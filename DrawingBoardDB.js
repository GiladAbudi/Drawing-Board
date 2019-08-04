var mysql = require('mysql');

var con;
con = mysql.createConnection({
    host: "localhost",
    user: "GiladAbudi",
    password: "Gilad123",
    database: "DrawingBoard"
});

var createDataBase;
exports.createDataBase = function createDataBase() {
    let sql = "CREATE DATABASE DrawingBoard";
    execQuery(sql);
}

var createTables;
exports.createTables = function createTAbles() {
    let sql = "CREATE TABLE IF NOT EXISTS boardAndShape (boardNumber VARCHAR(255) , shape VARCHAR(255) , x int , y int ,size int)";
    execQuery(sql);
    sql = "CREATE TABLE IF NOT EXISTS boardAndUser (boardNumber VARCHAR(255) , userIP VARCHAR(255) )";
    execQuery(sql);
    sql = "CREATE TABLE IF NOT EXISTS userAndAmount (userIP VARCHAR(255) , amount int )";
    execQuery(sql);
}

var DropTables;
exports.DropTables = function DropTables() {
    let sql = "DROP TABLE boardAndShape";
    execQuery(sql);
    sql = "DROP TABLE boardAndUser";
    execQuery(sql);
    sql = "DROP TABLE userAndAmount";
    execQuery(sql);
}

/*var insertRow;
exports.insertRow=function (table, data) {
    if(table=='boardAndShape')
        insertBoardAndShape(data);
}*/

var insertBoardAndShape = function insertBoardAndShape(boardNumber, data) {
    let sql = "INSERT INTO boardandshape (boardNumber, shape, x, y, size) VALUES ('" + boardNumber + "','" + data.shape + "'," + data.x + "," + data.y +","+data.s+" )";
    execQuery(sql);
}

var insertBoardCreator;
exports.insertBoardCreator = function insertBoardCreator(boardnumber, userIP) {
    let sql1 = "SELECT * FROM boardanduser WHERE boardNumber='" + boardnumber + "'";
    con.query(sql1, function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            let sql = "INSERT INTO boardanduser (boardnumber, userip) VALUES ('" + boardnumber + "','" + userIP + "')";
            execQuery(sql);
        }
    });
}

var insertNewUser;
exports.insertNewUser = function insertNewUser(userIP) {
    let sql1 = "SELECT * FROM userAndAmount WHERE userIP='" + userIP + "'";
    con.query(sql1, function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            let sql = "INSERT INTO userAndAmount (userIP, amount) VALUES ('" + userIP + "', 0)";
            execQuery(sql);
        }
    });
}

var checkUserCreatorAndClear;
exports.checkUserCreatorAndClear = function checkUserCreatorAndClear(socket, isAdmin) {
    var boardNumber = socket.rooms[0];
    let sql1 = "SELECT * FROM boardanduser WHERE boardnumber='" + boardNumber + "' AND userip='" + socket.id + "'";
    con.query(sql1, function (err, result) {
        if (err) throw err;
        if (result.length != 0 || isAdmin) {
            clearBoard(boardNumber, socket);
        }
    });
}

function clearBoard(boardNumber, socket) {
    let sql = "DELETE FROM boardandshape WHERE boardNumber='" + boardNumber + "'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("DELETE - OK");
        socket.emit('clear');
        socket.broadcast.to(socket.rooms[0]).emit('clear');
    });
}

var updateBoard;
exports.updateBoard = function updateBoard(data, io) {
    let sql = "SELECT * FROM boardandshape WHERE boardNumber ='" + data + "'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            io.sockets.emit('draw', result[i]);
        }
    });
}

var increaseUserAmount;
exports.increaseUserAmount = function increaseUserAmount(userIP, maxAmount, data, socket, isAdmin) {
    let sql = "SELECT * FROM userAndAmount WHERE userIP ='" + userIP + "'";
    con.query(sql, function (err, result) {
        if (err) throw err;
        if (result[0].amount < maxAmount || isAdmin) {
            increaseAmount(userIP);
            insertBoardAndShape(socket.rooms[0], data);
            socket.emit('draw', data);
            socket.broadcast.to(socket.rooms[0]).emit('draw', data);
        }
    });
}

function increaseAmount(userIP) {
    let sql = "UPDATE userAndAmount SET amount = amount + 1 WHERE userIP ='" + userIP + "'";
    execQuery(sql);
}

var restUserAmount;
exports.restUserAmount = function restUserAmount() {
    let sql = "DELETE FROM userAndAmount";
    execQuery(sql);
}

function execQuery(sql) {
    con.query(sql, function (err, result) {
        if (err) throw err;
    });
}





