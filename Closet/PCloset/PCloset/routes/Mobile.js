var mysql = require('mysql');
var nodemailer = require('nodemailer');

var fs = require('fs');
var PORT = 3306;

var test = mysql.createConnection({
    user: 'root',
    host: 'closet.cbi7hsyh7oru.us-west-2.rds.amazonaws.com',
    port : PORT,
    password: 'qkrwjdxo1',
    database: 'Closet'
});
//============DB 설정========
// 회원정보 DB
var ClosetCustom = mysql.createConnection({
    user: 'root',
    host: 'closet.cbi7hsyh7oru.us-west-2.rds.amazonaws.com',
    port : PORT,
    password: 'qkrwjdxo1',
    database: 'ClosetCustom'
});

// 옷 목록DB
var ClosetList = mysql.createConnection({
    user: 'root',
    host: 'closet.cbi7hsyh7oru.us-west-2.rds.amazonaws.com',
    port : PORT,
    password: 'qkrwjdxo1',
    database: 'ClosetList'
});

// fit감 정보 DB
var ClosetFit = mysql.createConnection({
    user: 'root',
    host: 'closet.cbi7hsyh7oru.us-west-2.rds.amazonaws.com',
    port : PORT,
    password: 'qkrwjdxo1',
    database: 'ClosetFit'
});


//메일 설정
//이메일 송신 설정
var trasporter = nodemailer.createTransport({
    service : 'Gmail',
    auth: {
        user: 'pjt3591oo@gmail.com',
        pass: 'qkrwjdxo1'
    }
});



function NewCustom(req, res) {
    try {
        //데이터 받는 부분
        var id = req.body.ID; //ID는 이메일 형식으로 받게 된다.
        var pw = req.body.PASSWORD;
        var name = req.body.NAME;
        
        //ID 검사
        client.query('SELECT *FROM Custom WHERE Custid=?', [id], function (err, data) {
            //ID가 존재할 경우
            if (data.lenth>0) {
                req.send({ STATUS : 'IdExit' });
            } else { // ID가 존재하지 않을경우는 회원목록에 추가를 한다.(이때 Custominformation에다가 id를 넣어준다.
                
                //password를 검사 한다.
                if (pw.length >= 5) {
                    client.query('INSERT INTO Custom(Custid, Name, Password), VALUES(?,?,?)', [id, name, pw], function () {
                    });
                    client.query('INSERT INTO CustomInformation(Custid) VALUES(?)', [id], function () {
                    });
                    req.send({ STATUS: 'NewCustomSuccess' });
                } else {
                    req.send({ STATUS: 'PwFail' });
                }
            }
        });

    } catch (err) {
        console.log('NewCustom Error Message : ' + err);
    }
}


//모바일과 이메일에 인증번호를 전송을 한다.
//모바일에서는 전송받은 인증번호와 사용자가 입력한 인증번호가 맞으면 회원가입 정보를 전송을 한다.
function Email(req, res) {
    
    var id = req.body.ID;
    var secu = 0;

    var mailOptions = {
        from: '박정태 <pjt3591oo@gmail.com>', // sender address
        to: id, // list of receivers
        subject: 'Closet 인증번호입니다.', // Subject line
        text: secu, // plaintext body
        //html: '<b>Hello world ?</b>' // html body
    };
    
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
            res.send({Secu : secu});// 모바일로 인증번호를 날린다.
        }
    });
};

function AppLogin(req, res) {
    try {
        //데이터 받는 부분
        var id = req.body.ID;
        var pw = req.body.PASSWORD;
        
        //전송된 id 검사
        if (SecuData(id)) {
            req.send({ STATUS: 'WARRING' });   
        }

        client.query('SELECT *FROM Custom WHERE (Custid=? and Password = ?)', [id, pw], function (err, data) {
            if (data.length<1) { //로그인 실패
                req.send({ STATUS: 'LoginFail' });
            } else { //로그인 성공
                req.send({ STATUS : 'LoginSuccess' });
            }
        });

    } catch (err) {
        console.log('login Error :' + err);
    }

};

function FbLogin(req, res) {
    try {
        //데이터 받는 부분
        var name = req.body.NAME;
        var id = req.body.ID;
        
        //페북 로그인 시 Custom에 ID가 없으면 집어넣기(DB에 있던 없던 최종적으로는 STATUS: 'LoginSuccess'전송
        client.query('SELECT *FROM Custom WHERE Custom id = ?', [id], function (err, data) {
            if (data.length<1) { // DB에 ID가 없을 경우
                client.query('INSERT INTO Custom(Custid, Name) VALUES(?, ?)', [id, name], function () {
                });
                client.query('INSERT INTO CustomInformation(Custid) VALUES(?)', [id], function () {
                });
                req.send({ STATUS: 'LoginSuccess' });
            } else { // 있을경우
                req.send({ STATUS: 'LoginSuccess' });
            }
        });

    } catch (err) {
        
        console.log('FacebookData Error : ' + err);

    }
};

