var mongoose = require("mongoose");
var requesterSchema = new mongoose.Schema({
    userId: String,
    name: String,
    aadhar : String,
    units: Number,
    bloodGroup: String,
    rhFactor: String
});
module.exports = mongoose.model("Requester",requesterSchema);