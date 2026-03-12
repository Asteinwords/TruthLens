import { BookOpen, Copy, Check, Terminal, Zap } from 'lucide-react'
import { useState } from 'react'

function CodeBlock({ code, lang = 'json' }) {
    const [copied, setCopied] = useState(false)
    const copy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    return (
        <div className="relative rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{lang}</span>
                <button onClick={copy} className="flex items-center gap-1 text-xs transition-colors" style={{ color: copied ? '#39ff14' : 'var(--text-secondary)' }}>
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto font-mono" style={{ color: '#e2e8f0' }}>{code}</pre>
        </div>
    )
}

const ENDPOINTS = [
    {
        method: 'POST', path: '/api/auth/register', desc: 'Create a new user account',
        request: `{\n  "name": "Jane Smith",\n  "email": "jane@example.com",\n  "password": "securepass123"\n}`,
        response: `{\n  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n  "user": { "id": "...", "email": "jane@example.com", "name": "Jane Smith" }\n}`,
    },
    {
        method: 'POST', path: '/api/auth/login', desc: 'Authenticate and get a JWT token',
        request: `{\n  "email": "jane@example.com",\n  "password": "securepass123"\n}`,
        response: `{\n  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",\n}`,
    },
    {
        method: 'POST', path: '/api/scans/upload', desc: 'Upload media for AI analysis (multipart/form-data)',
        request: `Content-Type: multipart/form-data\nAuthorization: Bearer <token>\n\n[Form field: "file" → binary media file]`,
        response: `{\n  "aiProbability": 78.4,\n  "humanProbability": 21.6,\n  "confidenceLevel": "High",\n  "authenticityScore": 22,\n  "detectedArtifacts": ["GAN noise patterns", "Unnatural lighting"],\n  "suspectedModel": "Stable Diffusion 2.1",\n  "heatmapData": [[0.1, 0.8, ...], ...],\n  "metadata": { "cameraModel": null, "metadataStatus": "Stripped" },\n  "deepfakeAnalysis": null\n}`,
    },
    {
        method: 'GET', path: '/api/scans', desc: 'Get the authenticated user\'s scan history',
        request: `Authorization: Bearer <token>`,
        response: `[\n  {\n    "_id": "...",\n    "fileName": "photo.jpg",\n    "analysis": { "authenticityScore": 22, "aiProbability": 78.4 },\n    "createdAt": "2026-03-12T10:00:00.000Z"\n  }\n]`,
    },
]

const methodColor = { GET: '#39ff14', POST: '#5b78f5', DELETE: '#ff006e' }

export default function ApiDocs() {
    return (
        <div className="min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 glass-card" style={{ border: '1px solid rgba(91,120,245,0.3)' }}>
                        <Terminal size={14} className="text-brand-400" />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Developer API</span>
                    </div>
                    <h1 className="text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
                        API <span className="gradient-text">Reference</span>
                    </h1>
                    <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        Integrate TruthLens AI into your applications using our REST API.
                    </p>
                </div>

                {/* Base URL */}
                <div className="glass-card p-5 mb-10" style={{ border: '1px solid rgba(91,120,245,0.2)' }}>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Base URL</p>
                    <code className="font-mono text-brand-400">http://localhost:5000</code>
                    <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                        All requests require <code className="font-mono text-brand-300">Content-Type: application/json</code> unless uploading files.
                        Protected endpoints require <code className="font-mono text-brand-300">Authorization: Bearer &lt;token&gt;</code>
                    </p>
                </div>

                {/* Endpoints */}
                <div className="space-y-8">
                    {ENDPOINTS.map(ep => (
                        <div key={ep.path} className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-1 rounded text-xs font-bold font-mono" style={{ background: `${methodColor[ep.method]}20`, color: methodColor[ep.method] }}>
                                    {ep.method}
                                </span>
                                <code className="font-mono text-sm text-brand-300">{ep.path}</code>
                            </div>
                            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{ep.desc}</p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Request</p>
                                    <CodeBlock code={ep.request} lang="http" />
                                </div>
                                <div>
                                    <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Response</p>
                                    <CodeBlock code={ep.response} lang="json" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
