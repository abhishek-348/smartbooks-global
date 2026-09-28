export const PRODUCT='founder-clarity-os-v2';
export function configured(env){return env.LAUNCH_ENABLED==='true' && Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET && env.SMTP_PASSWORD && env.FOUNDER_BLOB_PATH && env.BLOB_READ_WRITE_TOKEN);}
export function validSessionId(id){return typeof id==='string' && /^cs_(test_|live_)?[A-Za-z0-9]{10,200}$/.test(id);}
export function isEntitled(s,live){
 const p=s.payment_intent,c=p?.latest_charge;
 return s.mode==='payment'&&s.status==='complete'&&s.payment_status==='paid'&&s.metadata?.product===PRODUCT&&s.currency==='usd'&&s.amount_subtotal===3900&&s.livemode===live&&p?.status==='succeeded'&&c?.paid===true&&!c.refunded&&!c.disputed&&c.amount_refunded===0;
}
export function headers(res){res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');}
export function siteOrigin(env=process.env){
 if(env.VERCEL_ENV==='preview' && env.VERCEL_URL && /^[a-zA-Z0-9.-]+\.vercel\.app$/.test(env.VERCEL_URL))return 'https://'+env.VERCEL_URL;
 return 'https://www.smartbooksglobal.com';
}
export function sameOrigin(req){return req.headers.origin===siteOrigin()||(process.env.VERCEL_ENV!=='preview' && req.headers.origin==='https://smartbooksglobal.com');}
export function checkoutOptions(){return {mode:'payment',payment_method_types:['card'],line_items:[{price_data:{currency:'usd',unit_amount:3900,product_data:{name:'Founder Clarity OS',description:'21-day workbook and four completed fictional examples'}},quantity:1}],metadata:{product:PRODUCT},payment_intent_data:{metadata:{product:PRODUCT}},success_url:siteOrigin()+'/founder-clarity/success.html?session_id={CHECKOUT_SESSION_ID}',cancel_url:siteOrigin()+'/founder-clarity/#offer'};}
