import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Sun, Moon, Shield, Menu, X, LayoutDashboard, BookOpen, Info, Home, LogOut, LogIn, FileText, Eye } from 'lucide-react'

export default function Navbar() {
    const { isDark, toggle } = useTheme()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isActive = (path) => location.pathname === path

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

    const navLinks = [
        ...(user ? [{ path: '/', label: 'Dashboard', icon: LayoutDashboard }] : []),
        { path: '/media-analysis', label: 'Media Analysis', icon: Eye },
        { path: '/text-analyzer', label: 'Text Analyzer', icon: FileText },
        { path: '/about', label: 'About', icon: Info }
    ]

    const getNavbarStyle = () => {
        if (isAuthPage) {
            return {
                background: 'transparent',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                borderBottom: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
            }
        }
        return {
            background: scrolled 
                ? (isDark ? 'rgba(10,11,20,0.6)' : 'rgba(255,255,255,0.6)') 
                : (isDark ? 'rgba(10,11,20,0.15)' : 'rgba(255,255,255,0.15)'),
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }
    }

    return (
        <nav className={`${!isAuthPage ? 'sticky' : ''} top-0 z-50 transition-all duration-300`} style={getNavbarStyle()}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <Shield size={28} className={`${isAuthPage ? 'text-brand-400' : 'text-brand-500'} transition-transform group-hover:scale-110`} />
                            <div className={`absolute inset-0 blur-md ${isAuthPage ? 'bg-brand-400' : 'bg-brand-500'} opacity-60 animate-pulse-slow`} />
                        </div>
                        <div>
                            <span className={`font-bold text-lg ${isAuthPage ? 'text-white' : 'gradient-text'}`}>TruthLens</span>
                            <span className="text-xs font-mono ml-1" style={{ color: isAuthPage ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)' }}>AI</span>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex flex-1 justify-center items-center gap-4 lg:gap-8 px-8">
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive(path)
                                    ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20'
                                    : (isAuthPage ? 'hover:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5')
                                    }`}
                                style={{
                                    color: isActive(path)
                                        ? undefined
                                        : (isAuthPage
                                            ? 'rgba(255, 255, 255, 0.9)' // Slightly brighter white
                                            : 'var(--text-secondary)'),
                                    textShadow: isAuthPage ? '0 1px 3px rgba(0,0,0,0.3)' : 'none' // Add shadow for visibility on light side
                                }}
                            >
                                <Icon size={16} />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right controls */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggle}
                            className={`p-2 rounded-lg transition-all ${isAuthPage ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}
                            style={{ color: isAuthPage ? '#475569' : 'var(--text-secondary)' }}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden lg:flex flex-col items-end mr-2 text-right">
                                    <span className="text-sm font-semibold" style={{ color: isAuthPage ? '#1e293b' : 'var(--text-primary)' }}>{user.name || 'User'}</span>
                                    <span className="text-xs" style={{ color: isAuthPage ? '#64748b' : 'var(--text-secondary)' }}>{user.email}</span>
                                </div>
                                <div className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/20 text-brand-500 font-bold text-sm">
                                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={() => { logout(); navigate('/') }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-500/10 hover:text-red-400"
                                    style={{ color: isAuthPage ? '#64748b' : 'var(--text-secondary)' }}
                                >
                                    <LogOut size={15} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isAuthPage ? 'hover:bg-black/5' : 'hover:bg-white/5'}`} style={{ color: isAuthPage ? '#475569' : 'var(--text-secondary)' }}>
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
                                <div className="flex flex-col w-full">
                                    <div className="px-4 py-3 flex items-center gap-3 border-b mb-2" style={{ borderColor: 'var(--border-color)' }}>
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-500/20 text-brand-500 font-bold text-lg">
                                            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.name || 'User'}</span>
                                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => { logout(); navigate('/'); setMenuOpen(false) }} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 px-4 py-3 transition-colors">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
