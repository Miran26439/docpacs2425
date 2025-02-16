const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const session = require('express-session');
const sqlite3 = require('sqlite3');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const FBJS_URL = 'https://formbar.yorktechapps.com';
const THIS_URL = 'http://localhost:3000/login';
const API_KEY = 'bd4cf1e837768719675cf8bfa360a3e60348af7898a0b61d385a560323423204a9445d4d25bedc5ec4b34626b89598474e45152a9f4ce523d444b0887cf90ed4';
let Authetication = false

app.use(session({
    secret: 'ohnose!',
    resave: false,
    saveUninitialized: false
}));

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('we good bruh');
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        db.get('SELECT * FROM users WHERE fb_id = ?', [req.session.token.id], (err, row) => {
            if (err) {
                console.log(err.message);
            } else if (row) {
                next()
            } else {
                db.run('INSERT INTO users(fb_name,fb_id) VALUES (?,?)', [req.session.user, req.session.token.id], (err) => {
                    if (err) {
                        console.log(err.message);
                    }
                });
                next()

            }
        })

    }
    else res.redirect(`/login?redirectURL=${THIS_URL}`);
}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/eachposter/:id', (req, res) => {
    db.all('SELECT * FROM post JOIN users ON post.poster=users.uid WHERE post.poster = ?;', req.params.id, (error, row) => {
        if (error) {
            res.send(error);
        } else if (row) {
            console.log(row)
            console.log(req.params.id)   
            res.render('eachposter', { user: req.session.user, post: row, convo: req.params.id });    
        }
    })
});


app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        req.session.id = tokenData.id
        console.log(req.session.token.id)
        res.redirect('/conversations');
    } else {
        res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/conversations', isAuthenticated, (req, res) => {
    db.all('SELECT * FROM conversations', (error, row) => {
        if (error) {
            res.send(error);
        } else if (row) {
            res.render('conversations', { user: req.session.user, conversations: row });
        }
    })
});

app.get('/thread/:id', isAuthenticated, (req, res) => {
    console.log(req.params.id);

    db.all('SELECT * FROM post JOIN users ON post.poster=users.uid WHERE convo_id = ?;', req.params.id, (error, row) => {
        if (error) {
            res.send(error);
        } else if (row) {
            res.render('eachpost', { user: req.session.user, post: row, convo: req.params.id });
            console.log(req.params.id)
        }
    })
});

app.post('/conversations', isAuthenticated, (req, res) => {
    console.log(req.body.fname);
    if (req.body.fname) {
        db.run('INSERT INTO conversations(title) VALUES (?)', [req.body.fname], (err) => {
            if (err) {
                console.log(err.message);
            }
        });
        res.redirect('/conversations')
    }
});


app.post('/thread/:id', isAuthenticated, (req, res) => {
    if (req.body.threadId && req.body.message) {
        db.get('SELECT * FROM users WHERE fb_id =?;',req.session.token.id, (err,row) => {
            db.run('INSERT INTO post(poster,content,time,convo_id) VALUES (?,?,?,?)', [row.uid, req.body.message, req.body.dateTime, req.body.threadId], (err) => {
                if (err) {
                    console.log(err.message);
                }
            });
            res.redirect(`/thread/${req.body.threadId}`);
        })

    }
});


app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});