//상하의 구분을 지어서 데이터를 받아서 넣어준다.
function TopCloseRegi(req, res) {
    var id = req.body.ID;

    TopRegi();
    BottonRegi();
};


function Regi(req, res) {
    try {
        //데이터 수신
        var id = req.body.ID;
        var Age = req.body.AGE;
        var Gender = req.body.GENDER;
        var Weight = req.body.WEIGHT;
        var Height = req.body.HEIGHT;
        var BodySize = req.body.BODYSIZE;
        var PantsSize = req.body.PANTSSIZE;
        var ShoseSize = req.body.SHOSESIZE;
        var ChestSize = req.body.CHESTSIZE;
        
        //신체 사이즈 등록
        client.query('UPDATE CustomInformation SET Age=?,Gender=?, Weight=?, Height=?, BodySize=?, pantsSize=?, ShoseSize=?, ChestSize=? WHERE Custid =?', 
            [Age, Gender, Weight, Height, BodySize, PantsSize, ShoseSize, ChestSize, id], function () {
                
            req.send({ STATUS: 'RegiSuccess' });
        });

    } catch (err) {
        console.log('regi Error : ' + err);
    }
};

//수정
function updateP(req, res) {
    //데이터 수신
    try {
        var id = req.body.ID;
        var Age = req.body.AGE;
        var Gender = req.body.GENDER;
        var Weight = req.body.WEIGHT;
        var Height = req.body.HEIGHT;
        var BodySize = req.body.BODYSIZE;
        var PantsSize = req.body.PANTSSIZE;
        var ShoseSize = req.body.SHOSESIZE;
        var ChestSize = req.body.CHESTSIZE;
        
        // 수정 쿼리
        client.query('UPDATE Custominformation SET Gender =?, Weight=?, Height=?,BodySize=?, PantsSize=?, ShoseSize=?, ChestSize=? WHERE id=? ', 
            [Gender, Weight, Height, BodySize, PantsSize, ShoseSize, Chestize, id], function () {
            res.send({ STETAUS : UpdateSuccess });
        
        });
    } catch (err) {
        console.log('Update Error : ' + err);
    }
};

//수정 하는 부분 접속 할떄 default값 띄우기
function updateG(req, res) {
    try {
        var id = req.body.ID;
        ClosetCustom.query('SELECT *FROM CustomInformation WHERE Custid =?', [id], function (err, data) {
            if (!err) {
                res.send(data);
            } else {
                console.log('updateG Data Sene ERROR : ' + err)
            }
        });
    } catch (err) {
        console.log('updateG Error : ' + err);
    }
};

function MainDisplay(req, res){
    try {
        var id = req.body.ID;
        var count=0;

        ClosetList.query('SELECT *FROM BuyList WHERE Id=? AND FitRegi = ?', [id, 0], function (err, data) {
            count = data.length;
            res.send({ Count: count });
        });
    } catch (err) {
        console.log('MainDisplay Error ' + err);
    }
};

