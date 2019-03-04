var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SavedSchema = new Schema({
  title: {
    type: String
},

link: {
    type: String,
    required: true
},

body: {
    type: String
},

note: {
  type: Schema.Types.ObjectId,
  ref: "Note"
}
  });
  
  var Saved = mongoose.model("Saved", SavedSchema);
  
  module.exports = Saved;