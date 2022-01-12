const FULL_LOAD = 0;
const UPDATE = 1;

var sessionCardsByID = new Map();

var wsChannel;

function init() {
	createChannel();

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

function createChannel() {
	wsChannel = new WsChannel();    
    wsChannel.initialize();
}

function WsChannel() {
    var _self = this;
	var ws;
    var isConnected = false;

    this.initialize = function() {
        var protocol = ('https:' == location.protocol) ? 'wss://' : 'ws://';
		var url = protocol + location.hostname + "/DASHBOARD"
                
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
            console.log("Spark Stream Server closed the connection.");
            
			if (ws) {
				ws = null;
				if (isConnected) {
					console.log('Lost connection to Spark Stream Server. Plase make sure the server is running.');
				} else {
					console.log('Spark Stream Server is disconencted. Plase make sure the server is running.');
				}
            }
            isConnected = false;
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
                        var sid = dataBuf.getUnicodeString(sidLen, false);
                        var unLen = dataBuf.getLittleEndian32();
                        var userName = dataBuf.getUnicodeString(unLen, false);
                        var thumbnailWidth = dataBuf.getLittleEndian32();
                        var thumbnailLen = dataBuf.getLittleEndian32();
                        var thumbnail = dataBuf.getAscllString(thumbnailLen, false); 

                        thumbnail.replace(/[\n\r]/g, '');
        
                        // console.debug("==== Session[" + i + "]:\n" + 
                        //         "protocolType=" + protocolTypeStr +
                        //         ", startTime=" + startTimeStr +
                        //         ", sessionId=" + sid +
                        //         ", userName=" + userName +
                        //         ", thumbnailWidth=" + thumbnailWidth +
                        //         ", thumbnailLen=" + thumbnailLen);                                
                    
                        
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
                            gridColEle = _self.createCard(sid, thumbnailWidth, thumbnail, protocolTypeStr, startTime, startTimeStr, userName);

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
                    var sid = dataBuf.getUnicodeString(sidLen, false);
                    // console.log("==== remove thumbnail of session id \"" + sid + "\".");
                    
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
        } else {
            console.log("Received empty data. Ignore.");
        }
    }; 

    this.createCard = function(sid, thumbnailWidth, thumbnail, protocolTypeStr, startTime, startTimeStr, userName) {
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

        imgDivEle.appendChild(imgEle);

        var detailDivEle = document.createElement("div");
        detailDivEle.className = "detailDiv";

        var detailEle = document.createElement("p");
        detailEle.className = "cardDetail";
        detailEle.innerHTML = 
                    "<b>Session ID: </b>" + sid + "<br />" +
                    "<b>Protocol Type: </b>" + protocolTypeStr + "<br />" +
                    "<b>Start Time: </b>" + startTimeStr + "<br />" +
                    "<b>User Name: </b>" + userName;

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