function search(req, res) {
    
    //넘어 온 값을 받는다
    var id = req.body.id;
    var CloseName = req.body.ModelName;
    var CloseCode = req.body.CloseCode;

    var Height = req.body.Height;
    var weight = req.body.weight;
    var Body = req.body.Body;
    var Pants = req.body.Pants;
    var Shoes = req.body.Shoes;
    var Chest = req.body.Chest;

    var HeightMax = req.body.HeightMax;
    var HeightMin = req.nody.HeightMIn;
    var WeightMax = req.body.WeightMax;
    var WeightMin = req.body.weightMin;
    var BodyMax = req.body.BodyMax;
    var BodyMin = req.body.BodyMin;
    var PantsMax = req.body.PantsMax;
    var PantsMin = req.body.PantsMin;
    var ShoesMax = req.body.ShoesMax;
    var ShoesMin = req.body.ShoesMin;
    var ChestMax = req.body.ChestMax;
    var ChestMin = req.body.ChestMin;

    //키
    if (search(HeightMax, HeightMin, Height)) {
        client.query('SELECT *FROM 디비 명 WHERE 컬럼> ? , 컬럼<? like=?',
            [HeightMin, HeightMax, CloseName], function (err, data) {
            res.send({ search: data });
        });
    } else {
        client.query('SELECT *FROM 디비 명 WHERE  컬럼<?, 컬럼> ? like=?',
            [HeightMax, HeightMin, CloseName], function (err, data) {
            res.send({ search : data });
        });
    }

    //몸무게
    if (search(WeightMax, WeightMin, weight)) {
        client.query('SELECT *FROM 디비 명 WHERE 컬럼> ? , 컬럼<? like=?',
            [WeightMin, WeightMax, CloseName], function (err, data) {
            res.send({ search: data });
        });
    } else {
        client.query('SELECT *FROM 디비 명 WHERE  컬럼<?, 컬럼> ? like=?',
            [WeightMax, WeightMin, CloseName], function (err, data) {
            res.send({ search: data });
        });
    }

    //상체
    if (search(BodyMax, BodyMin, Body)) {
        client.query('SELECT *FROM 디비 명 WHERE 컬럼> ? , 컬럼<? like=?',
            [BodyMin, BodyMax, CloseName], function (err, data) {
            res.send({ search: data });
        });
    } else {
        client.query('SELECT *FROM 디비 명 WHERE  컬럼<?, 컬럼> ? like=?',
            [BodyMax, BodyMin, CloseName], function (err, data) {
            res.send({ search: data });
        });
    }

    //하체
    if (search(PantsMax, PantsMin, Pants )) {
        client.query('SELECT *FROM 디비 명 WHERE 컬럼> ? , 컬럼<? like=?',
            [PantsMin, PantsMax, CloseName], function (err, data) {
            res.send({ search: data });
        });
    } else {
        client.query('SELECT *FROM 디비 명 WHERE  컬럼<?, 컬럼> ? like=?',
            [PantsMax, PantsMin, CloseName], function (err, data) {
            res.send({ search: data });
        });
    }

    //신발
    if (search(ShoesMax, ShoesMin, Shoes)) {
        client.query('SELECT *FROM 디비 명 WHERE 컬럼> ? , 컬럼<? like=?',
            [ShoesMin, ShoesMax, CloseName], function (err, data) {
            res.send({ search: data });
        });
    } else {
        client.query('SELECT *FROM 디비 명 WHERE  컬럼<?, 컬럼> ? like=?',
            [ShoesMax, ShoesMin, CloseName], function (err, data) {
            res.send({ search: data });
        });
    }

    //가슴
    if (search(ChestMax, ChestMin, Chest)) {
        client.query('SELECT *FROM 디비 명 WHERE 컬럼> ? , 컬럼<? like=?',
            [ChestMin, ChestMax, CloseName], function (err, data) {
            res.send({ search: data });
        });
    } else {
        client.query('SELECT *FROM 디비 명 WHERE  컬럼<?, 컬럼> ? like=?',
            [ChestMax, ChestMin, CloseName], function (err, data) {
            res.send({ search: data });
        });
    }

};

function Testm(req, res) {
    console.log('test');
    //var teststring = req.body.TestString;
    
    //test.query('SELECT *FROM test WHERE Name LIKE "%?%"', [teststring], function (err, data) {
    //    res.send(data);
    //});
};


exports.AppLogin = AppLogin;
exports.FbLogin = FbLogin;
exports.search = search;
exports.NewCustom = NewCustom;
exports.Regi = Regi;
exports.MainDisplay = MainDisplay;
exports.Email = Email;
exports.updateP = updateP;
exports.updateG = updateG;
exports.Testm = Testm;

;
//# sourceMappingURL=index.js.map

//검색시 치수 비교
function search(max, min, basic) {
    
    var v1 = max;
    var v2 = basic-min;
    
    if (v1>=v2) {
        return true; //min값을 먼저 검사   where 컴럼>min, 컬럼< max
    } else {
        return false; //max값을 먼저 검사 where 컬럼< max, 컴럼>min
    }

};

//데이터에 sql문, 특수문자를 필터 -> 발견시 true리턴
function SecuData(data) {
    
    var string = NULL;
    
    for (var i in data) {
        //특수 문자 검사 (일단 기본적인 쿼리문과 태그에 사용되는 특수문자 필터링)
        if ((i == "'") || (i=='"') || (i=="=") || (i == "<") || (i == ">") || (i == "?") || (i == "*") ) {
            return true;
        }
        
        //공백이 있을때 까지 글자를 합친다. 
        if (i == " ") {
            //DML을 우선적으로 필터
            if ((string=="select") || (string == "where") || (string == "show") || (string == "update") || (string == "insert")) {
                return true;
            }
        } else {
            string += i;
        }
    }

};



/* 옷 CodeName
0 TShort
1 TLong
2 TShirts
3 Tjumper
4 TJacket
5 TNasir
6 TDress 
7 TSleeveDress
8 THoodie  
9 BShort
10 BLong  
11 BSkirth 
12 BSkirta
13 ETC
*/  