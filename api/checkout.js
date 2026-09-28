import Stripe from 'stripe';
import {head} from '@vercel/blob';
import {configured,headers,sameOrigin,checkoutOptions} from '../lib/commerce.js';
export default async function handler(req,res){
 headers(res);
 if(req.method==='GET')return res.status(200).json({available:configured(process.env)});
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});}
 if(!sameOrigin(req))return res.status(403).json({error:'Please start from the product page.'});
 if(!configured(process.env))return res.status(503).json({error:'Sales are not open yet.'});
 try{
  // Confirm delivery storage is reachable before creating a payment session.
  await head(process.env.FOUNDER_BLOB_PATH,{token:process.env.BLOB_READ_WRITE_TOKEN});
  if(process.env.VERCEL_ENV==='preview' && /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY))throw Error('Live payments disabled in previews');
  const stripe=new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:1,timeout:15000});
  const session=await stripe.checkout.sessions.create(checkoutOptions());
  return res.status(200).json({url:session.url});
 }catch{return res.status(503).json({error:'Checkout is temporarily unavailable. Please try again later.'});}
}
