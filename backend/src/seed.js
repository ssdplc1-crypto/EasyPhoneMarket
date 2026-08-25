require('dotenv').config();
const {query,pool}=require('./db'); const {hashPassword}=require('./auth');
function code(name){return `${String(name||'USER').replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,5)||'USER'}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;}
(async()=>{try{
 const email=process.env.ADMIN_EMAIL||'admin@fulatan.com'; const password=process.env.ADMIN_PASSWORD; if(!password)throw new Error('Set ADMIN_PASSWORD before seeding.');
 const hash=await hashPassword(password);
 await query(`INSERT INTO users(name,email,phone,password_hash,role,referral_code) VALUES($1,$2,$3,$4,'admin',$5,TRUE) ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,role='admin',is_verified=TRUE`,['FULATAN Admin',email,'2348000000000',hash,code('ADMIN')]);
 const users=await query("SELECT id,name FROM users WHERE referral_code IS NULL"); for(const u of users.rows){let c;do{c=code(u.name);}while((await query('SELECT 1 FROM users WHERE referral_code=$1',[c])).rowCount);await query('UPDATE users SET referral_code=$1 WHERE id=$2',[c,u.id]);}
 const cats=[['Apple','apple'],['Samsung','samsung'],['Tecno','tecno'],['Infinix','infinix'],['Xiaomi','xiaomi'],['Oppo','oppo'],['Vivo','vivo'],['Huawei','huawei'],['Nokia','nokia'],['Other','other']]; for(const [name,slug] of cats)await query('INSERT INTO categories(name,slug) VALUES($1,$2) ON CONFLICT DO NOTHING',[name,slug]);
 console.log('FULATAN production admin, categories and referral codes ready.');
}catch(e){console.error(e);process.exitCode=1;}finally{await pool.end();}})();
