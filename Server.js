var express = require('express');
var socket = require('socket.io');
var DrowingBoardDB = require('./DrawingBoardDB');


//DrowingBoardDB.createDataBase();
DrowingBoardDB.DropTables();
DrowingBoardDB.createTables();

var app= express();
var server = app.listen(3000);

var maxAmount = 6;          // max shape that user can draw
const adminUser="admin";    //admin user and password
const adminPass="admin";


app.use('/:boardNumber',express.static('public'));
console.log("my server running");

var io =socket(server);
io.on('connection',newConnection);


function  newConnection(socket) {
    addSocketToRoom(socket);
    var userIP = socket.id;

    console.log('new connection : '+ userIP + 'in url :'+socket.rooms[0] );
    DrowingBoardDB.insertBoardCreator(socket.rooms[0],userIP);
    DrowingBoardDB.insertNewUser(userIP);
    DrowingBoardDB.updateBoard(socket.rooms[0],io);

    socket.on('mouse',mouseDraw);
    socket.on('clear', clearBoard );

    function mouseDraw(data,isAdmin){
        if(isAdmin.pass==adminPass && isAdmin.user==adminUser)
            DrowingBoardDB.increaseUserAmount(userIP,maxAmount,data,socket,true);
        else
            DrowingBoardDB.increaseUserAmount(userIP,maxAmount,data,socket,false);
        console.log(data);
    }

    function clearBoard(isAdmin){
        if(isAdmin.pass==adminPass && isAdmin.user==adminUser)
            DrowingBoardDB.checkUserCreatorAndClear(socket,true);
        else
            DrowingBoardDB.checkUserCreatorAndClear(socket,false);
    }

}

function addSocketToRoom(socket) {
    var boardName=getBoardName(socket).toString();
    socket.leave(socket.rooms[0]);
    socket.join(boardName);
    socket.rooms = [boardName];
}

function getBoardName(socket){
    return socket.conn.request.headers.referer;
}

setInterval(() => {
    DrowingBoardDB.restUserAmount();
},86400000); //86,400,000ms = 1 day

