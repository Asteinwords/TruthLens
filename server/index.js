require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoose = require('mongoose')
const path = require('path')

const authRoutes = require('./routes/auth')
const scanRoutes = require('./routes/scans')
const textRoutes = require('./routes/text')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
}))
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'
const allowedOrigins = frontendURL.split(',').map(url => url.trim())
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/scans', scanRoutes)
app.use('/api/text', textRoutes)

// Health check
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    res.json({ 
        status: 'ok', 
        service: 'TruthLens API', 
        mongodb: dbStatus,
        timestamp: new Date() 
    })
})

// MongoDB connect + start
mongoose.connect(process.env.MONGODB_URI, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    bufferCommands: false, // Prevent hanging on Netlify proxy
})
    .then(() => {
        console.log('✅ MongoDB connected')
        app.listen(PORT, () => console.log(`🚀 TruthLens API running on http://localhost:${PORT}`))
    })
    .catch(err => {
        console.warn('⚠️  MongoDB unavailable, starting without DB:', err.message)
        app.listen(PORT, () => console.log(`🚀 TruthLens API (no DB) on http://localhost:${PORT}`))
    })
