import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Upload, AlertTriangle, CheckCircle, Clock, Trash2, BarChart3 } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function getVerdict(score) {
    if (score < 40) return { label: 'AI Generated', cls: 'badge-ai', icon: AlertTriangle }
    if (score < 70) return { label: 'Suspicious', cls: 'badge-ai', icon: AlertTriangle }
    return { label: 'Authentic', cls: 'badge-real', icon: CheckCircle }
}

export default function Dashboard() {
    const { user } = useAuth()
    const [scans, setScans] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        axios.get('/api/scans')
            .then(r => setScans(r.data))
            .catch(() => setError('Failed to load scan history'))
            .finally(() => setLoading(false))
    }, [])

    const avgScore = scans.length ? Math.round(scans.reduce((a, s) => a + (s.analysis?.authenticityScore || 0), 0) / scans.length) : 0
    const aiCount = scans.filter(s => (s.analysis?.aiProbability || 0) > 50).length

    return (
        <div className="min-h-screen py-10">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                            <LayoutDashboard size={28} className="text-brand-400" /> Dashboard
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Welcome back, <span className="text-brand-400 font-medium">{user?.name || user?.email}</span>
                        </p>
                    </div>
                    <Link to="/" className="btn-glow">
                        <span className="flex items-center gap-2"><Upload size={16} /> New Scan</span>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Scans', value: scans.length, icon: BarChart3, color: '#5b78f5' },
                        { label: 'AI Detected', value: aiCount, icon: AlertTriangle, color: '#ff006e' },
                        { label: 'Authentic', value: scans.length - aiCount, icon: CheckCircle, color: '#39ff14' },
                        { label: 'Avg Authenticity', value: `${avgScore}`, icon: BarChart3, color: '#00d4ff' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="glass-card p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                                    <Icon size={16} style={{ color }} />
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                            </div>
                            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Scan history */}
                <div className="glass-card p-6">
                    <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Scan History</h2>
                    {loading && (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)' }} />)}
                        </div>
                    )}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    {!loading && scans.length === 0 && (
                        <div className="text-center py-16">
                            <Upload size={48} className="mx-auto mb-4 text-brand-400 opacity-40" />
                            <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No scans yet</p>
                            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Upload your first file to see the analysis here</p>
                            <Link to="/" className="btn-glow inline-block"><span>Upload Media</span></Link>
                        </div>
                    )}
                    {!loading && scans.length > 0 && (
                        <div className="space-y-3">
                            {scans.map(scan => {
                                const verdict = getVerdict(scan.analysis?.authenticityScore || 50)
                                const VIcon = verdict.icon
                                return (
                                    <div key={scan._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/3 transition-all" style={{ border: '1px solid var(--border-color)' }}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(91,120,245,0.1)' }}>
                                                <Upload size={16} className="text-brand-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{scan.fileName}</p>
                                                <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                    <Clock size={11} /> {new Date(scan.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-bold gradient-text">{scan.analysis?.authenticityScore || 0}/100</p>
                                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Authenticity</p>
                                            </div>
                                            <span className={verdict.cls + ' flex items-center gap-1'}>
                                                <VIcon size={11} /> {verdict.label}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
