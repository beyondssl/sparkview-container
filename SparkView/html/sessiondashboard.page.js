const FULL_LOAD = 0;
const UPDATE = 1;

var sessionCardsByID = new Map();

var wsChannel;

function init() {
    var md5password = "21232F297A57A5A743894A0E4A801FC3";
	createChannel(md5password);

    refreshCount();
}

function refreshCount(delta) {    
    if (sessionCardsByID.size == 0) {
        document.getElementById("sessionCount").innerHTML = "no session found";
    } else {
        var displayedSessionCount = sessionCardsByID.size;
        if (delta) {
            displayedSessionCount -= delta;
            if (displayedSessionCount < 0) {
                displayedSessionCount = 0;
            }
        }
        
        if (displayedSessionCount == 0) {
            document.getElementById("sessionCount").innerHTML = "no session found";
        } else if (displayedSessionCount == 1) {
            document.getElementById("sessionCount").innerHTML = "1 session found";
        } else {
            document.getElementById("sessionCount").innerHTML = displayedSessionCount + " sessions found";
        }
    }
}

function createChannel(password) {
	wsChannel = new WsChannel();    
    wsChannel.initialize(password);
}

function WsChannel() {
    var _self = this;
	var ws;
    var isConnected = false;

    this.initialize = function(password) {
        var protocol = ('https:' == location.protocol) ? 'wss://' : 'ws://';
		var url = protocol + location.hostname + "/DASHBOARD?gatewayPwd=" + password + "&fields=" + encodeURIComponent("mapClipboard,mapDisk");
                
        ws = new WebSocket(url);
		ws.binaryType = "arraybuffer";
		
		ws.onopen = function() {
			isConnected = true;
		};
	
		ws.onmessage = function(e) { 
			// Received data (a byte array) from SparkGatewayAgent
			try {
				_self.dataReceived(e.data);
			} catch (err) {
				console.log(err);
			}
		};
	
		ws.onclose = function() {
            hi5.notifications.notify("Connection was closed.");
            
			if (ws) {
				ws = null;
				if (isConnected) {
					console.log('Lost connection to Spark Stream Server. Plase make sure the server is running.');
				} else {
					console.log('Spark Stream Server is disconencted. Plase make sure the server is running.');
				}
            }
            isConnected = false;

            var gridEle = document.getElementById("grid");
            while (gridEle.firstChild){
                gridEle.removeChild(gridEle.firstChild);
            }
		};
	
		ws.onerror = function(evt) {
			console.log("Websocket error observed: " + evt)
			if (ws) {
				ws.close();
			}
        };        
    };

    this.isConnected = function() {
		return isConnected;
    };

    this.sendMsg = function(data) {
		if (isConnected && ws && ws.readyState == ws.OPEN) {
			ws.send(data);
		} else {
			console.log('Error: failed to send data through websocket with state: ' + ws.readyState);
		}
    };
    
    /**
     * The received session information data from gateway.
     * @param {*} data the TypedArray received from the gateway through websocket
     */
    this.dataReceived = function(data) {        
		if (data.byteLength) {
            data = new Uint8Array(data);
            var dataBuf = new hi5.DataBuffer(data);

            var operation = dataBuf.getLittleEndian16();

            switch (operation) {
                case 0x00:          // Add or update thumbnail
                    var sessionCount = dataBuf.getLittleEndian32();
        
                    var i;
                    for (i = 0; i < sessionCount; i++) {
                        var protocolType = dataBuf.getLittleEndian16();
                        var protocolTypeStr = getProtocolTypeStr(protocolType);
                        var startTime = dataBuf.getUnsignedLittleEndian64();
                        var startDate = new Date(startTime);
                        var startTimeStr = startDate.toLocaleString("en-CA", {hour12: false});
                        var sidLen = dataBuf.getLittleEndian32();
                        var sid = dataBuf.getAsciiString(sidLen, false);
                        var joinLen = dataBuf.getLittleEndian32();
                        var joinedSID = (joinLen > 0) ? dataBuf.getAsciiString(joinLen, false) : '';
                        var unLen = dataBuf.getLittleEndian32();
                        var userName = dataBuf.getUnicodeString(unLen, false);
                        var thumbnailWidth = dataBuf.getLittleEndian32();
                        var thumbnailLen = dataBuf.getLittleEndian32();
                        var thumbnail = 'computer.png';
                        if (thumbnailLen > 0) {
                            thumbnail = dataBuf.getAscllString(thumbnailLen, false); 
                            thumbnail.replace(/[\n\r]/g, '');
                        }

                        var ipLen = dataBuf.getLittleEndian32();
                        var ip = "N/A";
                        if (ipLen > 0){
                            ip = dataBuf.getAsciiString(ipLen, false);
                        }

                        var userAgentLen = dataBuf.getLittleEndian32();
                        var userAgent = "N/A";
                        if (userAgentLen > 0){
                            userAgent = dataBuf.getAsciiString(userAgentLen, false);
                        }
                        
                        //extra fields if websocekt url includes the fields parameter
                        var fields = "";
                        while (dataBuf.has(4)){
                            var lenField = dataBuf.getLittleEndian32();
                            if (fields){
                                fields += ";";
                            }
                            fields += dataBuf.getUnicodeString(lenField, false);
                            // console.log("extra field:" + fields);
                        }
                        
                        var gridColEle;
                        var existingCard = document.getElementById(sid);

                        if (existingCard) {
                            gridColEle = existingCard.parentNode;

                            // Update the image of the existing session card
                            var imgEles = existingCard.getElementsByTagName("img");
                            if (imgEles && imgEles.length > 0) {
                                var imgEle = imgEles[0];
                                imgEle.src = thumbnail;
                            } else {
                                console.warn("Image element is not found, create new one");
                                
                                var imgDivEle = document.createElement("div");
                                imgDivEle.className = "imgDiv";

                                var imgEle = document.createElement("img");
                                imgEle.className = "cardImg";
                                imgEle.style.width = thumbnailWidth + "px";

                                imgEle.src = thumbnail;

                                imgDivEle.appendChild(imgEle);
                                
                                existingCard.appendChild(imgDivEle);
                            }
                        } else {
                            // Append a new session card
                            gridColEle = _self.createCard(sid, thumbnailWidth, thumbnail, protocolTypeStr, startTime, startTimeStr, userName, joinedSID, ip, userAgent, fields);

                            reshuffle();
                        }

                        // keep the session id
                        if (!sessionCardsByID.has(sid)) {
                            sessionCardsByID.set(sid, gridColEle);
                        }
                    }

                    refreshCount();

                    break;

                case 0x01:          // Remove thumbnail
                    var sidLen = dataBuf.getLittleEndian32();
                    var sid = dataBuf.getAsciiString(sidLen, false);
                    // console.log("==== remove thumbnail of session id \"" + sid + "\".");
                    var loggedin = dataBuf.getByte() == 1;
                    var statusCode = dataBuf.getLittleEndian32();
                    var status = "";
                    switch (statusCode){
                        case 0:
                            status = "Unknown";  
                            break;
                        case 1:
                            status = "Connected";
                            break;
                        case 2:
                            status = "User disconnected";
                            break;
                        case 3:
                            status = "Server disconnected";
                            break;
                        case 4:
                            status = "Log off";
                            break;
                        default:
                            status = "Invalid status " + statusCode;
                            break;
                    }

                    hi5.notifications.notify("Session " + sid + "disconnected, loggedin: " + loggedin + " connection status: " + status);
                    
                    // remove the element
                    var cardEle = document.getElementById(sid);
                    if (cardEle) {
                        cardEle.parentElement.remove();     // remove the gridColEle

                        reshuffle();
                    }
                    
                    // remove sid from the session ID array
                    if (sessionCardsByID.has(sid)) {
                        sessionCardsByID.delete(sid);
                    }

                    refreshCount();

                    break;

                default:
                    console.debug("Unknown session information operation code [" + operation + "], ignored.");
            }
        } else {//text data
            var type = parseInt(data.substring(0, 2), 16);
            var value = data.substring(2);
            switch (type) {
                case 0x1A: processMsg(value); break;
                default: hi5.notifications.notify('Invalid output:' + data);
            }
        }
    }; 

    function processMsg(value) {
        var message = JSON.parse(value);
        
        if (!isNaN(message.name)){//if it's number
            message.name = 'S' + message.name;
        }
    
        var msg = __svi18n.errorCode[message.name];
    
        hi5.notifications.notify(msg);
    }
    
    this.createCard = function(sid, thumbnailWidth, thumbnail, protocolTypeStr, startTime, startTimeStr, userName, joinedSID, ip, userAgent, fields) {
        var gridEle = document.getElementById("grid");
        
        var gridColEle = document.createElement("div");
        gridColEle.className = "grid-view col";
        gridColEle.sid = sid;
        gridColEle.type = protocolTypeStr;
        gridColEle.startTime = startTime;
        gridColEle.userName = userName;

        
        var newCard = document.createElement("div");
        newCard.className = "card";
        newCard.id = sid;
        // newCard.style.maxWidth = thumbnailWidth + "px";
        // newCard.style.minWidth = thumbnailWidth + "px";

        var imgDivEle = document.createElement("div");
        imgDivEle.className = "imgDiv";

        var imgEle = document.createElement("img");
        imgEle.className = "cardImg";
        // imgEle.style.width = thumbnailWidth + "px";

        // var arrayBufferView = new Uint8Array(thumbnailBytes);
        // var blob = new Blob([arrayBufferView], {type: "image/jpeg"});
        // var urlCreator = window.URL || window.webkitURL;
        // var imageUrl = urlCreator.createObjectURL(blob);                            
        // imgEle.src = imageUrl;

        imgEle.src = thumbnail;
        imgEle.onclick = function(){
            var join = 'join';
			switch (protocolTypeStr){
			case 'RFB': join = 'joinvnc'; break;
			case 'SSH': join = 'joinssh'; break;
			case 'TELNET': join = 'jointelnet'; break;
			}
			
			var url = location.protocol + '//' + location.hostname + '/' + join + '.html?id=' + sid;
			window.open(url);
        }

        imgDivEle.appendChild(imgEle);

        var detailDivEle = document.createElement("div");
        detailDivEle.className = "detailDiv";

        var detailEle = document.createElement("p");
        detailEle.className = "cardDetail";
        detailEle.innerHTML = 
                    "<b>Session ID: </b>" + sid + "" +
                    "<br/><b>Protocol Type: </b>" + protocolTypeStr +
                    "<br/><b>Start Time: </b>" + startTimeStr +
                    "<br/><b>User Name: </b>" + userName +
                    "<br/><b>Joined: </b>" + joinedSID +
                    "<br/><b>IP: </b>" + ip +
                    "<br/><b>UserAgent: </b>" + userAgent + 
                    "<br/><b>Extra:</b>" + fields;

        detailDivEle.appendChild(detailEle);
        
        newCard.appendChild(imgDivEle);
        newCard.appendChild(detailDivEle);

        gridColEle.appendChild(newCard);

        gridEle.appendChild(gridColEle);

        return gridColEle;
    };
};

