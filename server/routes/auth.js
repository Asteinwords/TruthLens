const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const sign = (user) => jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
)

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' })
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

        const exists = await User.findOne({ email })
        if (exists) return res.status(409).json({ message: 'Email already registered' })

        const hashed = await bcrypt.hash(password, 12)
        const user = await User.create({ name, email, password: hashed })
        const token = sign(user)
        res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } })
    } catch (err) {
        console.error('Register error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'Invalid credentials' })

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

        const token = sign(user)
        res.json({ token, user: { id: user._id, email: user.email, name: user.name } })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST /api/auth/google
const { OAuth2Client } = require('google-auth-library')
// Use the client ID provided by the user
const client = new OAuth2Client("247235363285-dgsfsno77ju87280sdhn8tlb0u4l73p1.apps.googleusercontent.com")

router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body
        if (!credential) return res.status(400).json({ message: 'Google credential required' })

        // Verify the token with Google
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: "247235363285-dgsfsno77ju87280sdhn8tlb0u4l73p1.apps.googleusercontent.com",
        })
        const payload = ticket.getPayload()
        const { sub: googleId, email, name } = payload

        // Find existing user by Google ID or Email
        let user = await User.findOne({ $or: [{ googleId }, { email }] })

        if (user) {
            // Unify account if needed
            if (!user.googleId) {
                user.googleId = googleId
                await user.save()
            }
        } else {
            // Register new user (no password required)
            user = await User.create({ name, email, googleId })
        }

        const token = sign(user)
        res.json({ token, user: { id: user._id, email: user.email, name: user.name } })
    } catch (err) {
        console.error('Google Auth error:', err)
        res.status(500).json({ message: 'Authentication failed' })
    }
})

module.exports = router
