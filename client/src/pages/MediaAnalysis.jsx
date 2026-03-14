import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, Zap, Eye, Image, Video, ShieldAlert } from 'lucide-react'
import axios from 'axios'
import AnalysisLoader from '../components/AnalysisLoader'
import { useAuth } from '../context/AuthContext'

export default function MediaAnalysis() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [analyzing, setAnalyzing] = useState(false)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [error, setError] = useState('')
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!user) {
            setShowLoginPrompt(true)
            return
        }

        const file = acceptedFiles[0]
        if (!file) return
        setError('')
        setUploadedFile(file)
        setAnalyzing(true)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await axios.post('/api/scans/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
            })
            setTimeout(() => {
                setAnalyzing(false)
                navigate('/results', { state: { result: res.data, file: { name: file.name, type: file.type, size: file.size } } })
            }, 500)
        } catch (err) {
            setAnalyzing(false)
            setError(err.response?.data?.message || 'Analysis failed. Please ensure the backend is running.')
        }
    }, [user, navigate])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'], 'video/*': ['.mp4', '.mov', '.avi', '.webm'] },
        maxFiles: 1,
        maxSize: 100 * 1024 * 1024,
        disabled: analyzing,
    })

    if (analyzing) return <AnalysisLoader fileName={uploadedFile?.name} fileType={uploadedFile?.type} />

    return (
        <div className="min-h-[calc(100vh-64px)] hero-bg grid-bg flex flex-col items-center justify-center py-12 px-4 relative">
            <div className="max-w-3xl w-full text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 glass-card border" style={{ borderColor: 'rgba(91,120,245,0.3)' }}>
                    <Eye size={14} className="text-brand-400" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Deep Vision Forensics Engine
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Media <span className="gradient-text">Analysis</span>
                </h1>
                <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    Upload an image or video to verify its authenticity using our multi-model neural and statistical forensic pipeline.
                </p>
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`drop-zone w-full max-w-2xl cursor-pointer p-12 transition-all ${isDragActive ? 'active' : ''}`}
                onClick={(e) => {
                    if (!user) {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowLoginPrompt(true)
                    }
                }}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(91,120,245,0.15)', border: '1px solid rgba(91,120,245,0.3)' }}>
                            <Upload size={36} className="text-brand-400" />
                        </div>
                        {isDragActive && <div className="absolute inset-0 rounded-2xl animate-ping" style={{ background: 'rgba(91,120,245,0.2)' }} />}
                    </div>

                    <div>
                        <p className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                            {isDragActive ? 'Drop your file here...' : 'Drag & drop media to analyze'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            or click to browse • JPG, PNG, MP4, MOV • Up to 100MB
                        </p>
                    </div>

                    <div className="flex items-center gap-6 mt-2">
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <Image size={16} className="text-brand-400" /> Images
                        </div>
                        <div className="w-1 h-1 rounded-full" style={{ background: 'var(--text-secondary)' }} />
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <Video size={16} className="text-brand-400" /> Videos
                        </div>
                    </div>

                    <button className="btn-glow mt-4" onClick={(e) => {
                        if (!user) {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowLoginPrompt(true)
                        }
                    }}>
                        <span className="flex items-center gap-2">
                            <Zap size={16} /> Analyze Media
                        </span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 rounded-xl mx-auto w-full max-w-2xl glass-card text-center" style={{ borderColor: 'rgba(255,100,100,0.3)', borderWidth: 1 }}>
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Login Required Overlay / Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(10,11,20,0.7)' }}>
                    <div className="glass-card max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300" style={{ border: '1px solid rgba(91,120,245,0.4)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-500/20 border border-brand-500/30">
                                <ShieldAlert size={32} className="text-brand-400" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>Oops! Access Restricted</h2>
                        <p className="text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
                            You have not signed up for the website. Please create a free account or log in to use the forensic analysis engine.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <Link to="/signup" className="btn-glow w-full text-center">
                                Create Free Account
                            </Link>
                            <Link to="/login" className="px-4 py-3 rounded-lg text-center font-medium transition-all hover:bg-white/5" style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                Sign in
                            </Link>
                        </div>
                        
                        <button 
                            onClick={() => setShowLoginPrompt(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
