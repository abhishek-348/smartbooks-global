import test from 'node:test';import assert from 'node:assert/strict';import check from '../api/setup-check.js';
function res(){return {setHeader(){},status(code){this.code=code;return this;},json(value){this.body=value;return this;}};}
test('Setup diagnostics unavailable in production',async()=>{process.env.VERCEL_ENV='production';const r=res();await check({method:'GET'},r);assert.equal(r.code,404);});
test('Preview rejects live keys without contacting Stripe or exposing them',async()=>{process.env.VERCEL_ENV='preview';process.env.STRIPE_SECRET_KEY='sk_live_testfixture';const r=res();await check({method:'GET'},r);assert.equal(r.body.stripe,'requires_test_key');assert.ok(!JSON.stringify(r.body).includes('sk_live'));delete process.env.STRIPE_SECRET_KEY;delete process.env.VERCEL_ENV;});
