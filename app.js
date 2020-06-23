const express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
const bodyParser = require('body-parser');
var session = require('express-session');



app.use(express.static(__dirname + '/node_modules'));
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());
app.use(session({
    secret: "Shh, its a secret!",
    resave: true,
    saveUninitialized: true
}));
app.set('view engine','ejs');
app.set('views','./views');


// socket.emit('event', 'For single self user');
// socket.broadcast.emit('event', 'All except self');
// io.emit('event', 'Emits to all including self');
// socket.id // unique ID of current socket;
// ROOM
// socket.join('roomName');
// socket.broadcast.to('roomName').emit('event', 'All except self');

var users = [];

var numClients = 0;
    // Check Connection
    io.on('connection', function(socket){
        numClients++;
        io.emit('stats', { numClients: numClients });
        io.emit('users', users);

        socket.on('call', (data) => {
            console.log('Server Pinged : ' + data.name);
            console.log(data);
            console.log('--------------------');
            if(data.room == "all"){
                io.emit('call', data.name);
            }else{
                socket.to(data.room).emit('call', data.name);
            }

        });

        socket.on('regU', (data) => {
            var userre = data.name;
            var ssi = data.sid;
            var room = data.room;
            users = users.filter( ppl => ppl.name !== userre);
            var obj = {};
            obj.name = userre;
            obj.sid = ssi;
            obj.room = room;
            users.push(obj);
            socket.join(room);
            console.log('New Users Directory : ',users);
            io.emit('users', users);
            console.log('--------------------');
        });

        socket.on('test', (data) => {
            console.log(data.name, ' | Socket ID : ', data.sid);
        });

        socket.on('dis', (data) => {
            console.log(data.name, ' | Socket ID : ', data.sid);
            socket.to(data.room).emit('dis', data.name + "Left Room");
        });
// On disconnect
        socket.on('disconnect', function() {
            numClients--;
            io.emit('stats', { numClients: numClients });
            console.log('Connected clients:', numClients);
            console.log('Disconnected : ' + socket.id);
            users = users.filter( ppl => ppl.sid !== socket.id);
            console.log('After Disconnect : ', users);
            io.emit('users', users);
        });
    });
    




// // Send Recieve Socket
//     io.on('connection', function(socket){
//         console.log('Client connection received');         
//         socket.emit('sendToClient', { hello: 'world' });
//         socket.on('receivedFromClient', function (data) {
//             console.log(data);
//         });
//     });



app.get('/', (req,res) => {
        res.render('index');    
    });

app.get('/test', (req,res) => {
    res.render('test');    
});  

app.get('/api', (req,res) => {
    res.status(200).json({users, "Clients : " : numClients});    
}); 

app.get('/ping/:name/:id/:room', (req,res) => {
    var user = req.params.name;
    var sid = req.params.id;
    var room = req.params.room;
    var obj = {};
    obj.name = user;
    obj.sid = sid;
    obj.room = room;
    users.push(obj);
    console.log(users);
    res.render('ping', {users : users, logged : obj});    
    });    

http.listen(3000, () => {
    console.log('Server Up and Running');
})

    