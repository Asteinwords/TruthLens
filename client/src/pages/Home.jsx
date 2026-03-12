import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, Zap, Shield, Eye, ChevronRight, Image, Video, Lock, BarChart3 } from 'lucide-react'
import axios from 'axios'
import AnalysisLoader from '../components/AnalysisLoader'

const FEATURES = [
    { icon: Eye, title: 'Deep Vision Analysis', desc: 'Multi-layer neural network analysis detects GAN artifacts, diffusion traces, and manipulation patterns.' },
    { icon: Shield, title: 'Deepfake Detection', desc: 'Facial landmark analysis, lip-sync verification, and blink pattern consistency checks for video media.' },
    { icon: BarChart3, title: 'Authenticity Score', desc: 'Comprehensive 0–100 authenticity score with confidence levels and detailed breakdown reports.' },
    { icon: Lock, title: 'Metadata Forensics', desc: 'Extract and analyze EXIF data, detect stripping, editing software signatures, and timestamp anomalies.' },
]

const STATS = [
    { value: '99.2%', label: 'Detection Accuracy' },
    { value: '2.4s', label: 'Avg. Analysis Time' },
    { value: '12M+', label: 'Media Scanned' },
    { value: '50+', label: 'AI Models Detected' },
]

export default function Home() {
    const [analyzing, setAnalyzing] = useState(false)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const onDrop = useCallback(async (acceptedFiles) => {
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
    }, [navigate])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'], 'video/*': ['.mp4', '.mov', '.avi', '.webm'] },
        maxFiles: 1,
        maxSize: 100 * 1024 * 1024,
        disabled: analyzing,
    })

    if (analyzing) return <AnalysisLoader fileName={uploadedFile?.name} fileType={uploadedFile?.type} />

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="hero-bg grid-bg relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 glass-card border" style={{ borderColor: 'rgba(91,120,245,0.3)' }}>
                        <Zap size={14} className="text-brand-400" />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Powered by Advanced Neural Networks
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Detect AI-Generated
                        <span className="block gradient-text">Media Instantly</span>
                    </h1>

                    <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        TruthLens AI analyzes images and videos to determine if they are AI-generated or real — with pixel-level precision and detailed forensic reports.
                    </p>

                    {/* Upload zone */}
                    <div
                        {...getRootProps()}
                        className={`drop-zone mx-auto max-w-2xl cursor-pointer p-12 transition-all ${isDragActive ? 'active' : ''}`}
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

                            <button className="btn-glow mt-4">
                                <span className="flex items-center gap-2">
                                    <Zap size={16} /> Analyze Media <ChevronRight size={16} />
                                </span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 rounded-xl mx-auto max-w-2xl glass-card" style={{ borderColor: 'rgba(255,100,100,0.3)', borderWidth: 1 }}>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 border-y" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <p className="text-4xl font-black gradient-text mb-1">{value}</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Enterprise-Grade <span className="gradient-text">AI Forensics</span>
                        </h2>
                        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                            Multi-model detection pipeline combining computer vision, metadata analysis, and behavioral pattern recognition.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="glass-card p-6">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(91,120,245,0.15)' }}>
                                    <Icon size={22} className="text-brand-400" />
                                </div>
                                <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24" style={{ background: 'var(--bg-secondary)' }}>
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="glass-card p-12" style={{ border: '1px solid rgba(91,120,245,0.25)' }}>
                        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Ready to Verify Media Authenticity?
                        </h2>
                        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
                            Join thousands of journalists, researchers, and security teams using TruthLens AI.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <link to="/signup" />
                            <a href="/signup" className="btn-glow">
                                <span className="flex items-center gap-2"><Zap size={16} /> Start for Free</span>
                            </a>
                            <a href="/api-docs" className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/5" style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                View API Docs
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <p className="text-sm">© 2026 TruthLens AI. All rights reserved. · <span className="gradient-text font-medium">Media Authenticity Detection Platform</span></p>
            </footer>
        </div>
    )
}
