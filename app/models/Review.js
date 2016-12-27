var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Reviews', new Schema({
      user:{type:Schema.ObjectId,ref:'User'},
    products:[{type:Schema.ObjectId,ref:'Product'}],
    created_at:{type:Date}
}));
