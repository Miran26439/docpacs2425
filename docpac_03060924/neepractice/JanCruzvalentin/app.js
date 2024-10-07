const express = require('express');
const app = express();

// configures express to use ejs 
app.set('view engine', 'ejs');

// creates http listen server w express
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// creates a get endpoint
app.get('/', (req, res) => {
    res.send('Welcome to my app');
});

// the other endpoint 
app.get('/endpoint', (req, res) => {
    let name = 'Guest'; 
    if (req.query.name) {
        name = req.query.name;
    }
    
    let Jan = "Hello, Jan!"; 
    
    res.render('hello', { name: Jan });
});

app.listen(PORT)