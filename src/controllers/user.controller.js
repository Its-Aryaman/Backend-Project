import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req,res) => {
    



    const {fullName, email, username ,password}= req.body
    // console.log("email",email,fullName,username,password);

    if([fullName,email,username,password].some((field) => field?.trim()==="")){
    throw new ApiError(400,"fields is required");}

    // if(fullName=== ""){
    //     throw new ApiError(400,"full name is required");
    // }
    // if(email==="")
    //     throw new ApiError(400,"email is required");
    // if(username==="")
    //     throw new ApiError(400,"username is required");
    // if (password==="") {
    // throw new ApiError(400,"password is required")
// }



    const existedUser=await User.findOne({
        $or : [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User already existes with email or username")
    }

    console.log(req.files)
    
    const avatarLocalPath= req.files?.avatar[0]?.path
    const coverImageLocalPath= req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
    throw new ApiError(400,"avatar not found")
    }


    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(! avatar)
    throw new ApiError(400,"avatar not finnaly found")


    const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username
    })

    const createdUser= await User.findById(user._id).select("-password -refreshTokens")

    if(!createdUser){
    throw new ApiError(500,"Something went wrong while creating the user");
    }
    
    return res.status(201).json(
        
           new ApiResponse(200,createdUser,"User registed successfully")

        )

})


export {registerUser}

