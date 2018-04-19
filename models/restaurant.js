var mongoose = require("mongoose");

var restaurantSchema = mongoose.Schema({
   name:String,
   img:String,
   imgId:String,
   cost:Number,
   location:String,
   lat:Number,
   lng:Number,
   description:String,
   createdAt:{type:Date, default:Date.now},
   user:{
      id:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"User"
      },
      username:String
   },
   comments:[{
       type:mongoose.Schema.Types.ObjectId,
       ref:"Comment"
   }]
});

// Creating the model

module.exports = mongoose.model("Restaurant",restaurantSchema);
