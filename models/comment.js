var mongoose = require("mongoose");


var commentSchema = mongoose.Schema({
   text:String,
   createdAt:{type:Date, default:Date.now},
   user:{
      id:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"User"
      },
      username:String,
      email:String
   }
});

// Creating the model

module.exports = mongoose.model("Comment",commentSchema);