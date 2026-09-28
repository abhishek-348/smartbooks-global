import {PRODUCT,isEntitled,siteOrigin,validSessionId} from './commerce.js';
export async function fulfill(session,dependencies){
 const {live,alreadySent,send,recordSent}=dependencies;
 if(!validSessionId(session.id)||session.metadata?.product!==PRODUCT||!isEntitled(session,live))return {ignored:true};
 if(await alreadySent(session.id))return {duplicate:true};
 const email=session.customer_details?.email;
 if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email)||/[\r\n,;]/.test(email))throw Error('Missing purchase email');
 const download=siteOrigin()+'/founder-clarity/success.html?session_id='+encodeURIComponent(session.id);
 await send({
  from:'SmartBooks Global <support@smartbooksglobal.com>',
  to:email,replyTo:'support@smartbooksglobal.com',
  subject:'Your Founder Clarity OS workbook and examples',
  messageId:`<founder-${session.id}@smartbooksglobal.com>`,
  text:`Thank you for purchasing Founder Clarity OS.\n\nDownload your workbook and four completed fictional examples here:\n${download}\n\nKeep this link private. Extract the ZIP and read START_HERE.md. Your answers stay in your browser; export backups regularly.\n\nIf you need help accessing the product, reply to this email.\n\nSmartBooks Global\nsupport@smartbooksglobal.com`
 });
 await recordSent(session.id);
 return {delivered:true};
}
