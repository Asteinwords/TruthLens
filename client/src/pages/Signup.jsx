import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Zap, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function Signup() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
        setLoading(true)
        try {
            const res = await axios.post('/api/auth/register', form)
            login(res.data.token)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen hero-bg grid-bg flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="glass-card p-8" style={{ border: '1px solid rgba(91,120,245,0.2)' }}>
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <Shield size={40} className="text-brand-400" />
                            <div className="absolute inset-0 blur-lg bg-brand-500 opacity-30 animate-pulse-slow" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-center mb-1" style={{ color: 'var(--text-primary)' }}>Create account</h1>
                    <p className="text-center text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Start detecting AI-generated media today</p>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                            <input name="name" type="text" value={form.name} onChange={handle} className="input-glass" placeholder="Jane Smith" required />
                        </div>
                        <div>
                            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Email</label>
                            <input name="email" type="email" value={form.email} onChange={handle} className="input-glass" placeholder="you@example.com" required />
                        </div>
                        <div>
                            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Password</label>
                            <div className="relative">
                                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handle} className="input-glass pr-10" placeholder="Min. 6 characters" required />
                                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button type="submit" disabled={loading} className="btn-glow w-full mt-2">
                            <span className="flex items-center justify-center gap-2">
                                {loading ? <span className="animate-spin">⟳</span> : <User size={16} />}
                                {loading ? 'Creating account...' : 'Create Account'}
                            </span>
                        </button>
                    </form>

                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
