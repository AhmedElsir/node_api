var mongoose     = require('mongoose');
var uniqueValitator = require('mongoose-unique-validator');
var Schema       = mongoose.Schema;


var UserSchema = new Schema({
    name: {type: String, required: true, unique: true},
    email: {type: String, required: true},
    phone_num : {type: String, required: true, unique: true},
    token: {type: String, required: true, unique: true}
});

UserSchema.plugin(uniqueValitator);

module.exports = mongoose.model('User', UserSchema);