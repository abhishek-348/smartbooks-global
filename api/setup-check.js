import Stripe from 'stripe';
import {head} from '@vercel/blob';
import nodemailer from 'nodemailer';
import {headers} from '../lib/commerce.js';
// Preview-only operational check. Never returns secrets, account details or buyer records.
export default async function handler(req,res){
 headers(res);
 if(process.env.VERCEL_ENV!=='preview')return res.status(404).json({error:'Not found'});
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const result={stripe:'missing',storage:'missing',mailbox:'missing',webhook:process.env.STRIPE_WEBHOOK_SECRET?'configured':'missing',salesEnabled:process.env.LAUNCH_ENABLED==='true'};
 const key=process.env.STRIPE_SECRET_KEY;
 if(key){
  if(!/^(sk|rk)_test_/.test(key))result.stripe='requires_test_key';
  else try{await new Stripe(key,{timeout:10000,maxNetworkRetries:0}).checkout.sessions.list({limit:1});result.stripe='connected_test_mode';}catch{result.stripe='connection_failed';}
 }
 if(process.env.FOUNDER_BLOB_PATH && process.env.BLOB_READ_WRITE_TOKEN){
  try{await head(process.env.FOUNDER_BLOB_PATH,{token:process.env.BLOB_READ_WRITE_TOKEN});result.storage='connected';}catch{result.storage='connection_failed';}
 }
 if(process.env.SMTP_PASSWORD){
  const transport=nodemailer.createTransport({host:'smtp.hostinger.com',port:465,secure:true,auth:{user:'support@smartbooksglobal.com',pass:process.env.SMTP_PASSWORD},connectionTimeout:10000,socketTimeout:10000});
  try{await transport.verify();result.mailbox='connected';}catch{result.mailbox='connection_failed';}finally{transport.close();}
 }
 return res.status(200).json(result);
}
