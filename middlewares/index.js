var Restaurant =require("../models/restaurant");
var Comment = require("../models/comment");

// all the midlleware goes here

var midllewareObj = {};

midllewareObj.isLoggedIn = function(req, res, next){
                                if(req.isAuthenticated()){
                                         return next();
                                    }
                                    req.flash("error", "You need to login first.");
                                    res.redirect("/login");
                            };
midllewareObj.checkRestaurantOwner = function(req, res , next){
                                        if(req.isAuthenticated()){
                                            Restaurant.findById(req.params.id, function(err, foundRestaurant){
                                            if(err || !foundRestaurant){
                                                return res.status(400).send("restaurant not found.");
                                            }
                                            if(foundRestaurant.user.id.equals(req.user._id)||req.user.isAdmin){
                                                    return next();
                                                    }
                                                    req.flash("danger","You are not authorized to do that.");
                                                    res.redirect("back");
                                         
                                        });
        
                                    }else{
                                        req.flash("danger","You must login first.");
                                        res.redirect("back");
                                    }
   
                        };

midllewareObj.checkCommentOwner = function(req, res, next){
                                        if(req.isAuthenticated()){
                                            Comment.findById(req.params.comment_id,function(err, foundComment) {
                                        if(err || !foundComment){
                                            return res.status(400).send("Item not found.");
                                        }
                                        if(foundComment.user.id.equals(req.user._id) || req.user.isAdmin){
                                                    return next();
                                             }else{
                                                    req.flash("danger","You are not authorized.");
                                                    res.redirect("back");
                                        
                                        }
                                    });
                            }else{
                                req.flash("danger","You are not loggedin.");
                                res.redirect("back");
                            }
                        };



module.exports = midllewareObj;