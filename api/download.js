import Stripe from 'stripe';
import {get} from '@vercel/blob';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {validSessionId,isEntitled,headers,sameOrigin} from '../lib/commerce.js';
export default async function handler(req,res){
 headers(res);
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 if(!sameOrigin(req))return res.status(403).json({error:'Please use your purchase download page.'});
 const id=req.body?.session_id;
 if(!validSessionId(id))return res.status(400).json({error:'A valid purchase link is required.'});
 if(!process.env.STRIPE_SECRET_KEY || !process.env.FOUNDER_BLOB_PATH)return res.status(503).json({error:'Download unavailable. Contact support@smartbooksglobal.com with your receipt.'});
 try{
  const stripe=new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:1,timeout:15000});
  const s=await stripe.checkout.sessions.retrieve(id,{expand:['payment_intent.latest_charge']});
  const live=/^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY);
  if(!isEntitled(s,live))return res.status(403).json({error:'A completed, unrefunded payment for this product is required. If you just paid, retry shortly or contact support.'});
  const file=await get(process.env.FOUNDER_BLOB_PATH,{access:'private'});
  if(!file?.stream || file.statusCode!==200)throw Error('Unavailable');
  res.setHeader('Content-Type','application/zip');res.setHeader('Content-Disposition','attachment; filename="Founder_Clarity_OS.zip"');
  await pipeline(Readable.fromWeb(file.stream),res);
 }catch{
  if(!res.headersSent)return res.status(503).json({error:'We could not verify or deliver your purchase. Retry or contact support@smartbooksglobal.com with your receipt.'});
  res.destroy();
 }
}
