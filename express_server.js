const express = require("express");
const crypto = require('crypto');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 3000; // default port 3000

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const genRandomString = () => {
  return randomString = crypto.randomBytes(3).toString('hex');
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// GETS
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Page to create new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

// Show table of URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  }
  res.render("urls_index", templateVars);
})

// Show info on URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Show URLs in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// POSTS
// Create & add new URL to DB
app.post("/urls", (req, res) => {
  let randomStr = genRandomString();
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect(`urls/${randomStr}`);
});

// Delete URL from DB
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("../../urls");
});

// Update URL in DB
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect("../../urls")
});

// Login
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect("urls")
})

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});