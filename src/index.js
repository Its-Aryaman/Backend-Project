
import dotenv from "dotenv"
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from 'express'
import connectDB from "./db/index.js"


dotenv.config({path: './.env'})



connectDB()























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