import { Brain, Eye, Database, Layers, Shield, Cpu, Zap, CheckCircle } from 'lucide-react'

const HOW_IT_WORKS = [
    { step: '01', icon: Eye, title: 'Media Ingestion', desc: 'Your file is received and preprocessed — images are decoded to pixel arrays; videos are split into frames for temporal analysis.' },
    { step: '02', icon: Brain, title: 'Neural Analysis', desc: 'Multiple specialized neural networks scan for GAN artifacts, frequency domain anomalies, and diffusion model signatures.' },
    { step: '03', icon: Database, title: 'Metadata Forensics', desc: 'EXIF data is extracted and cross-referenced. Stripped or inconsistent metadata is a strong indicator of manipulation.' },
    { step: '04', icon: Layers, title: 'Heatmap Generation', desc: 'Region-level attribution maps highlight areas with highest manipulation probability using gradient-weighted class activation mapping.' },
    { step: '05', icon: Shield, title: 'Score Calculation', desc: 'A weighted ensemble of all sub-models produces the final authenticity score, confidence level, and AI model fingerprint.' },
]

const MODELS_DETECTED = [
    { name: 'Stable Diffusion', versions: 'v1.5, v2.1, XL, 3.0', accuracy: '97%' },
    { name: 'Midjourney', versions: 'v5, v6, Niji', accuracy: '95%' },
    { name: 'DALL·E', versions: '2, 3', accuracy: '96%' },
    { name: 'GAN-based', versions: 'StyleGAN 2/3, BigGAN', accuracy: '94%' },
    { name: 'Adobe Firefly', versions: '1.0, 2.0', accuracy: '91%' },
    { name: 'Deepfake Video', versions: 'FaceSwap, DeepFaceLab', accuracy: '98%' },
]

export default function About() {
    return (
        <div className="min-h-screen py-16">
            <div className="max-w-5xl mx-auto px-4">
                {/* Hero */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 glass-card" style={{ border: '1px solid rgba(91,120,245,0.3)' }}>
                        <Zap size={14} className="text-brand-400" />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>How It Works</span>
                    </div>
                    <h1 className="text-5xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
                        Science Behind <span className="gradient-text">TruthLens AI</span>
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Our multi-layer detection pipeline combines computer vision, generative model fingerprinting, and metadata forensics to deliver industry-leading accuracy.
                    </p>
                </div>

                {/* How it works timeline */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold mb-10 text-center" style={{ color: 'var(--text-primary)' }}>Detection Pipeline</h2>
                    <div className="space-y-6">
                        {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }, i) => (
                            <div key={step} className="glass-card p-6 flex items-start gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(91,120,245,0.15)', border: '1px solid rgba(91,120,245,0.3)' }}>
                                        <Icon size={24} className="text-brand-400" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-mono text-brand-400">{step}</span>
                                        <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI models detected */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold mb-10 text-center" style={{ color: 'var(--text-primary)' }}>AI Models We Detect</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MODELS_DETECTED.map(({ name, versions, accuracy }) => (
                            <div key={name} className="glass-card p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</h3>
                                    <span className="text-xs font-mono text-brand-400">{accuracy}</span>
                                </div>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Versions: {versions}</p>
                                <div className="mt-3 progress-bar">
                                    <div className="progress-fill" style={{ width: accuracy }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tech stack */}
                <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(91,120,245,0.2)' }}>
                    <Cpu size={32} className="text-brand-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Technology Stack</h2>
                    <p className="text-sm mb-6 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Built on a microservices architecture designed for scale and accuracy.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { cat: 'Frontend', tech: 'React + Tailwind' },
                            { cat: 'API', tech: 'Node.js + Express' },
                            { cat: 'AI Service', tech: 'Python FastAPI' },
                            { cat: 'Database', tech: 'MongoDB Atlas' },
                        ].map(({ cat, tech }) => (
                            <div key={cat} className="p-3 rounded-xl" style={{ background: 'rgba(91,120,245,0.08)', border: '1px solid rgba(91,120,245,0.15)' }}>
                                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{cat}</p>
                                <p className="font-semibold text-sm gradient-text">{tech}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
