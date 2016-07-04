"use strict";
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var sf = require('slice-file');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
let logFile = "~/ela/logs/requests.log";
let textFile = "~/ela/textFile";
let sizeLog = "~/ela/logs/size.log";

let logReq = (req) => req.get('user-agent') + ' ' + req.method + ' ' + req.ip + '\n';

let updateSize = ()=>{
    var stats = fs.statSync("myfile.txt");
    var fileSize = stats["size"]/1000;
    fs.writeFile(sizeLog, fileSize.toString());
};

app.get('/', (req, res, nxt)=>{
    fs.appendFile(logFile, logReq(req));
    nxt();

});

app.post('/', (req, res, nxt)=>{
    fs.appendFile(logFile, logReq(req));
    nxt();
});

app.put('/text', (req, res) => {
    let entry = req.body.text;
    fs.appendFile(textFile, entry, (err)=>{
        if(err) {
            console.log(err);
            res.status(500).send("could'nt add file");
        }
        else{
          res.status(200).send('appended!!');
            updateSize();
        }
        });
    });

app.get('/text/:rows', ()=>{
    let rows = parseInt(req.params.rows);
    let stream  = sf(textFile).slice(-rows);
    stream.pipe(res);
});

app.delete('/text/:rows', ()=>{
    let rows = parseInt(req.params.rows);
    fs.readFile(textFile, (err, data)=>{
        if(err)conosle.log(err);
        else{
            let text = data.split('\n').slice(-rows)
            fs.writeFile(textFile, text, (err)=>{
                if(err){
                    console.log(err);
                    res.status(500).send(err);
                }
                else{
                    res.status(200).send();
                    updateSize()
                }

            });
        }
    })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
