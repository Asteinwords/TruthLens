import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
    ArrowLeft, AlertTriangle, CheckCircle, Shield, Cpu, Camera, FileText,
    Eye, Activity, Layers, Zap, Search, Download, Radio, Fingerprint,
    Brain, BarChart2, Microscope, Globe, Award, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react'
import {
    RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
    BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LineChart, Line, CartesianGrid
} from 'recharts'

// ─── Utility Components ───────────────────────────────────────────────────────

function TrustBadge({ label, score }) {
    const cfg = {
        'Low Risk': { bg: 'rgba(57,255,20,0.12)', border: 'rgba(57,255,20,0.5)', color: '#39ff14', icon: CheckCircle },
        'Suspicious': { bg: 'rgba(255,165,0,0.12)', border: 'rgba(255,165,0,0.5)', color: '#ffa500', icon: AlertTriangle },
        'High Probability AI Generated': { bg: 'rgba(255,0,110,0.12)', border: 'rgba(255,0,110,0.5)', color: '#ff006e', icon: AlertTriangle },
    }
    const c = cfg[label] || cfg['Suspicious']
    const Icon = c.icon
    return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
            style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
            <Icon size={14} /> {label}
        </div>
    )
}

function ConfidenceBadge({ level }) {
    const styles = {
        High: { bg: 'rgba(57,255,20,0.1)', border: 'rgba(57,255,20,0.4)', color: '#39ff14' },
        Medium: { bg: 'rgba(255,165,0,0.1)', border: 'rgba(255,165,0,0.4)', color: '#ffa500' },
        Low: { bg: 'rgba(255,100,100,0.1)', border: 'rgba(255,100,100,0.4)', color: '#ff6464' },
    }
    const s = styles[level] || styles.Low
    return (
        <span className="px-3 py-1 rounded-lg text-sm font-semibold"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
            {level} Confidence
        </span>
    )
}

function ScoreGauge({ value, label, color, unit = '%' }) {
    const data = [{ value: Math.round(value), fill: color }]
    return (
        <div className="text-center">
            <div className="relative h-28 w-28 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="68%" outerRadius="100%" data={data} startAngle={200} endAngle={-20}>
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={5} background={{ fill: 'rgba(255,255,255,0.05)' }} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black leading-tight" style={{ color }}>{Math.round(value)}{unit}</span>
                </div>
            </div>
            <p className="text-xs mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        </div>
    )
}

function AnimatedBar({ value, max = 100, color, label, detail }) {
    const [width, setWidth] = useState(0)
    useEffect(() => { setTimeout(() => setWidth(value), 200) }, [value])
    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="font-mono font-semibold" style={{ color }}>{detail || `${value.toFixed(1)}%`}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(width / max) * 100}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }} />
            </div>
        </div>
    )
}

function SectionCard({ icon: Icon, title, children, accent = '#5b78f5', collapsible = false }) {
    const [open, setOpen] = useState(true)
    return (
        <div className="glass-card overflow-hidden" style={{ border: `1px solid rgba(${hexToRgb(accent)},0.15)` }}>
            <div
                className={`flex items-center justify-between p-5 ${collapsible ? 'cursor-pointer hover:bg-white/3' : ''}`}
                onClick={collapsible ? () => setOpen(v => !v) : undefined}
                style={{ borderBottom: open ? '1px solid var(--border-color)' : 'none' }}
            >
                <h2 className="font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `rgba(${hexToRgb(accent)},0.15)` }}>
                        <Icon size={16} style={{ color: accent }} />
                    </span>
                    {title}
                </h2>
                {collapsible && (open ? <ChevronUp size={16} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />)}
            </div>
            {open && <div className="p-5">{children}</div>}
        </div>
    )
}

function hexToRgb(hex) {
    const clean = hex.replace('#', '')
    const r = parseInt(clean.slice(0, 2), 16)
    const g = parseInt(clean.slice(2, 4), 16)
    const b = parseInt(clean.slice(4, 6), 16)
    return `${r},${g},${b}`
}

