var mongoose = require('mongoose');

var PetSchema = new mongoose.Schema({
  breed: {
    type: String,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  age: {
    type: Number
  },
  petBio: {
    type: String,
    trim: true
  },
  petImgs: [{
    data: Buffer,
    contentType: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId
  }
});

var Pet = mongoose.model('Pet', PetSchema);
module.exports = Pet;
