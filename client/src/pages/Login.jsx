import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await axios.post('/api/auth/login', form)
            login(res.data.token)
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post('/api/auth/google', { credential: credentialResponse.credential })
            login(res.data.token)
            navigate('/')
        } catch (err) {
            setError('Google Sign-In failed. Please try again.')
        }
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] w-full bg-white">
            {/* Branding Section (Dark Theme) */}
            <div className="w-full lg:w-1/2 relative bg-[#0a0b14] flex flex-col justify-center items-center py-12 lg:py-0 shrink-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,rgba(91,120,245,0.1)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
                
                <div className="relative z-10 flex flex-col items-center justify-center p-4">
                    <div className="flex items-center gap-3 lg:mb-6 group cursor-default">
                        <div className="relative">
                            <Shield className="text-brand-500 transition-transform group-hover:scale-105 w-12 h-12 lg:w-16 lg:h-16" />
                            <div className="absolute inset-0 blur-xl lg:blur-2xl bg-brand-500 opacity-40 animate-pulse-slow" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight flex items-baseline gap-1">
                            TruthLens <span className="text-brand-400 text-2xl lg:text-3xl font-mono">AI</span>
                        </h1>
                    </div>
                    <p className="hidden sm:block lg:text-xl text-gray-400 font-medium max-w-sm text-center mt-4 lg:mt-0 px-4">
                        Discover the truth behind your media, <span className="text-white">powered by AI</span>
                    </p>
                </div>
            </div>

            {/* Form Section (Light/White Theme) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 shrink-0" style={{ background: 'var(--bg-primary)' }}>
                <div className="w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-xl p-8 lg:p-10 rounded-3xl border shadow-2xl relative" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                        <h2 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
                        <p className="text-sm lg:text-base mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>

                        <div className="flex justify-center mb-4">
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Sign In was unsuccessful')}
                                useOneTap
                                theme="outline"
                                shape="pill"
                                text="signin_with"
                            />
                        </div>

                        <div className="relative my-4 lg:my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" style={{ borderColor: 'var(--border-color)' }}></div>
                            </div>
                            <div className="relative flex justify-center text-xs lg:text-sm">
                                <span className="px-3 lg:px-4 bg-white" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-primary)' }}>Email <span className="text-red-500">*</span></label>
                                <input name="email" type="email" value={form.email} onChange={handle} className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} placeholder="Enter your email address" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-primary)' }}>Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handle} className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 pr-10" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} placeholder="Enter your password" required />
                                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-start">
                                <a href="#" className="text-sm text-brand-500 hover:text-brand-600 font-medium pb-1">Forgot password?</a>
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}

                            <button type="submit" disabled={loading} className="w-full bg-[#1a1b26] hover:bg-[#2a2b36] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors mt-2">
                                {loading ? <span className="animate-spin">⟳</span> : <Zap size={18} />}
                                {loading ? 'Signing in...' : 'Sign in →'}
                            </button>
                        </form>

                        <p className="text-center text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-semibold underline-offset-4 hover:underline">Create one</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
