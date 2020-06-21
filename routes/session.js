var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var shortid = require('shortid');

var db = require('../lib/db.js');

const bcrypt = require('bcrypt');

module.exports = (passport) => {
    


    router.get('/login', (request, response) => {
        if (request.user) {
            response.redirect('/');
            return false;
        }
        var fmsg = request.flash();
        console.log(fmsg);
        var feedback = '';
        if (fmsg.error) {
            feedback = fmsg.error[0];
        }
        var title = 'Session - login';
        var cookieUI = template.cookie(request, response);
        var sessionUI = template.session(request, response);
        var list = template.list(request.list);
        var html = template.HTML(title, list, `
        <div style="color:red;">${feedback}</div>
        <form action="/session/login_process" method="post">
          <p><input type="email" name="userID" placeholder="user@naver.com" required value="test@naver.com"></p>
          <p><input type="password" name="userPW" placeholder="password" required value="12345678"></p>
          
          <p>
            <input type="submit">
          </p>
        </form>
      `, '', cookieUI, sessionUI);
        response.send(html);
    });

    router.post('/login_process',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/session/login',
            successFlash: true,
            failureFlash: true
        })
    );

    /*
    router.post('/login_process', (request, response) => {
        if (request.session.useAuth) {
            response.redirect('/');
            return false;
        }
        var post = request.body;
        var email = post.userID;
        var password = post.userPW;
        if (email == 'test@naver.com' && password == '12345678') {
            request.session.user = email;
            request.session.useAuth = true;
            request.session.save(() => {
                response.redirect('/');
            });
        } else {
            response.send('Incorrect Account');
        }
    })*/

   


    router.get('/regist', (request, response) => {
        var feedback = '';
        var fmsg = request.flash();
        if (fmsg.error) {
            feedback = fmsg.error[0];
        }
        console.log(fmsg);
        var title = 'Session - regist';
        var cookieUI = template.cookie(request, response);
        var sessionUI = template.session(request, response);
        var list = template.list(request.list);
        var html = template.HTML(title, list, `
        <div style="color:red;">${feedback}</div>
        <form action="/session/regist_process" method="post">
          <p><input type="email" name="userID" placeholder="user@naver.com" required value="test@naver.com"></p>
          <p><input type="password" name="userPW" placeholder="password" required value="12345678"></p>
          <p><input type="password" name="userPW2" placeholder="password check" required value="12345678"></p>
          <p><input type="text" name="userNick" placeholder="nick name" required value="test"></p>
          <p>
            <input type="submit">
          </p>
        </form>
      `, '', cookieUI, sessionUI);
        response.send(html);
    });

    router.post('/regist_process', (request, response) => {
        var post = request.body;
        var email = post.userID;
        var password = post.userPW;
        var password2 = post.userPW2;
        var nickName = post.userNick;
        var overlap = db.get('users').find({ email: email }).value();
        console.log(overlap);
        if (overlap == undefined){
            if (password == password2){
                bcrypt.hash(password, 10, function (err, hash) {
                    var userDB = {
                        id: shortid.generate(),
                        email: email,
                        password: hash,
                        nickname: nickName
                    }
                    db.get('users').push(userDB).write();
                    request.login(userDB, (err) => {
                        response.redirect('/');
                    });
                });
            }else{
                request.flash('error', '패스워드를 확인해주세요')
                response.redirect('/session/regist');
            }
        }else{
            request.flash('error', '이미 등록된 이메일입니다')
            response.redirect('/session/regist');
        }
    });

    router.get('/logout_process', (request, response) => {
        request.session.save(() => {
            request.logout();
            response.redirect('/');
        })
        // request.session.save(() => {
        //     request.session.destroy(() => {
        //         response.redirect('/');
        //     });
        // })
    });

    return router;   
}


