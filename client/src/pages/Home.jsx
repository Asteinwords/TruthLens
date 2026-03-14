import { Link } from 'react-router-dom'
import { Zap, Shield, Eye, ChevronRight, Image, Video, Lock, BarChart3 } from 'lucide-react'

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

                    <Link to="/media-analysis" className="btn-glow inline-flex items-center gap-2 px-8 py-4 text-lg">
                        <Zap size={20} /> Start Media Analysis <ChevronRight size={20} />
                    </Link>
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
