module.exports = {
  HTML:function(title, list, body, control, cookie, session){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      ${cookie}
      ${session}
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },list:function(filelist){
    var list = '<ul>';
    var i = 0;
    for(var i=0; i < filelist.length; i++){
      list = list + `<li><a href="/topic/${filelist[i].id}">${filelist[i].title}</a></li>`;
    }
    list = list+'</ul>';
    return list;
  },cookie:(request, response)=>{
    var cookieUI = ``;
    if (request.cookies.email !== undefined && request.cookies.password !== undefined){
      cookieUI = `<p>${request.cookies.email} | <a href="/cookie/logout_process">logout</a></p>`;
    }else{
      cookieUI = `<p><a href="/cookie/login">login</a></p>`;
    }
    return cookieUI
  }, session: (request, response)=>{
    var useAuth = false;
    var sessionUI = "";
    if (request.user){
      useAuth = true;
    }
    if (useAuth){
      sessionUI = `<p>${request.user.nickname} | <a href="/session/logout_process">logout</a></p>`;
    }else{
      sessionUI = `<p><a href="/session/login">login</a> | <a href="/session/regist">regist</a></p>`;
    }
    
    return sessionUI;
  }
}
