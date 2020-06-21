var express = require('express');
var app = express();

var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var compression = require('compression');
const helmet = require("helmet");

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var FileStore = require('session-file-store')(session);
var db = require('./lib/db.js');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("*",session({
  secret: 'abcdefghijklmnopQRSTUVWXYZ!@#$%^&*(*)',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: new FileStore()
}));

var passport = require('./lib/passport.js')(app);
var flash = require('connect-flash');

app.use(helmet());
app.use(compression());
app.get('*', (request, response, next) => {
  request.list = db.get('topics').take(100).value();
  //take(n) n개 만큼 가져오는걸로 제한 생략하면 모두 가져옴
  next();
});

/*
app.get('*',(request, response, next) => {
  fs.readdir('./data', function (error, filelist) {
    request.list = filelist;
    next();
  })
});
*/

app.use(flash());
app.use(express.static('public'));

var homeRouter = require('./routes/home.js')
var topicRouter = require('./routes/topic.js')
var cookieRouter = require('./routes/cookie.js')
var sessionRouter = require('./routes/session.js')(passport);

app.use('/', homeRouter);
app.use('/topic', topicRouter);
app.use('/cookie', cookieRouter);
app.use('/session', sessionRouter);

app.use((request, response, next) => {
  response.status(404).send('Not Found Page');
});

app.use((err, request, response, next) => {// 에러처리 미들웨어의 약속된 4개의 인자
  response.status(500).send('Something Broke! ' + err);
});

app.listen(3000);