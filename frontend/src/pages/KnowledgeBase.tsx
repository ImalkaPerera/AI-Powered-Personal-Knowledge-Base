import React, { useState, useEffect, useCallback } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';

interface Document {
    id: string;
    name: string;
    s3Key: string;
    size: number;
    mimeType: string;
    createdAt: string;
}

interface UploadProgress {
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

const KnowledgeBase: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<UploadProgress[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch documents from API
    const fetchDocuments = useCallback(async () => {
        try {
            setError(null);
            const response = await api.get('/documents');
            setDocuments(response.data);
        } catch (err: any) {
            setError('Failed to fetch documents');
            console.error('Error fetching documents:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Handle drag and drop events
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    }, []);

    // Handle file input
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };

    // Process uploaded files
    const handleFiles = (files: File[]) => {
        const newUploads: UploadProgress[] = files.map(file => ({
            file,
            progress: 0,
            status: 'uploading'
        }));

        setUploading(prev => [...prev, ...newUploads]);

        files.forEach((file, index) => {
            uploadFile(file, uploading.length + index);
        });
    };

    // Upload individual file
    const uploadFile = async (file: File, index: number) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        
                        setUploading(prev => 
                            prev.map((upload, i) => 
                                i === index 
                                    ? { ...upload, progress: percentCompleted }
                                    : upload
                            )
                        );
                    }
                }
            });

            // Update upload status to success
            setUploading(prev => 
                prev.map((upload, i) => 
                    i === index 
                        ? { ...upload, status: 'success', progress: 100 }
                        : upload
                )
            );

            // Add new document to the list
            setDocuments(prev => [response.data, ...prev]);

            // Remove from uploading after a delay
            setTimeout(() => {
                setUploading(prev => prev.filter((_, i) => i !== index));
            }, 2000);

        } catch (err: any) {
            console.error('Upload error:', err);
            setUploading(prev => 
                prev.map((upload, i) => 
                    i === index 
                        ? { 
                            ...upload, 
                            status: 'error', 
                            error: err.response?.data?.message || 'Upload failed' 
                          }
                        : upload
                )
            );
        }
    };

    // Remove failed upload
    const removeUpload = (index: number) => {
        setUploading(prev => prev.filter((_, i) => i !== index));
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading documents...</span>
            </div>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
                <p className="text-gray-600">Upload and manage your documents</p>
            </div>

            {/* Upload Area */}
            <div className="mb-8">
                <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive 
                            ? 'border-blue-400 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Drop files here or click to upload
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Support for PDF, DOC, DOCX, TXT and other document types
                    </p>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx,.txt,.md"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Choose Files
                    </button>
                </div>
            </div>

            {/* Upload Progress */}
            {uploading.length > 0 && (
                <div className="mb-8 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Uploading Files</h3>
                    <div className="space-y-3">
                        {uploading.map((upload, index) => (
                            <div key={index} className="bg-white rounded-md p-3 border">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <File className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-sm font-medium text-gray-900">
                                            {upload.file.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        {upload.status === 'uploading' && (
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                                        )}
                                        {upload.status === 'success' && (
                                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                        )}
                                        {upload.status === 'error' && (
                                            <>
                                                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                                <button
                                                    onClick={() => removeUpload(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            upload.status === 'success' 
                                                ? 'bg-green-600' 
                                                : upload.status === 'error'
                                                ? 'bg-red-600'
                                                : 'bg-blue-600'
                                        }`}
                                        style={{ width: `${upload.progress}%` }}
                                    ></div>
                                </div>
                                {upload.error && (
                                    <p className="text-sm text-red-600 mt-1">{upload.error}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-red-800">{error}</span>
                    </div>
                </div>
            )}

            {/* Documents List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
                </div>
                
                {documents.length === 0 ? (
                    <div className="p-8 text-center">
                        <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                        <p className="text-gray-600">Upload your first document to get started</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {documents.map((doc) => (
                            <div key={doc.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <File className="h-8 w-8 text-gray-400 mr-3" />
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {doc.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {formatFileSize(doc.size)} • {doc.mimeType}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatDate(doc.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
        </Layout>
    );
};

export default KnowledgeBase;