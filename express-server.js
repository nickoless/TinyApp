const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080; //default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
   "b2xVn2": "http://lighthouselabs.ca",
   "9sm5xK": "http://www.google.com"
};


// Create: GET

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  res.render("urls_index", { urlDatabase:urlDatabase });
});

// app.get("/urls/:id", (req,res) => {
//   let shortURL = req.params.id;
//   let templateVars = {
//     shortURL: shortURL, 
//     longURL: urlDatabase[shortURL]
//   };
//   res.render("urls_show", templateVars);
// });

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls/new", (req,res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Retrieve: POST

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.listen(PORT, () =>{
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(str) {
  let randomStr = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  for (let i = 0; i < 6; i++) {
    emptyStr += char.charAt(Math.floor(Math.random() * char.length));
  }
  return randomStr;
}

