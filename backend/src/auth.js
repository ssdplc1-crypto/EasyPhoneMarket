const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('./db');
function signToken(user) { return jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' }); }
function auth(req,res,next){ try { const h=req.headers.authorization||''; if(!h.startsWith('Bearer ')) return res.status(401).json({message:'Authentication required'}); req.user=jwt.verify(h.slice(7),process.env.JWT_SECRET); next(); } catch { return res.status(401).json({message:'Invalid or expired token'}); } }
function admin(req,res,next){ if(req.user?.role!=='admin') return res.status(403).json({message:'Admin access required'}); next(); }
async function hashPassword(password){ return bcrypt.hash(password,12); }
async function comparePassword(password,hash){ return bcrypt.compare(password,hash); }
async function publicUser(row){ return { id:row.id,name:row.name,email:row.email,phone:row.phone,avatar:row.avatar,location:row.location,rating:Number(row.rating||5),totalSales:Number(row.total_sales||0),joinedAt:new Date(row.created_at).toISOString().split('T')[0],role:row.role,referralCode:row.referral_code||null,referralBalance:Number(row.referral_balance||0),referredBy:row.referred_by||null }; }
module.exports={signToken,auth,admin,hashPassword,comparePassword,publicUser};
