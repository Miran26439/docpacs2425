function index(req,res) {
    res.render('index.ejs');
}

function login(req, res) {
    res.send('Login Page')
}

function loginPost(req, res) {
    res.send('Login Page');
}

function logout(req, res) {
    res.send('Hello World!');
}

function chat(req, res) {
    res.send('Hello World!');
}

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

module.exports = {
    index,
    login,
    loginPost,
    logout,
    chat
}