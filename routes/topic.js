var express = require('express');
var router = express.Router();

var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var db = require('../lib/db.js');
var shortid = require('shortid');

router.get('/create', (request, response) => {
    var title = 'WEB - create';
    var cookieUI = template.cookie(request, response);
    var sessionUI = template.session(request, response);
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <form action="/topic/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `, '', cookieUI, sessionUI);
    response.send(html);
})

router.post('/create_process', (request, response) => {
    if (!request.user) {
        response.redirect('/');
        return false;
    }
    var post = request.body;
    var title = post.title;
    var description = post.description;
    var id = shortid.generate()
    db.get('topics').push({
        id: id,
        title:title,
        description:description,
        userID : request.user.id
    }).write();
    response.redirect(`/topic/${id}`);
    /*
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.redirect(`/topic/${title}`);
    })*/
})

router.get('/update/:topicID', (request, response) => {
    
    var topicDB = db.get('topics').find({id:request.params.topicID}).value();
    console.log(request.user.id + ' ' + topicDB.userID);
    if (request.user.id !== topicDB.userID) {
        request.flash('error', 'Not Yours!');
        return response.redirect(`/topic/${topicDB.id}`)
    }
    var filteredId = path.parse(topicDB.title).base;
    //fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var title = topicDB.title;
        var description = topicDB.description;
        var cookieUI = template.cookie(request, response);
        var sessionUI = template.session(request, response);
        var list = template.list(request.list);
        var html = template.HTML(title, list,
            `
        <form action="/topic/update_process" method="post">
          <input type="hidden" name="id" value="${topicDB.id}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/topic/create">create</a> <a href="/topic/update/${topicDB.id}">update</a>`
        , cookieUI, sessionUI
        );
        response.send(html);
    //});
});

router.post('/update_process', (request, response) => {
    if (!request.user) {
        response.redirect('/');
        return false;
    }
    var post = request.body;
    var id = post.id; //글 고유번호
    var title = post.title;
    var description = post.description;
    var loginID = request.user.id; //로그인 유저 고유번호
    var writeID = db.get('topics').find({ id: id }).value(); //글 작성 정보
    if (loginID === writeID.userID) {//로그인 유저 고유번호 == 글쓴이 유저 고유번호
        db.get('topics').find({id:id}).assign({
            tittle: title,
            description: description
        }).write();
        response.redirect(`/topic/${writeID.id}`)
    }else{
        request.flash('error', 'Not Yours!');
        return response.redirect(`/topic/${writeID.id}`)
    }

    // fs.rename(`data/${id}`, `data/${title}`, function (error) {
    //     fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
    //         response.redirect(`/topic/${title}`);
    //     })
    // });
});

router.post('/delete_process', (request, response) => {
    if (!request.user) {
        response.redirect('/');
        return false;
    }
    var post = request.body;
    var id = post.id;
    var loginID = request.user.id; //로그인 유저 고유번호
    var writeID = db.get('topics').find({ id: id }).value(); //글 작성 정보
    if (loginID === writeID.userID) {//로그인 유저 고유번호 == 글쓴이 유저 고유번호
        db.get('topics').remove({ id: id }).write();
        response.redirect(`/`)
    } else {
        request.flash('error', 'Not Yours!');
        return response.redirect(`/topic/${writeID.id}`)
    }

    var filteredId = path.parse(id).base;
    // fs.unlink(`data/${filteredId}`, function (error) {
    //     response.redirect('/');
    // })
});


router.get('/:topicID', (request, response) => {
    // console.log(request.params.topicID);
    // console.log(request.list);
    var fmsg = request.flash();
    console.log(fmsg);
    var feedback = '';
    if (fmsg.error) {
        feedback = fmsg.error[0];
    }
    var topicDB = db.get('topics').find({ id: request.params.topicID}).value();
    var user = db.get('users').find({ id: topicDB.userID }).value();
    var filteredId = path.parse(topicDB.title).base;
    //fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
         
        var sanitizedTitle = sanitizeHtml(topicDB.title);
        var sanitizedDescription = sanitizeHtml(topicDB.description, {
            allowedTags: ['h1']
        });
        var cookieUI = template.cookie(request, response);
        var sessionUI = template.session(request, response);
        var list = template.list(request.list);
        var html = template.HTML(sanitizedTitle, list,
            `
            <p style="color:red; font-size:18px;">${feedback}</p>
            <h2>${sanitizedTitle}</h2>
            ${sanitizedDescription}
            <p>by ${user.nickname}</p>
            `,
            ` <a href="/topic/create">create</a>
        <a href="/topic/update/${topicDB.id}">update</a>
        <form action="/topic/delete_process" method="post">
          <input type="hidden" name="id" value="${topicDB.id}">
          <input type="submit" value="delete">
        </form>`,
            cookieUI, sessionUI
        );
        response.send(html);
   //});
});

module.exports = router;