// ─── Heatmap Canvas ──────────────────────────────────────────────────────────
function HeatmapOverlay({ imageUrl, heatmapData }) {
    const canvasRef = useRef(null)
    const imgRef = useRef(null)
    const [show, setShow] = useState(true)
    const [opacity, setOpacity] = useState(65)

    const draw = useCallback(() => {
        if (!canvasRef.current || !imgRef.current || !heatmapData) return
        const img = imgRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        canvas.width = img.clientWidth || img.naturalWidth
        canvas.height = img.clientHeight || img.naturalHeight
        const rows = heatmapData.length
        const cols = heatmapData[0]?.length || 1
        const cw = canvas.width / cols, ch = canvas.height / rows
        heatmapData.forEach((row, r) => {
            row.forEach((val, c) => {
                const a = val * (opacity / 100)
                ctx.fillStyle = val > 0.65 ? `rgba(255,0,80,${a})` : val > 0.38 ? `rgba(255,130,0,${a})` : `rgba(0,200,255,${a * 0.5})`
                ctx.fillRect(c * cw, r * ch, cw, ch)
            })
        })
    }, [heatmapData, opacity])

    useEffect(() => {
        if (!imgRef.current) return
        if (imgRef.current.complete) draw()
        else imgRef.current.onload = draw
    }, [draw])

    return (
        <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                        <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} className="accent-brand-500" />
                        Show overlay
                    </label>
                    {show && (
                        <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Opacity
                            <input type="range" min={20} max={90} value={opacity} onChange={e => { setOpacity(+e.target.value); draw() }}
                                className="w-20 accent-brand-500" />
                        </label>
                    )}
                </div>
                <div className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,0,80,0.75)', display: 'inline-block' }} /> High</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,130,0,0.75)', display: 'inline-block' }} /> Medium</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,200,255,0.4)', display: 'inline-block' }} /> Low</span>
                </div>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black/20">
                <img ref={imgRef} src={imageUrl} alt="Analyzed" className="w-full max-h-96 object-contain rounded-xl block" />
                {show && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded-xl" style={{ mixBlendMode: 'screen' }} />}
            </div>
        </div>
    )
}

