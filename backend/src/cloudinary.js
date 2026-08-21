const cloudinary = require('cloudinary').v2;
const configured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if(configured) cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET});
async function upload(file){ if(!configured) return null; return cloudinary.uploader.upload(file.path,{folder:'fulatan/phones',resource_type:'image'}); }
module.exports={upload,configured};
