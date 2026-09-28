const button=document.getElementById('checkout');
const status=document.getElementById('checkoutStatus');
fetch('/api/checkout').then(r=>r.json()).then(data=>{
 if(data.available){button.disabled=false;button.textContent='Get Founder Clarity OS — $39';status.textContent='One-time payment in USD. Secure checkout with Stripe.';}
}).catch(()=>{});
button.onclick=async()=>{
 button.disabled=true;status.textContent='Opening secure checkout…';
 try{const response=await fetch('/api/checkout',{method:'POST'});const data=await response.json();
 if(!response.ok||!data.url)throw Error();const url=new URL(data.url);if(url.origin!=='https://checkout.stripe.com')throw Error();location.assign(url.href);
 }catch{status.textContent='Checkout is unavailable. No payment was taken here. Please try again or contact support@smartbooksglobal.com.';button.disabled=false;}
};
