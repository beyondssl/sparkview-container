function Gateway(addr){
	if (typeof addr == "undefined"){
		addr = window.location.host;
		if (addr.length < 1) addr = "localhost";
	}
	this.connected = false;
	self = this;
	var callbacks = {};
	var W = window.WebSocket || window.MozWebSocket;
	var p = ("https:" == location.protocol) ? "wss://" : "ws://";
	var wsAddr = p + addr +  "/GATEWAY";
	console.log("connecting to:" + addr);
	var ws = new W(wsAddr);
	ws.onmessage = processMsg;
	ws.onclose = function(e){
		self.connected = false;
		console.log("closed.");
	};
	var cache = [];
	
	function getRandom(){
		return "CB" + Math.floor(Math.random()*10000);
	}
	
	function pushCallback(callback){
		var random = "";
		if (callback){
			random = getRandom();
			callbacks[random] = callback;
		}
		return random;
	}
	
	function popCallback(args){
		var random = args.callback;
		if (!random) return null;

		delete args.callback;

		var cb = callbacks[random];
		if (!cb) return null;

		delete callbacks[random];
		
		cb(args);

		return cb;
	}
	
	function logResult(obj, header){
		if (obj.error){
			console.log("Error on" + header + ": " + obj.error);
			return;
		}
		console.log(header);
		console.log(obj);
	}

	
	ws.onopen = function(){
		self.connected = true;
		
		while(cache.length > 0){
			ws.send(cache.shift());
		}
	};
	
	function processMsg(e){
		var text = e.data;
		var type = parseInt(text.substring(0, 2), 16);
		var value = text.substring(2);
		switch (type){
		case 0x11:
			processResult(value, "report");
			break;
		case 0x15:
			processResult(value, "license");
			break;
		default:
			processResult(value, "unknown");
		}
	}
	

	function processResult(v, tag){
		var obj = JSON.parse(v);
		
		if (popCallback(obj) == null){
			logResult(obj, tag);
		}
	}
	
	function exeCommand(cmd){
		if (self.connected){
			ws.send(cmd);
		}else{
			cache.push(cmd);
		}
	}
	
	this.report = function(callback){
		var random = pushCallback(callback);
		exeCommand("10" + random); 
	};
	
	this.checkLicense = function(callback){
		var random = pushCallback(callback);
		exeCommand("14" + random);
	};
	
	this.close = function(){
		ws.close();
	};
	
	this.login = function(pwd, hashed){
		exeCommand((hashed ? "16" : "12") + pwd);
	};
	
}
