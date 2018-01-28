const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8080; //default port 8080
const bcrypt = require('bcrypt');
// const hashedPassword = bcrypt.hashSync(password, 10);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
  return bcrypt.compareSync(password, user.password)
  console.log(user.password)
  console.log(password)
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

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

// URLS

    // Main URLS page

app.get("/urls", (req, res) => {
if (req.cookies.user_id in users) {
    res.render("urls_index", { 
    urlDatabase: urlDatabase,
    user: req.cookies.user_id
  });
} else {
  res.send('<script>alert("Please login to continue")</script>')
}
});

    // new URL

app.get("/urls/new", (req, res) => {
  let hasCookie = {
    user: req.cookies.user_id };
  if (req.cookies.user_id in users) {
    res.render("urls_new", hasCookie);
  } else {
    res.redirect("/login");
  }
});

        // Add URL to urlDatabase

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { 
    longURL: req.body.longURL,
    shortURL: shortURL,
    userid: shortURL
   };
   console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});
    
    // Short URL redirect

app.get("/visit/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id].longURL);
});

    // Show URL
    
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    longURL: urlDatabase[req.params.id].longURL,
    shortURL: req.params.id,
    user: urlDatabase["user_id"]
  }; 
  if (req.cookies.user_id in users) {
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
}); 

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


    // Edit URL

app.post("/urls/:id/update", (req, res) => {
  let databaseID = urlDatabase[req.params.id].userid
  let loggedIn = req.cookies.user_id;
  if (dataID === loggedIn) {
    res.redirect("/urls");
  } else {
    res.status(403)
    res.send("403: Permission denied")
  }    
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL };
    urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

    // Delete URL

app.post('/urls/:id/delete', (req, res) => {
  let dataID = urlDatabase[req.params.id].userid
  let loggedIn = req.cookies.user_id;
  if (dataID === loggedIn) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403)
    res.send("403: Permission denied")
  }  
});

// Login

app.post("login", (req, res) => {
  let name = req.body.users;
  res.cookie("user_id", name);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login_page");
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);
  if (user && passCheck(user, req.body.password)) {
    res.cookie("user_id", user.id);
    res.redirect("/");
  } else {
    res.status(403);
    res.send("Incorrect password!");
  }
  console.log(req.body.password)
  console.log(user)
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

    console.log(users)
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


//clear cookie = req session ... user id = null
// remove res clear cookie