# SelectRestaurant
+
## Initial Setup
+ * Add Landing Page
+ * Add Home Page that lists all restaurants
+
# Each Restaurant has:
+   * Name
+   * Image
+   * Cost per two person
+   * location
+   * Description
+
## Layout and Basic Styling
+  * Create our header and footer partials
+  * Add in Bootstrap
+  * Add in semantic ui for icons
+
## Creating New Restaurant
+ * Setup new rseaturant POST route
+ * Add in body-parser
+ * Setup a button to show modal
+ * Add basic modal from bootsrap
+
## Style the restaurants page
+ * Add a better header/title
+ * Make restaurants display in a grid
+
## Style the Navbar and Form
+ * Add a navbar to all templates
+ * Style the new restaurant form
+
## Add Mongoose
+ * Install and configure Mongoose
+ * Setup resaturant model
+ * Use restaurant model inside of our routes
+
## Show Page
+ * Review the RESTful routes 
+ * Show db.collection.drop()
+ * Add a show route/template
+
## Refactor Mongoose Code
+ * Create a models directory
+ * Use module.exports
+ * Require everything correctly!
+

## Add the Comment model!
+ * Make our errors go away!
+ * Display comments on restaurant show page
+
## Comment New/Create
+ * Discuss nested routes
+ * Add the comment new and create routes
+ * Add the new button
+ * add a basic bootsrap modal
+
## Style Show Page
+ * Add sidebar to show page
+ * Display comments nicely
+ * use google map api and show the location on first column
+
## Finish Styling Show Page
+ * Add public directory
+ * Add custom stylesheet
+
## Auth Pt. 1 - Add User Model
+ * Install all packages needed for auth
+ * Define User model 
+
## Auth Pt. 2 - signup
+ * Configure Passport
+ * Add signup routes
+ * Add signup template
+
## Auth Pt. 3 - Login
+ * Add login routes
+ * Add login template
+
## Auth Pt. 4 - Logout/Navbar
+ * Add logout route
+ * Prevent user from adding a comment if not signed in
+ * Add links to navbar
+
## Auth Pt. 5 - forgot
+ * Add forgot route
+ * Use nodemailer and sendgrid to get password tokens 
+ * add a forgot.ejs in views directory with one email input
+ * when a user forgot his password
+ * Add links to navbar

## Auth Pt. 6 - reset/:token
+ * Add reset route
+ * Use nodemailer and sendgrid to get password tokens via email 
+ * add a reset.ejs in views directory
+ * add a basic form from bootsrap with newpassword and confirm password field
+ * now use nodemailer and sendgrid to send another mail after user submit the new
+ * pasword with confirmation email
+ * Add links to navbar

## Auth Pt. 7 - Show/Hide Links
+ * Show/hide auth links in navbar 
+
## Create and show user profile - 
+ * create a route /users
+ * add button in navbar where you put the link /users
+ * create a directory user and inside that add a file profile.ejs
+ * show user's avatar and name and restaurants that he/she submitted
+ * use cloudinary api to upload images both for restaurant and users
## Change the user model
```javascript
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
```
+
## Refactor The Routes
+ * Use Express router to reoragnize all routes
+
## Users + Comments
+ * Associate users and comments
+ * Save user's name to a comment automatically
+
## Users + Restaurants
+ * Prevent an unauthenticated user from creating a campground
+ * Save username+id to newly created Restaurant
+
## Create and Show  a contact page 
+ * create a route /contact
+ * add link in navbar name it contact
+ * create a directory contact and inside that add a file contactme.ejs
+ * add a form with inputs name, email, and message
+ * user the same email method to get emails from users

+ * Add "back" redirect to login
+ * Add method-override
# BOOTSTRAP NAV COLLPASE JS
+ * Flash Messages
+ * Refactor container div to header
+ * Show/hide delete and update buttons
+ * style login/register forms
+ * Random Background Landing Page
+ * Refactor middleware
+ * change styling in show template - comment delete/update
## UPATE/DELETE Restaurant
+
+ * BOOTSTRAP NAV COLLPASE JS
+ * Flash Messages
+ * add container div to header
+ * Show/hide delete and update buttons
+ * style login/register forms
+ * Random Background Landing Page
+ * Refactor middleware
+ * change styling in show template - comment delete/update
+ * UPDATE/DELETE Restaurant
+
+
+
+
## RESTFUL ROUTES
+
+ name      url      verb    desc.
+ ===============================================
+ INDEX   /dogs      GET   Display a list of all dogs
+ NEW     /dogs/new  GET   Displays form to make a new dog
+ CREATE  /dogs      POST  Add new dog to DB
+ SHOW    /dogs/:id  GET   Shows info about one dog
+
+ INDEX   /
+ NEW     /home/new
+ CREATE  /
+ SHOW    /home/:id
+
+ NEW     /home/:id/comment/new    GET
+ CREATE  /home/:id/comment      POST

+ CONTACT    /contact         GET
+ FORGOT     /forgot          GET
+ RESET      /reset/:token    POST
