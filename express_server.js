const express = require("express");
const bodyParser = require("body-parser");
const crypto = require('crypto');
const app = express();
const PORT = 3000; // default port 3000

app.use(bodyParser.urlencoded({extended: true}));
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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase}
  res.render("urls_index", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


// POSTS
app.post("/urls", (req, res) => {
  let randomStr = genRandomString();
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect(`urls/${randomStr}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});