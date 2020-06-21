var express = require('express');
var router = express.Router();

var template = require('../lib/template.js');

router.get('/', (request, response) => {
    if (request.user){
    console.log('session ' + request.session.passport.user);
    console.log('user ' + request.user.email);
    }
    var fmsg = request.flash();
    var feedback = '';
    if (fmsg.success) {
        feedback = fmsg.success[0];
    }
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var cookieUI = template.cookie(request, response);
    var sessionUI = template.session(request, response);
    var list = template.list(request.list);
    var html = template.HTML(title, list,
        `<h2>${title}</h2>${description}
        <img src="/images/hello.jpg" style="width:50%; margin:0 auto; display:block;">
        `,
        `<div style="color:blue;">${feedback}</div>
        <a href="/topic/create">create</a>
        
        `,
        cookieUI, sessionUI
    );
    response.send(html);
});

module.exports = router;