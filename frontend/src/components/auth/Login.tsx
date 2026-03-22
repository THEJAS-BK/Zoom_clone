import React, { useState, type JSX } from "react";
import type {LoginFormData} from "../../types/Auth"
import "./Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function Login():JSX.Element {
    const [formData,setFormData]=useState<LoginFormData>(
        {
            email:"",
            password:"",
        }
    )
    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        let fieldName=e.target.name as keyof LoginFormData;
        let fieldValue=e.target.value

        setFormData((curData)=>{
            return {...curData,[fieldName]:fieldValue}
        })
    }

    const navigate=useNavigate();

    //send inputs to backend
    const handleSubmit=async (e:React.SubmitEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const res = await axios.post("http://localhost:8080/auth/login",
        formData,
        {
        headers:{
          "Content-Type":"application/json"
        },
      })

     if(res.status===200){
      console.log("success")
     }
      
    }

  return (
    <form className="container" onSubmit={handleSubmit}>
      <div className="signup">
        <h1>Login</h1>
        <div className="content">
          <input onChange={handleChange} placeholder="Email" type="text" name="email" id="" />
          <input onChange={handleChange} placeholder="Password" type="password" name="password" id="" />
        </div>
        <button className="send">Login</button>
      </div>
    </form>
  );
}
