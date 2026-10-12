import {test} from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
test('Demo UI: starts without Auth/network, selects prepared example and navigates',async()=>{
 const browser=new Window({url:'http://localhost:3000/?demo=1'});
 for(const [key,value] of Object.entries({window:browser,document:browser.document,navigator:browser.navigator,localStorage:browser.localStorage,sessionStorage:browser.sessionStorage,HTMLElement:browser.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true}))Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
 const oldFetch=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;throw new Error('No network in demo');};
 const host=browser.document.createElement('div');browser.document.body.append(host);const root=createRoot(host as unknown as HTMLElement);
 try{
  const {default:App}=await import('../src/App');
  await act(async()=>{root.render(React.createElement(App));});
  assert.ok(host.textContent?.includes('สวนสาธิต AuraFarming'));
  assert.ok(host.textContent?.includes('โหมดสาธิต'));
  const scan=Array.from(host.querySelectorAll('button')).find(b=>b.textContent?.includes('สแกนพืช'));assert.ok(scan);
  await act(async()=>{scan.dispatchEvent(new browser.MouseEvent('click',{bubbles:true}));});
  assert.ok(host.textContent?.includes('ไม่ใช่การวิเคราะห์ภาพสด'));
  const example=Array.from(host.querySelectorAll('button')).find(b=>b.textContent?.includes('Monstera deliciosa'));assert.ok(example);
  await act(async()=>{example.dispatchEvent(new browser.MouseEvent('click',{bubbles:true}));});
  assert.ok(host.textContent?.includes('DEMO'));
  assert.ok(host.textContent?.includes('มอนสเตอร่า'));
  assert.equal(host.textContent?.includes('ค่าความมั่นใจต่ำกว่า 60%'),false);
  assert.equal(calls,0);
 }finally{await act(async()=>root.unmount());globalThis.fetch=oldFetch;await browser.happyDOM.close();}
});
