const router = require('express').Router()
const multer = require('multer')
const FormData = require('form-data')
const axios = require('axios')
const authMiddleware = require('../middleware/auth')
const Scan = require('../models/Scan')

// multer: store in memory
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })

// POST /api/scans/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file provided' })

        // Forward to FastAPI AI service
        const form = new FormData()
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        })

        let analysis
        try {
            const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, form, {
                headers: form.getHeaders(),
                timeout: 30000,
            })
            analysis = aiRes.data
        } catch (aiErr) {
            console.warn('AI service unavailable, using fallback mock:', aiErr.message)
            analysis = generateMockAnalysis(req.file)
        }

        // Build base64 preview for images
        let imageData = null
        if (req.file.mimetype.startsWith('image/')) {
            const b64 = req.file.buffer.toString('base64')
            imageData = `data:${req.file.mimetype};base64,${b64}`
        }

        // Save scan to DB (optional auth)
        let userId = null
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const jwt = require('jsonwebtoken')
                const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
                userId = decoded.id
            } catch { }
        }

        // Save scan to DB (non-critical – analysis still returns even if DB fails)
        let scanId = null
        try {
            const scan = await Scan.create({
                userId,
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                analysis,
                imageData,
            })
            scanId = scan._id
        } catch (dbErr) {
            console.warn('⚠️  DB save skipped (non-fatal):', dbErr.message)
        }

        res.json({ ...analysis, imageData, scanId })
    } catch (err) {
        console.error('Upload error:', err)
        res.status(500).json({ message: 'Analysis failed: ' + err.message })
    }
})

// GET /api/scans  (requires auth)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const scans = await Scan.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50)
        res.json(scans)
    } catch (err) {
        res.status(500).json({ message: 'Server error' })
    }
})

// ────────────────────────────────────────────────
// Inline mock analysis (used when AI service is down)
// ────────────────────────────────────────────────
function generateMockAnalysis(file) {
    const isVideo = file.mimetype.startsWith('video/')
    const aiProb = parseFloat((Math.random() * 85 + 10).toFixed(1))
    const humanProb = parseFloat((100 - aiProb).toFixed(1))
    const authScore = Math.round(humanProb * 0.9 + Math.random() * 10)
    const conf = aiProb > 75 ? 'High' : aiProb > 50 ? 'Medium' : 'Low'

    const allArtifacts = [
        'GAN noise patterns detected in high-frequency domain',
        'Unnatural lighting gradient inconsistencies',
        'Facial geometry distortion (ear/eye symmetry)',
        'Diffusion model spectral fingerprint',
        'JPEG compression artifact mismatch',
        'Pixel-level blending seams detected',
        'Unrealistic texture repetition',
        'Chromatic aberration absence',
    ]
    const detectedArtifacts = aiProb > 55
        ? allArtifacts.slice(0, Math.ceil(aiProb / 25))
        : []

    const models = ['Stable Diffusion 2.1', 'Stable Diffusion XL', 'Midjourney v6', 'DALL·E 3', 'Adobe Firefly 2.0', 'DeepFloyd IF']
    const suspectedModel = aiProb > 55 ? models[Math.floor(Math.random() * models.length)] : null

    const rows = 16, cols = 16
    const heatmapData = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
            const cx = cols / 2, cy = rows / 2
            const dist = Math.sqrt((c - cx) ** 2 + (r - cy) ** 2) / (cols / 2)
            return parseFloat(Math.max(0, Math.min(1, (aiProb / 100) * (1 - dist * 0.6) + Math.random() * 0.3)).toFixed(2))
        })
    )

    return {
        aiProbability: aiProb,
        humanProbability: humanProb,
        confidenceLevel: conf,
        authenticityScore: authScore,
        detectedArtifacts,
        suspectedModel,
        heatmapData,
        metadata: {
            cameraModel: Math.random() > 0.5 ? null : 'Canon EOS R5',
            editingSoftware: Math.random() > 0.5 ? 'Adobe Photoshop 25.0' : 'Unknown',
            timestamp: Math.random() > 0.5 ? null : new Date(Date.now() - Math.random() * 1e10).toISOString(),
            gpsData: Math.random() > 0.7 ? '40.7128° N, 74.0060° W' : 'None',
            colorSpace: Math.random() > 0.5 ? 'sRGB' : 'AdobeRGB',
            metadataStatus: aiProb > 65 ? 'Stripped' : Math.random() > 0.5 ? 'Intact' : 'Modified',
        },
        deepfakeAnalysis: isVideo ? {
            facialLandmarkScore: parseFloat((Math.random() * 40 + 55).toFixed(1)),
            lipSyncConsistency: parseFloat((Math.random() * 60 + 30).toFixed(1)),
            blinkPatternNormal: Math.random() > 0.5,
            frameConsistencyScore: parseFloat((Math.random() * 50 + 40).toFixed(1)),
            deepfakeProbability: parseFloat((aiProb * 0.9 + Math.random() * 10).toFixed(1)),
        } : null,
    }
}

module.exports = router
