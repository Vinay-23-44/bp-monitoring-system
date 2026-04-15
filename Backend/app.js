import 'dotenv/config'
import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import cors from 'cors';
const PORT = 4444;
const app =express();
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));
import authRoutes from './http/routes/auth.routes.js'
import requireAuth from './http/middlewares/requireAuth.js';
import bpRoutes from './http/routes/bp.routes.js';
import recommendationRoutes from './http/routes/users.routes.js';
import "./http/jobs/medicationJob.js";
import medicationRoutes from './http/routes/medication.routes.js';
import profileRoutes from './http/routes/profile.routes.js'
import consultationRoutes from "./http/routes/consultation.routes.js";
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/auth',authRoutes);
app.use('/api/user/',requireAuth,recommendationRoutes);
app.use('/api/bp/',requireAuth,bpRoutes);
app.use('/api/medication',requireAuth,medicationRoutes);
app.use('/api/profile',requireAuth,profileRoutes)
app.use('/api/consultations', requireAuth, consultationRoutes);
app.get('/',(req,res)=>{
    res.send('hello ankit')
})

app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`);
})