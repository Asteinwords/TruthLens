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
        detectedArtifacts: [String],
        suspectedModel: String,
        heatmapData: [[Number]],
        metadata: {
            cameraModel: String,
            editingSoftware: String,
            timestamp: String,
            gpsData: String,
            colorSpace: String,
            metadataStatus: String,
        },
        deepfakeAnalysis: mongoose.Schema.Types.Mixed,
    },
    imageData: String, // base64 for display in results
}, { timestamps: true })

module.exports = mongoose.model('Scan', scanSchema)
