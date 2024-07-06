import mongoose, { Schema } from "mongoose";



const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true

            },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },
        
        fullName:{
            type:String,
            required: true,
            index: true,
            trim:  true
        },

        avatar: {
        type: String,
        required: true

        },

        coverImage: {
        type: String,
        
        },
        watchHistroy: [
            {
            type: Schema.Types.ObjectId,
            ref: "Video"
            }
        ],

        passowrd: {
            type: String,
            required: [true,"Password is required"]

        },
        refreshTokens: {
            type: String,
            
        }


    },{timestamps: true})



export const User= mongoose.model("User",userSchema)