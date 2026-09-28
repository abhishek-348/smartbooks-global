import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import {get,put} from '@vercel/blob';
import {fulfill} from '../lib/fulfillment.js';
import {headers} from '../lib/commerce.js';
export const config={api:{bodyParser:false}};
export default async function handler(req,res){
 headers(res);
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.STRIPE_WEBHOOK_SECRET||!process.env.STRIPE_SECRET_KEY)return res.status(503).json({error:'Webhook not configured'});
 const stripe=new Stripe(process.env.STRIPE_SECRET_KEY,{maxNetworkRetries:1,timeout:10000});
 let event;
 try{
  const parts=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>262144)return res.status(413).json({error:'Payload too large'});parts.push(Buffer.from(chunk));}
  event=stripe.webhooks.constructEvent(Buffer.concat(parts),req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET);
 }catch{return res.status(400).json({error:'Invalid signature or payload'});}
 if(event.type!=='checkout.session.completed')return res.status(200).json({received:true});
 const live=/^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY);
 if(event.livemode!==live)return res.status(400).json({error:'Wrong payment environment'});
 try{
  const session=await stripe.checkout.sessions.retrieve(event.data.object.id,{expand:['payment_intent.latest_charge']});
  const smtp=nodemailer.createTransport({host:'smtp.hostinger.com',port:465,secure:true,auth:{user:'support@smartbooksglobal.com',pass:process.env.SMTP_PASSWORD},connectionTimeout:10000,socketTimeout:15000});
  await fulfill(session,{live,
   alreadySent:async id=>Boolean(await get(`orders/${id}.json`,{access:'private',useCache:false})),
   send:async message=>{const result=await smtp.sendMail(message);if(!result.accepted?.length)throw Error('Email not accepted');},
   recordSent:async id=>{await put(`orders/${id}.json`,JSON.stringify({sentAt:new Date().toISOString()}),{access:'private',allowOverwrite:true,contentType:'application/json'});}
  });
  return res.status(200).json({received:true});
 }catch{return res.status(500).json({error:'Delivery incomplete; retry required'});}
}
