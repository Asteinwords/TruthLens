import { useState, useEffect } from 'react'
import { Shield, Cpu, Search, Eye, Database, CheckCircle, Fingerprint, Radio, Brain, BarChart2 } from 'lucide-react'

const STEPS = [
    { icon: Search, label: 'Pre-processing media', detail: 'Extracting frames and pixel data' },
    { icon: Eye, label: 'Visual artifact analysis', detail: 'GAN noise, lighting inconsistencies, edge integrity' },
    { icon: Fingerprint, label: 'Pixel forensics scan', detail: 'Skin texture, color channels, compression analysis' },
    { icon: BarChart2, label: 'Frequency spectrum analysis', detail: 'DCT anomalies, spectral fingerprinting' },
    { icon: Cpu, label: 'Neural network inference', detail: 'Running multi-model AI detection pipeline' },
    { icon: Radio, label: 'Watermark detection', detail: 'Scanning for C2PA, Stable Diffusion, DALL·E markers' },
    { icon: Brain, label: 'Biometric analysis', detail: 'Facial landmarks, blink patterns, lip-sync' },
    { icon: Database, label: 'Metadata forensics', detail: 'EXIF extraction, hash verification' },
    { icon: Shield, label: 'Generating forensic report', detail: 'Compiling trust score & explainable AI narrative' },
]

export default function AnalysisLoader({ fileName, fileType }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [progress, setProgress] = useState(0)
    const [dots, setDots] = useState('')

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(interval); return 100 }
                return prev + 0.9
            })
        }, 60)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
        }, 700)
        return () => clearInterval(stepInterval)
    }, [])

    useEffect(() => {
        const d = setInterval(() => setDots(p => p.length >= 3 ? '' : p + '.'), 400)
        return () => clearInterval(d)
    }, [])

    const isVideo = fileType?.startsWith('video/')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
            <div className="absolute inset-0 grid-bg opacity-30" />
            {/* Scan line */}
            <div className="absolute inset-x-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)', animation: 'scanLine 2s linear infinite' }} />

            <div className="relative z-10 w-full max-w-lg mx-4">
                <div className="glass-card p-8" style={{ border: '1px solid rgba(91,120,245,0.35)', boxShadow: '0 0 80px rgba(91,120,245,0.12)' }}>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(91,120,245,0.15)', border: '1px solid rgba(91,120,245,0.35)' }}>
                                <Shield size={28} className="text-brand-400 animate-pulse" />
                            </div>
                            <div className="absolute inset-0 rounded-2xl animate-ping" style={{ background: 'rgba(91,120,245,0.08)' }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                Forensic Analysis{dots}
                            </h2>
                            <p className="text-xs truncate max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                                {fileName} · {isVideo ? 'Video' : 'Image'} scan
                            </p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="progress-bar mb-1.5">
                        <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs mb-6 font-mono" style={{ color: 'var(--text-secondary)' }}>
                        <span>Analyzing{dots}</span>
                        <span>{Math.round(Math.min(progress, 100))}%</span>
                    </div>

                    {/* Steps */}
                    <div className="space-y-2 max-h-72 overflow-hidden">
                        {STEPS.map((step, i) => {
                            const done = i < currentStep
                            const active = i === currentStep
                            const Icon = step.icon
                            return (
                                <div key={i}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${active ? 'scale-100' : 'scale-98 opacity-60'}`}
                                    style={{
                                        background: active ? 'rgba(91,120,245,0.08)' : 'transparent',
                                        border: active ? '1px solid rgba(91,120,245,0.25)' : '1px solid transparent',
                                    }}>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500/20' : active ? 'bg-brand-500/20' : 'bg-white/5'}`}>
                                        {done
                                            ? <CheckCircle size={13} className="text-green-400" />
                                            : <Icon size={13} style={{ color: active ? '#5b78f5' : 'var(--text-secondary)' }} className={active ? 'animate-pulse' : ''} />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate"
                                            style={{ color: done ? '#39ff14' : active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                            {step.label}
                                        </p>
                                        {active && <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{step.detail}</p>}
                                    </div>
                                    {done && <CheckCircle size={12} className="text-green-400 flex-shrink-0" />}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
