var db = require('../lib/db.js');
var bcrypt = require('bcrypt');

module.exports = (app) => {

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-AUTHENTICATION, X-IP, Content-Type, Accept');
    response.header('Access-Control-Allow-Credentials', true);
    response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
}
);



passport.serializeUser(function (user, done) {
    console.log('serializeUser ' + user.email);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    console.log('deserializeUser ' + id)
    var user =  db.get('users').find({ id: id}).value();
    done(null, user);
});


passport.use(new LocalStrategy({
    usernameField: 'userID',
    passwordField: 'userPW',
    session: true
},
    function (username, password, done) {
        console.log(0);
        console.log('LocalStrategy'+username, password);
        var userDB = db.get('users').find({ email: username }).value();
        console.log();
        if (userDB){
            bcrypt.compare(password, userDB.password, function (err, result) {
                if (result){
                    console.log(1);
                    return done(null, userDB, { message: "환영합니다" });
                }else{
                    console.log(2);
                    return done(null, false, { message: "비밀번호를 확인하세요" });
                }
            });
        }else{
            console.log(3);
            return done(null, false, { message: "아이디를 확인하세요" });
        }
    }
));//**** 이부분에서 flash 오류가 나거나 session이 늦게 반응하는건 session 내용이 변경 될 때 pm2나 nodemon이 서버를 재시작해서 생기는 오류!
    //nodemon main.js --ignore session/* --ignore db.json  , pm2 start main.js--watch--ignore - watch="sessions/* db.json data/*"를 참고 할 것!
return passport;
}