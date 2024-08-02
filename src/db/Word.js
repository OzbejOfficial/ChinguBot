const mongoose = require('mongoose');
const { Schema } = mongoose;

const WordSchema = new Schema({
    id: {
        type: Number,
    },
    korean: {
        type: String,
    },
    english: {
        type: String,
    },
    romanization: {
        type: String,
    },
    meanings: {
        type: Array,
    },
    example_sentence_korean: {
        type: String,
    },
    example_sentence_romanization: {
        type: String,
    },
    example_sentence_english: {
        type: String,
    },
    level: {
        type: String,
    }
});

module.exports = mongoose.model('Word', WordSchema);