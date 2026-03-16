const router = require('express').Router()
const multer = require('multer')
const FormData = require('form-data')
const axios = require('axios')

const upload = multer({ storage: multer.memoryStorage() })

// POST /api/text/analyze
router.post('/analyze', upload.single('file'), async (req, res) => {
    try {
        const form = new FormData()

        if (req.file) {
            form.append('file', req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            })
        } else if (req.body.text) {
            form.append('text', req.body.text)
        } else {
            return res.status(400).json({ message: 'No text or file provided' })
        }

        const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/text/analyze`, form, {
            headers: form.getHeaders(),
            timeout: 60000,
        })

        res.json(aiRes.data)
    } catch (err) {
        console.error('Text analysis proxy error:', err.message)
        res.status(500).json({ message: 'Text analysis failed: ' + err.message })
    }
})

// POST /api/text/humanize
router.post('/humanize', async (req, res) => {
    try {
        const { text } = req.body
        if (!text) return res.status(400).json({ message: 'No text provided' })

        const form = new FormData()
        form.append('text', text)

        const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/text/humanize`, form, {
            headers: form.getHeaders(),
            timeout: 120000, // Humanization can take time for long texts
        })

        res.json(aiRes.data)
    } catch (err) {
        console.error('Humanization proxy error:', err.message)
        res.status(500).json({ message: 'Humanization failed: ' + err.message })
    }
})

module.exports = router
