import {test} from 'node:test';
import assert from 'node:assert/strict';
import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
import {optionalSignedImage, IMAGE_UNAVAILABLE, showUnavailableImage} from '../src/services/images';
import {analyzePlant} from '../src/services/scans';
import {ScannerScreen} from '../src/components/ScannerScreen';

test('Missing optional photo does not reject other garden photos or replace good URLs',async()=>{
  const sign=async(path:string)=>{if(path==='missing')throw new Error('Storage unavailable');return `https://test.local/${path}`;};
  assert.deepEqual(await Promise.all(['first','missing','last'].map(path=>optionalSignedImage(path,sign))),
    ['https://test.local/first',IMAGE_UNAVAILABLE,'https://test.local/last']);
});

test('Cancelled scan rejects before any upload or authentication request',async()=>{
  const controller=new AbortController();controller.abort();
  await assert.rejects(analyzePlant(new Blob(['image']),controller.signal),{name:'AbortError'});
});

test('Scanner back remains usable while a scan is pending; broken image fallback does not loop',async()=>{
  const browser=new Window({url:'https://localhost/'});
  for(const [key,value] of Object.entries({window:browser,document:browser.document,navigator:browser.navigator,
    HTMLElement:browser.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true}))
    Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
  Object.defineProperty(browser.navigator,'mediaDevices',{value:undefined,configurable:true});
  const host=browser.document.createElement('div');browser.document.body.append(host);
  const root=createRoot(host as unknown as HTMLElement);
  let back=0,finish!:()=>void;
  const pending=new Promise<void>(resolve=>{finish=resolve;});
  try{
    await act(async()=>root.render(React.createElement(ScannerScreen,{onBack:()=>{back++;},onScanComplete:()=>pending,onShowToast:()=>{}})));
    const input=host.querySelector('input[type=file]')!;
    Object.defineProperty(input,'files',{value:[new File(['test'],'plant.jpg',{type:'image/jpeg'})]});
    await act(async()=>input.dispatchEvent(new browser.Event('change',{bubbles:true})));
    await act(async()=>host.querySelector('[aria-label="ถ่ายรูปต้นไม้"]')!.dispatchEvent(new browser.MouseEvent('click',{bubbles:true})));
    const button=host.querySelector('button[aria-label="ย้อนกลับ"]') as unknown as HTMLButtonElement;
    assert.equal(button.disabled,false);
    await act(async()=>button.click());assert.equal(back,1);
    const image=browser.document.createElement('img');image.src='broken.jpg';
    showUnavailableImage({currentTarget:image as unknown as HTMLImageElement});
    assert.equal(image.getAttribute('src'),IMAGE_UNAVAILABLE);
    showUnavailableImage({currentTarget:image as unknown as HTMLImageElement});
    assert.equal(image.getAttribute('src'),IMAGE_UNAVAILABLE);
    await act(async()=>root.unmount());finish();
  }finally{finish();await browser.happyDOM.close();}
});
