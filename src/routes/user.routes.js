import { Router } from "express";
import { loginUser, registerUser , logoutUser, refreshAccessToken, changeuserPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, uploadVideo } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/register").post(
    upload.fields([
        {
        name: "avatar",
        maxCount: 1
    },{
        name: "coverImage",
        maxCount: 1
    }]),
registerUser);

router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshToken").post(refreshAccessToken)
router.route("/changePassword").post(verifyJWT,changeuserPassword)
router.route("/currentUser").post(verifyJWT,getCurrentUser)
router.route("/updateAccountDetails").post(verifyJWT,updateAccountDetails)
router.route("/avatar").post(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover").post(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/video").post(verifyJWT,upload.single("video"),uploadVideo)




export default router