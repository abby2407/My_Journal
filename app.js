
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";

const app = express();

mongoose.connect("mongodb+srv://dbUser:dbUser@cluster0-krfp2.mongodb.net/blogPostDB", { useUnifiedTopology: true, useNewUrlParser: true }, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to database");
  }
});


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const postSchema = {
  title: String,
  content: String,
};

const registerUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"],
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: [true, "can't be blank"],
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateofbirth: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  }
});

const secretKey = "thisisasampleencryptioncode.";
registerUserSchema.plugin(encrypt, { secret: secretKey, encryptedFields: ["password"] });

const RegisterUser = mongoose.model("Register", registerUserSchema);

const Post = mongoose.model("Post", postSchema);

app.get("/", function (req, res) {
    res.render("index");
  });

app.get("/home", function(req, res) {
  Post.find({}, function (err, posts) {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
    });
  });
})

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  RegisterUser.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.redirect("/home");
        }
      }
    }
  });
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const newUser = new RegisterUser({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    dateofbirth: req.body.dateOfBirth,
    phoneNumber: req.body.phNumber
  });
  newUser.save(function (err) {
    if (!err) {
      res.redirect("home");
    }
  });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("home");
    }
  });
});

app.get("/posts/:postName", function (req, res) {
  const requestedTitle = _.lowerCase(req.params.postName);
  Post.findOne({ title: requestedTitle }, function (err, post) {
    res.render("post", { title: post.title, content: post.content });
  });
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started Succesfully");
});
