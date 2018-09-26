var authKey = 'a1s2d3f4'

Tail = require('tail').Tail;
var cmdFile = "cmd.txt"
tail = new Tail(cmdFile);

require('log-timestamp');
const fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);

var io = require('socket.io')(http , {'pingTimeout': 7000, 'pingInterval': 5000});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.get('/', function(req, res){
  console.log('website accessed');
});

io.on('connection', function (socket) {
   console.log(socket.id,': connected');
   console.log('live sockets :',Object.keys(io.sockets.clients().sockets));
   //console.log(io.sockets.clients());

   socket.on('join', function (msg) {
    if (typeof msg == 'string'){
        jsonMsg = JSON.parse(msg)
                console.log(socket.id, ': join request - ',jsonMsg);
        }
    else if(typeof msg == 'object'){
        jsonMsg = msg
                console.log(socket.id, ': join request - ',jsonMsg);
        }
    else{
        console.log('invalid join request');
                socket.disconnect();
        }



    if (jsonMsg.authKey == authKey){
        socket.join(jsonMsg.hostName);
        //console.log(io.sockets.clients());
        socket.emit('fromServer', 'welcome to ure private room');
        console.log(socket.id,': been assigned to room - ',jsonMsg.hostName);
        }
    else{
        console.log('invalid authKey');
        socket.emit('fromServer','wrong authKey');
        socket.disconnect();
                }
   });

    socket.on('fromClient', function (name, data) {
        fs.writeFile(name, data, (err) => {
                if (err) throw err;
                console.log(name+' has been saved!');
                });
        socket.emit('fromServerAck',name+' received');
        });

        socket.on('powershellOutput', function (data) {
        console.log('powershell output\n'+data);                
        });

   socket.on('disconnect', function () {
    socket.disconnect();
    console.log(socket.id,': disconnected')
    console.log('live sockets :',Object.keys(io.sockets.clients().sockets));
   });
});

function wait()
    { }
tail.on("line", function(data) {
    setTimeout(wait, 1000);
    var arr = data.split("~~");
    io.sockets.in(arr[0]).emit('fromServerPowershell', arr[1]);
    fs.truncate(cmdFile, 0, function(){console.log(arr[1],'sent to',arr[0],'&',cmdFile,'truncated')});
});
