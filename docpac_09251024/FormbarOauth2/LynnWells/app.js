const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const session = require('express-session');
const FBJS_URL = 'http://172.16.3.100:420';
const THIS_URL = 'http://localhost:3000/login';
const API_KEY = 'dab43ffb0ad71caa01a8c758bddb8c1e9b9682f6a987b9c2a9040641c415cb92c62bb18a7769e8509cb823f1921463122ad9851c5ff313dc24d929892c86f86a';

// I LOVE SODA!!!!
const db = new sqlite3.Database('data/database.db', (err) => {
	if (err) {
		console.log(err)
	} else {
		console.log('it worky');
	};
});

// Bocchi the Crock
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(session({
	secret: 'kronk!',
	resave: false,
	saveUninitialized: false
}));

// John Bocchi
function isAuthenticated(req, res, next) {
	if (req.session.user) next();
	else res.redirect(`/login?redirectURL=${THIS_URL}`);
};

// This was really over complicated teehee
app.get('/', (req, res) => {
	res.render('index', { user: req.session.user });
});

// SO- no, no full soda for you
app.get('/login', (req, res) => {
	console.log(req.query.token);
	if (req.query.token) {
		let tokenData = jwt.decode(req.query.token);
		req.session.token = tokenData;
		req.session.user = tokenData.username;
		db.get("SELECT * FROM users WHERE fb_id = ?", [tokenData.id], (err, row) => {
			if (err) { console.log(err); res.render('error'); return; }
			if (!row) {
				db.run("INSERT INTO users (fb_id, fb_name, profile_checked) VALUES(?,?,?)", [tokenData.id, tokenData.username, 0], (err) => {
					if (err) res.render('error');
					res.redirect('/');
				});
			} else {
				res.redirect('/');
			}
		});
	} else {
		res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`);
	};
});

//THEY BUFFED RAM TO THE MOON, WE'RE SO BACK

app.get('/profile', isAuthenticated, (req, res) => {
	db.get("SELECT * FROM users WHERE fb_id = ?", [req.session.token.id], (err, user) => {
		if (err) {
			res.send("An error occurred.");
		} else {
			res.render('profile', { user: user });
		}
	});
});

//YOUR NAME IS TROBY BOY
app.post('/profile', isAuthenticated, (req, res) => {
	if (req.body.checkbox){
		db.run("UPDATE users SET profile_checked = ? WHERE fb_id = ?;", [String(req.body.checkbox), req.session.token.id], (err) => {
			res.redirect('/profile');
		});
	} else{
		db.run("UPDATE users SET profile_checked = ? WHERE fb_id = ?;", [String(req.body.checkbox), req.session.token.id], (err) => {
			res.redirect('/profile');
		});
	}
	
});

// THEY'RE IN THE WALLS
app.listen(3000);

// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓███████████▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████▓▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▒▒▒░░░░░░▒▒▒▒▒▓▓▓▒▓▓▓▓▓▓████████▓▓█▓▓▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▒▒▒▒▒▒▒▒▒▒▒▓██▓▓▒▒▓▒▒▒▒▒░░░░░░░░░░░░▒▒▒▒▒▒▒▒▓▓▓████████████▓▓██▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ▒▒▒▒▒▒▒▒▓██▓▒▒▓▓▓▒▒▒▒▒▒▒░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▓██████████████▒▒▓█▓▓▓▓▓▓▓▓▓▓▓
// ▒▒▒▒▒▒▓█▓▓▒▒▓▓▓▒▒▒░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓██████████████████▒▒▒▓█▓▓▓▓▓▓▓▓
// ▒▒▒▒▓▓▓▓░▒▓▓▒▒▒░░░░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▓▓██████▓▒░▒▒▓▓██████▒▒▒▒▓█▓▓▓▓▓
// ▒▒▒▓▓▓▒▒▒░░░░░░░░░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓███████████▓░████▒▒▒▓███▒▒▒▒▓█▓▓▓
// ▒▓▓▓▓▒▒░░▒░░░░░░░░░░░░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓███████████▓▒▒▒▓▒▒▓▓▓▒▓▓▒▒▒▒▒██▓
// ▓▓▓▒▒▒▒░░░░░░░░░░░░░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████████▒░▒▒▓▓▓▓▓▓▓▓▓░▒▒▒▒▒█
// █▓▒▒▒▒░░░░░░░░░░░░░░░▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████▒░▒▓▓▓▓▓▓▓▓▓▓▒░▒▒▒▒
// ▒▒▒▒▒░░░░░░░░░░░░░░░▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█████▒▒▒▓▓▓▓▓▓▓▒▒▒▒░░▒▒
// ▒▒▒▒░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▒▒▒▒▓▓▓▒▓▒▒▒▒░░░░
// ▒▒▒░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▒▒▒▓▒▒▒▒▒▒▒▒▒░░░
// ▒▒▒░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░▒▒▒▒▒▒▒▒▒▒░░░
// ▒▒▒░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░▒▒▒▒▒▒▒▒▒░▒
// ▒▒▒▒▒░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▒░░▒▒▒▒▒░▒▒
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▓▒░░░▒▓▒
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓████████▓
// ▒▒▒▒▒░░▒░░▒▒░▒▒▒▒░▒░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓██████▓
// ▒▒▒▒░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓███▒
// ▒▒▒▒▒░░░░░░░░░▒░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒
// ░▒▒▒░░░░░░░░░░░░░▒░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
// ░▒▒░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
// ░░░░▒░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▒▓▓
// ░░░░▒░░░░░░░░░░░░░░░░░░░░░░░▒▒░▒░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▒▒▓▓▓
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▒▓▓▒▓▒
// ░░░░░▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▒▒▒▒▓▓
// ░░░░░░▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▒▒▒▒▒▒▓▓▓
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▒▒▓
// ▓▓▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
// ▒▓▓▓▓▓▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▒▒▒▒▒▒▒
// ▒▓▓▓▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░▒▒▓████████▒▒▒▒
// ░░▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒░░░▒░░▒▒▒▒▒▒▓▓▓████████▓▒
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒░▒░░░░▒▒▒▒▒▓▓██████████
// ░░░▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒░░░░▒▒▒▓▓▓▓▓▓▓███████
// ░░░▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒░░▒▒░▒▓█▓▓▓▓▓▓▓▓▓▓▓