svGlobal.auth.afterlogin = function(connected){
    console.log(window.__sparkUser);
}

svGlobal.auth.onconnect = function(server){
    console.log(server);
}