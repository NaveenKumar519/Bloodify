var mongoose = require("mongoose");
var bloodStockSchema = new mongoose.Schema({
    bloodGroup: String,
    rhFactor: String,
    units : Number
});
module.exports = mongoose.model("BloodStock",bloodStockSchema);