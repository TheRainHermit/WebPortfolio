import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
    analysisId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    wordCount: {
        type: Number,
        required: true
    },
    characterCount: {
        type: Number,
        required: true
    },
    errors: [{
        type: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        suggestion: String,
        line: Number
    }],
    warnings: [{
        type: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        suggestion: String,
        line: Number
    }],
    suggestions: [String],
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Los análisis expiran después de 30 días
    }
});

export default mongoose.model('Analysis', analysisSchema);
