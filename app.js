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


// صفحة تسجيل الدخول
const path = require('path');


app.get("/", (req, res) => {
  const isAdmin = req.cookies.Admin === 'false';
  res.render('login');
});

app.get('/login', (req, res) => {
  const isAdmin = req.cookies.Admin === 'false';
  res.render('login');
});


// معالجة تسجيل الدخول
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.send('Invalid credentials. <a href="/login">Try again</a>');
  }

  // ⚠️ هنا النقطة الحساسة — نرسل الكوكي بناء على isAdmin
  res.cookie('Admin', user.isAdmin ? 'true' : 'false');
  res.send(`
    <h3>Welcome, ${username}!</h3>
    <p>You are now logged in. <a href="/admin">Go to Admin Panel</a></p>
  `);
});


// صفحة لوحة الإدارة
app.get('/admin', (req, res) => {
  const isAdmin = req.cookies.Admin === 'true';

  if (!isAdmin) {
    return res.status(403).send('Access denied. You are not admin.');
  }

  res.send(`
    <h2>Admin Panel</h2>
    <p>Welcome, Admin!</p>
    <form method="POST" action="/delete-carlos">
      <button type="submit">Delete user carlos</button>
    </form>
  `);
});

// حذف المستخدم carlos (فقط للمظهر)
app.post('/delete-carlos', (req, res) => {
  res.send('<p>User carlos deleted ✅</p>');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
