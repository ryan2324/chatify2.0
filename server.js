const express = require('express');
const path = require('path');
const user = require('./routes/user');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const cookie = require('cookie-parser');
const logger = require('./middleware/logger');
const jwt = require('jsonwebtoken');
const contact = require('./routes/contact');
const db = require('./db');
const message = require('./routes/message');
const search = require('./routes/search-user');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT;
const server = app.listen(PORT, () =>{
    console.log(`listening on port: ${PORT}`)
})

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});
io.on('connection', (socket) =>{
    socket.on('verify-token',(data) =>{
        jwt.verify(data.user.split('=')[1], process.env.AUTH_TOKEN, (err, res) =>{
            if(res){
                socket.join(res.email);
            }
        })
    })
    socket.on('send', (data) =>{
        const token = jwt.verify(data.sender.split('=')[1], process.env.AUTH_TOKEN, (err, res) =>{
            return res;
        })
        if(token){
            const receivedData = {
                message: data.message,
                sender: {
                    user_id: token.userId,
                    email: token.email,
                    name: token.name
                },
                receiver: data.receiver,
            }
            socket.to(receivedData.receiver.email).emit('receive', receivedData);
        }
        
    })
})
app.use(cookie());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use('/public', express.static('public'));
app.use('/', user);
app.use('/contact', contact);
app.use('/send', message);
app.use('/search', search);

app.get('/', logger, (req, res) =>{
    res.sendFile(path.resolve(__dirname, './views/index.html'))
})
app.get('/signup', (req, res) =>{
    res.sendFile(path.resolve(__dirname, './views/signup.html'))
})
app.get('/login', (req, res) =>{
    res.sendFile(path.resolve(__dirname, './views/login.html'))
})
