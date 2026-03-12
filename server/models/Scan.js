const mongoose = require('mongoose')

const scanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number },
    analysis: {
        aiProbability: Number,
        humanProbability: Number,
        confidenceLevel: String,
        authenticityScore: Number,
        trustScore: Number,
        trustLabel: String,
        manipulationType: String,
        suspectedModel: String,
        detectedArtifacts: [String],
        heatmapData: [[Number]],
        metadata: mongoose.Schema.Types.Mixed,
        pixelForensics: mongoose.Schema.Types.Mixed,
        frequencySpectrum: mongoose.Schema.Types.Mixed,
        watermarkDetection: mongoose.Schema.Types.Mixed,
        biometric: mongoose.Schema.Types.Mixed,
        explainableReport: String,
        mediaId: String,
        reverseSearchResults: [mongoose.Schema.Types.Mixed],
        deepfakeAnalysis: mongoose.Schema.Types.Mixed,
    },
    imageData: String, // base64 for display in results
}, { timestamps: true })

module.exports = mongoose.model('Scan', scanSchema)
