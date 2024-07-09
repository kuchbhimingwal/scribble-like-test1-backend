import express from 'express'
import cors from "cors"
import z from "zod"
import jwt from "jsonwebtoken"
import authMiddelware from './middleware'
import WebSocket, { WebSocketServer } from 'ws';

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
app.use(cors());
app.use(express.json());

const signupBody = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string()
})
const signinBody = z.object({
  email: z.string().email(),
  password: z.string()
})
app.post("/signup", async(req,res)=>{
  const body = req.body;

  const {success} = signupBody.safeParse(body);
  if(!success){
    return res.status(401).json({message: "invalid creadentials"})
  }
  const userAlready = await prisma.user.findMany({
    where:{
      email: body.email
    }
  }) 
  if(userAlready[0]){
    return res.status(401).json({message:"email already in use"});
  }
  try {
    await prisma.user.create({
      data:{
        email: body.email,
        name: body.name,
        password: body.password
      }
    })
    return res.status(200).json({message: "user created"});
  } catch (error) {
    console.log(error);
    return res.status(400).json({message: "error while creating user", error: error})
  }
})

app.get("/signin",async(req,res)=>{
  const body = req.body;

  const { success } = signinBody.safeParse(body);
  if(!success){
    return res.status(401).json({message: "invalid creadentials"});
  }

  try {
    const user = await prisma.user.findUnique({
      where:{
        email: body.email,
        password: body.password
      }
    })
    if(!user){
      return res.status(411).json({message: "user does not exists"})
    }
    if(!JWT_SECRET) return
    const token = jwt.sign({userId: user.id}, JWT_SECRET) ;
    return res.status(200).json({message: "signedin", token: token})
  } catch (error) {
    return res.status(411).json({message: "error while signing in", error: error})
  }
});

const httpServer = app.listen(3000, ()=>{console.log("listning on http://localhost:3000");
});


const wss = new WebSocketServer({ server: httpServer });
let connectedSockets = [];
let connectedUsers = [];
wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data:any) {
    const message = JSON.parse(data);
    if (message.type === 'connect') {
      connectedSockets.push(ws);
      connectedUsers.push(message.userId);
      if(connectedSockets[0]){
        connectedSockets.forEach((connectedsocket)=>{
          connectedsocket?.send(JSON.stringify({ users :  connectedUsers}));
        })
      }
    }
  });

  ws.send('Hello! Message From Server!!');
});