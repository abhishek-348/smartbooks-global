import test from 'node:test';import assert from 'node:assert/strict';import {fulfill} from '../lib/fulfillment.js';import {PRODUCT,siteOrigin} from '../lib/commerce.js';import Stripe from 'stripe';import webhook from '../api/stripe-webhook.js';import {Readable} from 'node:stream';
const session=()=>({id:'cs_test_1234567890ABCDEF',mode:'payment',status:'complete',payment_status:'paid',metadata:{product:PRODUCT},currency:'usd',amount_subtotal:3900,livemode:false,payment_intent:{status:'succeeded',latest_charge:{paid:true,refunded:false,disputed:false,amount_refunded:0}},customer_details:{email:'buyer@example.com'}});
test('Purchase email includes private recovery link and retry is deduplicated after completion',async()=>{let sent=0,recorded=false;const d={live:false,alreadySent:async()=>recorded,send:async m=>{sent++;assert.equal(m.to,'buyer@example.com');assert.match(m.text,/session_id=cs_test_/);},recordSent:async()=>{recorded=true;}};await fulfill(session(),d);await fulfill(session(),d);assert.equal(sent,1);});
test('Failed email is not marked delivered and can be retried',async()=>{let recorded=false;await assert.rejects(()=>fulfill(session(),{live:false,alreadySent:async()=>false,send:async()=>{throw Error('SMTP failed');},recordSent:async()=>{recorded=true;}}));assert.equal(recorded,false);});
test('Unpaid session cannot trigger an email',async()=>{await fulfill({...session(),payment_status:'unpaid'},{live:false,send:async()=>assert.fail('must not send')});});
test('Preview redirect is constrained to Vercel host',()=>{assert.equal(siteOrigin({VERCEL_ENV:'preview',VERCEL_URL:'project-test.vercel.app'}),'https://project-test.vercel.app');assert.equal(siteOrigin({VERCEL_ENV:'preview',VERCEL_URL:'evil.test/path'}),'https://www.smartbooksglobal.com');});
const res=()=>({setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}});
test('Webhook rejects forged signatures and accepts signed irrelevant events without sending',async()=>{
 process.env.STRIPE_SECRET_KEY='sk_test_fixture';process.env.STRIPE_WEBHOOK_SECRET='whsec_fixture';
 const body=JSON.stringify({id:'evt_fixture',type:'unhandled.test',livemode:false,data:{object:{}}});
 const stripe=new Stripe('sk_test_fixture');
 for(const valid of [false,true]){const req=Readable.from([Buffer.from(body)]);req.method='POST';req.headers={'stripe-signature':valid?stripe.webhooks.generateTestHeaderString({payload:body,secret:'whsec_fixture'}):'fake'};const r=res();await webhook(req,r);assert.equal(r.code,valid?200:400);}
 delete process.env.STRIPE_SECRET_KEY;delete process.env.STRIPE_WEBHOOK_SECRET;
});