function filter(event) {
    if (event.key === 'Enter') {        
        var inputEle = event.srcElement || event.target;
        var filterText = inputEle.value;

        if (filterText) {
            var gridEle = document.getElementById("grid");
            gridEle.innerHTML = "";

            for (let [k, cardNode] of sessionCardsByID) {
                gridEle.appendChild(cardNode);
            }

            var toFilterNodes = gridEle.children;
        
            var delta = 0;
            for (var i = toFilterNodes.length - 1; i >= 0; i--) {
                var cardNode = toFilterNodes[i];
                if (!cardNode.userName.toLowerCase().includes(filterText.toLowerCase())
                    && !cardNode.type.toLowerCase().includes(filterText.toLowerCase())
                    && !cardNode.sid.toLowerCase().includes(filterText.toLowerCase())) {
                        cardNode.remove();
                        delta++;
                }
            }

            refreshCount(delta);
        } else {
            location.reload();
        }
    }
}

function reshuffle() {
    var gridEle = document.getElementById("grid");
    var toSortNodes = gridEle.children;
    var toSortArray = Array.prototype.slice.call(toSortNodes, 0);

    var selectEle = document.getElementById("sorter");
    var selectVal = selectEle.value.replace(/^\[\'|\'\]$/g,'').split("', '");

    var sortField = selectVal[0];

    if (sortField) {
        var sortOrder = selectVal[1];

        switch (sortField) {
            case "type":
                toSortArray.sort(function(a, b) {
                    return (sortOrder == "asc") ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
                });

                break;
            
            case "name":
                toSortArray.sort(function(a, b) {
                    return (sortOrder == "asc") ? a.userName.localeCompare(b.userName) : b.userName.localeCompare(a.userName);
                });

                break;

            case "time":
                toSortArray.sort(function(a, b) {
                    return (sortOrder == "asc") ? a.startTime - b.startTime : b.startTime - a.startTime;
                });

                break;

            default:
                console.warn("Unknown sorting field: " + sortField);
        }

        gridEle.innerHTML = "";

        for (var i = 0, l = toSortArray.length; i < l; i++) {
            gridEle.appendChild(toSortArray[i]);
        }
    }
}

function getProtocolTypeStr(protocolType) {
    switch (protocolType) {
        case 0:
            return "RDP";
        case 1:
            return "VNC";
        case 2:
            return "SSH";
        case 3:
            return "TELNET";
        case 4:
            return "FILE";
        case 5:
            return "MEDIA";
        default:
            return "Unknown";
    }
}

window.addEventListener('load', init, false);