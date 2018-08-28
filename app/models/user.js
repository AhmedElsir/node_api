const mongoose = require('mongoose');
const uniqueValitator = require('mongoose-unique-validator');

const { Schema } = mongoose;
const bcrypt = require('bcrypt');


const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone_num: { type: String, required: true, unique: true },
  hash: { type: String },
  salt: { type: String },
});

UserSchema.methods.setPassword = function setPassword(password) {
  bcrypt.hash(password, 10, (err, hash) => {
    this.hash = hash;
  });
};


UserSchema.methods.validPassword = function validPassword(password) {
  bcrypt.compare(password, this.hash, (err, res) => {
    if (res) { return true; } return false;
  });
};

UserSchema.plugin(uniqueValitator);
module.exports = mongoose.model('User', UserSchema);
