import {useState} from "react";
import api from "../api/axios";

const Register=()=>{
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [message,setMessage]=useState("");

    const handleRegister=async(e:React.FormEvent)=>{
        e.preventDefault();
        try{
            await api.post("/auth/register",{email,password});
            setMessage("Registration successful!");
        }catch(error:any){
            setMessage(error.response?.data?.message || "Registration failed.");
        }
    }

    return(
        <>
        <div className="max-w-md m-auto m-12">
            <h2 className="text-2xl mb-4">Register</h2>
            <form onSubmit={handleRegister}>
                <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-2 mb-4 border border-gray-300 rounded"/>
                <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-2 mb-4 border border-gray-300 rounded"/>
                <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Register</button>
            </form>
            {message && <p className="mt-4">{message}</p>}
        </div>
        </>
    )
}

export default Register;