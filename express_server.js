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

const users = {};


const fetchUser = (userID) => {
  for (const user_id in users) {
    if (userID === user_id) {
      const user = users[user_id];
      return user;
    }
  }
  return undefined;
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// GETS
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Page to register new user
app.get("/register", (req, res) => {
  const templateVars = {
    user: fetchUser(req.cookies["user_id"])
  }
  res.render("user_reg", templateVars);
})

// Page to create new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: fetchUser(req.cookies["user_id"]),
  }
  res.render("urls_new", templateVars);
});

// Show table of URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    user: fetchUser(req.cookies["user_id"]),
    urls: urlDatabase
  }
  res.render("urls_index", templateVars);
})

// Show info on URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

// Redirect to domain of URL
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
// Register new users to DB
app.post("/register", (req, res) => {
  const randID = genRandomString();
  users[randID] = {id: randID, email: req.body.email, password: req.body.password}
  res.cookie("user_id", users[randID].id)
  console.log(users)
  res.redirect("urls");
})

// Create & add new URL to DB
app.post("/urls", (req, res) => {
  const randomStr = genRandomString();
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
  const user = fetchUser(req.cookies["user_id"])
  res.cookie("user_id", user.id);
  res.redirect("urls")
})

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});