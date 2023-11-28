import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.router.js';
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

app.use("/api/user",userRouter);
app.use("/api/auth",authRouter);