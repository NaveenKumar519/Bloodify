var mongoose = require("mongoose");
var confirmedRequestSchema = new mongoose.Schema({
    userId: String,
    name: String,
    aadhar : String,
    units: Number,
    bloodGroup: String,
    rhFactor: String
});
module.exports = mongoose.model("confirmedRequest",confirmedRequestSchema);