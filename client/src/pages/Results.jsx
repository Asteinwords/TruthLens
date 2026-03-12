import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, AlertTriangle, CheckCircle, Info, Cpu, Camera, FileText, Eye, Activity, Layers } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'

function ScoreGauge({ value, label, color }) {
    const data = [{ value, fill: color }]
    return (
        <div className="text-center">
            <div className="relative h-32 w-32 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={data} startAngle={200} endAngle={-20}>
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255,255,255,0.05)' }} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black" style={{ color }}>{value}%</span>
                </div>
            </div>
            <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        </div>
    )
}

function HeatmapCanvas({ imageUrl, heatmapData }) {
    const canvasRef = useRef(null)
    const imgRef = useRef(null)
    const [showHeatmap, setShowHeatmap] = useState(true)

    useEffect(() => {
        if (!canvasRef.current || !imgRef.current || !heatmapData) return
        const img = imgRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        const drawHeatmap = () => {
            canvas.width = img.naturalWidth || img.clientWidth
            canvas.height = img.naturalHeight || img.clientHeight
            const w = canvas.width, h = canvas.height
            const rows = heatmapData.length
            const cols = heatmapData[0]?.length || 0
            const cellW = w / cols
            const cellH = h / rows
            heatmapData.forEach((row, r) => {
                row.forEach((val, c) => {
                    const alpha = val * 0.75
                    ctx.fillStyle = val > 0.6
                        ? `rgba(255,0,80,${alpha})`
                        : val > 0.35
                            ? `rgba(255,165,0,${alpha})`
                            : `rgba(0,212,255,${alpha * 0.4})`
                    ctx.fillRect(c * cellW, r * cellH, cellW, cellH)
                })
            })
        }

        if (img.complete) drawHeatmap()
        else img.onload = drawHeatmap
    }, [heatmapData, showHeatmap])

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Eye size={16} className="text-brand-400" /> Heatmap Analysis
                </h3>
                <button
                    onClick={() => setShowHeatmap(v => !v)}
                    className="text-xs px-3 py-1 rounded-lg transition-all hover:bg-white/5"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                >
                    {showHeatmap ? 'Hide Overlay' : 'Show Overlay'}
                </button>
            </div>
            <div className="heatmap-container rounded-xl overflow-hidden">
                <img ref={imgRef} src={imageUrl} alt="Analyzed media" className="w-full max-h-[400px] object-contain rounded-xl" style={{ display: 'block' }} />
                {showHeatmap && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ borderRadius: 12 }} />}
            </div>
            <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(255,0,80,0.7)' }} /> High risk</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(255,165,0,0.7)' }} /> Medium risk</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'rgba(0,212,255,0.4)' }} /> Low risk</span>
            </div>
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
        <span className="px-3 py-1 rounded-lg text-sm font-semibold" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
            {level} Confidence
        </span>
    )
}

