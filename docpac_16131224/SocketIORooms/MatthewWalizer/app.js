const express = require('express');
const jwt = require('jsonwebtoken')
const session = require('express-session');
const socketIo = require('socket.io');

const app = express();
const port = 3000;

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
const io = socketIo(server);

const FBJS_URL = 'https://formbar.yorktechapps.com'
var THIS_URL = ''

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else {
        THIS_URL = 'http://' + req.headers.host + req.url + 'login'
        res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`)
    }
}

function checkRoomsList(socket) {
    var roomsList = []

    Array.from(socket.rooms).forEach(room => roomsList.push(room));

    for (room in roomsList) {
        if (roomsList[room] == socket.id) {
            roomsList.splice(room, 1);
        }
    }
    return roomsList;
}

app.set('view engine', 'ejs');

app.use(express.static('public'))

const sessionRooms = session({
    secret: 'SocketRooms',
    resave: false,
    saveUninitialized: false
});

app.use(sessionRooms);

app.get('/', isAuthenticated, (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        console.log(tokenData)
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        req.session.userid = tokenData.id;



        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionRooms));

io.use((socket, next) => {
    let session = socket.request.session;
    if (session.user) {
        next();
    } else {
        next(new Error('unauthorized'));
    }
});

io.on('connection', (socket) => {
    socket.join('general');
    socket.request.session.selectedRoom = 'general';
    socket.emit('roomsList', { roomsList: checkRoomsList(socket), selectedRoom: socket.request.session.selectedRoom });
    socket.emit('message', { roomName: 'general', content: 'Welcome to the chat room! Use /help for a list of commands' });
    socket.on('message', (message) => {
        if (message.selectedRoom) {
            socket.request.session.selectedRoom = message.selectedRoom;
            socket.emit('roomsList', { roomsList: checkRoomsList(socket), selectedRoom: socket.request.session.selectedRoom });
        } else {
            if (message.content.startsWith('/')) {
                // grabs the message and splits it into command and arguments
                let content = message.content
                let command = content.split(' ')[0].substring(1);
                let args = content.split(' ').slice(1);
                // compares the command to known commands
                switch (command) {
                    case 'join':
                        if (args.length === 0) {
                            socket.emit('message', { roomName: 'general', content: 'No arguments provided for the command' });
                            return;
                        }

                        // Filters the `args` array to remove duplicate elements and assigns the result to `joinargs`.
                        let joinargs = args.filter((arg, index) => args.indexOf(arg) === index);
                        joinargs.forEach(arg => {
                            socket.join(arg);
                            socket.emit('roomsList', { roomsList: checkRoomsList(socket), selectedRoom: socket.request.session.selectedRoom });
                            socket.to(arg).emit('message', { roomName: arg, content: `${socket.request.session.user} has joined the room` });
                        });
                        let joinedRooms = joinargs.join(', ');
                            socket.emit('message', { roomName: 'general', content: `You have joined: ${joinedRooms}` });
                        break;
                    case 'leave':
                        if (args.length === 0) {
                            socket.emit('message', { roomName: 'general', content: 'No arguments provided for the command' });
                            return;
                        }
                        // Filters the `args` array to remove duplicate elements and assigns the result to `leaveargs`.
                        let leaveargs = args.filter((arg, index) => args.indexOf(arg) === index);
                        leaveargs.forEach(arg => {
                            if (arg === 'general') {
                                socket.emit('message', { roomName: 'general', content: 'There\'s no escape' });
                                leaveargs.splice(leaveargs.indexOf(arg), 1);
                            } else {
                                socket.leave(arg);
                                socket.emit('roomsList', { roomsList: checkRoomsList(socket), selectedRoom: socket.request.session.selectedRoom });
                                socket.to(arg).emit('message', { roomName: arg, content: `${socket.request.session.user} has left the room` });
                            }
                        });
                        if (leaveargs.length != 0) {
                            let leftRooms = leaveargs.join(', ');
                            socket.emit('message', { roomName: 'general', content: `You have left: ${leftRooms}` });
                        }
                        break;
                    case 'users':
                        let users = [];
                        let room = args[0] || socket.request.session.selectedRoom;
                        let clients = io.sockets.adapter.rooms.get(room);
                        if (clients) {
                            clients.forEach(clientId => {
                                let clientSocket = io.sockets.sockets.get(clientId);
                                if (clientSocket) {
                                    users.push(clientSocket.request.session.user);
                                }
                            });
                        }
                        socket.emit('message', { roomName: args[0], content: `Users in ${socket.request.session.selectedRoom}: ${users.join(', ')}` });
                        break;
                    case 'rooms':
                        let rooms = [];
                        io.sockets.adapter.rooms.forEach((_, room) => {
                            let isSocketId = false;
                            io.sockets.sockets.forEach((_, socketId) => {
                                if (room === socketId) {
                                    isSocketId = true;
                                }
                            });
                            if (!isSocketId) {
                                rooms.push(room);
                            }
                        });
                        socket.emit('message', { roomName: 'general', content: `Rooms: ${rooms.join(', ')}` });
                        break;
                    case 'help':
                        if (args.length === 0) {
                            socket.emit('message', { roomName: 'general', content: 'Available commands: /join, /leave, /users, /rooms, /help. Use /help <command> for more information' });
                        } else {
                            switch (args[0]) {
                                case 'join':
                                    socket.emit('message', { roomName: 'general', content: 'Join the room(s). Usage: /join <room> or /join <room1> <room2>...' });
                                    break;
                                case 'leave':
                                    socket.emit('message', { roomName: 'general', content: 'Leave the room(s). Usage: /leave <room> or /leave <room1> <room2>...' });
                                    break;
                                case 'users':
                                    socket.emit('message', { roomName: 'general', content: 'List users in the room the user is in. Usage: /users' });
                                    break;
                                case 'rooms':
                                    socket.emit('message', { roomName: 'general', content: 'List all active rooms. Usage: /rooms' });
                                    break;
                                case 'help':
                                    socket.emit('message', { roomName: 'general', content: 'Get information of all commands or information on a specific command. Usage: /help <command>' });
                                    break;
                                default:
                                    socket.emit('message', { roomName: 'general', content: 'Unknown command' });
                                    break;
                            }
                        }
                        break;
                    default:
                        socket.emit('message', { roomName: 'general', content: 'Unknown command' });
                        break;
                }
            } else {
                io.to(message.receivingRoom).emit('message', { sender: socket.request.session.user, date: message.currentTime, roomName: message.receivingRoom, content: message.content });
            }
        }
    });
})
