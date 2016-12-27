var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = mongoose.model('Product', new Schema({
          name:String,
          path:String,
          size:Number,
          currency:String,
          price:Number,
          description:String,
    }));
