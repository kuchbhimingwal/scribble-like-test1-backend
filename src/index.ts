import express from 'express'
import cors from "cors"
import z from "zod"
import jwt from "jsonwebtoken"
import authMiddelware from './middleware'

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
  try {
    await prisma.user.create({
      data:{
        email: body.email,
        name: body.name,
        password: body.name
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

app.listen(3000), ()=>{console.log("listning on port 3000");
};