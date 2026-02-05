import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; 

const Login=()=>{
    const [formData,setFormData]=useState({email:"",password:""});
    const [isLoading, setIsLoading] = useState(false);
    const navigate=useNavigate();

    const handleSubmit=async (e:React.FormEvent)=>{
        e.preventDefault();
        setIsLoading(true);
        try{
            const {data}=await api.post("/auth/login",formData);
            if (data.token) {
                localStorage.setItem("token",data.token);
                alert("Login Success!");
                navigate("/dashboard");
            } else {
                throw new Error("No token received");
            }
        }catch(error:any){
            console.error("Login error:", error);
            alert(error.response?.data?.message || "Login failed.");
        } finally {
            setIsLoading(false);
        }
    }
    return(
        <div className="">
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    required
                    value={formData.email}
                    onChange={(e)=>setFormData({...formData,email:e.target.value})}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    value={formData.password}
                    onChange={(e)=>setFormData({...formData,password:e.target.value})}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    )

}
export default Login;