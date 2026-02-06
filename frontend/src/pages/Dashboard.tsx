import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user, logout, loading } = useAuth();

    if (loading) return <p>Loading your knowledge base...</p>;
    if (!user) return <p>No user data available</p>;

    return (
        <div>
            <header>
                <h1>Welcome, {user.email}</h1>
            </header>
            {/* The logout function now handles both API call and state cleanup */}
            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default Dashboard;