const express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
const bodyParser = require('body-parser');



app.use(express.static(__dirname + '/node_modules'));
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());


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
            console.log('Server Pinged : ' + data);
            console.log(data);
            console.log('--------------------');
            io.emit('call', data);
        });

        socket.on('test', (data) => {
            console.log(data.name, ' | Socket ID : ', data.sid);
        });
 // On disconnect
        socket.on('disconnect', function() {
            numClients--;
            io.emit('stats', { numClients: numClients });
            console.log('Connected clients:', numClients);
            console.log('Disconnected : ' + socket.id);
            users = users.filter( ppl => users.sid !== socket.id);
            console.log('After Disconnect : ', users);
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

app.get('/ping/:name/:id', (req,res) => {
    var user = req.params.name;
    var sid = req.params.id;
    var obj = {};
    obj.name = user;
    obj.sid = sid;
    users.push(obj);
    console.log(users);
    res.render('ping', {users : users, logged : obj});    
    });    

http.listen(3000, () => {
    console.log('Server Up and Running');
})

    