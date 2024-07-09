import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


 const uploadOnCloudinary= async (localFilePath) => {

    // Configuration
    cloudinary.config({ 
        cloud_name: 'drqard4qh', 
        api_key: '623977959327823', 
        api_secret: 'qBSklGYLRZg_t3rRcoY-DAAP9IE' // Click 'View Credentials' below to copy your API secret
    });
    
    // Upload an image
    try{
        if(!localFilePath)
            return null
     const uploadResult = await cloudinary.uploader
       .upload(
           localFilePath, {
               
               resource_type: 'auto'
           }
       )
       console.log("file added successfully",uploadResult);
       return uploadResult
    }
       catch(error) {
        fs.unlinkSync(localFilePath)
        return null
       };
    
    // console.log(uploadResult);
 
};


export { uploadOnCloudinary }