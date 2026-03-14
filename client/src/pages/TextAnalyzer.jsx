import { useState, useRef } from 'react'
import { FileText, Zap, Shield, Sparkles, Copy, Download, Upload, AlertCircle, FileType, CheckCircle2, RotateCcw, Eye, ChevronRight, File, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function TextAnalyzer() {
    const { user } = useAuth()
    const [text, setText] = useState('')
    const [file, setFile] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [humanizing, setHumanizing] = useState(false)
    const [rechecking, setRechecking] = useState(false)
    const [result, setResult] = useState(null)
    const [humanized, setHumanized] = useState('')
    const [recheckResult, setRecheckResult] = useState(null)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const [showLoginPrompt, setShowLoginPrompt] = useState(false)
    const fileInputRef = useRef(null)

    const handleAnalyze = async (textToAnalyze = null, isRecheck = false) => {
        if (!user) {
            setShowLoginPrompt(true)
            return
        }

        const targetText = textToAnalyze || text
        if (!targetText.trim() && !file && !isRecheck) {
            setError('Please enter text or upload a document.')
            return
        }

        if (isRecheck) {
            setRechecking(true)
        } else {
            setAnalyzing(true)
            setError('')
            setResult(null)
            setHumanized('')
            setRecheckResult(null)
        }

        const form = new FormData()
        if (file && !textToAnalyze) {
            form.append('file', file)
        } else {
            form.append('text', targetText)
        }

        try {
            const res = await axios.post('/api/text/analyze', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
            })
            if (isRecheck) {
                setRecheckResult(res.data)
            } else {
                setResult(res.data)
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Text analysis failed. Please ensure the backend and AI service (FastAPI) are running.')
        } finally {
            if (isRecheck) {
                setRechecking(false)
            } else {
                setAnalyzing(false)
            }
        }
    }

    const handleHumanize = async () => {
        if (!user) {
            setShowLoginPrompt(true)
            return
        }
        if (!result?.originalText) return
        setHumanizing(true)
        setError('')

        try {
            const textToHumanize = text || result.originalText
            const res = await axios.post('/api/text/humanize', {
                text: textToHumanize
            }, { timeout: 120000 })

            const humanizedText = res.data.humanizedText
            setHumanized(humanizedText)

            // Auto re-check the humanized version
            handleAnalyze(humanizedText, true)

        } catch (err) {
            setError(err.response?.data?.message || 'Humanization failed. Ensure Ollama is running Llama 3.2.')
        } finally {
            setHumanizing(false)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadText = (content, name) => {
        const element = document.createElement("a")
        const fileBlob = new Blob([content], { type: 'text/plain' })
        element.href = URL.createObjectURL(fileBlob)
        element.download = `${name}_truthlens.txt`
        document.body.appendChild(element)
        element.click()
    }

    return (
        <div className="min-h-screen pb-20 pt-24 px-4 overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-8 relative">
                {/* Background Glows */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full" />
                <div className="absolute top-1/2 -right-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />

                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-brand-500/20 text-xs font-medium text-brand-400">
                        <Sparkles size={12} /> NLP Integrity Engine v2026
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black gradient-text tracking-tight">
                        Text AI Detector + Humanizer
                    </h1>
                    <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Hybrid Neural-Forensic analysis with RoBERTa-base detection. Rewrite AI patterns instantly for organic, undetectable flow.
                    </p>
                </div>

                {/* Input Area */}
                <div className="glass-card overflow-hidden shadow-2xl relative">
                    <div className="p-1 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-brand-500/20 opacity-30" />
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="relative group">
                            <textarea
                                value={text}
                                onChange={e => {
                                    setText(e.target.value)
                                    if (e.target.value) setFile(null)
                                }}
                                disabled={analyzing || humanizing}
                                placeholder="Paste your text here to analyze for AI patterns..."
                                className="w-full h-56 p-6 rounded-2xl bg-black/20 border border-white/5 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all resize-none font-light leading-relaxed"
                                style={{ color: 'var(--text-primary)' }}
                            />
                            {text && (
                                <button
                                    onClick={() => setText('')}
                                    className="absolute top-4 right-4 text-xs opacity-50 hover:opacity-100 transition-opacity"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 w-full text-center md:text-left">
                                <label className="inline-flex items-center gap-2 cursor-pointer group">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-500/10 group-hover:bg-brand-500/20 transition-all border border-brand-500/20">
                                        <Upload size={18} className="text-brand-400" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {file ? file.name : 'Upload Document'}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            PDF, DOCX, TXT • Max 5MB
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".txt,.pdf,.docx"
                                        onChange={e => {
                                            const f = e.target.files?.[0]
                                            if (f) {
                                                setFile(f)
                                                setText('')
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <button
                                onClick={() => handleAnalyze()}
                                disabled={analyzing || humanizing || (!text && !file)}
                                className={`btn-glow min-w-[200px] h-14 flex items-center justify-center gap-2 ${analyzing ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {analyzing && !recheckResult ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Running Diagnostics...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={18} /> Detect AI Patterns
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl glass-card border-red-500/20 text-red-400 text-sm animate-in fade-in duration-300">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {/* Initial Results Section */}
                {result && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-3">
                                <p className="text-xs font-medium opacity-60 uppercase tracking-widest">Original AI Probability</p>
                                <div className="relative">
                                    <p className={`text-7xl font-black tracking-tighter ${result.aiProbability > 60 ? 'text-red-500' : 'text-brand-400'}`}>
                                        {result.aiProbability}%
                                    </p>
                                    <div className="absolute -inset-4 blur-3xl opacity-20 bg-brand-500 -z-10" />
                                </div>
                                <p className="font-bold text-lg px-4 py-1 rounded-full bg-white/5 border border-white/10">
                                    {result.verdict}
                                </p>
                            </div>

                            <div className="glass-card p-8 flex flex-col justify-center space-y-6">
                                <h3 className="text-sm font-bold opacity-40 uppercase tracking-widest border-b border-white/5 pb-2">Analysis Breakdown</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Transformer Pattern Match</span>
                                        <span className="font-mono text-brand-400">{result.transformerScore ?? '---'}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Statistical Forensic Score</span>
                                        <span className="font-mono text-brand-400">{result.statisticalScore}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Human Likelihood</span>
                                        <span className="font-mono text-green-400">{result.humanProbability}%</span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-2">
                                        <span className="text-sm opacity-60">Word Count</span>
                                        <span className="font-mono font-bold">{result.wordCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Humanizer CTA */}
                        <div className="glass-card p-1 bg-gradient-to-r from-brand-500/20 to-purple-500/20 shadow-xl">
                            <button
                                onClick={handleHumanize}
                                disabled={humanizing}
                                className="w-full h-16 bg-black/40 hover:bg-black/20 transition-all rounded-[11px] flex items-center justify-center gap-3 font-bold text-lg text-white"
                            >
                                {humanizing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Neutralizing AI Residue...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} className="text-brand-400" /> Humanize → Make it Undetectable
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Humanized Result + Re-check Loop */}
                        {humanized && (
                            <div className="space-y-6 animate-in fade-in duration-700">
                                <div className="glass-card p-8 space-y-6 border-brand-500/30">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <CheckCircle2 size={22} className="text-green-400" /> Humanized Output
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => copyToClipboard(humanized)}
                                                className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-sm flex items-center gap-2 border border-white/5"
                                            >
                                                {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                                                {copied ? 'Copied' : 'Copy'}
                                            </button>
                                            <button
                                                onClick={() => downloadText(humanized, 'humanized')}
                                                className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-sm flex items-center gap-2 border border-white/5"
                                            >
                                                <Download size={16} /> Download
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-brand-500/5 rounded-2xl border border-brand-500/10 whitespace-pre-wrap text-[15px] leading-relaxed font-light text-gray-200">
                                        {humanized}
                                    </div>

                                    {/* Re-check Results Dashboard */}
                                    <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <RotateCcw size={18} className="text-purple-400" /> Re-check Integrity Test
                                            </h3>
                                            {rechecking && recheckResult === null && (
                                                <div className="flex items-center gap-2 text-xs text-brand-400 animate-pulse">
                                                    <div className="w-2 h-2 rounded-full bg-brand-400" /> Verifying Humanversion...
                                                </div>
                                            )}
                                        </div>

                                        {recheckResult && (
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest opacity-40 mb-1">New AI Probability</p>
                                                        <p className={`text-4xl font-black ${recheckResult.aiProbability < 30 ? 'text-green-400' : 'text-yellow-500'}`}>
                                                            {recheckResult.aiProbability}%
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] uppercase tracking-widest opacity-40 mb-1">Human Confidence</p>
                                                        <p className="text-2xl font-bold">{recheckResult.humanProbability}%</p>
                                                    </div>
                                                </div>
                                                <div className="p-6 rounded-2xl bg-brand-500/10 border border-brand-500/10 flex flex-col justify-center">
                                                    <p className="text-sm font-semibold mb-1">{recheckResult.verdict}</p>
                                                    <p className="text-xs opacity-60">Success! The text now passes through neural classifiers as human-written.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tech Specs */}
                {!result && (
                    <div className="grid md:grid-cols-3 gap-6 mt-16 scale-95 opacity-80">
                        <div className="glass-card p-6 text-center space-y-2">
                            <Shield size={24} className="mx-auto text-brand-400 mb-2" />
                            <h4 className="font-bold text-sm">RoBERTa Detection</h4>
                            <p className="text-xs opacity-60">Neural pattern recognition trained on GPT-4, Claude 3.5, and Llama 3.2 outputs.</p>
                        </div>
                        <div className="glass-card p-6 text-center space-y-2">
                            <BarChart3 size={24} className="mx-auto text-purple-400 mb-2" />
                            <h4 className="font-bold text-sm">Statistical Entropy</h4>
                            <p className="text-xs opacity-60">Analyzes burstiness, perplexity, and bigram repetition for forensic verification.</p>
                        </div>
                        <div className="glass-card p-6 text-center space-y-2">
                            <Zap size={24} className="mx-auto text-yellow-400 mb-2" />
                            <h4 className="font-bold text-sm">One-Click Stealth</h4>
                            <p className="text-xs opacity-60">Automatically neutralize AI patterns using local Llama 3.2 rewrites.</p>
                        </div>
                    </div>
                )}
            </div>

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
                            You have not signed up for the website. Please create a free account or log in to use the text forensic engine.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <a href="/signup" className="btn-glow w-full text-center">
                                Create Free Account
                            </a>
                            <a href="/login" className="px-4 py-3 rounded-lg text-center font-medium transition-all hover:bg-white/5" style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                Sign in
                            </a>
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

import { BarChart3 } from 'lucide-react'