export default function Results() {
    const location = useLocation()
    const navigate = useNavigate()
    const { result, file } = location.state || {}
    const [imageUrl, setImageUrl] = useState(null)

    useEffect(() => {
        if (result?.imageData) {
            setImageUrl(result.imageData)
        }
    }, [result])

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p style={{ color: 'var(--text-secondary)' }}>No analysis data found.</p>
                    <button onClick={() => navigate('/')} className="btn-glow mt-4"><span>Go Home</span></button>
                </div>
            </div>
        )
    }

    const isAI = result.aiProbability > 50
    const ar = result.analysis || result

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                        <ArrowLeft size={16} /> Back to Upload
                    </button>
                    <div className="flex items-center gap-3">
                        {isAI
                            ? <span className="badge-ai flex items-center gap-1"><AlertTriangle size={12} /> AI Generated</span>
                            : <span className="badge-real flex items-center gap-1"><CheckCircle size={12} /> Likely Real</span>
                        }
                        <ConfidenceBadge level={ar.confidenceLevel} />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Media Authenticity Report</h1>
                <p className="mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    File: <code className="font-mono text-brand-400">{file?.name}</code> · {file?.type} · {(file?.size / 1024).toFixed(1)} KB
                </p>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left col: scores + heatmap */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Score cards */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Activity size={18} className="text-brand-400" /> Probability Analysis
                            </h2>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <ScoreGauge value={Math.round(ar.aiProbability)} label="AI Generated" color="#ff006e" />
                                <ScoreGauge value={Math.round(ar.humanProbability)} label="Human Captured" color="#39ff14" />
                                <ScoreGauge value={Math.round(ar.authenticityScore)} label="Authenticity" color="#5b78f5" />
                            </div>

                            {/* Progress bars */}
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        <span>AI Probability</span><span className="font-mono">{ar.aiProbability?.toFixed(1)}%</span>
                                    </div>
                                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${ar.aiProbability}%`, background: 'linear-gradient(90deg, #ff006e, #bf00ff)' }} /></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        <span>Human Probability</span><span className="font-mono">{ar.humanProbability?.toFixed(1)}%</span>
                                    </div>
                                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${ar.humanProbability}%`, background: 'linear-gradient(90deg, #39ff14, #00d4ff)' }} /></div>
                                </div>
                            </div>
                        </div>

                        {/* Heatmap */}
                        {imageUrl && ar.heatmapData && (
                            <div className="glass-card p-6">
                                <HeatmapCanvas imageUrl={imageUrl} heatmapData={ar.heatmapData} />
                            </div>
                        )}

                        {/* Detected artifacts */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Layers size={18} className="text-brand-400" /> Detected Artifacts
                            </h2>
                            {ar.detectedArtifacts?.length > 0 ? (
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {ar.detectedArtifacts.map((artifact, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,0,110,0.05)', border: '1px solid rgba(255,0,110,0.15)' }}>
                                            <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{artifact}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.15)' }}>
                                    <CheckCircle size={16} className="text-green-400" />
                                    <span className="text-sm text-green-400">No significant artifacts detected</span>
                                </div>
                            )}
                        </div>

                        {/* Deepfake module (videos) */}
                        {ar.deepfakeAnalysis && (
                            <div className="glass-card p-6">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                    <Camera size={18} className="text-brand-400" /> Deepfake Detection
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {Object.entries(ar.deepfakeAnalysis).map(([key, val]) => (
                                        <div key={key} className="p-3 rounded-xl glass-card">
                                            <p className="text-xs mb-1 capitalize" style={{ color: 'var(--text-secondary)' }}>
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </p>
                                            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                                {typeof val === 'number' ? `${val.toFixed(1)}%` : val}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right col: metadata + AI model */}
                    <div className="space-y-6">
                        {/* AI model */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Cpu size={18} className="text-brand-400" /> Suspected AI Model
                            </h2>
                            {ar.suspectedModel ? (
                                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(91,120,245,0.08)', border: '1px solid rgba(91,120,245,0.25)' }}>
                                    <p className="gradient-text font-bold text-lg">{ar.suspectedModel}</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Most likely generation source</p>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.15)' }}>
                                    <p className="text-green-400 font-semibold">No AI Model Detected</p>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Content appears authentic</p>
                                </div>
                            )}
                        </div>

                        {/* Authenticity score summary */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Info size={18} className="text-brand-400" /> Summary
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Authenticity Score</span>
                                    <span className="font-bold text-lg gradient-text">{ar.authenticityScore}/100</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Confidence</span>
                                    <ConfidenceBadge level={ar.confidenceLevel} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Verdict</span>
                                    {isAI
                                        ? <span className="badge-ai">AI Generated</span>
                                        : <span className="badge-real">Authentic</span>
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Metadata panel */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <FileText size={18} className="text-brand-400" /> Metadata Analysis
                            </h2>
                            {ar.metadata && (
                                <div className="space-y-3">
                                    {[
                                        { label: 'Camera Model', value: ar.metadata.cameraModel || 'Not found' },
                                        { label: 'Editing Software', value: ar.metadata.editingSoftware || 'Unknown' },
                                        { label: 'Timestamp', value: ar.metadata.timestamp || 'Not found' },
                                        { label: 'GPS Data', value: ar.metadata.gpsData || 'None' },
                                        { label: 'Color Space', value: ar.metadata.colorSpace || 'Unknown' },
                                        { label: 'Metadata Status', value: ar.metadata.metadataStatus },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-start gap-2">
                                            <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                            <span className={`text-xs font-medium text-right ${value === 'Stripped' || value === 'Modified' ? 'text-red-400' :
                                                    value === 'Intact' ? 'text-green-400' : ''
                                                }`} style={{ color: !['Stripped', 'Modified', 'Intact'].includes(value) ? 'var(--text-primary)' : undefined }}>
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={() => navigate('/')} className="w-full btn-glow">
                            <span className="flex items-center justify-center gap-2">
                                Analyze Another File
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
