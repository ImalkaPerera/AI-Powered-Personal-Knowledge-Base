import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading your knowledge base...</p>
    </div>;
    
    if (!user) return <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No user data available</p>
    </div>;

    const renderContent = () => {
        switch (location.pathname) {
            case '/dashboard/chat':
                return (
                    <div className="max-w-4xl">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Chat</h3>
                            <p className="text-gray-600">Chat interface coming soon...</p>
                        </div>
                    </div>
                );
            case '/dashboard/knowledge':
                return (
                    <div className="max-w-4xl">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Knowledge Base</h3>
                            <p className="text-gray-600">Document management coming soon...</p>
                        </div>
                    </div>
                );
            case '/dashboard/settings':
                return (
                    <div className="max-w-4xl">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Settings</h3>
                            <p className="text-gray-600">Account settings coming soon...</p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="max-w-4xl">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Welcome to your AI Knowledge Assistant</h3>
                            <p className="text-gray-600 mb-6">
                                Get started by uploading documents to your knowledge base or start a conversation with the AI.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <h4 className="font-medium text-blue-900">Chat</h4>
                                    </div>
                                    <p className="text-blue-700 text-sm">Start a conversation with your AI assistant</p>
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h4 className="font-medium text-green-900">Knowledge Base</h4>
                                    </div>
                                    <p className="text-green-700 text-sm">Upload and manage your PDF documents</p>
                                </div>

                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                        <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        </svg>
                                        <h4 className="font-medium text-purple-900">Settings</h4>
                                    </div>
                                    <p className="text-purple-700 text-sm">Configure your account and Azure settings</p>
                                </div>
                            </div>

                            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h5 className="font-medium text-gray-800 mb-2">Quick Stats</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Account:</span>
                                        <span className="ml-2 font-medium text-gray-800">{user.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Documents:</span>
                                        <span className="ml-2 font-medium text-gray-800">0 uploaded</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <span className="ml-2 font-medium text-green-600">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Layout>
            {renderContent()}
        </Layout>
    );
}

export default Dashboard;