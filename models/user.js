var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    
    username:{type:String, unique:true,required:true},
    firstName:String,
    lastName:String,
    email:{type:String, unique:true,required:true},
    avatar:String,
    avatarId:String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    birthday:Date,
    password:String,
    isAdmin:{type:Boolean, default:false}
});


userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);