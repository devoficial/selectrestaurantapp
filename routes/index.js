var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Restaurant = require("../models/restaurant");
var nodemailer = require("nodemailer");
var request = require("request");
var async = require("async");
var crypto = require("crypto");
var midlleware = require("../middlewares");
var multer = require('multer');
var cloudinary = require('cloudinary');
var sgTransport = require('nodemailer-sendgrid-transport');
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


// ==========================
// Root route
// ==========================

router.get("/", function(req, res) {
  res.render("landing");
});
// show sign up from
router.get("/signup", function(req, res) {
  res.render("signup", { page: "signup" });
});


router.post("/signup", upload.single('avatar'), function(req, res) {
  const captcha = req.body["g-recaptcha-response"];
  if (!captcha) {
    console.log(req.body);
    req.flash("error", "Please select captcha");
    res.redirect("/signup");
  }
  else {
    // secret key
    var secretKey = process.env.SECRET_KEY;
    // Verify URL
    var verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;
    // Make request to Verify URL
    request.get(verifyURL, (err, response, body) => {
      if (err) return err;
      // if not successful
      if (body.success !== undefined && !body.success) {
        req.flash("error", "Captcha Failed");
        res.redirect("/signup");
      }
      else {
        cloudinary.uploader.upload(req.file.path, function(result) {
          // add cloudinary url for the image to the avatar object under image property
          req.body.avatar = result.secure_url;
          req.body.avatarId = result.public_id;

          var username = req.body.username;
          var email = req.body.email;
          var birthday = req.body.birthday;
          var firstName = req.body.firstName;
          var lastName = req.body.lastName;
          var newUser = new User({
            username: username,
            email: email,
            avatar: req.body.avatar,
            avatarId: req.body.avatarId,
            birthday: birthday,
            firstName: firstName,
            lastName: lastName
          });

          if (req.body.adminCode === "secretissecret") {
            newUser.isAdmin = true;
          }

          User.register(newUser, req.body.password, function(err, user) {
            if (err) {
              console.log(err.message);
              return res.render("signup", { error: err.message });
            }
            passport.authenticate("local")(req, res, function() {
              req.flash("success", "Welcome to selectrestaurant " + user.username);
              res.redirect("/home");
            });
          });
        });
      }
    });
  }
});



// show login form
router.get("/login", function(req, res) {
  res.render("login", { page: "login" });
});

// handling login 
router.post("/login", passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login",
  failureFlash: true,
  successFlash: 'Welcome to selectrestaurant  '
}), function(req, res) {});



// logout form
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out successfully!");
  res.redirect("/home");
});
// forgot router
router.get("/forgot", function(req, res) {
  res.render("forgot");
});
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (err) return err;
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      let options = {
        auth: {
          api_user: process.env.API_USER,
          api_key: process.env.API_KEY
        }
      }
      var mailOptions = {
        to: user.email,
        from: '"Techstudio DN" <debasisnath84@gmail.com>',
        subject: 'Your Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      let client = nodemailer.createTransport(sgTransport(options));
      client.sendMail(mailOptions, (error, info) => {
        console.log('mail sent');
        console.log('Message %s sent: %s', info.messageId, info.response);
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(error, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});
// reset route
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (err) return err;
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');

    }
    res.render('reset', { token: req.params.token });
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (err) return err;
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
        }
        if (req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            if (err) return err;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              if (err) return err;
              req.logIn(user, function(err) {
                if (err) return err;
                done(err, user);
              });
            });
          });
        }
        else {
          req.flash("error", "Passwords do not match.");
          return res.redirect('back');
        }
      });
    },
    function(user, done) {
      let options = {
        auth: {
          api_user: process.env.API_USER,
          api_key: process.env.API_KEY
        }
      }
      var mailOptions = {
        to: user.email,
        from: 'debasisnath84@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      let client = nodemailer.createTransport(sgTransport(options));

      client.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    if (err) return err;
    res.redirect('/home');
  });
});
// users profile
router.get("/users/:id", midlleware.isLoggedIn, function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      req.flash("err", "User can not be found.");
      res.redirect("/home");
    }
    Restaurant.find().where("user.id").equals(foundUser.id).exec(function(err, restaurant) {
      if (err) {
        req.flash("err", "User can not be found.");
        res.redirect("/home");
      }
      else {
        res.render("user/profile", { user: foundUser, restaurants: restaurant });
      }
    });


  });
});
// update user html loader
router.get("/users/:id/update", midlleware.isLoggedIn, function(req, res) {
  User.findById(req.params.id, function(err, user) {
    if (err) return err;
    res.render("user/updateuser", { user: user, page: "updateuser" });
  });

});
router.put("/users/:id", midlleware.isLoggedIn, upload.single('avatar'), function(req, res) {
  User.findById(req.params.id, async function(err, user) {
    console.log(user);
    if (err) return err;
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(user.avatarId);
        var result = await cloudinary.uploader.upload(req.file.path);
        user.avatar = result.secure_url;
        user.avatarId = result.public_id;

      }
      catch (err) {
        if (err) {
          console.log(err);
          req.flash("error", err.message);
          res.redirect("back");
        }
      }

    }

    user.save();
    console.log(user);
    req.flash("success", "Your profile pic has been updated");
    res.redirect("/users/" + user.id);
  });

});

module.exports = router;
