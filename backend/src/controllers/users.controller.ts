import { Request,Response } from "express"
import User from "../models/user.model"

const getUser=async (req:Request,res:Response)=>{
   console.log("hererer")
   console.log(req.userId)
   if(!req.userId){
    res.status(401).json({message:"unauthorized"})
   }

   const user=await User.findById(req.userId).select("name email")
   if(!user){
    return res.status(404).json({message:"user not found"})
   }
   res.json(user)
}


export {getUser}