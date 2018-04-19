var express =require("express");
var router = express.Router({mergeParams:true});
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var midlleware = require("../middlewares");

// Comment new
router.get("/new",midlleware.isLoggedIn,function(req, res) {
    Restaurant.findById(req.params.id,function(err, restaurant){
        if(err || !restaurant){
            return res.redirect("back");
        }
            // console.log(restaurant);
            res.render("comment/new",{restaurantC:restaurant});
       
    });
    
});

// Comment create
router.post("/",midlleware.isLoggedIn,function(req, res){
    Restaurant.findById(req.params.id,function(err, restaurant) {
        if(err || !restaurant){
            res.redirect("/home");
        }else{
            Comment.create(req.body.comment,function(err, comment){
                if(err){
                    console.log(req.body.comment);
                    console.log(err);
                }else{
                    comment.user.id = req.user._id;
                    comment.user.username = req.user.username;
                    // comment.user.email = req.user.email;
                    // console.log(comment);
                    comment.save();
                    restaurant.comments.push(comment);
                    restaurant.save();
                    // console.log(comment);
                    req.flash("success","Added the comment successfully.")
                    res.redirect("/home/" +req.params.id);
                }
            });
        }
    });
    
});

// Edit comment
router.get("/:comment_id/edit",midlleware.checkCommentOwner, function(req, res){
     Comment.findById(req.params.comment_id, function(err, comment) {
        if(err || !comment){
            req.flash("error","something went wrong");
            res.render("back");
        }else{
            res.render("comment/edit",{comment:comment,restaurant_id:req.params.id}); 
        }
    });
   
});
// Update comment
router.put("/:comment_id", midlleware.checkCommentOwner,function(req, res){
    
     Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,function(err, comment) {
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Updated successfully.");
            res.redirect("/home/"+req.params.id);
        }
    });
   
});
// Delete comment
router.delete("/:comment_id",midlleware.checkCommentOwner, function(req, res){
    
     Comment.findByIdAndRemove(req.params.comment_id,function(err, comment) {
        if(err){
            req.flash("error","something went wrong.");
            res.redirect("back");
        }else{
            req.flash("success","comment Deleted.");
            res.redirect("back");
        }
    });
   
});

module.exports = router;
