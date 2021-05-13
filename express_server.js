const express = require("express");
const cookieSession = require('cookie-session');
const { genRandomString, addNewUser, authenticateUser, urlsForUsers, fetchUserByEmail } = require('./helpers');
const app = express();
const PORT = 3000; // default port 3000

app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const userParser = (req, res, next) => {
  const userId = req.session['user_id'];
  const user = users[userId];
  req.currentUser = user;
  next();
};

app.use(userParser);
app.set("view engine", "ejs");

const users = {};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// GETS
app.get("/", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  if (!currentUser) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

// Page to register new user
app.get("/register", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  const templateVars = {
    user: currentUser
  };
  res.render("user_reg", templateVars);
});

app.get('/users', (req, res) => {
  res.json(users);
});

// Page to login
app.get("/login", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("login", templateVars);
});

// Page to create new URL
app.get("/urls/new", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  if (!currentUser) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: currentUser,
    };
    res.render("urls_new", templateVars);
  }
});

// Show table of URLs
app.get("/urls", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  if (!currentUser) {
    res.status(403).send('<html><body><h1>Sorry, you need to <a href="/login">login</a> or <a href="/register">register</a></h1></body></html>');
  } else {
    const templateVars = {
      user: currentUser,
      urls: urlsForUsers(userId, urlDatabase)
    };
    res.render("urls_index", templateVars);
  }
});

// Show info on URL
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  const templateVars = {
    user: currentUser,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

// Redirect to domain of URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Show URLs in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POSTS
// Register new users to DB
app.post("/register", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const user = fetchUserByEmail(email, users);
  if (!user) {
    const userId = addNewUser(name, email, password, users);
    //set the cookie
    req.session['user_id'] = userId;
    res.redirect("urls");
  } else {
    res.status(403).send('<html><body><h1>Sorry, the user is already registered</h1></body></html>');
  }
});

// Create & add new URL to DB
app.post("/urls", (req, res) => {
  const userId = req.session['user_id'];
  const randomStr = genRandomString();
  urlDatabase[randomStr] = {longURL: req.body.longURL, userID: userId};
  res.redirect(`urls/${randomStr}`);
});

// Delete URL from DB
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  if (!currentUser) {
    res.sendStatus(403);
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("../../urls");
});

// Update URL in DB
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  if (!currentUser) {
    res.sendStatus(403);
  }
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("../../urls");
});

// Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, users);
  if (user) {
    req.session['user_id'] = user.id;
    res.redirect('/urls');
  } else {
    // otherwise we send an error message
    res.status(401).send('Wrong credentials!');
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});