import { test } from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Window } from 'happy-dom';
import { ScannerScreen } from '../src/components/ScannerScreen';

test('Scanner: unavailable/denied camera, independent gallery, capture, flip and stream cleanup', async () => {
  const browser = new Window({ url: 'https://localhost/' });
  Object.defineProperty(browser, 'isSecureContext', { value: true });
  for (const [key, value] of Object.entries({ window: browser, document: browser.document, navigator: browser.navigator,
    HTMLElement: browser.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true }))
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  browser.HTMLMediaElement.prototype.play = async () => undefined;
  Object.defineProperty(browser.HTMLMediaElement.prototype, 'srcObject', { value: null, writable: true, configurable: true });
  let stopped = 0;
  let requested: unknown[] = [];
  const stream = () => ({ getTracks: () => [{ stop: () => stopped++ }], getVideoTracks: () => [] });
  const captures: Blob[] = [];
  const messages: string[] = [];
  let host = browser.document.createElement('div'); browser.document.body.append(host);
  let root = createRoot(host as unknown as HTMLElement);
  const render = () => root.render(React.createElement(ScannerScreen, {
    onBack: () => {}, onScanComplete: async image => { captures.push(image); }, onShowToast: text => messages.push(text),
  }));
  const click = async (label: string) => {
    const button = host.querySelector(`button[aria-label="${label}"]`);
    assert.ok(button, label);
    await act(async () => { button.dispatchEvent(new browser.MouseEvent('click', { bubbles: true })); });
  };
  try {
    // No mediaDevices: component must render an understandable fallback.
    Object.defineProperty(browser.navigator, 'mediaDevices', { value: undefined, configurable: true });
    await act(async () => { render(); });
    assert.match(host.textContent ?? '', /ไม่รองรับกล้องสด/);
    const file = new File(['test-image'], 'plant.jpg', { type: 'image/jpeg' });
    const input = host.querySelector('input[type=file]')!;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    await act(async () => { input.dispatchEvent(new browser.Event('change', { bubbles: true })); });
    await click('ถ่ายรูปต้นไม้');
    assert.equal(captures[0], file, 'Gallery works without a live camera');
    await act(async () => root.unmount());

    // Permission denied is handled without crashing or manufacturing an image.
    Object.defineProperty(browser.navigator, 'mediaDevices', { value: { getUserMedia: async () => {
      throw new DOMException('Denied', 'NotAllowedError');
    } }, configurable: true });
    host = browser.document.createElement('div'); browser.document.body.append(host); root = createRoot(host as unknown as HTMLElement);
    await act(async () => { render(); });
    assert.match(host.textContent ?? '', /ไม่ได้รับอนุญาต/);
    await act(async () => root.unmount());

    // Real preview lifecycle, including switch and gallery stop.
    Object.defineProperty(browser.navigator, 'mediaDevices', { value: { getUserMedia: async (constraints: unknown) => {
      requested.push(constraints); return stream();
    } }, configurable: true });
    host = browser.document.createElement('div'); browser.document.body.append(host); root = createRoot(host as unknown as HTMLElement);
    await act(async () => { render(); });
    const video = host.querySelector('video')!;
    assert.ok(video, `Live video missing: ${host.textContent}`);
    assert.ok((video as unknown as { srcObject: unknown }).srcObject, 'Stream assigned after video mounts');
    Object.defineProperties(video, { videoWidth: { value: 1920 }, videoHeight: { value: 1080 } });
    browser.HTMLCanvasElement.prototype.getContext = (() => ({ drawImage: () => {} })) as never;
    browser.HTMLCanvasElement.prototype.toBlob = (callback) => callback(new Blob(['captured'], { type: 'image/jpeg' }) as never);
    await click('ถ่ายรูปต้นไม้');
    assert.equal(captures[1].type, 'image/jpeg');
    const flip = [...host.querySelectorAll('button')].find(b => b.textContent?.includes('สลับกล้อง'))!;
    await act(async () => { flip.dispatchEvent(new browser.MouseEvent('click', { bubbles: true })); });
    assert.equal(requested.length, 2); assert.equal(stopped, 1);
    const gallery = host.querySelector('input[type=file]')!;
    Object.defineProperty(gallery, 'files', { value: [file], configurable: true });
    await act(async () => { gallery.dispatchEvent(new browser.Event('change', { bubbles: true })); });
    assert.equal(stopped, 2, 'Gallery stops the live stream');
    await act(async () => root.unmount());
    // A stream obtained after leaving the screen must also stop.
    let release!: (value: unknown) => void;
    Object.defineProperty(browser.navigator, 'mediaDevices', { value: { getUserMedia: () => new Promise(resolve => { release = resolve; }) }, configurable: true });
    host = browser.document.createElement('div'); browser.document.body.append(host); root = createRoot(host as unknown as HTMLElement);
    await act(async () => { render(); });
    await act(async () => root.unmount());
    await act(async () => release(stream()));
    assert.equal(stopped, 3, 'Late camera permission response stops after unmount');
  } finally { await browser.happyDOM.close(); }
});
