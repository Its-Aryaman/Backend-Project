import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";



const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,
            required: true,

            },

        thumbnail: {
            type: String,
            required: true,
            
        },
        
        title:{
            type:String,
            required: true,

        },

        description: {
            type: String,
            required: true

        },

        duration: {
        type: Number,
        required: true
        
        },

        views: 
            {
            type: Number,
            required: true,
            default: 0
            },

        isPublished: {
            type: Boolean,
            default: true

        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"

        }


    },{timestamps: true})



export const Video= mongoose.model("Video",videoSchema)