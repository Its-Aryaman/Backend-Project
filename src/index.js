
import dotenv from "dotenv"
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from 'express'
import connectDB from "./db/index.js"
import app from "./app.js"


dotenv.config({path: './.env'})



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000,()=> {
        console.log(`listening to ${process.env.PORT}`);
    })
    app.on("error", (err) => {
    console.log("error",err)
    throw err;
})})
.catch((err)=> {
console.log("Mongo DB connection failed", err);})























// const app= express();

// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log("Error")
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`listening on ${process.env.PORT}`)
//         })
        
//     } catch (error) {
//         console.error("error");
//         throw error
        
//     }
// })()