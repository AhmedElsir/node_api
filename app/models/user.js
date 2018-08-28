const mongoose = require('mongoose');
const uniqueValitator = require('mongoose-unique-validator');

const { Schema } = mongoose;
const crypto = require('crypto');

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone_num: { type: String, required: true, unique: true },
  hash: { type: String, required: true },
  salt: String,
});

UserSchema.methods.setPassword = function setPassword(password) {
  // creating a unique salt for a particular user
  this.salt = crypto.randomBytes(16).toString('hex');

  // hashing user's salt and password with 1000 iterations
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function validPassword(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.hash === hash;
};


UserSchema.plugin(uniqueValitator);
module.exports = mongoose.model('User', UserSchema);
