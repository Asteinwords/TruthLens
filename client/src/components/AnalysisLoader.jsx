import { useState, useEffect } from 'react'
import { Shield, Cpu, Search, Eye, Database, CheckCircle } from 'lucide-react'

const STEPS = [
    { icon: Search, label: 'Pre-processing media', detail: 'Extracting frames and pixel data' },
    { icon: Eye, label: 'Visual artifact analysis', detail: 'GAN noise, lighting inconsistencies' },
    { icon: Cpu, label: 'Neural network inference', detail: 'Running AI detection models' },
    { icon: Database, label: 'Metadata forensics', detail: 'EXIF extraction & verification' },
    { icon: Shield, label: 'Generating report', detail: 'Compiling authenticity score' },
]

export default function AnalysisLoader({ fileName, fileType }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(interval); return 100 }
                return prev + 1.4
            })
        }, 60)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
        }, 1200)
        return () => clearInterval(stepInterval)
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
            {/* Background grid */}
            <div className="absolute inset-0 grid-bg opacity-40" />

            {/* Scan line animation */}
            <div className="absolute inset-x-0 top-0" style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)', animation: 'scanLine 2s linear infinite' }} />

            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(91,120,245,0.3)', boxShadow: '0 0 60px rgba(91,120,245,0.15)' }}>
                    {/* Icon */}
                    <div className="relative inline-flex mb-6">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(91,120,245,0.15)', border: '1px solid rgba(91,120,245,0.3)' }}>
                            <Shield size={36} className="text-brand-400 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 rounded-2xl animate-ping" style={{ background: 'rgba(91,120,245,0.1)' }} />
                    </div>

                    <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Analyzing Media</h2>
                    <p className="text-sm mb-6 truncate" style={{ color: 'var(--text-secondary)' }}>{fileName}</p>

                    {/* Progress bar */}
                    <div className="progress-bar mb-2">
                        <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <p className="text-xs mb-8 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{Math.round(Math.min(progress, 100))}%</p>

                    {/* Steps */}
                    <div className="space-y-3 text-left">
                        {STEPS.map((step, i) => {
                            const Icon = step.icon
                            const done = i < currentStep
                            const active = i === currentStep
                            return (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'glass-card' : ''}`}
                                    style={{ borderColor: active ? 'rgba(91,120,245,0.3)' : undefined, border: active ? '1px solid rgba(91,120,245,0.3)' : undefined }}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500/20' : active ? 'bg-brand-500/20' : 'bg-white/5'}`}>
                                        {done
                                            ? <CheckCircle size={16} className="text-green-400" />
                                            : <Icon size={16} className={active ? 'text-brand-400 animate-pulse' : ''} style={{ color: !active ? 'var(--text-secondary)' : undefined }} />
                                        }
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${done ? 'text-green-400' : active ? 'text-brand-300' : ''}`} style={{ color: !done && !active ? 'var(--text-secondary)' : undefined }}>
                                            {step.label}
                                        </p>
                                        {active && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{step.detail}</p>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
