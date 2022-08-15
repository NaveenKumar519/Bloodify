var mongoose = require("mongoose");
var confirmDonorSchema = new mongoose.Schema({
    userId: String,
    name: String,
    isDiabetic: String,
    weight: Number,
    units: Number,
    bloodGroup: String,
    rhFactor: String,
    date: {
		type: Date,
		default: Date.now
	}
});
module.exports = mongoose.model("ConfirmedDonor",confirmDonorSchema);