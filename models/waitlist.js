const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const waitlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
}, { timestamps: true });

const WaitlistDetails = mongoose.model('WaitlistDetails', waitlistSchema);

module.exports = WaitlistDetails;