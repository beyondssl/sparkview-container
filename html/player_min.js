svGlobal.Player=function(l){function D(){d=m=h=0;p=a=null;n=!1;b.state=b.CLOSED;d=m=h=0;p=a=null;n=!1}function v(b,c){return(b[c]&255)<<24|(b[c+1]&255)<<16|(b[c+2]&255)<<8|b[c+3]&255}function G(){m+=w;b.onprogress(m,h)}function H(e,c){if(b.state!=b.PLAYING)d-=8;else{var f=e.target.result,k=function(){x&&(clearInterval(x),x=0);if(b.onprogress)b.onprogress(c,h);m=c;if(b.state==b.PLAYING){d+=f.byteLength;if(y)b.onmessage({data:f.slice(2)});else b.onmessage({data:f});q(8,z)}else d-=8};if(b.state==b.PLAYING){var g=
n?0:c-m;if(10>g||0==m)g=0;n&&0<r&&c>=r&&(a.getDesktop&&a.getDesktop().pause(!1),n=!1,r=0);0<g?p=setTimeout(k,g):k();g>3*w&&(x=setInterval(G,w))}}}function z(a){if(b.state==b.PLAYING){var c=new Int8Array(a.target.result);if(c&&8==c.length){a=v(c,0);var e=v(c,4);0>e&&(console.error("Duration:"+e),e=0);c=function(b){E=e;H(b,e)};b.state==b.PLAYING&&(d+=8,q(a,c))}else{if(b.onprogress)b.onprogress(h,h);b.close()}}}function F(e){var c=new Int8Array(e.target.result);t=String.fromCharCode(c[0],c[1],c[2],c[3]);
e=(c[4]&255)<<8|c[5]&255;var f=(c[6]&255)<<8|c[7]&255,k=(c[8]&255)<<8|c[9]&255,g=c[10]&255;m=0;h=v(c,19)<<32|v(c,23);console.log("total time:"+h+" type:"+t+" width:"+f+" height:"+k+" color:"+g);if(f&&k){w=h/100|0;if(a&&a.running())a.resetStatus&&a.resetStatus();else if("RDPV"==t)(c=svManager.getInstance())&&c.close(),a=new svGlobal.Rdp(b,f,k,g),a.displayMsg=!1,a.setTitle=!1,a.addSurface(l),a.run();else if("VNCV"==t)(c=svManager.getInstance())&&c.close(),a=new svGlobal.Vnc(b,f,k,g),a.displayMsg=!1,
a.setTitle=!1,a.addSurface(l),a.run();else if("SSHV"==t)y=!0,(c=svManager.getInstance())&&c.close(),a=new svGlobal.SSH(b,f,k,g),a.displayMsg=!1,a.setTitle=!1,a.addSurface(l),a.run();else if("TELV"==t)y=!0,(c=svManager.getInstance())&&c.close(),a=new svGlobal.TELNET(b,f,k,g),a.displayMsg=!1,a.setTitle=!1,a.addSurface(l),a.run();else{hi5.notifications.notify("Invalid format!");return}if(b.onopen)b.onopen();if(b.onopened)b.onopened({width:f,height:k,color:g,version:e,length:h,size:A.size});d=64;0<r&&
a.getDesktop&&a.getDesktop().pause(!0);q(8,z)}else hi5.notifications.notify("Invalid resolution, width:"+f+" height:"+k)}function q(a,c){if(b.state!=b.PLAYING){if(8==a)return;d-=8}if(B){var e=A.slice(d,d+a);u=new FileReader;u.onload=c;u.readAsArrayBuffer(e)}else d=0,B=!0,q(64,F)}var b=this,d=0,m=0,h=0,w=0,x=0,A=null,p=null,a=null,u=null,n=!1,C=!1,r=0,t="",y=!1;this.PLAYING=0;this.PAUSED=1;this.CLOSED=3;var E=0;this.state=this.CLOSED;var B=!0;l||(l=new svGlobal.LocalInterface);l.setReadOnly(!0);l.hideWhenClose=
!1;this.getSurface=function(){return l};this.close=function(){console.log("Player closed");try{if(b.onclose&&(b.onclose({code:0,reason:""}),b.onclose=null),a&&(a.close(),a=null),b.onend)b.onend()}finally{D()}};this.setSource=function(a){if(u){try{u.abort()}catch(c){}u=null}b.state==b.PLAYING?(b.state=b.CLOSED,C=!0,p&&(clearTimeout(p),p=null),b.close()):(D(),C=!1);if(a){if(!("slice"in a||(a.slice=a.webkitSlice||a.mozSlice,"slice"in a))){alert(__svi18n.file.slice);return}A=a}else alert(__svi18n.player.noinput)};
this.send=function(){};this.play=function(){b.state=b.PLAYING;if(0==d){var a=function(){d=0;q(64,F)};C?setTimeout(a,888):a()}else q(8,z)};this.scan=function(a){n=a};this.pause=function(){b.state=b.PAUSED};this.seek=function(b){a&&(n=!0,a.getDesktop&&a.getDesktop().pause(!0),r=parseInt(h*b/100),r<E&&(B=!1))};this.setVolume=function(b){a&&a.setVolume&&a.setVolume(b)}};svGlobal.RdpPlayer=svGlobal.Player;
