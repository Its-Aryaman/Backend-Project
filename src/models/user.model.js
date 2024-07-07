import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'json-web-token'



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


    userSchema.pre('save', async function(next)
        {
            if(! this.isModified("password")) return next();
            this.passowrd=bcrypt.hash(this.passowrd,10)
            next()


        }
    )

    userSchema.methods.isPasswordCoreect= async function(passowrd){
        return await bcrypt.compare(passowrd,this.passowrd)
    }


    userSchema.methods.generateAccessToken = function(){
        jwt.sign(
            {
                _id: this._id,
                username: this.username,
                email: this.email,
                fullName: this.fullName

            },process.env.ACCESS_TOKEN_SECRET,{expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
        )
    }
    userSchema.methods.generateRefreshToken = function(){
        jwt.sign(
            {
            _id: this.id,
            },process.env.REFRESH_TOKEN_SECRET,{expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
        )
    }

export const User= mongoose.model("User",userSchema)