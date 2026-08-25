require('dotenv').config();
const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const multer=require('multer');
const fs=require('fs');
const path=require('path');
const {query,pool}=require('./db');
const {auth,admin,signToken,hashPassword,comparePassword,publicUser}=require('./auth');
const {upload,configured:cloudinaryConfigured}=require('./cloudinary');
const {generateOtp,hashOtp,verifyOtp,sendEmailOtp,sendSmsOtp,maskEmail,maskPhone}=require('./otp');

const app=express();
app.use(helmet());
app.use(cors({origin:process.env.CORS_ORIGIN||'*'}));
app.use(express.json({limit:'2mb'}));
const uploadDir=path.join(__dirname,'../uploads'); fs.mkdirSync(uploadDir,{recursive:true});
const uploader=multer({dest:uploadDir,limits:{fileSize:8*1024*1024}});

const money=n=>Number(n||0);
const normalizePhone=p=>{let v=String(p||'').replace(/\D/g,'');if(v.startsWith('00'))v=v.slice(2);if(v.startsWith('0')&&v.length===11)v='234'+v.slice(1);if(v.startsWith('234')&&v.length===13)return v;return v;};
const normalizeEmail=e=>String(e||'').trim().toLowerCase();
const normalizeName=n=>String(n||'').trim().replace(/\s+/g,' ').toLowerCase();
const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validOtpChannel=c=>c==='email'||c==='sms';
function cleanPrice(v){
  const n=Number(String(v??'').replace(/,/g,'').replace(/₦/g,'').trim());
  return Number.isFinite(n)&&n>=0?n:NaN;
}
function makeReferralCode(name){
  const base=String(name||'USER').replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,5)||'USER';
  return `${base}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
}
async function uniqueReferralCode(name){
  for(let i=0;i<20;i++){
    const code=makeReferralCode(name);
    const r=await query('SELECT 1 FROM users WHERE referral_code=$1',[code]);
    if(!r.rowCount)return code;
  }
  throw new Error('Could not generate referral code');
}
function commissionFor(phone, unitPrice, qty){
  const value=money(phone.commission_value);
  if(value<=0)return 0;
  const one=phone.commission_type==='percent' ? (unitPrice*value/100) : value;
  return Math.max(0,Math.round(one*qty*100)/100);
}

const flutterwaveConfigured=Boolean(process.env.FLW_SECRET_KEY&&process.env.FLW_REDIRECT_URL);
async function initializeFlutterwave(order,user,total){
  if(!flutterwaveConfigured) throw new Error('Flutterwave is not configured. Set FLW_SECRET_KEY and FLW_REDIRECT_URL.');
  const txRef=`FULATAN-${order.id}-${Date.now()}`;
  const response=await fetch('https://api.flutterwave.com/v3/payments',{method:'POST',headers:{Authorization:`Bearer ${process.env.FLW_SECRET_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({tx_ref:txRef,amount:total,currency:'NGN',redirect_url:process.env.FLW_REDIRECT_URL,payment_options:'card,banktransfer,ussd',customer:{email:user.email,name:user.name,phonenumber:user.phone},customizations:{title:'FULATAN COMMUNICATION',description:'Phone purchase'}})});
  const data=await response.json();
  if(!response.ok||data.status!=='success'||!data.data?.link)throw new Error(data.message||'Flutterwave payment initialization failed');
  await query("UPDATE orders SET payment_status='pending',tx_ref=$1,payment_link=$2 WHERE id=$3",[txRef,data.data.link,order.id]);
  return {txRef,paymentLink:data.data.link};
}
async function verifyFlutterwaveTransaction(transactionId){
  if(!process.env.FLW_SECRET_KEY)throw new Error('Flutterwave secret key is not configured');
  const response=await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`,{headers:{Authorization:`Bearer ${process.env.FLW_SECRET_KEY}`}});
  const data=await response.json();
  if(!response.ok||data.status!=='success'||!data.data)return null;
  return data.data;
}

function phoneDto(r){return {
  id:r.id,title:r.title,brand:r.brand,model:r.model,price:money(r.price),condition:r.condition,description:r.description,
  images:r.images||[],location:r.location,state:r.state,sellerId:r.seller_id,sellerName:r.seller_name,sellerPhone:r.seller_phone,
  sellerRating:money(r.seller_rating||5),createdAt:new Date(r.created_at).toISOString().split('T')[0],views:r.views,
  isPublished:r.is_published,commissionType:r.commission_type||'fixed',commissionValue:money(r.commission_value)
};}
function publicOrder(row){return {id:row.id,buyerId:row.buyer_id,status:row.status,total:money(row.total),deliveryAddress:row.delivery_address,phoneNumber:row.phone_number,buyerName:row.buyer_name||null,buyerEmail:row.buyer_email||null,deliveryState:row.delivery_state||null,deliveryLga:row.delivery_lga||null,deliveryLandmark:row.delivery_landmark||null,deliveryMethod:row.delivery_method||'delivery',createdAt:new Date(row.created_at).toISOString(),completedAt:row.completed_at?new Date(row.completed_at).toISOString():null,paymentStatus:row.payment_status||'unpaid',paymentLink:row.payment_link||null,txRef:row.tx_ref||null};}

app.get('/health',(req,res)=>res.json({ok:true,service:'FULATAN COMMUNICATION API',database:'PostgreSQL',imageStorage:cloudinaryConfigured?'Cloudinary':'not-configured'}));

app.post('/api/auth/register',async(req,res)=>{
 try{
  await query("DELETE FROM registration_verifications WHERE expires_at < NOW()-INTERVAL '1 day'");
  const {name,email,phone,password,referralCode,otpChannel='email'}=req.body;
  const normalizedEmail=normalizeEmail(email); const normalizedPhone=normalizePhone(phone);
  if(!name?.trim()||!validEmail(normalizedEmail)||normalizedPhone.length<10||!password||password.length<8||!validOtpChannel(otpChannel))
    return res.status(400).json({message:'Name, valid email, phone, 8+ character password and OTP method are required'});
  const exists=await query('SELECT id FROM users WHERE lower(email)=lower($1) OR phone=$2 LIMIT 1',[normalizedEmail,normalizedPhone]);
  if(exists.rowCount)return res.status(409).json({message:'Email or phone number is already registered'});
  const recent=await query(`SELECT id FROM registration_verifications WHERE (lower(email)=lower($1) OR phone=$2) AND consumed_at IS NULL AND expires_at>NOW() AND last_sent_at>NOW()-INTERVAL '60 seconds' ORDER BY created_at DESC LIMIT 1`,[normalizedEmail,normalizedPhone]);
  if(recent.rowCount)return res.status(429).json({message:'Please wait before requesting another OTP'});
  const attemptsLastHour=await query("SELECT COUNT(*)::int AS count FROM registration_verifications WHERE (lower(email)=lower($1) OR phone=$2) AND created_at>NOW()-INTERVAL '1 hour'",[normalizedEmail,normalizedPhone]);
  if(Number(attemptsLastHour.rows[0].count)>=5)return res.status(429).json({message:'Too many verification requests. Try again later.'});
  let referrerId=null;
  if(referralCode){
    const rr=await query('SELECT id FROM users WHERE upper(referral_code)=upper($1) AND role=\'user\' LIMIT 1',[String(referralCode).trim()]);
    if(!rr.rowCount)return res.status(400).json({message:'Invalid referral code'});
    referrerId=rr.rows[0].id;
  }
  const hash=await hashPassword(password); const otp=generateOtp(); const otpHash=await hashOtp(otp);
  const expires=new Date(Date.now()+10*60*1000);
  const r=await query(`INSERT INTO registration_verifications(name,email,phone,password_hash,referral_code,channel,otp_hash,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,[name.trim(),normalizedEmail,normalizedPhone,hash,referralCode?.trim()||null,otpChannel,otpHash,expires]);
  try{
    if(otpChannel==='email') await sendEmailOtp({to:normalizedEmail,otp,name:name.trim()});
    else await sendSmsOtp({to:normalizedPhone,otp});
  }catch(sendError){ await query('DELETE FROM registration_verifications WHERE id=$1',[r.rows[0].id]); throw sendError; }
  res.status(201).json({verificationId:r.rows[0].id,channel:otpChannel,destination:otpChannel==='email'?maskEmail(normalizedEmail):maskPhone(normalizedPhone),expiresAt:expires.toISOString()});
 }catch(e){console.error(e);res.status(500).json({message:e?.message||'Registration could not be started'});}
});

