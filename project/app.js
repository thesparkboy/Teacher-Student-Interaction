var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/users");

const fileUpload = require('express-fileupload');

mongoose.connect("mongodb://localhost/auth_univapp");

app.use(require("express-session")({
    secret: "Magic",
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(__dirname + "/public"));
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(fileUpload());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

var assignmentSchema = new mongoose.Schema({
    title: String,
    teacher: String,
    body: String,
    submissionDate: String
});
var Assignment = mongoose.model("Assignment", assignmentSchema);

var noticeSchema = new mongoose.Schema({
    title: String,
    body: String,
    submissionDate: String
});
var Notices = mongoose.model("Notices", assignmentSchema);

var marksSchema = new mongoose.Schema({
    path: String
});
var Marks = mongoose.model("Marks", marksSchema);

app.get("/", function(req, res) {
    /*if (isLoggedIn) {
        return res.redirect("/secret");
    }*/
    res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res) {
    res.render("secret");
});

app.post("/register", function(req, res) {
    req.body.username
    req.body.password
    User.register(new User({
        username: req.body.username
    }), req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/secret");
        });
    });
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req, res) {});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.get("/assignments", isLoggedIn, function(req, res) {
    Assignment.find({}, function(err, ass) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("assignments", {
                ass: ass
            });
        }
    });
});

app.get("/assignments/new", isLoggedIn, function(req, res) {
    res.render("new");
});

app.post("/assignments", isLoggedIn, function(req, res) {
    Assignment.create(req.body.ass, function(err, newAssignment) {
        if (err) {
            console.log(err)
        }
        else {
            res.redirect("/assignments");
        }
    });
});

app.get("/notices", isLoggedIn, function(req, res) {
    Notices.find({}, function(err, notices) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("notices", {
                notices: notices
            });
        }
    });
});

app.get("/notices/new", isLoggedIn, function(req, res) {
    res.render("newNotice");
});

app.post("/notices", isLoggedIn, function(req, res) {
    Notices.create(req.body.notices, function(err, newNotice) {
        if (err) {
            console.log(err)
        }
        else {
            res.redirect("/notices");
        }
    });
});

app.get('/marks',isLoggedIn,function(req, res) {
    Marks.find({}, function(err, Files) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("marks", {
                Files: Files
            });
        }
    });
});

app.post('/marks',isLoggedIn, function(req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
    req.files.sampleFile.mv("./public/data/" + req.files.sampleFile.name, function(err) {
        if (err)
            return res.status(500).send(err);
    var tempObj = {
        path: String
    }
    tempObj.path = "data/" + req.files.sampleFile.name;
        Marks.create(tempObj, function(err,sampleFile){
            if(err){
                console.log(err);
            }else{
                res.redirect("/marks");
            }
        });  
    });
});


app.get('/questions', isLoggedIn, function(req, res) {
    res.render("questions");
});

//===================

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(8080, process.env.IP, function() {
    console.log("server is starting at" + 8080);
});
