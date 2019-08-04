
var socket;
var shape='circul';
var ShapeFunction;
var isAdmin={user:"",pass:""};
const boardSizeX =640 ; const boardSizeY= 480;
var size=1;

$(document).ready(function () {
    $('#SubmissionButtonCircul').click(() => shape = 'circul');
    $('#SubmissionButtonSizePlus').click(() => {if(size<=5)size++});
    $('#SubmissionButtonSizeMinus').click(() => {if(size>=1)size--;});
    $('#SubmissionButtonTriangle').click(() => shape = 'triangle');
    $('#SubmissionButtonSquare').click(() => shape = 'square');
    $('#SubmissionButtonStar').click(() => shape = 'star');
    $('#SubmissionButtonGear').click(() => shape = 'gear');
    $('#SubmissionButtonClear').click(() => {socket.emit('clear',isAdmin); });
    $('#SubmissionButtonAdmin').click(()=>{isAdmin.user= $('#adminName').val() ; isAdmin.pass= $('#adminPassWord').val();});
});

    function setup() {
    createCanvas(boardSizeX, boardSizeY);
    background(51);
    socket = io.connect('localhost:3000');
    socket.on('clear',clearBoard);
    socket.on('draw',updateBoard);
}

function clearBoard(){
    createCanvas(640, 480);
    background(51);
}


function updateBoard(data){
    noStroke();
    ShapeFunction[data.shape](data);
}

function mousePressed(){
    if(mouseY > 0 && mouseY < boardSizeY && mouseX < boardSizeX) {
        console.log(mouseX + '   ' + mouseY);
        noStroke();
        var data = {shape: shape, x: mouseX, y: mouseY, s:size};
        socket.emit('mouse', data ,isAdmin);
    }
}

function circul(data) {
    fill(255);
    ellipse(data.x, data.y, 47+data.s*2, 47+data.s*2);
}

function triangle(data) {
    fill(255);
    triangle( 10 + data.x,10 + data.y,40 + data.x,70 + data.y,0 + data.x, 70 + data.y);
}

function square(data) {
    fill(255);
    rect(data.x, data.y, 63+data.s*3, 63+data.s*3);
}

function star(data) {

    fill(255);
    buildStar(data.x, data.y, 17+data.s*7, 45+data.s*6, 5);
}

function gear(data) {
    fill(255);
    buildStar(data.x, data.y, 42, 57, 21);
}


ShapeFunction = {
    'circul':circul,
    'triangle':triangle,
    'square':square,
    'star':star,
    'gear':gear
};

function buildStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}