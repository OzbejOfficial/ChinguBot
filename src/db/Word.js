const mongoose = require('mongoose');
const { Schema } = mongoose;

const WordSchema = new Schema({
    english_word: {
        type: String,
        required: true,
        unique: true,
    },
    korean_word: {
        type: String,
        required: true,
    },
    eng_allows: {
        type: [String],
        default: [],
    },
});

module.exports = mongoose.model('Word', WordSchema);