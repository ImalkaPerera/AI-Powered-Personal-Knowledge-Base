import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; 

const Login=()=>{
    const [formData,setFormData]=useState({email:"",password:""});
    const navigate=useNavigate();

    const handleSubmit=async (e:React.FormEvent)=>{
        e.preventDefault();
        try{
            const {data}=await api.post("/auth/login",formData);
            localStorage.setItem("token",data.token);
            alert("Login Success!");
            navigate("/dashboard");
        }catch(error:any){
            alert(error.response?.data?.message || "Login failed.");
        }
    }
    return(
        <div className="">
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" onChange={(e)=>setFormData({...formData,email:e.target.value})}/>
                <input type="password" placeholder="Password" onChange={(e)=>setFormData({...formData,password:e.target.value})}/>
                <button type="submit">Login</button>
            </form>
        </div>
    )

}
export default Login;