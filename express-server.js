const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const PORT = process.env.PORT || 8080;
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["random_key"]
}));

// ----------------------------------------

function generateRandomString(str) {
  let randomStr = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {
    randomStr += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randomStr;
}

function getUserByEmail(email) {
  for (let key in users) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }
}

function hashPass(pass) {
  return bcrypt.hashSync(pass, 10);
}

function passCheck(user, password) {
  return bcrypt.compareSync(password, user.password);
}

// ----------------------------------------

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",

    shortURL: "b2xVn2",
    userid: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.ca",
    shortURL: "9sm5xK",
    userid: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "a@a",
    password: bcrypt.hashSync("asd", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "b@b",
    password: bcrypt.hashSync("123", 10)
  }
};

// ----------------------------------------

app.get("/", (req, res) => {
  if (req.session.user_id in users) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Index URL

app.get("/urls", (req, res) => {
  if (req.session.user_id in users) {
    let templateVars = {
      urlDatabase: urlDatabase,
      users: users,
      user: req.session.user_id,
      email: users[req.session.user_id].email
    };
    res.render("urls_index", templateVars);
  } else { 
    res.status(401);
    res.send("401: Please login");
   }   
});

// New URL

app.get("/urls/new", (req, res) => {
  if (req.session.user_id in users) {
    let templateVars = {
      urlDatabase: urlDatabase,
      users: users,
      user: req.session.user_id,
      email: users[req.session.user_id].email
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    shortURL: shortURL,
    userid: shortURL
  };
  res.redirect(`/urls/${shortURL}`);
});
    
// Redirect URL

app.get("/u/:id", (req, res) => {
  if (req.params.id in urlDatabase) {
    let longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send("404: This TinyApp URL does not exist");
  }
});

// Show URL
    
app.get("/urls/:id", (req, res) => {
  if (req.session.user_id in users) {
    let templateVars = {
      urlDatabase: urlDatabase,
      users: users,
      user: req.session.user_id,
      email: users[req.session.user_id].email,
      longURL: urlDatabase[req.params.id].longURL,
      shortURL: req.params.id
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(401);
    res.send("401: Please login");
  }
});

// Edit URL

app.post("/urls/:id/update", (req, res) => {
  let databaseID = urlDatabase[req.params.id].userid;
  let loggedIn = req.session.user_id;
  if (dataID === loggedIn) {
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("403: Permission denied");
  }
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL };
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// Delete URL

app.post('/urls/:id/delete', (req, res) => {
  let dataID = urlDatabase[req.params.id].userid;
  let loggedIn = req.session.user_id;
  if (dataID === loggedIn) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("403: Permission denied");
  }
});

// Login

app.post("login", (req, res) => {
  let name = req.body.users;
  req.session.user_id = name;
  // res.cookie("user_id", name);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login_page");
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (user && passCheck(user, req.body.password)) {
    req.session.user_id = user.id;
    res.redirect("/");
  } else {
    res.status(403);
    res.send("Incorrect password!");
  }
});

// Logout

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

// Register

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("Please enter a users and password.");
  } else if (getUserByEmail(req.body.email)) {
    res.status(400);
    res.send("Email already exists in database");
  } else {
    let newUser = generateRandomString();
    users[newUser] = {
      id: newUser,
      email: req.body.email,
      password: hashPass(req.body.password)
    };
    req.session.user_id = newUser;
    res.redirect("/urls");
  }
});

// ----------------------------------------

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
