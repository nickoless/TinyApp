const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8080; //default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString(str) {
  let randomStr = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  for (let i = 0; i < 6; i++) {
    randomStr += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randomStr;
}

// ----------------------------------------

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    shortURL: "b2xVn2",
    userid: "userRandomID"
  }
  "9sm5xK": {
    longURL: "http://www.google.ca"
    shortURL: "9sm5xK"
    userid: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "a@a",
    password: "asd"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

// URLS

app.get("/urls", (req, res) => {
  res.render("urls_index", {
    urlDatabase: urlDatabase,
    users: req.cookies["user_id"]});
});

app.get("/urls/new", (req, res) => {
  let hasCookie = { 
    user: req.cookies.user_id }  
  if (req.cookies.user_id in users) { // hasCookie -------------------------
    res.render("urls_new", hasCookie);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL],
    users: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Add URL  to urlDatabase

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Edit URL

app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.params.id;
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[shortURL] };
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// Delete URL

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Cookies

app.post("login", (req, res) => {
  let name = req.body.users;
  res.cookie("user_id", name);
  res.redirect("/urls");
});

// Login

app.get("/login", (req, res) => {
  res.render("login_page");
});

app.post("/login", (req, res) => {
  function getUserByEmail(email) {
    for (let key in users) {
      const user = users[key];
      if (user.email === email) {
        return user;
      }
    }
  } 
  function passCheck(user, password) {
    return user.password === password;
  }
  const user = getUserByEmail(req.body.email);
  if (user && passCheck(user, req.body.password)) {
    res.cookie("user_id", user.id);
    res.redirect("/")
  } else {
    res.status(403);
    res.send("Incorrect password!");
  }

});

// Logout

app.post('/logout', (req, res) => {
  let value = req.body.users;
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Register

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  function UserExists(email) {
    for (let key in users) {
      const user = users[key];
      if (user.email === email) {
        return user;
      }
    }
    return false;
  }
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("Please enter a users and password.");
  } else if (UserExists(req.body.email)) {
    res.status(400);
    res.send("Email already exists in database");
  } else {
    let newUser = generateRandomString();
    users[newUser] = {
      id: newUser,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", newUser);
    res.redirect("/urls");
  }
});


// Other

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
