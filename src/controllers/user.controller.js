import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        // console.log(userId);
        const user = await User.findById(userId)
        // console.log(user);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshTokens = refreshToken
        await user.save({ validateBeforeSave: false })

        // console.log(user)

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}



const registerUser = asyncHandler( async (req,res) => {
    



    const {fullName, email, username ,password}= req.body
    // console.log("email",email,fullName,username,password);
    // console.log(req.body);

    if([fullName,email,username,password].some((field) => field?.trim()==="")){
        throw new ApiError(400,"fields is required");}



    const existedUser=await User.findOne({
        $or : [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User already existes with email or username")
    }

    // console.log(req.files)
    
    const avatarLocalPath= req.files?.avatar[0]?.path
    // const coverImageLocalPath= req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
        coverImageLocalPath= req.files.coverImage[0].path

    

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





const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(req.body);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCoreect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

    // console.log(user._id);

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})


const logoutUser = asyncHandler(async(req,res) => {
    console.log(req.user);
    await User.findByIdAndUpdate(
        req.user._id,
            {
                $set: {
                refreshTokens: undefined
                    }
            },
            {
                new: true
            }
        )

    const options = {
    httpOnly: true,
    secure: true

    }


    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, 
            "User logged Out Successfully"
        )
    )

})


const refreshAccessToken = asyncHandler(async(req,res) => {

    const incomingrefreshToken = req.cookies.refreshToken
    console.log(incomingrefreshToken);

    if(!incomingrefreshToken)
    throw new ApiError(401,"Unauthorized request");


    const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)
    console.log(decodedToken)


    const user = await User.findById(decodedToken?._id)   
    console.log(user);

    if(incomingrefreshToken !== user.refreshTokens)
        throw new ApiError(401,"Refresh token is expired or used")

    const {accessToken,refreshToken}=await generateAccessAndRefereshTokens(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(201)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json( new ApiResponse(200,"Access Token refreshed success"))

    })
    

const changeuserPassword = asyncHandler(async(req,res) => {

const {oldPassword,newPassword}=req.body

console.log(req.user)

const user= await User.findById(req.user?._id)

const checkPassword= await user.isPasswordCoreect(oldPassword)

if(!checkPassword)
    throw new ApiError(401,"incorrect password")

user.password = newPassword;

await user.save({ validateBeforeSave: false })


return res.status(200).json( new ApiResponse(200,{},"Password changed Successfully"))


})



const getCurrentUser = asyncHandler(async(req,res) => {

return res
.status(200)
.json(new ApiResponse(200, req.user , "Current User fetched Successfully"))

    



})


const updateAccountDetails = asyncHandler(async(req,res) => {

const {fullName,email}=req.body

if(!(fullName || email))
    throw new ApiError(401,"need fullName or email")


const user = await User.findById(req.user?._id)
if(fullName)
    user.fullName = fullName
if(email)
    user.email= email

await user.save({validateBeforeSave: false})


const users = await User.findById(user._id).select("-password -refreshTokens")

return res.status(200).json(new ApiResponse(200,users,"fullName email changed successfully"))


})

const updateUserAvatar = asyncHandler( async(req, res) => {


const localAvatar= await req.file?.path

console.log(localAvatar)

if(!localAvatar)
    throw new ApiError(401,"Avatar not found")


// const AvatarUrl = await uploadOnCloudinary(localAvatar)

const avatar= await uploadOnCloudinary(localAvatar)

console.log(avatar);

if(!avatar.url)
    throw new ApiError( 500,"cloudinary update fault")

const user =  await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
        avatar: avatar.url
        }
    },
    {
        new: true

    } ).select("-password -refreshTokens")

    return res.status(200).json(new ApiResponse(200, user,"Avatar changed successfully"))

})



const updateUserCoverImage = asyncHandler( async(req, res) => {


const localCover= await req.file?.path

console.log(localCover)

if(!localCover)
    throw new ApiError(401,"coverImage not found")


// const AvatarUrl = await uploadOnCloudinary(localAvatar)

const cover= await uploadOnCloudinary(localCover)

console.log(cover);

if(!cover.url)
    throw new ApiError( 500,"cloudinary update fault")

const user =  await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
        coverImage: cover.url
        }
    },
    {
        new: true

    } ).select("-password -refreshTokens")

    return res.status(200).json(new ApiResponse(200, user,"coverImage changed successfully"))

})

const uploadVideo = asyncHandler( async(req,res) => {

const localVideo = await req.file?.path

if(!localVideo)
 throw new ApiError(401,"Video not uploaded");

 console.log(localVideo);


const video=await uploadOnCloudinary(localVideo);

console.log(video);

if(!video)
 throw new ApiError(500,"cloudinary server error");

return res.status(201).json( new ApiResponse(201,"video uploaded"));

})






// const loginUser = asyncHandler( async (req,res) => {

    

//     const {username,password,email}= req.body
//     console.log(req.body);

//     if(!username && !email)
//         throw new ApiError(401,"username or email required to login");

//     const user= await User.findOne({
//         $or: [{username},{email}]
//         })

//         console.log(user._id);

//     if(!user)
//         throw new ApiError(401,"User doesn't exist")

//     const isPasswordValid = await user.isPasswordCoreect(password)


//     if(!isPasswordValid)
//     throw new ApiError(401,"invalid password")

//     const {accessToken, refreshToken}= generateAccessTokenANDrefreshTokens(user)

//     const loggedinUser = await User.findById(user._id).select("-password -refreshTokens")

//     const options = {
//     httpOnly: true,
//     secure: true
//     }
    
//     return res
//     .status(200)
//     .cookie("accessToken",accessToken,options)
//     .cookie("refreshToken",refreshToken,options)
//     .json( new ApiResponse(200,"user loggedin"))






// })


export {registerUser,
loginUser,
logoutUser,
refreshAccessToken,
changeuserPassword,
getCurrentUser,
updateAccountDetails,
updateUserAvatar,
updateUserCoverImage,
uploadVideo
}

