window.onload = function() {

    function onStateChange(e, data){
        if(data.state == WMKS.CONST.ConnectionState.CONNECTED){
            console.log('connection state change : connected');
        }
        console.log('state changed:' + data.state);
    }

    function onError(e, data){
        hi5.notifications.notify('Error:' + data);
    }

    function connect(args, conntainerId){
        if (!args.server || !args.ticket){
            hi5.notifications.notify("Esxi server and access ticket are required!");
            return;
        }

        if (!conntainerId){
            conntainerId = 'wmksContainer';
        }
    
        var gateway = args.gateway || location.host;
        var scheme = ('https:' == location.protocol) ?  'wss://' : 'ws://';
        var esxi = args.server;
        //esxi server has HTTPS eanbled and listen on 443
        var url = scheme + gateway + '/PXY/https/' + esxi + '/443/ticket/'  + args.ticket;
        
    
        var wmks = WMKS.createWMKS(conntainerId,{});
        wmks.register(WMKS.CONST.Events.CONNECTION_STATE_CHANGE, onStateChange);
        wmks.register(WMKS.CONST.Events.ERROR, onError);
        

        if (args.keyboard){
            wmks.setOption('keyboardLayoutId', args.keyboard);
        }
        
        wmks.connect(url); 


        window.addEventListener('resize', function(e){
            if (wmks){
                wmks.updateScreen();
            }
        }, false);
    }


    //get args from URL:
    var args = hi5.tool.queryToObj();
    //get args from cookie otherwise
    if (!args.server || !args.ticket){
        args = hi5.browser.cookie2Obj();
    }
    
    //ask otherhwise
    if (!args.server || !args.ticket){
        var divLogin = document.getElementById('login');
        var dlg = new hi5.ui.Lightbox(divLogin);
        var frmLogin = document.getElementById('frmConn');
        frmLogin.onsubmit = function(e){
            e.preventDefault();
            dlg.dismiss();
        }

        dlg.onclose = function(){
            var elms = frmLogin.elements;
            args = {server: elms['server'].value, ticket: elms['ticket'].value, keyboard: elms['keyboard'].value};
            console.log(args);
            connect(args);
            return;
        };

        dlg.show();
    }else{
        connect(args); 
    }
};