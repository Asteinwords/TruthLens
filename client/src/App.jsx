import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Results from './pages/Results'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import ApiDocs from './pages/ApiDocs'
import Login from './pages/Login'
import Signup from './pages/Signup'

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
                    <Route path="/" element={<Home />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/api-docs" element={<ApiDocs />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppInner />
            </AuthProvider>
        </ThemeProvider>
    )
}
