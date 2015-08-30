var express = require('express');
var mobile = require('./routes/Mobile');
var web = require('./routes/Web');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var url = require('url');
var bodyparser = require('body-parser');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.bodyParser()); // post요청시 매개변수 추출
app.use(express.cookieParser());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

var stylus = require('stylus');
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//======== 웹 ========

// 로그인 페이지
app.get('/', web.Login);

//회원가입 페이지 
app.get('/wNewCustom', web.NewCustom);

//회원가입시 이메일 인증

//신체사이즈 등록
app.get('/wFirstRegi', web.FirstRegi);

//==========모바일 디바이스

app.get('/', function (req, res) {
    console.log('root');
});

//test
app.get('/test', mobile.Testm);

//회원가입
//이메일 인증 부분.
//회원가입 후 신체 사이즈 등록
app.post('/NewCustom', mobile.NewCustom);
app.post('/NewCustom/EmailCheck', mobile.Email);
app.post('/NewCustom/FirstRegi', mobile.Regi);

//로그인 
//facebook login
app.post('/login', mobile.AppLogin);
//app.post('/login/facebookLogin'. mobule.FbLogin);

//옷 이름 입력
//옷 사이즈 입력
//app.post('/TopCloseRegi', mobile.CloseRegi);


//Main화면 미등록 옷 갯수 확인
//app.get('/Main', mobile.MainDisplay);

//내 옷장 들어 갔을때 -> 핏팅감 등록된 것과 등록되지 않은것 구분
//내 옷장에서 핏팅감 등록
//app.get('/MyClose', mobile.MyClose);
//app.get('/MyClose/regi', mobile.rMyClose);

//옷 검색하기 검색
app.post('/search', mobile.search);

//사이즈 수정
app.get('/UpdaRegi', mobile.updateG);
app.post('/UpdaRegi', mobile.updateP);

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log('server running' + app.get('port'));
});

var io = socketio.listen(server);
