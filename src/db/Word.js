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
});

module.exports = mongoose.model('Word', WordSchema);