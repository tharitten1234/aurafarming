import test from 'node:test';
import assert from 'node:assert/strict';
import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {Window} from 'happy-dom';
import {AppBoundary} from '../src/components/AppBoundary';
import {ConnectionStatus} from '../src/components/ConnectionStatus';

test('Offline notice follows connection events and removes listeners after unmount', async()=>{
 const browser=new Window({url:'https://localhost/'});
 for(const [key,value] of Object.entries({window:browser,document:browser.document,navigator:browser.navigator,HTMLElement:browser.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true}))
  Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
 const host=browser.document.createElement('div');browser.document.body.append(host);
 const root=createRoot(host as unknown as HTMLElement);
 try {
  Object.defineProperty(browser.navigator,'onLine',{value:false,configurable:true});
  await act(async()=>root.render(React.createElement(ConnectionStatus)));
  assert.match(host.textContent!,/ออฟไลน์/);
  Object.defineProperty(browser.navigator,'onLine',{value:true,configurable:true});
  await act(async()=>browser.dispatchEvent(new browser.Event('online')));
  assert.equal(host.textContent,'');
  Object.defineProperty(browser.navigator,'onLine',{value:false,configurable:true});
  await act(async()=>browser.dispatchEvent(new browser.Event('offline')));
  assert.match(host.textContent!,/ออฟไลน์/);
 } finally {await act(async()=>root.unmount());await browser.happyDOM.close();}
});

test('Unexpected render failure offers a recovery action instead of a blank application', async()=>{
 const browser=new Window({url:'https://localhost/'});
 for(const [key,value] of Object.entries({window:browser,document:browser.document,navigator:browser.navigator,HTMLElement:browser.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true}))
  Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
 const host=browser.document.createElement('div');browser.document.body.append(host);
 const root=createRoot(host as unknown as HTMLElement);
 const Throw=():React.ReactNode=>{throw new Error('Simulated missing screen chunk');};
 try {
  await act(async()=>root.render(React.createElement(AppBoundary,null,React.createElement(Throw))));
  assert.ok(host.querySelector('[role=alert]'));
  assert.match(host.querySelector('button')!.textContent!,/โหลดแอปใหม่/);
 } finally {await act(async()=>root.unmount());await browser.happyDOM.close();}
});
