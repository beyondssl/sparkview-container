window.addEventListener('load', function(){
    var player = null,
        seekBar = document.getElementById('seekpos');


    function initState(){
        seekBar.value = 0;
        var elm = document.getElementById('sv_pl_scan');
        elm.setAttribute('data-state', 'scanmode');
        elm.setAttribute('title', 'Scan Mode');
        
        elm = document.getElementById('sv_pl_play');
        elm.setAttribute('data-state', 'pause');

        elm = document.getElementById('sv_pl_mute');
        elm.setAttribute('data-state', 'mute');
    }

    function initPlayer(p){
        var seekBar = document.getElementById('seekpos');
        p.onopened = function(info){
            // document.getElementById('playMode').value = 'Normal Mode';
            // var fi = document.getElementById('fileInfo');
            seekBar.setAttribute('title', 'Size: ' + hi5.tool.bytesToSize(info.size) + ', Video length: ' + (info.length / (1000 * 60)).toFixed(2) + ' minutes');
            // document.getElementById('seekbar').style.width = info.width + 'px';
            var elm = document.getElementById('openFile');
            if (elm){
                elm.style.display = 'none';
            }
    
            elm = document.getElementById('sessionZone');
            elm.style.display = 'block';
            
            elm = document.getElementById('video-controls');
            if (elm){
                elm.style.display = 'none';
            }
    
            elm = document.getElementById('sv_pl_play');
            if (elm){
                elm.setAttribute('data-state', 'pause');
            }
        };
        p.onprogress = function(played, total){
            seekBar.value = (played / total * 100); 
        };
        
        var displayTimeout = 0;
        document.addEventListener('click', function(){
            var elm = document.getElementById('video-controls');
            if (elm){
                elm.style.display = 'block';
                clearTimeout(displayTimeout);
                displayTimeout = setTimeout(function(){
                    elm.style.display = 'none';
                }, 8000);
            }
            
        }, false);
    }
    
    function broadcast(file, playtype){
        var protocol = ('https:' == location.protocol) ? 'wss://' : 'ws://';
        var gateway = window.location.host;
        if (gateway.length < 1) gateway = 'localhost';
        var url = protocol + gateway + '/PLAY?f=' + file;
        if (player){
            player.close();
        }

        if(playtype=="RDP"){
               player = new Rdp(url);
           }else if(playtype=="VNC"){
                player = new svGlobal.Vnc(url);
        }else if(playtype=="SSH"){
                player = new svGlobal.SSH(url);
        }else{
              player = new svGlobal.TELNET(url);
          }
        initPlayer(player);
        var surface = new svGlobal.LocalInterface();
        surface.scaleTo(800, 600);
        player.addSurface(surface);
        player.run();
    }
    

    var elm = document.getElementById('sv_pl_play');
    elm.addEventListener('click', function(e){
        if (!player) return;
        var state = e.target.getAttribute('data-state');
        if (state == 'pause'){
            player.pause();
            e.target.setAttribute('data-state', 'play');
        }else{
            player.play();
            e.target.setAttribute('data-state', 'pause');
        }
    }, false);

    elm = document.getElementById('sv_pl_stop');
    elm.addEventListener('click', function(){
        if (!player) return;
        player.close();
        initState();
    }, false);

    seekBar.addEventListener('click', function(e){
        if (!player) return;
        var pos = (e.pageX  - (this.offsetLeft + this.offsetParent.offsetLeft)) / this.offsetWidth * 100;
        console.log('pos:' + pos);
        player.seek(pos);
    }, false);

    elm = document.getElementById('sv_pl_scan');
    elm.addEventListener('click', function(e){
        if (!player) return;
        var state = e.target.getAttribute('data-state');
        if (state == 'scanmode'){
            player.scan(true);
            e.target.setAttribute('data-state', 'normalmode');
            e.target.setAttribute('title', 'Normal Mode');
        }else{
            player.scan(false);
            e.target.setAttribute('data-state', 'scanmode');
            e.target.setAttribute('title', 'Scan Mode');
        }
    }, false);

    elm = document.getElementById('sv_pl_mute');
    elm.addEventListener('click', function(e){
        if (!player) return;
        var state = e.target.getAttribute('data-state');
        if (state == 'mute'){
            player.setVolume(0);
            e.target.setAttribute('data-state', 'unmute');
        }else{
            player.setVolume(1);
            e.target.setAttribute('data-state', 'mute');
        }
    }, false);
    


    var q = location.search;
    if (!q){
        return;
    }
    q = q.substring(1);

    var args = hi5.tool.queryToObj(q);
    var file = args.file;
    if (!file){
        return;
    }
    
    var type = args.type;
    if (!type){
        var idx = file.lastIndexOf('.');
        if (idx){
            type = file.substring(idx + 1);
            type = type.substring(0, type.length - 1).toUpperCase();
            if (!type){
                type = 'RDP';
            }
        }
    }

    broadcast(file, type);

}, false);

