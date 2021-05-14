const express = require("express");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const { genRandomString, addNewUser, authenticateUser, urlsForUsers, fetchUserByEmail } = require('./helpers');
const app = express();
const PORT = 3000; // default port 3000

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

// Users DB
const users = {};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// GETS
app.get("/", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  // if user is not logged in:
  if (!currentUser) {
    res.redirect("/login");
  } else {
    //if user is logged in: redirect to /urls
    res.redirect("/urls");
  }
});

// Page to register new user
app.get("/register", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  if (currentUser) {
    res.redirect('/urls');
  }
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
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  if (currentUser) {
    res.redirect('/urls');
  }
  const templateVars = {
    user: null,
  };
  res.render("login", templateVars);
});

// Page to create new URL
app.get("/urls/new", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  // if user is not logged in: redirects to the /login page
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
  //if user is not logged in: returns HTML with a relevant error message
  if (!currentUser) {
    res.status(401).send('<html><body><h1>Sorry, you need to <a href="/login">login</a> or <a href="/register">register</a></h1></body></html>');
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
  const shortURL = req.params.shortURL;
  const belongsToUser = urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId;
  //if a URL for the given ID does not exist:
  if (!urlDatabase[shortURL]) {
    res.status(404).send('<html><meta http-equiv=refresh content=5;URL=/urls /><body><h1>The requested URL does not exist. Redirecting..</h1></body></html>');
  }
  //if user is not logged in:
  if (!currentUser) {
    res.status(401).send('<html><meta http-equiv=refresh content=5;URL=/login /><body><h1>You need to login to access this Redirecting..</h1></body></html>');
  }
  //if user is logged it but does not own the URL with the given ID:
  if (!belongsToUser) {
    res.status(403).send(`<html><meta http-equiv=refresh content=5;URL=/urls /><body><h1>You don't own ${shortURL}. Redirecting..</h1></body></html>`);
  }
  const templateVars = {
    user: currentUser,
    shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // if URL for the given ID exists:
  if (longURL) {
    // Redirect to domain of URL
    res.redirect(longURL);
  } else {
    // returns HTML with a relevant error message
    res.status(404).send('<html><meta http-equiv=refresh content=5;URL=/urls /><body><h1>The requested URL does not exist. Redirecting..</h1></body></html>');
  }
  
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
  //if email or password are empty:
  if (!email || !password) {
    res.status(400).send('<html><meta http-equiv=refresh content=5;URL=/register /><body><h1>Please supply an email and a password.. redirecting</h1></body></html>');
  }
  if (!user) {
    //creates a new user
    const userId = addNewUser(name, email, password, users);
    //set the cookie
    req.session['user_id'] = userId;
    //redirects to /urls
    res.redirect("urls");
  } else {
    //if email already exists:
    res.status(403).send('<html><meta http-equiv=refresh content=5;URL=/register /><body><h1>Sorry, the user is already registered.. redirecting</h1></body></html>');
  }
});

// Create & add new URL to DB
app.post("/urls", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  //if user is logged in:
  if (currentUser) {
    //generates a short URL, saves it, and associates it with the user
    const randomStr = genRandomString();
    urlDatabase[randomStr] = {longURL: req.body.longURL, userID: userId};
    //redirects to /urls/:id, where :id matches the ID of the newly saved URL
    res.redirect(`urls/${randomStr}`);
  } else {
    // returns HTML with a relevant error message
    res.status(401).send('<html><body><h1>Sorry, you need to <a href="/login">login</a> or <a href="/register">register</a></h1></body></html>');
  }
});

// Delete URL from DB
app.delete("/urls/:shortURL", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  const shortURL = req.params.shortURL;
  const belongsToUser = urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId;
  //if user is not logged in:
  if (!currentUser) {
    //returns HTML with a relevant error message
    res.sendStatus(403);
  }
  // if user is logged it but does not own the URL for the given ID:
  if (!belongsToUser) {
    //returns HTML with a relevant error message
    res.status(403).send(`You don't own ${shortURL}`);
  }
  //deletes the URL
  delete urlDatabase[req.params.shortURL];
  //redirects to /urls
  res.redirect("../../urls");
});

// Update URL in DB
app.put("/urls/:shortURL", (req, res) => {
  const userId = req.session['user_id'];
  const currentUser = users[userId];
  const shortURL = req.params.shortURL;
  const belongsToUser = urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId;
  //if user is not logged in:
  if (!currentUser) {
    //returns HTML with a relevant error message
    res.sendStatus(403);
  }
  // if user is logged it but does not own the URL for the given ID:
  if (!belongsToUser) {
    res.status(403).send(`<html><meta http-equiv=refresh content=5;URL=/urls /><body><h1>You don't own ${shortURL}. Redirecting..</h1></body></html>`);
  }
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  //redirects to /urls
  res.redirect("../../urls");
});

// Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = authenticateUser(email, password, users);
  //if email and password params match an existing user:
  if (user) {
    //sets a cookie
    req.session['user_id'] = user.id;
    //redirects to /urls
    res.redirect('/urls');
  } else {
    // otherwise we send an error message
    res.status(401).send('<html><meta http-equiv=refresh content=5;URL=/login /></html>Invalid credentials!, redirecting back to login');
  }
});

// Logout
app.post("/logout", (req, res) => {
  //deletes cookie
  req.session = null;
  //redirects to /urls
  res.redirect("urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});