// ─── Freq Spectrum Chart ────────────────────────────────────────────────────
function FrequencyChart({ spectrumData }) {
    if (!spectrumData?.bands) return null
    const data = spectrumData.bands.map(b => ({ name: b.band, energy: b.energy, anomaly: b.anomaly }))
    const CustomBar = (props) => {
        const { x, y, width, height, anomaly } = props
        return <rect x={x} y={y} width={width} height={height} rx={3}
            fill={anomaly ? '#ff006e' : '#5b78f5'} opacity={anomaly ? 1 : 0.75} />
    }
    return (
        <div>
            <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip
                        contentStyle={{ background: '#0f1124', border: '1px solid rgba(91,120,245,0.3)', borderRadius: 8, fontSize: 11 }}
                        formatter={(v, _, item) => [v.toFixed(1), item.payload.anomaly ? '⚠️ Anomalous' : 'Normal']}
                    />
                    <Bar dataKey="energy" shape={(props) => <CustomBar {...props} anomaly={data[data.indexOf(data.find(d => d.name === props.name))]?.anomaly} />}>
                        {data.map((entry, i) => <Cell key={i} fill={entry.anomaly ? '#ff006e' : '#5b78f5'} opacity={entry.anomaly ? 1 : 0.7} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#5b78f5' }} /> Normal band</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#ff006e' }} /> Anomalous band</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                    { label: 'DCT Anomaly Score', val: `${spectrumData.dctAnomalyScore?.toFixed(1)}/100` },
                    { label: 'FFT Fingerprint', val: spectrumData.fftFingerprint },
                ].map(({ label, val }) => (
                    <div key={label} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                        <p className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{val}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Certificate Download ────────────────────────────────────────────────────
function downloadCertificate(ar, file) {
    const ts = new Date().toISOString()
    const lines = [
        '═══════════════════════════════════════════════════════',
        '       TRUTHLENS AI — AUTHENTICITY CERTIFICATE',
        '═══════════════════════════════════════════════════════',
        '',
        `  Media ID       : ${ar.mediaId || 'N/A'}`,
        `  File Name      : ${file?.name || 'Unknown'}`,
        `  File Type      : ${file?.type || 'Unknown'}`,
        `  Scan Timestamp : ${ts}`,
        '',
        '─── VERDICT ─────────────────────────────────────────',
        `  Trust Label        : ${ar.trustLabel}`,
        `  Authenticity Score : ${ar.authenticityScore}/100`,
        `  AI Probability     : ${ar.aiProbability?.toFixed(1)}%`,
        `  Human Probability  : ${ar.humanProbability?.toFixed(1)}%`,
        `  Confidence Level   : ${ar.confidenceLevel}`,
        `  Manipulation Type  : ${ar.manipulationType}`,
        `  Suspected AI Model : ${ar.suspectedModel || 'None detected'}`,
        '',
        '─── DETECTED ARTIFACTS ──────────────────────────────',
        ...(ar.detectedArtifacts?.length
            ? ar.detectedArtifacts.map((a, i) => `  ${i + 1}. ${a}`)
            : ['  No significant artifacts detected']),
        '',
        '─── WATERMARK ANALYSIS ──────────────────────────────',
        `  Overall Status : ${ar.watermarkDetection?.overallWatermarkStatus || 'N/A'}`,
        `  C2PA Marker    : ${ar.watermarkDetection?.c2paWatermark || 'N/A'}`,
        '',
        '─── METADATA ────────────────────────────────────────',
        `  Camera Model   : ${ar.metadata?.cameraModel || 'Not found'}`,
        `  Metadata Status: ${ar.metadata?.metadataStatus || 'Unknown'}`,
        `  File Hash      : ${ar.metadata?.fileHash || 'N/A'}`,
        '',
        '─── EXPLAINABLE AI REPORT ───────────────────────────',
        `  ${ar.explainableReport || 'N/A'}`,
        '',
        '═══════════════════════════════════════════════════════',
        '  This certificate was generated by TruthLens AI.',
        '  Results are based on algorithmic analysis and should',
        '  be used for informational purposes only.',
        '═══════════════════════════════════════════════════════',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `TruthLens-Certificate-${ar.mediaId || Date.now()}.txt`
    a.click()
}

// ─── Main Results Page ────────────────────────────────────────────────────────
export default function Results() {
    const location = useLocation()
    const navigate = useNavigate()
    const { result, file } = location.state || {}
    const ar = result?.analysis || result
    const isAI = (ar?.aiProbability || 0) > 50

    if (!ar) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center glass-card p-10">
                    <Shield size={40} className="text-brand-400 mx-auto mb-4" />
                    <p className="mb-2 font-semibold" style={{ color: 'var(--text-primary)' }}>No analysis data</p>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Upload a file to get a forensic report.</p>
                    <button onClick={() => navigate('/')} className="btn-glow"><span>Go to Upload</span></button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">

                {/* ── Top bar ── */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
                        <ArrowLeft size={15} /> New Analysis
                    </button>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs px-3 py-1 rounded-lg" style={{ background: 'rgba(91,120,245,0.1)', border: '1px solid rgba(91,120,245,0.3)', color: '#5b78f5' }}>
                            ID: {ar.mediaId}
                        </span>
                        <ConfidenceBadge level={ar.confidenceLevel} />
                        <button onClick={() => downloadCertificate(ar, file)}
                            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all hover:bg-brand-500/15"
                            style={{ border: '1px solid rgba(91,120,245,0.4)', color: '#5b78f5' }}>
                            <Download size={14} /> Certificate
                        </button>
                    </div>
                </div>

                {/* ── Hero verdict card ── */}
                <div className="glass-card p-6 mb-6" style={{ border: '1px solid rgba(91,120,245,0.25)', background: 'linear-gradient(135deg, rgba(91,120,245,0.05), rgba(0,212,255,0.03))' }}>
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Forensic Analysis Report</h1>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <code className="font-mono text-brand-400">{file?.name}</code>
                                {file?.type && <> · {file.type}</>}
                                {file?.size && <> · {(file.size / 1024).toFixed(1)} KB</>}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <TrustBadge label={ar.trustLabel} score={ar.trustScore} />
                            <div className="text-center">
                                <p className="text-3xl font-black gradient-text">{ar.authenticityScore}</p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Trust Score /100</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold" style={{ color: isAI ? '#ff006e' : '#39ff14' }}>{ar.manipulationType}</p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Classification</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main grid ── */}
                <div className="grid xl:grid-cols-3 gap-6">

                    {/* Left col (xl:col-span-2) */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Probability gauges */}
                        <SectionCard icon={Activity} title="Probability Analysis" accent="#5b78f5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                <ScoreGauge value={ar.aiProbability || 0} label="AI Generated" color="#ff006e" />
                                <ScoreGauge value={ar.humanProbability || 0} label="Human Captured" color="#39ff14" />
                                <ScoreGauge value={ar.authenticityScore || 0} label="Authenticity" color="#5b78f5" />
                                <ScoreGauge value={ar.trustScore || 0} label="Trust Score" color="#00d4ff" />
                            </div>
                            <div className="space-y-2">
                                <AnimatedBar value={ar.aiProbability || 0} color="#ff006e" label="AI Probability" />
                                <AnimatedBar value={ar.humanProbability || 0} color="#39ff14" label="Human Probability" />
                                <AnimatedBar value={ar.authenticityScore || 0} color="#5b78f5" label="Authenticity Score" detail={`${ar.authenticityScore}/100`} />
                            </div>
                        </SectionCard>

                        {/* Heatmap */}
                        {result?.imageData && ar.heatmapData && (
                            <SectionCard icon={Eye} title="Suspicious Region Heatmap" accent="#ff006e">
                                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                                    Red regions indicate high probability of AI manipulation. Green/cyan indicates likely authentic areas.
                                </p>
                                <HeatmapOverlay imageUrl={result.imageData} heatmapData={ar.heatmapData} />
                            </SectionCard>
                        )}

                        {/* Pixel Forensics */}
                        <SectionCard icon={Microscope} title="Pixel Forensics Panel" accent="#bf00ff" collapsible>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {ar.pixelForensics && Object.entries(ar.pixelForensics).map(([key, val]) => {
                                    const isAlert = typeof val === 'string' && (val.toLowerCase().includes('abnormal') || val.toLowerCase().includes('inconsistent') || val.toLowerCase().includes('detected') || val.toLowerCase().includes('degraded') || val.toLowerCase().includes('imbalanced'))
                                    return (
                                        <div key={key} className="p-3 rounded-xl flex items-start gap-3"
                                            style={{ background: isAlert ? 'rgba(255,0,110,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isAlert ? 'rgba(255,0,110,0.2)' : 'var(--border-color)'}` }}>
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isAlert ? 'bg-red-400' : 'bg-green-400'}`} />
                                            <div>
                                                <p className="text-xs mb-0.5 capitalize font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                                <p className="text-xs font-semibold" style={{ color: isAlert ? '#ff6464' : 'var(--text-primary)' }}>
                                                    {typeof val === 'number' ? `${val.toFixed(1)}%` : val}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </SectionCard>

                        {/* Frequency Spectrum */}
                        <SectionCard icon={BarChart2} title="Frequency Spectrum Analysis" accent="#00d4ff" collapsible>
                            <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
                                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Dominant Pattern</p>
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ar.frequencySpectrum?.dominantPattern}</p>
                            </div>
                            <FrequencyChart spectrumData={ar.frequencySpectrum} />
                        </SectionCard>

                        {/* Detected Artifacts */}
                        <SectionCard icon={Layers} title="Detected Manipulation Artifacts" accent="#ff006e" collapsible>
                            {ar.detectedArtifacts?.length > 0 ? (
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {ar.detectedArtifacts.map((artifact, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                                            style={{ background: 'rgba(255,0,110,0.05)', border: '1px solid rgba(255,0,110,0.15)' }}>
                                            <AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{artifact}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 rounded-xl"
                                    style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.15)' }}>
                                    <CheckCircle size={16} className="text-green-400" />
                                    <span className="text-sm text-green-400">No significant artifacts detected — content appears authentic</span>
                                </div>
                            )}
                        </SectionCard>

                        {/* Biometric Deepfake */}
                        <SectionCard icon={Camera} title="Biometric Deepfake Detection" accent="#ffa500" collapsible>
                            {ar.biometric?.faceDetected ? (
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="badge-ai flex items-center gap-1 text-xs">
                                            <Camera size={11} /> {ar.biometric.facesCount} face{ar.biometric.facesCount > 1 ? 's' : ''} detected
                                        </span>
                                        {ar.biometric.deepfakeProbability !== undefined && (
                                            <span className="text-sm font-bold" style={{ color: ar.biometric.deepfakeProbability > 60 ? '#ff006e' : '#39ff14' }}>
                                                Deepfake: {ar.biometric.deepfakeProbability.toFixed(1)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        {ar.biometric.deepfakeProbability !== undefined &&
                                            <AnimatedBar value={ar.biometric.deepfakeProbability} color="#ff006e" label="Deepfake Probability" />}
                                        {ar.biometric.microExpressionScore !== undefined &&
                                            <AnimatedBar value={ar.biometric.microExpressionScore} color="#5b78f5" label="Micro-expression Score" />}
                                        {ar.biometric.facialSymmetryScore !== undefined &&
                                            <AnimatedBar value={ar.biometric.facialSymmetryScore} color="#00d4ff" label="Facial Symmetry Score" />}
                                        {ar.biometric.lipSyncScore !== null && ar.biometric.lipSyncScore !== undefined &&
                                            <AnimatedBar value={ar.biometric.lipSyncScore} color="#ffa500" label="Lip-sync Accuracy" />}
                                        {ar.biometric.temporalConsistency !== null && ar.biometric.temporalConsistency !== undefined &&
                                            <AnimatedBar value={ar.biometric.temporalConsistency} color="#39ff14" label="Temporal Frame Consistency" />}
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {[
                                            { label: 'Blink Frequency', val: ar.biometric.blinkFrequency },
                                            { label: 'Eye Movement', val: ar.biometric.eyeMovementPattern },
                                            { label: 'Landmark Distortion', val: ar.biometric.faceLandmarkDistortion },
                                        ].filter(x => x.val && x.val !== 'N/A (image)' && x.val !== 'N/A').map(({ label, val }) => (
                                            <div key={label} className="p-3 rounded-xl"
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                                                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 rounded-xl"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                    <Camera size={16} style={{ color: 'var(--text-secondary)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>No faces detected in this media</span>
                                </div>
                            )}
                        </SectionCard>

                        {/* Explainable AI */}
                        <SectionCard icon={Brain} title="Explainable AI Report" accent="#5b78f5" collapsible>
                            <div className="p-5 rounded-xl" style={{ background: 'rgba(91,120,245,0.06)', border: '1px solid rgba(91,120,245,0.2)' }}>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{ar.explainableReport}</p>
                            </div>
                        </SectionCard>

                        {/* Reverse media search */}
                        <SectionCard icon={Globe} title="Reverse Media Search" accent="#00d4ff" collapsible>
                            <div className="space-y-3">
                                {ar.reverseSearchResults?.map((r, i) => (
                                    <div key={i} className="flex items-start justify-between gap-4 p-4 rounded-xl"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                                        <div className="flex items-start gap-3">
                                            <Globe size={16} className="text-cyber-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.source}</p>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{r.note}</p>
                                            </div>
                                        </div>
                                        {r.similarity > 0 && (
                                            <span className="text-sm font-bold flex-shrink-0" style={{ color: r.similarity > 70 ? '#ff006e' : '#ffa500' }}>
                                                {r.similarity.toFixed(0)}% match
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>

                    {/* Right col */}
                    <div className="space-y-6">

                        {/* AI Model ID */}
                        <SectionCard icon={Cpu} title="AI Model Identification" accent="#bf00ff">
                            <div className="mb-4 p-4 rounded-xl text-center"
                                style={{ background: ar.suspectedModel ? 'rgba(191,0,255,0.08)' : 'rgba(57,255,20,0.05)', border: `1px solid ${ar.suspectedModel ? 'rgba(191,0,255,0.3)' : 'rgba(57,255,20,0.2)'}` }}>
                                <p className="font-bold text-lg mb-1" style={{ color: ar.suspectedModel ? '#bf00ff' : '#39ff14' }}>
                                    {ar.suspectedModel || 'No AI Model Detected'}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    {ar.suspectedModel ? 'Most likely generation source' : 'Content appears authentic'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: 'var(--text-secondary)' }}>Manipulation Type</span>
                                    <span className="font-semibold" style={{ color: isAI ? '#ff006e' : '#39ff14' }}>{ar.manipulationType}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: 'var(--text-secondary)' }}>Classification</span>
                                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ar.confidenceLevel} conf.</span>
                                </div>
                            </div>
                        </SectionCard>

                        {/* AI Watermark */}
                        <SectionCard icon={Radio} title="AI Watermark Detection" accent="#ffa500">
                            <div className="mb-3 p-3 rounded-xl"
                                style={{ background: ar.watermarkDetection?.overallWatermarkStatus?.includes('Found') ? 'rgba(255,0,110,0.08)' : 'rgba(57,255,20,0.05)', border: ar.watermarkDetection?.overallWatermarkStatus?.includes('Found') ? '1px solid rgba(255,0,110,0.25)' : '1px solid rgba(57,255,20,0.2)' }}>
                                <p className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>Overall Status</p>
                                <p className="text-sm font-bold" style={{ color: ar.watermarkDetection?.overallWatermarkStatus?.includes('Found') ? '#ff006e' : '#39ff14' }}>
                                    {ar.watermarkDetection?.overallWatermarkStatus}
                                </p>
                            </div>
                            <div className="space-y-2">
                                {ar.watermarkDetection && Object.entries(ar.watermarkDetection)
                                    .filter(([k]) => k !== 'overallWatermarkStatus')
                                    .map(([key, val]) => {
                                        const found = val !== 'Not detected'
                                        return (
                                            <div key={key} className="flex items-start gap-2">
                                                <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${found ? 'bg-red-400' : 'bg-green-400'}`} />
                                                <div>
                                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                        {key.replace(/([A-Z])/g, ' $1').replace('Signature', '').trim()}
                                                    </p>
                                                    <p className="text-xs font-medium" style={{ color: found ? '#ff6464' : 'var(--text-primary)' }}>{val}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                            </div>
                        </SectionCard>

                        {/* Metadata */}
                        <SectionCard icon={FileText} title="Metadata Analysis" accent="#00d4ff">
                            {ar.metadata && (
                                <div className="space-y-3">
                                    {[
                                        { label: 'Camera Model', value: ar.metadata.cameraModel || 'Not found' },
                                        { label: 'Editing Software', value: ar.metadata.editingSoftware || 'Unknown' },
                                        { label: 'Timestamp', value: ar.metadata.timestamp || 'Not found' },
                                        { label: 'GPS Data', value: ar.metadata.gpsData || 'None' },
                                        { label: 'Color Space', value: ar.metadata.colorSpace || 'Unknown' },
                                        { label: 'Metadata Status', value: ar.metadata.metadataStatus },
                                    ].map(({ label, value }) => {
                                        const isRisk = value === 'Stripped' || value === 'Modified'
                                        const isOk = value === 'Intact'
                                        return (
                                            <div key={label} className="flex justify-between items-start gap-2">
                                                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                                <span className="text-xs font-medium text-right"
                                                    style={{ color: isRisk ? '#ff6464' : isOk ? '#39ff14' : 'var(--text-primary)' }}>
                                                    {value}
                                                </span>
                                            </div>
                                        )
                                    })}
                                    {ar.metadata.fileHash && (
                                        <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>File Hash</p>
                                            <p className="font-mono text-xs break-all" style={{ color: '#5b78f5' }}>{ar.metadata.fileHash}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </SectionCard>

                        {/* Certificate */}
                        <SectionCard icon={Award} title="Authenticity Certificate" accent="#39ff14">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)' }}>
                                    <Award size={28} style={{ color: '#39ff14' }} />
                                </div>
                                <p className="text-sm mb-1 font-semibold" style={{ color: 'var(--text-primary)' }}>Media ID: {ar.mediaId}</p>
                                <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
                                    Download a signed authenticity certificate with full forensic details.
                                </p>
                                <button onClick={() => downloadCertificate(ar, file)} className="btn-glow w-full">
                                    <span className="flex items-center justify-center gap-2"><Download size={14} /> Download Certificate</span>
                                </button>
                            </div>
                        </SectionCard>

                        <button onClick={() => navigate('/')} className="w-full btn-glow">
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCw size={15} /> Analyze Another File
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
