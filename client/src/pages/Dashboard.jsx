import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, Upload, AlertTriangle, CheckCircle, Clock,
    BarChart3, Shield, Download, FileText, Cpu, RefreshCw
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function getVerdict(t) {
    if (!t && t !== 0) t = 50
    if (t < 40) return { label: 'High Risk AI', cls: 'badge-ai', icon: AlertTriangle, color: '#ff006e' }
    if (t < 70) return { label: 'Suspicious', icon: AlertTriangle, color: '#ffa500', cls: '' }
    return { label: 'Authentic', cls: 'badge-real', icon: CheckCircle, color: '#39ff14' }
}

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                    <Icon size={17} style={{ color }} />
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            </div>
            <p className="text-3xl font-black gradient-text">{value}</p>
        </div>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [scans, setScans] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetch = () => {
        setLoading(true)
        axios.get('/api/scans')
            .then(r => setScans(r.data))
            .catch(() => setError('Failed to load scan history. Make sure you are logged in.'))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetch() }, [])

    const avgScore = scans.length
        ? Math.round(scans.reduce((a, s) => a + (s.analysis?.authenticityScore || 0), 0) / scans.length)
        : '--'
    const aiCount = scans.filter(s => (s.analysis?.aiProbability || 0) > 50).length
    const realCount = scans.length - aiCount

    return (
        <div className="min-h-screen py-10">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                            <LayoutDashboard size={26} className="text-brand-400" /> Forensic Dashboard
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Welcome back, <span className="text-brand-400 font-medium">{user?.name || user?.email}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetch} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:bg-white/5"
                            style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <Link to="/" className="btn-glow">
                            <span className="flex items-center gap-2"><Upload size={15} /> New Scan</span>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Scans" value={scans.length} icon={BarChart3} color="#5b78f5" />
                    <StatCard label="AI Detected" value={aiCount} icon={AlertTriangle} color="#ff006e" />
                    <StatCard label="Authentic" value={realCount} icon={CheckCircle} color="#39ff14" />
                    <StatCard label="Avg Trust Score" value={avgScore} icon={Shield} color="#00d4ff" />
                </div>

                {/* Scan history table */}
                <div className="glass-card overflow-hidden">
                    <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                        <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Scan History</h2>
                        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(91,120,245,0.1)', color: '#5b78f5' }}>
                            {scans.length} records
                        </span>
                    </div>

                    <div className="p-5">
                        {loading && (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                                ))}
                            </div>
                        )}
                        {error && <p className="text-red-400 text-sm text-center py-8">{error}</p>}
                        {!loading && scans.length === 0 && !error && (
                            <div className="text-center py-16">
                                <Upload size={48} className="mx-auto mb-4 text-brand-400 opacity-30" />
                                <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No scans yet</p>
                                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Upload your first file to see forensic analysis history here</p>
                                <Link to="/" className="btn-glow inline-block"><span>Analyze Media</span></Link>
                            </div>
                        )}

                        {!loading && scans.length > 0 && (
                            <div className="space-y-2">
                                {/* Table header */}
                                <div className="hidden md:grid grid-cols-5 gap-4 px-4 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                    <span className="col-span-2">File</span>
                                    <span>Trust Score</span>
                                    <span>Classification</span>
                                    <span>Date</span>
                                </div>

                                {scans.map(scan => {
                                    const score = scan.analysis?.authenticityScore ?? 50
                                    const verdict = getVerdict(score)
                                    const VIcon = verdict.icon
                                    const manip = scan.analysis?.manipulationType || '—'
                                    return (
                                        <div key={scan._id}
                                            className="grid md:grid-cols-5 gap-4 items-center p-4 rounded-xl transition-all hover:bg-white/3 cursor-default"
                                            style={{ border: '1px solid var(--border-color)' }}>

                                            {/* File */}
                                            <div className="col-span-2 flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{ background: 'rgba(91,120,245,0.1)' }}>
                                                    <FileText size={15} className="text-brand-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{scan.fileName}</p>
                                                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{scan.fileType}</p>
                                                </div>
                                            </div>

                                            {/* Trust score */}
                                            <div className="flex items-center gap-2">
                                                <p className="text-lg font-black gradient-text">{score}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>/100</p>
                                            </div>

                                            {/* Classification */}
                                            <div>
                                                <p className="text-xs font-semibold" style={{ color: verdict.color }}>
                                                    <VIcon size={11} className="inline mr-1" />{verdict.label}
                                                </p>
                                                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{manip}</p>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                <Clock size={11} />
                                                {new Date(scan.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
