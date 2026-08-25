const crypto = require('crypto');
const bcrypt = require('bcryptjs');

function generateOtp(){
  return String(crypto.randomInt(100000, 1000000));
}

async function hashOtp(otp){ return bcrypt.hash(otp, 10); }
async function verifyOtp(otp, hash){ return bcrypt.compare(String(otp), hash); }

function maskEmail(email){
  const [name, domain] = String(email).split('@');
  if(!domain) return 'your email';
  const visible = name.length <= 2 ? name[0] : name.slice(0,2);
  return `${visible}${'*'.repeat(Math.max(1,name.length-visible.length))}@${domain}`;
}
function maskPhone(phone){
  const p=String(phone);
  if(p.length<=4) return p;
  return `${p.slice(0,3)}${'*'.repeat(Math.max(1,p.length-5))}${p.slice(-2)}`;
}

async function sendEmailOtp({to,otp,name}){
  if(!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL){
    throw new Error('Email OTP is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.');
  }
  const response=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      from:process.env.RESEND_FROM_EMAIL,
      to:[to],
      subject:'FULATAN verification code',
      html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px"><h2>FULATAN COMMUNICATION</h2><p>Hello ${escapeHtml(name)},</p><p>Your verification code is:</p><div style="font-size:32px;font-weight:800;letter-spacing:8px;padding:18px;background:#f4f4f5;text-align:center">${otp}</div><p>This code expires in 10 minutes. Do not share it with anyone.</p></div>`
    })
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.message||'Could not send email OTP');
}

async function sendSmsOtp({to,otp}){
  if(!process.env.TERMII_API_KEY || !process.env.TERMII_SENDER_ID){
    throw new Error('SMS OTP is not configured. Set TERMII_API_KEY and TERMII_SENDER_ID.');
  }
  const response=await fetch('https://v3.api.termii.com/api/sms/send',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      api_key:process.env.TERMII_API_KEY,
      to,
      from:process.env.TERMII_SENDER_ID,
      sms:`Your FULATAN verification code is ${otp}. It expires in 10 minutes. Do not share it.`,
      type:'plain',
      channel:process.env.TERMII_CHANNEL||'generic'
    })
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok || data.code===0 && data.message?.toLowerCase?.().includes('error')) throw new Error(data.message||'Could not send SMS OTP');
}

function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

module.exports={generateOtp,hashOtp,verifyOtp,sendEmailOtp,sendSmsOtp,maskEmail,maskPhone};
