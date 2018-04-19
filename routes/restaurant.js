var express = require("express");
var router = express.Router({ mergeParams: true });
var Restaurant = require("../models/restaurant");
var midlleware = require("../middlewares");
var NodeGeocoder = require('node-geocoder');
var User = require("../models/user");
var multer = require('multer');
var cloudinary = require('cloudinary');
// multer configuretion
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + "-" + file.originalname);
    }
});
var imageFilter = function(req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter });


cloudinary.config({
    cloud_name: 'selectrestaurant',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

// INDEX  route
// show all the restaurants

router.get("/", function(req, res) {
    var perPage = 6;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Restaurant.find({ name: regex }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, restaurant) {
            if (err) {
                console.log(err);

                return res.redirect("back");
            }
            Restaurant.count({ name: regex }).exec(function(err, count) {
                if (err && restaurant.length < 1) {
                    console.log(err);
                    req.query.search = "";
                    return res.redirect("back");
                }
                res.render("restaurant/index", {
                    restaurant: restaurant,
                    current: pageNumber,
                    pages: Math.ceil(count / perPage),
                    search: req.query.search
                });

            });
        });
    }
    else {
        // get all restaurant from DB
        Restaurant.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, restaurant) {
            if (err) {
                console.log(err);
                return res.redirect("back");
            }
            Restaurant.count().exec(function(err, count) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("restaurant/index", {
                        restaurant: restaurant,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        search: false
                    });
                }
            });
        });
    }
});



//CREATE route
// add new restaurant to DB
//CREATE - add new campground to DB
router.post("/", midlleware.isLoggedIn, upload.single('img'), function(req, res) {
    // get data from form and add to restaurant array
    geocoder.geocode(req.body.location, function(err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            res.redirect('back');
        }
        else {
            cloudinary.uploader.upload(req.file.path, function(result) {
                // add cloudinary url for the image to the restaurant object under image property
                req.body.img = result.secure_url;
                req.body.imgId = result.public_id;
                // add author to campground
                var user = {
                    id: req.user._id,
                    username: req.user.username
                };
                var name = req.body.name;
                var cost = req.body.cost;
                var description = req.sanitize(req.body.description);
                var lat = data[0].latitude;
                var lng = data[0].longitude;
                var location = data[0].formattedAddress;
                var newRestaurant = {
                    name: name,
                    cost: cost,
                    description: description,
                    img: req.body.img,
                    imgId: req.body.imgId,
                    user: user,
                    location: location,
                    lat: lat,
                    lng: lng
                };
                // Create a new campground and save to DB
                Restaurant.create(newRestaurant, function(err, data) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        //redirect back to campgrounds page
                        console.log(data);
                        res.redirect("/home");
                    }
                });

            })
        }
    });
});


//SHOW routes
// Shows more details about a restaurant

// SHOW - shows more info about one restaurant
router.get("/:id", function(req, res) {
    //find the restaurant with provided ID
    Restaurant.findById(req.params.id).populate("comments").exec(function(err, foundRestaurant) {
        if (err) {
            console.log(err);
        }
        else {
            //render show template with that restaurant

            res.render("restaurant/more", { theRestaurant: foundRestaurant });

        }

    });
});


// UPDATE Restaurant ROUTE
router.put("/:id", midlleware.checkRestaurantOwner, upload.single('img'), function(req, res) {
    geocoder.geocode(req.body.location, function(err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.lat = data[0].latitude;
        req.body.lng = data[0].longitude;
        req.body.location = data[0].formattedAddress;
        Restaurant.findById(req.params.id, async function(err, restaurant) {
            if (err) {

                req.flash('error', err.message);

                return res.redirect('back');
            }
            if (req.file) {
                try {
                    await cloudinary.uploader.destroy(restaurant.imgId);

                    var result = await cloudinary.uploader.upload(req.file.path);
                    restaurant.img = result.secure_url;
                    restaurant.imgId = result.public_id;
                }
                catch (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }

            }
            restaurant.location = req.body.location;
            restaurant.name = req.body.name;
            restaurant.cost = req.body.cost;
            restaurant.description = req.sanitize(req.body.description);
            restaurant.save();
            // console.log(restaurant);
            req.flash("success", "Successfully Updated!");
            res.redirect("/home/" + req.params.id);


        });

    });

});

// Delete route
router.delete("/:id", midlleware.checkRestaurantOwner, function(req, res) {
    Restaurant.findById(req.params.id, async function(err, data) {
        if (err) {
            console.log(err.message);
            req.flash("error", "Something went wrong.");
            return res.redirect("back");
        }
        try {
            await cloudinary.uploader.destroy(data.imgId);
            data.remove();
            req.flash("success", "Restaurant deleted successfully");
            res.redirect("/home");
        }
        catch (err) {
            req.flash("error", "Something went wrong.");
            res.redirect("back");
        }

    });
});
// function for fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports = router;
