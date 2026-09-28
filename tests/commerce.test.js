import test from 'node:test';import assert from 'node:assert/strict';
import {isEntitled,PRODUCT,configured,validSessionId,checkoutOptions} from '../lib/commerce.js';
const paid=()=>({mode:'payment',status:'complete',payment_status:'paid',metadata:{product:PRODUCT},currency:'usd',amount_subtotal:3900,livemode:true,payment_intent:{status:'succeeded',latest_charge:{paid:true,refunded:false,disputed:false,amount_refunded:0}}});
test('Paid purchase passes; no other product, price, mode, status or environment passes',()=>{
 assert.equal(isEntitled(paid(),true),true);
 for(const patch of [{payment_status:'unpaid'},{status:'open'},{mode:'subscription'},{metadata:{product:'other'}},{currency:'inr'},{amount_subtotal:1},{livemode:false},{payment_intent:null}])assert.ok(!isEntitled({...paid(),...patch},true));
});
test('Refunds, partial refunds, disputes and failed charges block download',()=>{
 for(const patch of [{refunded:true},{disputed:true},{amount_refunded:1},{paid:false}]){const p=paid();Object.assign(p.payment_intent.latest_charge,patch);assert.ok(!isEntitled(p,true));}
});
test('Sales remain closed until explicit activation and storage/payment config',()=>{
 assert.ok(!configured({}));assert.ok(!configured({LAUNCH_ENABLED:'true',STRIPE_SECRET_KEY:'test'}));assert.ok(configured({LAUNCH_ENABLED:'true',STRIPE_SECRET_KEY:'test',STRIPE_WEBHOOK_SECRET:'test',SMTP_PASSWORD:'test',FOUNDER_BLOB_PATH:'bundle.zip',BLOB_READ_WRITE_TOKEN:'test'}));
});
test('Checkout fixes price and redirect independently of request data',()=>{const s=checkoutOptions();assert.equal(s.line_items[0].price_data.unit_amount,3900);assert.equal(s.line_items[0].quantity,1);assert.equal(s.metadata.product,PRODUCT);assert.ok(s.success_url.startsWith('https://www.smartbooksglobal.com/'));});
test('Session identifier rejects paths and malformed input',()=>{assert.ok(validSessionId('cs_test_1234567890ABCDE'));for(const v of [null,[],{},'../../.env','cs_live_<script>',''])assert.ok(!validSessionId(v));});
