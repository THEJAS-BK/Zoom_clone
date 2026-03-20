import React, { useEffect, useState, type JSX } from "react";
import type {Formdata} from "../../types/Register"
import "./Register.css";
import axios from "axios";
export default function Register():JSX.Element {
    const [formData,setFormData]=useState<Formdata>(
        {
            name:"",
            email:"",
            password:"",
        }
    )
    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        let fieldName=e.target.name as keyof Formdata;
        let fieldValue=e.target.value

        setFormData((curData)=>{
            return {...curData,[fieldName]:fieldValue}
        })
        console.log(formData)
    }

    //send inputs to backend
    const handleSubmit=(e:React.SubmitEvent<HTMLFormElement>)=>{
      e.preventDefault();
      axios.post("http://localhost:8080/auth/register",{
        headers:{
          "Content-Type":"application/json"
        },
        body:formData,
      })
    }

  return (
    <form className="container" onSubmit={handleSubmit}>
      <div className="signup">
        <h1>Signup</h1>
        <div className="content">
          <input onChange={handleChange} placeholder="Name" type="text" name="name" id="" />
          <input onChange={handleChange} placeholder="email" type="email" name="email" id="" />
          <input onChange={handleChange} placeholder="password" type="password" name="password" id="" />
        </div>
        <button className="send">Register</button>
      </div>
    </form>
  );
}
