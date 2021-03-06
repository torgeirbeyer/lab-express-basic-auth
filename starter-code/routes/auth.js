const express = require("express");
const router = express.Router();
const User = require("../models/user").User;

const bcrypt = require("bcrypt");
const bcryptSalt = 10;

//  LOGIN
router.get("/login", (req, res, next) => {
  if (req.session.currentUser) {
    res.redirect("/auth/private");
    return;
  }
  // @todo if req.session.currentUser redirect to private
  res.render("auth/login", { title: "login" });
});

router.post("/login", (req, res, next) => {
  // @todo if req.session.currentUser redirect to private
  if (req.session.currentUser) {
    res.redirect("/auth/private");
    return;
  }

  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Indicate a username and a password to sign up"
    });
    return;
  }

  User.findOne({ username: username }, (err, user) => {
    if (err || !user) {
      res.render("auth/login", { errorMessage: "The username doesn't exist" });
      return;
    }
    if (bcrypt.compareSync(password, user.password)) {
      // Save the login in the session!
      req.session.currentUser = user;
      res.redirect("/");
    } else {
      res.render("auth/login", { errorMessage: "Incorrect password" });
    }
  });
});

// SIGN UP

router.get("/signup", (req, res, next) => {
  // @todo if req.session.currentUser redirect to private
  if (req.session.currentUser) {
    res.redirect("/auth/private");
    return;
  }
  res.render("auth/signup", { title: "signup" });
});

router.post("/signup", (req, res, next) => {
  // @todo if req.session.currentUser redirect to private
  if (req.session.currentUser) {
    res.redirect("/auth/private");
    return;
  }

  const username = req.body.username;
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  const newUser = User({
    username,
    password: hashPass
  });

  if (username === "" || password === "") {
    res.render("auth/signup", {
      errorMessage: "Please type in your username and password"
    });
    return;
  }

  User.findOne({ username: username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", {
        errorMessage: "Username already exists"
      });
      return;
    }
    newUser.save(err => {
      req.session.currentUser = newUser;
      res.redirect("/");
    });
  });

  // @todo verify if User.findOne with that username
  // if exists re render signup with error "already exists"
});

// PROTECTED PAGES

router.get("/main", (req, res, next) => {
  if (req.session.currentUser) {
    res.render("auth/main", { title: "main page" });
  } else {
    res.redirect("/auth/login");
  }
});

router.get("/private", (req, res, next) => {
  if (req.session.currentUser) {
    res.render("auth/private", { title: "private page" });
  } else {
    res.redirect("/auth/login");
  }
});

router.get("/logout", (req, res, next) => {
  req.session.destroy(err => {
    res.redirect("/");
  });
});

module.exports = router;