app.post('/api/auth/register/verify',async(req,res)=>{
 try{
  const {verificationId,otp}=req.body; if(!verificationId||!/^\d{6}$/.test(String(otp||'')))return res.status(400).json({message:'Enter the 6-digit OTP'});
  const client=await pool.connect();
  try{
   await client.query('BEGIN');
   const r=await client.query('SELECT * FROM registration_verifications WHERE id=$1 FOR UPDATE',[verificationId]);
   if(!r.rowCount){await client.query('ROLLBACK');return res.status(404).json({message:'Verification request not found'});}
   const v=r.rows[0];
   if(v.consumed_at){await client.query('ROLLBACK');return res.status(400).json({message:'Verification code has already been used'});}
   if(new Date(v.expires_at)<new Date()){await client.query('ROLLBACK');return res.status(400).json({message:'Verification code has expired'});}
   if(v.attempts>=5){await client.query('ROLLBACK');return res.status(429).json({message:'Too many incorrect OTP attempts. Request a new code.'});}
   const ok=await verifyOtp(String(otp),v.otp_hash);
   if(!ok){await client.query('UPDATE registration_verifications SET attempts=attempts+1 WHERE id=$1',[verificationId]);await client.query('COMMIT');return res.status(400).json({message:'Incorrect verification code'});}
   const exists=await client.query('SELECT id FROM users WHERE lower(email)=lower($1) OR phone=$2 LIMIT 1',[v.email,v.phone]);
   if(exists.rowCount){await client.query('UPDATE registration_verifications SET consumed_at=NOW() WHERE id=$1',[verificationId]);await client.query('COMMIT');return res.status(409).json({message:'Email or phone number is already registered'});}
   let referrerId=null;
   if(v.referral_code){const rr=await client.query('SELECT id FROM users WHERE upper(referral_code)=upper($1) AND role=\'user\' LIMIT 1',[v.referral_code]);if(rr.rowCount)referrerId=rr.rows[0].id;}
   const code=await uniqueReferralCode(v.name);
   const u=await client.query('INSERT INTO users(name,email,phone,password_hash,referral_code,referred_by,is_verified) VALUES($1,$2,$3,$4,$5,$6,TRUE) RETURNING *',[v.name,v.email,v.phone,v.password_hash,code,referrerId]);
   await client.query('UPDATE registration_verifications SET consumed_at=NOW() WHERE id=$1',[verificationId]);
   await client.query('COMMIT');
   const user=await publicUser(u.rows[0]); res.status(201).json({user,token:signToken(u.rows[0])});
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
 }catch(e){console.error(e);res.status(500).json({message:'Verification failed'});}
});

app.post('/api/auth/register/resend',async(req,res)=>{
 try{
  const {verificationId}=req.body; const r=await query('SELECT * FROM registration_verifications WHERE id=$1',[verificationId]);
  if(!r.rowCount)return res.status(404).json({message:'Verification request not found'});
  const v=r.rows[0]; if(v.consumed_at)return res.status(400).json({message:'Verification already completed'});
  if(new Date(v.last_sent_at).getTime()>Date.now()-60000)return res.status(429).json({message:'Please wait 60 seconds before requesting another OTP'});
  const otp=generateOtp(); const otpHash=await hashOtp(otp); const expires=new Date(Date.now()+10*60*1000);
  if(v.channel==='email')await sendEmailOtp({to:v.email,otp,name:v.name}); else await sendSmsOtp({to:v.phone,otp});
  await query('UPDATE registration_verifications SET otp_hash=$1,expires_at=$2,attempts=0,last_sent_at=NOW() WHERE id=$3',[otpHash,expires,verificationId]);
  res.json({channel:v.channel,destination:v.channel==='email'?maskEmail(v.email):maskPhone(v.phone),expiresAt:expires.toISOString()});
 }catch(e){console.error(e);res.status(500).json({message:e?.message||'Could not resend OTP'});}
});

app.post('/api/auth/login',async(req,res)=>{
 try{
  const {emailOrPhone,password}=req.body; const value=String(emailOrPhone||'').trim(); const normalizedEmail=normalizeEmail(value); const normalizedPhone=normalizePhone(value);
  const r=await query('SELECT * FROM users WHERE lower(email)=lower($1) OR phone=$2 LIMIT 1',[normalizedEmail,normalizedPhone]);
  if(!r.rowCount||!(await comparePassword(password||'',r.rows[0].password_hash)))return res.status(401).json({message:'Invalid credentials'});
  if(!r.rows[0].is_verified && r.rows[0].role==='user')return res.status(403).json({message:'Account verification is required before login'});
  res.json({user:await publicUser(r.rows[0]),token:signToken(r.rows[0])});
 }catch(e){console.error(e);res.status(500).json({message:'Login failed'});
 }
});

app.get('/api/me',auth,async(req,res)=>{const r=await query('SELECT * FROM users WHERE id=$1',[req.user.id]);if(!r.rowCount)return res.status(404).json({message:'User not found'});res.json({user:await publicUser(r.rows[0])});});

app.get('/api/referral/me',auth,async(req,res)=>{
 const u=await query('SELECT referral_code,referral_balance FROM users WHERE id=$1',[req.user.id]);
 if(!u.rowCount)return res.status(404).json({message:'User not found'});
 const stats=await query(`SELECT COUNT(*) FILTER (WHERE status='credited')::int AS credited_count,COALESCE(SUM(amount) FILTER (WHERE status='credited'),0) AS credited_amount,COUNT(DISTINCT referred_user_id)::int AS invited_users FROM referral_commissions WHERE referrer_id=$1`,[req.user.id]);
 res.json({referralCode:u.rows[0].referral_code,balance:money(u.rows[0].referral_balance),...stats.rows[0],history:[]});
});

app.get('/api/categories',async(req,res)=>{const r=await query('SELECT id,name,slug FROM categories ORDER BY name');res.json(r.rows);});

app.get('/api/phones',async(req,res)=>{try{const {q,brand}=req.query;const params=[];let where='WHERE is_published=true';if(q){params.push(`%${q}%`);where+=` AND (title ILIKE $${params.length} OR model ILIKE $${params.length} OR brand ILIKE $${params.length})`;}if(brand){params.push(brand);where+=` AND brand=$${params.length}`;}const r=await query(`SELECT * FROM phones ${where} ORDER BY created_at DESC`,params);res.json(r.rows.map(phoneDto));}catch(e){res.status(500).json({message:'Could not load phones'});}});
app.get('/api/admin/phones',auth,admin,async(req,res)=>{const r=await query('SELECT * FROM phones ORDER BY created_at DESC');res.json(r.rows.map(phoneDto));});

app.post('/api/phones',auth,admin,uploader.array('images',8),async(req,res)=>{
 try{
  const b=req.body; const price=cleanPrice(b.price);
  if(!b.title||!b.brand||!b.model||!Number.isFinite(price)||!b.condition||!b.location)return res.status(400).json({message:'Title, brand, model, valid price, condition and location are required'});
  const commissionType=b.commissionType==='percent'?'percent':'fixed';
  const commissionValue=cleanPrice(b.commissionValue||0);
  if(!Number.isFinite(commissionValue))return res.status(400).json({message:'Invalid commission amount'});
  if(commissionType==='percent'&&commissionValue>100)return res.status(400).json({message:'Commission percentage cannot exceed 100'});
  const images=[];
  if((req.files||[]).length && !cloudinaryConfigured) return res.status(503).json({message:'Image storage is not configured. Admin must configure Cloudinary before publishing phones.'});
  for(const f of (req.files||[])){const result=await upload(f);images.push(result.secure_url);if(fs.existsSync(f.path))fs.unlinkSync(f.path);}
  const imageUris=b.imageUris?JSON.parse(b.imageUris):[]; images.push(...imageUris);
  const r=await query(`INSERT INTO phones(title,brand,model,price,condition,description,images,location,state,seller_id,seller_name,seller_phone,seller_rating,commission_type,commission_value,is_published) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,[b.title,b.brand,b.model,price,b.condition,b.description||'',JSON.stringify(images),b.location||'',b.state||'',req.user.id,'FULATAN COMMUNICATION',b.sellerPhone||'',5,commissionType,commissionValue,true]);
  res.status(201).json(phoneDto(r.rows[0]));
 }catch(e){console.error(e);res.status(500).json({message:'Could not publish phone'});}
});
app.patch('/api/phones/:id',auth,admin,async(req,res)=>{const b=req.body;const price=b.price===undefined?undefined:cleanPrice(b.price);if(price!==undefined&&!Number.isFinite(price))return res.status(400).json({message:'Invalid price'});const cv=b.commissionValue===undefined?undefined:cleanPrice(b.commissionValue);if(cv!==undefined&&!Number.isFinite(cv))return res.status(400).json({message:'Invalid commission'});const r=await query(`UPDATE phones SET title=COALESCE($1,title),price=COALESCE($2,price),description=COALESCE($3,description),commission_type=COALESCE($4,commission_type),commission_value=COALESCE($5,commission_value),is_published=COALESCE($6,is_published) WHERE id=$7 RETURNING *`,[b.title,price,b.description,b.commissionType,cv,b.isPublished,req.params.id]);if(!r.rowCount)return res.status(404).json({message:'Phone not found'});res.json(phoneDto(r.rows[0]));});
app.delete('/api/phones/:id',auth,admin,async(req,res)=>{const r=await query('DELETE FROM phones WHERE id=$1 RETURNING id',[req.params.id]);if(!r.rowCount)return res.status(404).json({message:'Phone not found'});res.json({ok:true});});

app.post('/api/chats',auth,async(req,res)=>{const {phoneId,phoneTitle,sellerId}=req.body;const r=await query('SELECT id FROM chats WHERE phone_id=$1 AND buyer_id=$2 AND seller_id=$3 LIMIT 1',[phoneId,req.user.id,sellerId]);if(r.rowCount)return res.json({id:r.rows[0].id});const n=await query('INSERT INTO chats(phone_id,phone_title,buyer_id,seller_id) VALUES($1,$2,$3,$4) RETURNING id',[phoneId,phoneTitle,req.user.id,sellerId]);res.status(201).json({id:n.rows[0].id});});
app.get('/api/chats/:id/messages',auth,async(req,res)=>{const c=await query('SELECT buyer_id,seller_id FROM chats WHERE id=$1',[req.params.id]);if(!c.rowCount||(![c.rows[0].buyer_id,c.rows[0].seller_id].includes(req.user.id)&&req.user.role!=='admin'))return res.status(403).json({message:'Chat access denied'});const r=await query('SELECT id,chat_id,sender_id,text,created_at,read FROM messages WHERE chat_id=$1 ORDER BY created_at ASC',[req.params.id]);res.json(r.rows.map(x=>({...x,createdAt:new Date(x.created_at).toISOString()})));});
app.post('/api/chats/:id/messages',auth,async(req,res)=>{const {text}=req.body;if(!text?.trim())return res.status(400).json({message:'Message required'});const c=await query('SELECT buyer_id,seller_id FROM chats WHERE id=$1',[req.params.id]);if(!c.rowCount||(![c.rows[0].buyer_id,c.rows[0].seller_id].includes(req.user.id)&&req.user.role!=='admin'))return res.status(403).json({message:'Chat access denied'});const r=await query('INSERT INTO messages(chat_id,sender_id,text) VALUES($1,$2,$3) RETURNING *',[req.params.id,req.user.id,text.trim()]);await query('UPDATE chats SET last_message=$1,updated_at=NOW() WHERE id=$2',[text.trim(),req.params.id]);res.status(201).json({...r.rows[0],createdAt:new Date(r.rows[0].created_at).toISOString()});});

app.post('/api/orders',auth,async(req,res)=>{
 try{
  const {items,deliveryAddress,phoneNumber,buyerName,buyerEmail,deliveryState,deliveryLga,deliveryLandmark,deliveryMethod='delivery'}=req.body;
  if(req.user?.role!=='user')return res.status(403).json({message:'Only customer accounts can place orders'});
  if(!Array.isArray(items)||!items.length)return res.status(400).json({message:'Cart is empty'});
  if(!buyerName?.trim()||!validEmail(normalizeEmail(buyerEmail))||normalizePhone(phoneNumber).length<10||!deliveryState?.trim()||!deliveryLga?.trim()||!deliveryAddress?.trim())return res.status(400).json({message:'Complete customer and delivery details are required'});
  if(!['delivery','pickup'].includes(deliveryMethod))return res.status(400).json({message:'Invalid delivery method'});
  const account=await query('SELECT name,email,phone FROM users WHERE id=$1',[req.user.id]);
  if(!account.rowCount)return res.status(404).json({message:'Customer account not found'});
  if(normalizeName(buyerName)!==normalizeName(account.rows[0].name)||normalizeEmail(buyerEmail)!==normalizeEmail(account.rows[0].email)||normalizePhone(phoneNumber)!==normalizePhone(account.rows[0].phone))return res.status(400).json({message:'Customer name, email and phone must match the verified account'});
  if(!flutterwaveConfigured)return res.status(503).json({message:'Online payment is not configured. Admin must add Flutterwave credentials before customers can pay.'});
  const ids=items.map(x=>x.phoneId); const r=await query('SELECT id,title,price,commission_type,commission_value FROM phones WHERE id=ANY($1::uuid[]) AND is_published=true',[ids]);
  const map=new Map(r.rows.map(x=>[x.id,x])); let total=0; const normalized=[];
  for(const item of items){const p=map.get(item.phoneId);const qty=Math.max(1,Number(item.quantity||1));if(!p)return res.status(400).json({message:'One of the selected phones is no longer available'});total+=money(p.price)*qty;normalized.push({phoneId:p.id,title:p.title,unitPrice:money(p.price),quantity:qty,commissionType:p.commission_type,commissionValue:money(p.commission_value)});}
  const client=await pool.connect(); let order;
  try{
   await client.query('BEGIN');
   const o=await client.query("INSERT INTO orders(buyer_id,total,delivery_address,phone_number,buyer_name,buyer_email,delivery_state,delivery_lga,delivery_landmark,delivery_method,payment_status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'unpaid') RETURNING *",[req.user.id,total,deliveryAddress.trim(),normalizePhone(phoneNumber),buyerName.trim(),normalizeEmail(buyerEmail),deliveryState.trim(),deliveryLga.trim(),String(deliveryLandmark||'').trim(),deliveryMethod]);
   order=o.rows[0];
   const buyer=await client.query('SELECT referred_by FROM users WHERE id=$1',[req.user.id]);
   for(const x of normalized){
    const oi=await client.query('INSERT INTO order_items(order_id,phone_id,title,unit_price,quantity) VALUES($1,$2,$3,$4,$5) RETURNING id',[order.id,x.phoneId,x.title,x.unitPrice,x.quantity]);
    if(buyer.rows[0]?.referred_by){const amount=commissionFor(x,x.unitPrice,x.quantity);if(amount>0)await client.query('INSERT INTO referral_commissions(referrer_id,referred_user_id,order_id,order_item_id,phone_id,amount) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(order_item_id,referrer_id) DO NOTHING',[buyer.rows[0].referred_by,req.user.id,order.id,oi.rows[0].id,x.phoneId,amount]);}
   }
   await client.query('COMMIT');
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  const payment=await initializeFlutterwave(order,req.user,total);
  res.status(201).json({id:order.id,status:order.status,total,paymentLink:payment.paymentLink,txRef:payment.txRef});
 }catch(e){console.error(e);res.status(500).json({message:e?.message||'Could not create order'});}
});
app.get('/api/orders',auth,async(req,res)=>{const r=await query('SELECT * FROM orders WHERE buyer_id=$1 ORDER BY created_at DESC',[req.user.id]);res.json(r.rows.map(publicOrder));});

app.get('/api/admin/stats',auth,admin,async(req,res)=>{
 const [products,users,orders,revenue]=await Promise.all([
  query('SELECT COUNT(*)::int AS count FROM phones'),
  query("SELECT COUNT(*)::int AS count FROM users WHERE role='user'"),
  query("SELECT COUNT(*)::int AS count FROM orders WHERE created_at >= CURRENT_DATE"),
  query("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status='completed'")
 ]);
 res.json({products:Number(products.rows[0].count),registeredUsers:Number(users.rows[0].count),ordersToday:Number(orders.rows[0].count),revenue:money(revenue.rows[0].total)});
});
app.get('/api/admin/orders',auth,admin,async(req,res)=>{const r=await query(`SELECT o.*,u.name buyer_name,u.email buyer_email,u.phone buyer_phone FROM orders o LEFT JOIN users u ON u.id=o.buyer_id ORDER BY o.created_at DESC`);res.json(r.rows.map(x=>({...publicOrder(x),buyerName:x.buyer_name,buyerEmail:x.buyer_email,buyerPhone:x.buyer_phone})));});
app.patch('/api/admin/orders/:id/status',auth,admin,async(req,res)=>{
 const status=req.body.status; const allowed=['pending','confirmed','processing','shipped','completed','cancelled']; if(!allowed.includes(status))return res.status(400).json({message:'Invalid order status'});
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const current=await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE',[req.params.id]);if(!current.rowCount){await client.query('ROLLBACK');return res.status(404).json({message:'Order not found'});}
  const old=current.rows[0].status;
  if(old==='completed'&&status!=='completed'){
   const comm=await client.query("SELECT * FROM referral_commissions WHERE order_id=$1 AND status='credited' FOR UPDATE",[req.params.id]);
   for(const c of comm.rows){await client.query('UPDATE users SET referral_balance=GREATEST(0,referral_balance-$1) WHERE id=$2',[money(c.amount),c.referrer_id]);await client.query("UPDATE referral_commissions SET status='reversed',credited_at=NULL WHERE id=$1",[c.id]);}
  }
  const completedAt=status==='completed'?'NOW()':(old==='completed'?'NULL':'completed_at');
  const updated=await client.query(`UPDATE orders SET status=$1,completed_at=${completedAt} WHERE id=$2 RETURNING *`,[status,req.params.id]);
  if(status==='completed'&&old!=='completed'){
   const comm=await client.query("SELECT * FROM referral_commissions WHERE order_id=$1 AND status='pending' FOR UPDATE",[req.params.id]);
   for(const c of comm.rows){await client.query('UPDATE users SET referral_balance=referral_balance+$1 WHERE id=$2',[money(c.amount),c.referrer_id]);await client.query("UPDATE referral_commissions SET status='credited',credited_at=NOW() WHERE id=$1",[c.id]);}
  }
  await client.query('COMMIT');res.json(publicOrder(updated.rows[0]));
 }catch(e){await client.query('ROLLBACK');console.error(e);res.status(500).json({message:'Could not update order'});}finally{client.release();}
});

app.get('/api/admin/referrals',auth,admin,async(req,res)=>{const r=await query(`SELECT rc.*,u.name referrer_name,u.referral_code,ru.name referred_name,o.status order_status,p.title phone_title FROM referral_commissions rc JOIN users u ON u.id=rc.referrer_id JOIN users ru ON ru.id=rc.referred_user_id JOIN orders o ON o.id=rc.order_id LEFT JOIN phones p ON p.id=rc.phone_id ORDER BY rc.created_at DESC`);res.json(r.rows.map(x=>({...x,amount:money(x.amount)})));});


app.get('/api/payments/flutterwave/callback',async(req,res)=>{
 try{
  const {transaction_id,tx_ref,status}=req.query;
  if(status!=='successful'||!transaction_id||!tx_ref)return res.status(400).send('<h2>Payment was not completed.</h2>');
  const verified=await verifyFlutterwaveTransaction(transaction_id);
  if(!verified||verified.status!=='successful'||verified.tx_ref!==tx_ref||verified.currency!=='NGN')return res.status(400).send('<h2>Payment verification failed.</h2>');
  const orderId=String(tx_ref).slice(7,String(tx_ref).lastIndexOf('-'));
  const o=await query('SELECT id,total FROM orders WHERE id=$1 AND tx_ref=$2',[orderId,tx_ref]);
  if(!o.rowCount)return res.status(404).send('<h2>Order not found.</h2>');
  if(Math.abs(money(verified.amount)-money(o.rows[0].total))>0.01)return res.status(400).send('<h2>Payment amount mismatch.</h2>');
  await query("UPDATE orders SET payment_status='paid',status=CASE WHEN status='pending' THEN 'confirmed' ELSE status END,paid_at=NOW() WHERE id=$1",[orderId]);
  res.send('<html><body style="font-family:sans-serif;text-align:center;padding:40px"><h2>Payment successful</h2><p>Your FULATAN order has been confirmed. You can return to the app.</p></body></html>');
 }catch(e){console.error(e);res.status(500).send('<h2>Payment verification error.</h2>');}
});
app.post('/api/payments/flutterwave/webhook',async(req,res)=>{
 try{
  const secret=req.headers['verif-hash']; if(!process.env.FLW_WEBHOOK_HASH||secret!==process.env.FLW_WEBHOOK_HASH)return res.status(401).send('Unauthorized');
  const data=req.body?.data; if(data?.status==='successful'&&data?.id){const verified=await verifyFlutterwaveTransaction(data.id);if(verified?.status==='successful'&&verified.tx_ref){const orderId=String(verified.tx_ref).slice(7,String(verified.tx_ref).lastIndexOf('-'));const o=await query('SELECT id,total FROM orders WHERE id=$1 AND tx_ref=$2',[orderId,verified.tx_ref]);if(o.rowCount&&Math.abs(money(verified.amount)-money(o.rows[0].total))<=0.01)await query("UPDATE orders SET payment_status='paid',status=CASE WHEN status='pending' THEN 'confirmed' ELSE status END,paid_at=NOW() WHERE id=$1",[orderId]);}}
  res.sendStatus(200);
 }catch(e){console.error(e);res.sendStatus(500);}
});

app.get('/api/settings/contact',async(req,res)=>{const r=await query("SELECT value FROM app_settings WHERE key='contact'");res.json(r.rowCount?r.rows[0].value:{phone:'',whatsapp:'',chatEnabled:true,callEnabled:true,whatsappEnabled:true,supportLabel:'FULATAN COMMUNICATION'});});
app.put('/api/settings/contact',auth,admin,async(req,res)=>{await query("INSERT INTO app_settings(key,value) VALUES('contact',$1) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value",[JSON.stringify(req.body)]);res.json(req.body);});


app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:'Server error'});});
const port=Number(process.env.PORT||10000); app.listen(port,()=>console.log(`FULATAN API running on :${port}`));
