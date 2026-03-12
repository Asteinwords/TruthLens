require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoose = require('mongoose')
const path = require('path')

const authRoutes = require('./routes/auth')
const scanRoutes = require('./routes/scans')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/scans', scanRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'TruthLens API', timestamp: new Date() }))

// MongoDB connect + start
mongoose.connect(process.env.MONGODB_URI, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
    .then(() => {
        console.log('✅ MongoDB connected')
        app.listen(PORT, () => console.log(`🚀 TruthLens API running on http://localhost:${PORT}`))
    })
    .catch(err => {
        console.warn('⚠️  MongoDB unavailable, starting without DB:', err.message)
        app.listen(PORT, () => console.log(`🚀 TruthLens API (no DB) on http://localhost:${PORT}`))
    })
