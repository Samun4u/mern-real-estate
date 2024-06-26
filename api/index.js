import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRouter from './server/routes/user.route.js';
import authRouter from './server/routes/auth.router.js';
import listingRouter from './server/routes/listing.router.js';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log(err);
});

const app = express();

app.listen('3000',()=>{
    console.log('server is connected');
})


app.use(express.json());
app.use(cookieParser());

app.use("/api/user",userRouter);
app.use("/api/auth",authRouter);
app.use("/api/listing",listingRouter);

app.use((err,req,res,next)=>{
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})