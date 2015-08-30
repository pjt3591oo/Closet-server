import express = require('express');
import routes = require('./routes/index');
import user = require('./routes/user');
import http = require('http');
import path = require('path');
var mysql = require('mysql');
var socketio = require('socket.io');
var url = require('url');

var client = mysql.createConnection({
    user: 'root',
    password: 'qkrwjdxo1',
    database: 'closet'
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

import stylus = require('stylus');
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('server running' + app.get('port'));
});

var io = socketio.listen(server);
var people = 0; //접속 인원수

app.get('/locations', function (req, res) {
    var query = url.parse(req.url, true).query;
    console.log(query);
    
   // res.writeHead(200, { 'Content-Type': 'text/html' });
   // res.end(JSON.stringify(query));
});

app.post('/locations', function (req, res, data) {
    console.log('fuckfuck');
});

io.sockets.on('connection', function (socket) {
    try {
        //접속할 경우 접속자 수 1증가
        people += 1;
        console.log('test');
    //신체 사이즈 등록/ 처음 이용 개인설정
    //저장을 누르면 Custom, CustomInformation에 데이터 저장
    socket.on('data', function (data) {
        console.log('asd');
    });
        socket.on('회원가입', function (data) {
            try {

                client.query('INSERT INTO Custom(Custid, Name) values(?,?)', [data], function () {
                    //Custom 이름과 회원 번호만 저장
                });

                client.query('INSERT INTO CustomInformation(Age, Gender, Weight, Height, BodySize, PantsSize, ShoseSize, ChestSize) values(?,?,?,?,?,?,?,?)', [data], function () {
                    //CustomInformation 회원 정보 저장(Custom에게 상속받음)
                });
            } catch (err) {
                console.log('회원가입 error : ' +err);
            }

        });

        //Main 화면에서 적합한 치수를 가져와서 보여준다.
        socket.on('MainDisplay', function (data) {
            try {
            client.query('select *from Dbtablename', function () {
                //핏감을 가져와서 fit이 좋으면 fit감 하나씩 뿌린다.
                if(data.fit){
                    //전송
                }
                else{

                }

            });
                   
            } catch (err) {
                console.log('main화면 errpr : ' + err);
            }
        });

        //접속을 끊을 경우 인원수를 1감소 시킨다.
        socket.on('disconnect', function () { 
            people -= 1;

        });
    } catch (err) {
        console.log('socket error : ' + err);
    }

});

//rul 연경 추가
/*
function start(route) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        route(pathname);
        console.log(pathname.a);
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write("HelloWorld");
        response.end();
    }

    http.createServer(onRequest).listen(3000);
}*/