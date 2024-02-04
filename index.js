const express = require('express');
const app = express();
const path=require('path');
const http = require('http');
const {Server} =require('socket.io')
const server = http.createServer(app);
const io=new Server(server);
const mysql = require('mysql');
const rooms=[];

//CREATE CONNECTION TO MYSQL
const connection =mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'',
database:'mydb'
})
connection.connect((err)=>{
  if(err){
    console.log(err);
  }else{
    console.log('Connected to mysql');
    const sql2 = "CREATE TABLE IF NOT EXISTS rooms (id INT AUTO_INCREMENT PRIMARY KEY,roomName VARCHAR(255))"; 
    connection.query(sql2,(err,result)=>{
      if(err){
        console.log(err);
      }else{
        console.log('Table created');
      }
    })
   const sql = "CREATE TABLE IF NOT EXISTS chat (id INT AUTO_INCREMENT PRIMARY KEY,message VARCHAR(255),roomId INT,FOREIGN KEY (roomId) REFERENCES rooms(id),time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,user VARCHAR(50));"
    connection.query(sql,(err,result)=>{
      if(err){
        console.log(err);
      }else{
        console.log('Table created');
      }
    })
  }
})

connection.query('SELECT * FROM rooms',(err,result)=>{
  if(err){
    console.log(err);
  }else{
    result.forEach((room)=>{
      rooms.push({id:room.id,roomName:room.roomName});
    })
    console.log(rooms);
  }
})


//app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(__dirname + '/public'));

  io.on('connection', (socket) => {
    console.log(`a user connected ${socket.id}`);
    
    io.to(socket.id).emit('updateRooms',rooms);
    socket.on('joinRoom',(room)=>{
      console.log(`${socket.id} joined ${room.roomName}`)
      socket.join(room.id);
      connection.query('SELECT * FROM chat WHERE roomId=?',[room.id],(err,result)=>{
        if(err){
          console.log(err);
        }else{
          console.log(result);
          io.to(room.id).emit('chatHistory',result);
        }
      })
    })
    socket.on('privateMessage',(data)=>{
      connection.query('INSERT INTO chat (message,roomId,user) VALUES (?,?,?)',[data.message,data.room.id,data.user],(err,result)=>{
        if(err){
          console.log(err);
        }else{
          console.log('Message inserted');
        }
      })
      io.to(data.room.id).emit('privateMessage',{message:data.message,room:data.room,from:socket.id,user:data.user});
    })
  
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
  });

server.listen(8000, () => {
    console.log('listening on:8000');
  });