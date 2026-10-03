import { handleRequest } from './index.ts';

const owner = '11111111-1111-4111-8111-111111111111';
const imagePath = `${owner}/scans/22222222-2222-4222-8222-222222222222.jpg`;
const sample = { isPlant: true, commonName: 'พืช', scientificName: 'Monstera deliciosa', category: 'foliage', confidence: 0.9,
  description: 'พืชใบ', wateringIntervalDays: 7, sunlightRequirement: 'medium', temperatureMinC: 18, temperatureMaxC: 32,
  careDifficulty: 'easy', warnings: [], alternativeCandidates: [] };
const assert = (condition: unknown, text: string) => { if (!condition) throw new Error(text); };
Deno.test('Edge handler: session, owner path, structured output, non-plant and upstream failures', async () => {
  const originalFetch = globalThis.fetch;
  const env = ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','GEMINI_API_KEY','GEMINI_MODEL'];
  const previous = env.map(k => Deno.env.get(k));
  Deno.env.set('SUPABASE_URL','https://test.supabase.co'); Deno.env.set('SUPABASE_SERVICE_ROLE_KEY','test-only');
  Deno.env.set('GEMINI_API_KEY','test-only'); Deno.env.set('GEMINI_MODEL','test-model');
  let output: unknown = sample;
  let upstreamStatus = 200;
  let failed = false;
  let transientFailures = 0;
  let geminiCalls = 0;
  let dailyQuota=false;
  const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.includes('/auth/v1/user')) return json({ id: owner, aud: 'authenticated', role: 'authenticated', email: '' });
    if (url.includes('/storage/v1/object/')) return new Response(new Uint8Array([0xff,0xd8,0xff,0xd9]), { headers: { 'Content-Type': 'image/jpeg' } });
    if (url.includes('/rest/v1/plant_scans')) {
      if (init?.method === 'HEAD') return new Response(null, { headers: { 'Content-Range': '0-0/0' } });
      if (init?.method === 'POST') return json({ id: '33333333-3333-4333-8333-333333333333' });
      if (init?.method === 'PATCH') { failed = String(init.body).includes('failed'); return new Response(null, { status: 204 }); }
    }
    if (url.includes('generativelanguage.googleapis.com')) {
      geminiCalls++;
      if (transientFailures-- > 0) return json({}, 503);
      const request = JSON.parse(String(init?.body));
      assert(url.includes('test-model'), 'Model must come from environment');
      assert(request.contents[0].parts[0].inlineData.data, 'Image bytes must reach Gemini request');
      assert(request.generationConfig.responseJsonSchema, 'Structured schema required');
      if(upstreamStatus===429)return json({error:{details:[{retryDelay:'43s'},{violations:[{quotaId:dailyQuota?'GenerateRequestsPerDayPerProjectPerModel':'GenerateRequestsPerMinutePerProjectPerModel'}]}]}},429);
      return json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(output) }] } }] }, upstreamStatus);
    }
    throw new Error('Unexpected request');
  };
  const request = (path = imagePath, token = true) => new Request('https://edge.test/', { method: 'POST',
    headers: token ? { Authorization: 'Bearer test-token' } : {}, body: JSON.stringify({ imagePath: path }) });
  try {
    assert((await handleRequest(request(imagePath,false))).status === 401, 'Missing session rejected');
    assert((await handleRequest(request('another-user/scans/test.jpg'))).status === 403, 'Foreign path rejected');
    const result = await handleRequest(request());
    assert(result.status === 200, 'Valid analysis succeeds');
    assert((await result.json()).identification.scientificName === sample.scientificName, 'Result normalized');
    transientFailures = 1; geminiCalls = 0;
    assert((await handleRequest(request())).status === 200 && geminiCalls === 2, 'Transient outage retried successfully');
    output = { ...sample, isPlant: false, alternativeCandidates: [sample] };
    const nonPlant = await (await handleRequest(request())).json();
    assert(nonPlant.identification.scientificName === '' && nonPlant.identification.alternativeCandidates.length === 0, 'Non-plant names stripped');
    output = { bad: true }; failed = false;
    assert((await handleRequest(request())).status === 502 && failed, 'Malformed output records failed scan');
    upstreamStatus = 503; failed = false; geminiCalls = 0;
    const outage=await handleRequest(request());
    assert(outage.status === 503 && failed && (await outage.json()).code==='GEMINI_UNAVAILABLE', 'Upstream outage explained');
    assert(geminiCalls === 3, 'Persistent outage retries are bounded');
    upstreamStatus=429;geminiCalls=0;failed=false;
    const limited=await handleRequest(request());
    assert(limited.status===429 && (await limited.json()).code==='GEMINI_RATE_LIMIT' && failed,'Rate limit exposed safely');
    assert(geminiCalls===1,'Quota failures do not cause a retry burst');
    dailyQuota=true;geminiCalls=0;
    const daily=await handleRequest(request());const dailyBody=await daily.json();
    assert(daily.status===429 && dailyBody.code==='GEMINI_DAILY_QUOTA' && dailyBody.retryAfterSeconds===43,'Daily quota and retry delay distinguished');
    assert(geminiCalls===1,'Daily quota is not retried');
    assert((await handleRequest(new Request('https://edge.test/', { method: 'OPTIONS' }))).status === 204, 'CORS preflight');
  } finally {
    globalThis.fetch = originalFetch;
    env.forEach((key,i) => { if (previous[i] === undefined) Deno.env.delete(key); else Deno.env.set(key,previous[i]!); });
  }
});
