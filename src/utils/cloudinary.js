import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


 const uploadOnCloudinary= async (localFilePath) => {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
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
    //    console.log("file added successfully",uploadResult);
       fs.unlinkSync(localFilePath)
       return uploadResult
    }
       catch(error) {
        fs.unlinkSync(localFilePath)
        return null
       };
    
    // console.log(uploadResult);
 
};


export { uploadOnCloudinary }