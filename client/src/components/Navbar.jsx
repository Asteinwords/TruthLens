import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Sun, Moon, Shield, Menu, X, LayoutDashboard, BookOpen, Info, Home, LogOut, LogIn } from 'lucide-react'

export default function Navbar() {
    const { isDark, toggle } = useTheme()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)

    const isActive = (path) => location.pathname === path

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/about', label: 'About', icon: Info },
        { path: '/api-docs', label: 'API Docs', icon: BookOpen },
        ...(user ? [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ]

    return (
        <nav className="sticky top-0 z-50" style={{
            background: isDark ? 'rgba(10,11,20,0.85)' : 'rgba(248,250,252,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-color)',
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <Shield size={28} className="text-brand-500 transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 blur-md bg-brand-500 opacity-40 animate-pulse-slow" />
                        </div>
                        <div>
                            <span className="font-bold text-lg gradient-text">TruthLens</span>
                            <span className="text-xs font-mono ml-1" style={{ color: 'var(--text-secondary)' }}>AI</span>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(path)
                                        ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                                        : 'hover:bg-white/5'
                                    }`}
                                style={{ color: isActive(path) ? undefined : 'var(--text-secondary)' }}
                            >
                                <Icon size={15} />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right controls */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggle}
                            className="p-2 rounded-lg transition-all hover:bg-white/5"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
                                <button
                                    onClick={() => { logout(); navigate('/') }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-500/10 hover:text-red-400"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    <LogOut size={15} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                                    <LogIn size={15} /> Login
                                </Link>
                                <Link to="/signup" className="btn-glow text-sm px-4 py-2">
                                    <span>Get Started</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu toggle */}
                    <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} style={{ color: 'var(--text-primary)' }}>
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden py-4 space-y-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${isActive(path) ? 'bg-brand-500/10 text-brand-400' : ''
                                    }`}
                                style={{ color: isActive(path) ? undefined : 'var(--text-secondary)' }}
                            >
                                <Icon size={16} /> {label}
                            </Link>
                        ))}
                        <div className="flex items-center gap-2 px-4 pt-2">
                            <button onClick={toggle} className="p-2 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            {!user && (
                                <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn-glow text-sm px-4 py-2 ml-2">
                                    <span>Get Started</span>
                                </Link>
                            )}
                            {user && (
                                <button onClick={() => { logout(); navigate('/'); setMenuOpen(false) }} className="text-sm text-red-400 px-4 py-2">
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
