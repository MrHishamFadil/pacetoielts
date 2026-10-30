// Sends homework emails through the EmailJS REST API (same service as the browser SDK, no extra script needed).
// Never throws: returns {sent,failed,skipped}.
window.PTI_NOTIFY=async function(list,a){const c=window.PTI_EMAIL||{};
  if(!c.publicKey||/PLACEHOLDER/.test(c.publicKey+c.serviceId+c.templateId))return{sent:0,failed:0,skipped:list.length};
  const due=a.due instanceof Date?a.due.toLocaleString('en-GB',{timeZone:'Asia/Riyadh',weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' (Riyadh time)':'';
  let sent=0,failed=0;
  for(const s of list){if(!s.email){failed++;continue;}
    try{const r=await fetch('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({service_id:c.serviceId,template_id:c.templateId,user_id:c.publicKey,template_params:{
        to_email:s.email,student_name:(s.displayName||'there').split(' ')[0],hw_title:a.title,hw_instructions:a.prompt||'See the homework page for details.',
        hw_due:due,hw_link:c.siteUrl,tutor_name:c.tutorName}})});r.ok?sent++:failed++;}catch(e){failed++;}}
  return{sent,failed,skipped:0};};
