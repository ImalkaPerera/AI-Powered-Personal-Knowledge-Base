import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Dashboard = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                const { data } = await api.get("/auth/me");
                setUser(data);
            } catch (error: any) {
                console.error("Failed to fetch user:", error);
                setError(error.response?.data?.message || "Failed to load user data");
                localStorage.removeItem("token");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    }

    if (loading) return <p>Loading your knowledge base...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!user) return <p>No user data available</p>;

    return (
        <div>
            <header>
                <h1>Welcome, {user.email}</h1>
            </header>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Dashboard;