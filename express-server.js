const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8080; //default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

function generateRandomString(str) {
  let randomStr = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  for (let i = 0; i < 6; i++) {
    randomStr += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randomStr;
}

const urlDatabase = {
   "b2xVn2": "http://lighthouselabs.ca",
   "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/", (req, res) => {
//   res.end("Hello!");
// });

// URLS

app.get("/urls", (req, res) => {
  res.render("urls_index", { urlDatabase:urlDatabase , username: req.cookies["username"]});
});

app.get("/urls/new", (req, res) => {
  let theCookie = { username : req.cookies["username"]
}
  res.render("urls_new", theCookie);
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let templateVars = { 
    shortURL: req.params.id, 
    longURL: urlDatabase[shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

    // Add URL  to urlDatabase

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`);
});

    // Edit URL

app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.params.id;
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[shortURL] };
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls");
});

    // Delete URL

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Cookies

app.post('/login', (req, res) => {
  let value = req.body.username
  res.cookie('username', value);
  res.redirect("/urls");
});

// Logout

app.post('/logout', (req, res) => {
  let value = req.body.username
  res.clearCookie("username")
  res.redirect("/urls");
});

// Add form information to users (database)

app.get("/register", (req, res) => {
  res.render("urls_register")
});

app.post("/register", (req, res) => {
  var newUser = generateRandomString();
  users[newUser] = {
    id: newUser,
    email: req.body.email,
    password: req.body.password
  }
  console.log(users)
  res.redirect("/urls")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}!`);
});


// redirecting 
// req.body.longURL