const fs=require('fs'); const path=require('path'); const {query,pool}=require('./db');
(async()=>{ try { await query(fs.readFileSync(path.join(__dirname,'../db/schema.sql'),'utf8')); console.log('FULATAN database migrated.'); } catch(e){ console.error(e); process.exitCode=1; } finally { await pool.end(); } })();
