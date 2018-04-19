require('dotenv').config();

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    expressSanitizer = require("express-sanitizer"),
    flash = require("connect-flash"),
    method = require("method-override"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    expressSession = require("express-session"),
    User = require("./models/user");

// Requiring routes
var commentRouter = require("./routes/comment"),
    indexRouter = require("./routes/index"),
    restaurantRouter = require("./routes/restaurant"),
    contactRouter = require("./routes/contact");



// Connecting to the courses database
// mongoose.connect("mongodb://localhost/restaurant_databse_final");
mongoose.connect("mongodb://debasis:imdev1996@ds247759.mlab.com:47759/selectrestaurant");


//Configuring the bodyParse and view engine
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(express.static(__dirname + "/public"));
app.use(method("_method"));
app.set("view engine", "ejs");
// Getting time with moment.js
app.locals.moment = require('moment');
// ===========================
// PASSPORT CONFIGURATION
// ===========================
app.use(expressSession({
    secret: "this is my secret message",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// This makes available all the loggedin user In all templates
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.danger = req.flash("danger");
    next();
});

// ====================
// routes  config
// ====================

app.use("/", indexRouter);
app.use("/contact", contactRouter);
app.use("/home", restaurantRouter);
app.use("/home/:id/comment", commentRouter);


// configuring server
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The app has started");
});
