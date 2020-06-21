var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');

router.get('/login', (request, response) => {
    var title = 'Cookie - login';
    var cookieUI = template.cookie(request, response);
    var sessionUI = template.session(request, response);
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <form action="/cookie/login_process" method="post">
          <p><input type="email" name="userID" placeholder="user@naver.com" required></p>
          <p><input type="password" name="userPW" placeholder="password" required></p>
          <p>
            <input type="submit">
          </p>
        </form>
      `, '', cookieUI, sessionUI);
    response.send(html);
})

router.post('/login_process', (request, response) => {
    var post = request.body;
    var email = post.userID;
    var password = post.userPW;
    if (email == 'test@naver.com' && password == '12345678') {
        response.cookie('email', email, {
            maxAge: 60 * 60 * 12,
            path: '/',
            httpOnly: true
        });
        response.cookie('password', password, {
            maxAge: 60 * 60 * 12,
            path: '/',
            httpOnly: true
        });
        response.redirect('/');
    } else {
        response.send('Incorrect Account');
    }
})

router.get('/logout_process', (request, response) => {
    response.clearCookie('email');
    response.cookie('password', '', {
        maxAge: 0,
    });
    //cookie 삭제의 두가지 방법
    response.redirect('/');
});

module.exports = router;