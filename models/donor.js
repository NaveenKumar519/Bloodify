var mongoose = require("mongoose");
var donorSchema = new mongoose.Schema({
    userId: String,
    name: String,
    isDiabetic: String,
    weight: Number,
    units: Number,
    bloodGroup: String,
    rhFactor: String
});
module.exports = mongoose.model("Donor",donorSchema);
