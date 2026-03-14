import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Results from './pages/Results'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import TextAnalyzer from './pages/TextAnalyzer'
import MediaAnalysis from './pages/MediaAnalysis'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return null
    return user ? children : <Navigate to="/login" replace />
}

function AppInner() {
    return (
        <BrowserRouter>
            <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
                <Navbar />
                <Routes>
                    <Route path="/" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/media-analysis" element={<MediaAnalysis />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/text-analyzer" element={<TextAnalyzer />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default function App() {
    return (
        <GoogleOAuthProvider clientId="247235363285-dgsfsno77ju87280sdhn8tlb0u4l73p1.apps.googleusercontent.com">
            <ThemeProvider>
                <AuthProvider>
                    <AppInner />
                </AuthProvider>
            </ThemeProvider>
        </GoogleOAuthProvider>
    )
}
