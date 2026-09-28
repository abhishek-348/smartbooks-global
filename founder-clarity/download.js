const id=new URLSearchParams(location.search).get('session_id');
const button=document.getElementById('download'),status=document.getElementById('status');
if(!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(id||'')){button.disabled=true;status.textContent='A valid purchase link is required. Contact support with your receipt for help.';}
button.onclick=async()=>{button.disabled=true;status.textContent='Checking your payment and preparing the download…';
try{const res=await fetch('/api/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:id})});
if(!res.ok){const data=await res.json();throw Error(data.error||'Download unavailable. Please retry or contact support.');}
const url=URL.createObjectURL(await res.blob());const a=document.createElement('a');a.href=url;a.download='Founder_Clarity_OS.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='Your download is ready. Save this page privately if you need another copy.';
}catch(e){status.textContent=e.message;}finally{button.disabled=false;}};
