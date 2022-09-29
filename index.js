const express = require('express');
const app = express();
const http = require('http');
const {Server} =require('socket.io')
const server = http.createServer(app);
const io=new Server(server);
app.get('/', (req, res) => {
    console.log("Here")
    res.sendFile(__dirname+"/index.html");
  });
  

  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
  });
  io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        console.log(msg)
        io.emit('chat message', msg);
    });
  });
  
 
server.listen(5000, () => {
    console.log('listening on:3000');
  });