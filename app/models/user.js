const mongoose = require('mongoose');
const uniqueValitator = require('mongoose-unique-validator');

const { Schema } = mongoose;
const crypto = require('crypto');


const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone_num: { type: String, required: true, unique: true },
  hash: String,
  salt: String,
});

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10, 32, 'ahmed').toString('hex');
};

UserSchema.methods.validPassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10, 32, 'ahmed').toString('hex');
  return this.hash === hash;
};


UserSchema.plugin(uniqueValitator);
module.exports = mongoose.model('User', UserSchema);
