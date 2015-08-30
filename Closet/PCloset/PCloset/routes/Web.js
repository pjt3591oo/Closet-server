var mysql = require('mysql');

var fs = require('fs');

var client = mysql.createConnection({
    user: 'root',
    password: 'qkrwjdxo1',
    database: 'Closet'
});

function Login(req, res) {
    try {
        fs.readFile('views/Login.html', function (err, data) {
            res.writeHead(200, { 'Content-Type' : 'text/html' });
            res.end(data);
        });
    } catch (err) {
        console.log('Web Login Page Error; ' + err);

    }
}

function NewCustom(req, res) {
    try {
        fs.readFile('views/NewCustom.html', function (err, data) {
            res.writeHead(200, { 'Content-Type' : 'text/html' });
            res.end(data);
        });
    } catch (err) {
        console.log('Web newCustom Page Error : ' + err);
    }
}

function FirstRegi(req, res) {
    
};

exports.Login = Login;
exports.NewCustom = NewCustom;
exports.FirstRegi = FirstRegi;
;