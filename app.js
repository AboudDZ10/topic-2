const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'supersecret', resave: false, saveUninitialized: true }));


const users = [
  { username: 'amine', password: '1234', isAdmin: false },
  { username: 'aboud',  password: '1234', isAdmin: false },
  { username: 'admin',  password: 'admin', isAdmin: true },
];


const path = require('path');


app.get("/", (req, res) => {
  res.render('login');
});

app.get('/login', (req, res) => {
  res.render('login');
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.send('Invalid credentials. <a href="/login">Try again</a>');
  }
    req.session.user = { 
        username: user.username,
    };

  res.cookie('Admin', user.isAdmin ? 'true' : 'false');
  res.redirect('/account');
});

app.get("/account", (req, res) => {
  if(!req.session.user) {
    return res.redirect('/login');
  }
   const username = req.session.user?.username;
   const isAdmin = req.cookies.Admin;
   res.render('account', { username, isAdmin });
});

app.get("/logout", (req, res) => {
  res.clearCookie("Admin")

  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err)
    }
    res.redirect("/login")
  })
})

app.get("/admin", (req, res) => {
  const isAdmin = req.cookies.Admin === "true"
  if (!isAdmin) {
    return res.status(403).send("Access denied. You are not admin.")
  }

  const success = req.query.success === "true"
  res.render("admin", { users: users, success: success })
})

app.post("/add-user", (req, res) => {
  const isAdmin = req.cookies.Admin === "true"
  if (!isAdmin) {
    return res.status(403).send("Access denied. You are not admin.")
  }

  const { username, password, userType } = req.body

  const existingUser = users.find((u) => u.username === username)
  if (existingUser) {
    return res.send('User already exists. <a href="/admin">Go back</a>')
  }

  const newUser = {
    username: username,
    password: password,
    isAdmin: userType === "admin",
  }

  users.push(newUser)
  console.log("User added:", newUser)
  console.log("Current users:", users)

  res.redirect("/admin?success=true")
  
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
