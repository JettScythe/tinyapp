const express = require("express");
const crypto = require('crypto');
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000; // default port 3000

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const genRandomString = () => {
  const randomString = crypto.randomBytes(3).toString('hex');
  return randomString;
};

const users = {};

const urlsForUsers = (id) => {
  const userURLS = {};
  for (const user_id in urlDatabase) {
    if (urlDatabase[user_id].userID === id) {
      userURLS[user_id] = urlDatabase[user_id];
    }
  }
  return userURLS;
};


const fetchUser = (userID) => {
  for (const user_id in users) {
    if (userID === user_id) {
      const user = users[user_id];
      return user;
    }
  }
  return undefined;
};


const emailLookup = () => {
  const emailArr = [];
  for (const user_id in users) {
    emailArr.push(users[user_id].email);
  }
  return emailArr;
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// GETS
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Page to register new user
app.get("/register", (req, res) => {
  const templateVars = {
    user: fetchUser(req.cookies["user_id"])
  };
  res.render("user_reg", templateVars);
});

// Page to login
app.get("/login", (req, res) => {
  const templateVars = {
    user: fetchUser(req.cookies["user_id"])
  };
  res.render("login", templateVars);
});

// Page to create new URL
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: fetchUser(req.cookies["user_id"]),
    };
    res.render("urls_new", templateVars);
  }
});



// Show table of URLs
app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    console.log(fetchUser(req.cookies["user_id"]));
    console.log(urlsForUsers(req.cookies["user_id"]));
    const templateVars = {
      user: fetchUser(req.cookies["user_id"]),
      urls: urlsForUsers(req.cookies["user_id"])
    };
    res.render("urls_index", templateVars);
  }
});

// Show info on URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: fetchUser(req.cookies["user_id"]),
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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// POSTS
// Register new users to DB
app.post("/register", (req, res) => {
  const emailArr = emailLookup();
  const randID = genRandomString();
  if (!req.body.email || !req.body.password) {
    return res.sendStatus(400);
  }
  for (let email of emailArr) {
    if (email === req.body.email) {
      return res.sendStatus(400);
    }
  }
  users[randID] = {id: randID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10)};
  res.cookie('email', users[randID].email);
  res.cookie("user_id", users[randID].id);
  console.log(users);
  res.redirect("urls");
});

// Create & add new URL to DB
app.post("/urls", (req, res) => {
  const randomStr = genRandomString();
  urlDatabase[randomStr] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  res.redirect(`urls/${randomStr}`);
});

// Delete URL from DB
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!fetchUser(req.cookies["user_id"])) {
    res.sendStatus(403);
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("../../urls");
});

// Update URL in DB
app.post("/urls/:shortURL", (req, res) => {
  if (!fetchUser(req.cookies["user_id"])) {
    res.sendStatus(403);
  }
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("../../urls");
});

// Login
app.post("/login", (req, res) => {
  if (fetchUser(req.body.email)) {
    if (req.body.password === users[fetchUser(req.body.email)].password) {
      return res.sendStatus(403);
    }
  } else {
    res.cookie("user_id", users[user_id].id);
    res.cookie("email", req.body.email);
    res.redirect("urls");
  }
});
  

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.clearCookie("email");
  res.redirect("urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});