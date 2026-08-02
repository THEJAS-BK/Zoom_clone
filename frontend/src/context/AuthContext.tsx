import { createContext, useContext, useState } from "react";
import type {ReactNode} from "react"

interface AuthContextType{
  accessToken:string|null,
  login:(accessToken:string,refreshToken:string)=>void,
  logout:()=>void
}

const AuthContext=createContext<AuthContextType|null>(null);

export const AuthProvider=({children}:{children:ReactNode})=>{
  const [accessToken,setaccessToken]=useState<string|null>(
    localStorage.getItem("accessToken")
  )
  const login = (accessToken:string,refreshToken:string)=>{
    localStorage.setItem("accessToken",accessToken)
    localStorage.setItem("refreshToken",refreshToken)
    setaccessToken(accessToken)
  }
  const logout=()=>{
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setaccessToken(null);
  }
  return (
    <AuthContext.Provider value={{accessToken,login,logout}}>
      {children}
    </AuthContext.Provider>
  )
};

export const useAuth=()=>{
  const context=useContext(AuthContext);
  if(!context) throw new Error("useAuth must be used inside AuthProvider")
    return context;
}