const express = require('express');
const app = express();
const path=require('path');
const http = require('http');
const {Server} =require('socket.io')
const server = http.createServer(app);
const io=new Server(server);

//app.use(express.static(path.join(__dirname, "public")));
const rooms = ['room1', 'room2', 'room3'];
app.get('/', (req, res) => {
    
    res.sendFile(__dirname+"/public/index.html");
  });
  io.on('connection', (socket) => {
    console.log(`a user connected ${socket.id}`);

    io.to(socket.id).emit('updateRooms',rooms);
    socket.on('joinRoom',(room)=>{
      console.log(`${socket.id} joined ${room}`)
      socket.join(room);
    })
    socket.on('privateMessage',(data)=>{
      io.to(data.room).emit('privateMessage',{message:data.message,room:data.room,from:socket.id})
    })
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
  });

  // io.on('connection',(socket)=>{
  //   socket.on('joinRoom',(room)=>{
  //     socket.join(room)
  //     console.log(`${socket.id} joined ${room}`)
  //   })
  // })
  // io.on('connection', (socket) => {
    
  //   socket.on('chat message', (msg) => {
  //       console.log(msg)
        
  //       io.emit('chat message', msg);
  //   });
  // });
  
 
server.listen(8000, () => {
    console.log('listening on:8000');
  });