import { BrowserRouter, Navigate, Route, Router, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const PrivateRoute=({children}:{children:JSX.Element})=>{
  const token=localStorage.getItem("token");
  return token ? children : <Navigate to="/login"/>;
}

export default function App(){
  return<>
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
        <Route path="/" element={<Navigate to="/dashboard"/>}/>
      </Routes>
    </BrowserRouter>
  </>
}
