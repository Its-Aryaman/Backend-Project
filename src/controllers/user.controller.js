import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'json-web-token'

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        console.log(userId);
        const user = await User.findById(userId)
        console.log(user);
        const accessToken = await user.generateAccessToken()
        const refreshToken = awaituser.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}




// const generateAccessTokenANDrefreshTokens = async (users) => {
// try {
//     console.log(users);
//     // const user = User.findById(userId)
//     const accessToken= users.generateAccessToken()
//     const refreshToken = users.generateRefreshToken()
//     users.refreshTokens = refreshToken
//     users.save({validateBeforeSave: false})
//     return {accessToken,refreshToken}
    
// } catch (error) {
//     throw new ApiError(500,"server error")
    
// }
// }

const registerUser = asyncHandler( async (req,res) => {
    



    const {fullName, email, username ,password}= req.body
    // console.log("email",email,fullName,username,password);
    console.log(req.body);

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
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

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

    console.log(user._id);

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
    .status(200).clearcookie
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, 
            {
                user: logoutUser , accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})


const refreshAccessToken = asyncHandler(async(req,res) => {

    const incomingrefreshToken = req.cookies.refreshToken

    if(!incomingrefreshToken)
    throw new ApiError(401,"Unauthorized request");


    const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)


    const user = await User.findById(decodedToken?._id)   

    if(incomingrefreshToken !== user)
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
logoutUser}

