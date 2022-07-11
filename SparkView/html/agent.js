
/**
 * @param r : Rdp object 
 */
function startGatewayAgent(r){
    var isSSL = r.protocol == 'wss';

    function startAgent(r, url){
        var downloadRef = document.getElementById('agentSetup');
        downloadRef.href = r.getAgentLink();

        function continueOnError(){
            r.onagentmessage = function(data) {};//let r.run() know it's handled.
            r.run();
        }

        var sgAgentElm = document.getElementById('sgAgentInfo');
        if (!sgAgentElm){
            continueOnError();
            return;
        }

        var legacy = document.getElementById('legacyAgentInfo');
        if (legacy){
            legacy.style.display = 'none';
        }

        function onAgentClose() {
            connectAgent(r, 8095);            
        };


        function showAgentDlg(fnClose){
            var sgAgentDlg = new hi5.ui.Lightbox(sgAgentElm);
            sgAgentDlg.show();
            sgAgentDlg.onclose = fnClose;
            var btnContinue = document.getElementById('btnAgentContinue');
            if (btnContinue){
                btnContinue.onclick = function(){
                    sgAgentDlg.dismiss();
                }
            }
        }

        var url = (hi5.appcfg.agent && hi5.appcfg.agent.scheme) || 'sparkagent';
        url += '://none';
        if (isSSL){
            url += '?scheme=https';
        }
        hi5.browser.launchApp(url, 
            function(){//sucess
                svGlobal.logger.info("Agent launched");
                onAgentClose();
            }, 
            function(){//error
                svGlobal.logger.info("Agent not installed");
                showAgentDlg(function(){
                    hi5.browser.launchApp(url, 
                        function(){//sucess
                            onAgentClose();
                        }, 
                        function(){//error
                            svGlobal.logger.warn("Failed to launch the agent, continue");
                            continueOnError();
                        }
                    );
                });
            }
        );
    }
 
    function connectAgent(r, port){
        // Connect to agent directly(HTTP or agent has root a trusted certificate).
        var url = (isSSL ? "wss" : "ws") + "://localhost:" + port;
        var _connected = false;

        var ws = new WebSocket(url);
        ws.binaryType = "arraybuffer";
        
        r.onagentmessage = function(data){
            // Received message from the gateway channel and send it to SparkGateway Agent
            if (ws && ws.readyState == ws.OPEN) {
                ws.send(data);
            } else {
                svGlobal.logger.warn('xxxx: ' + ws.readyState);
            }
        };

        ws.onopen = function() {
            _connected = true;
            svGlobal.logger.info("connected to the agent on " + this.url);

            if (!r.hasScanner() && !r.running()) {//// With scanner, rdp should be connected after the user selects the preferred DS
                r.run();
            }

            var versionReq = new Uint8Array(2);
            versionReq[0] = 5;
            versionReq[1] = 1;
            ws.send(versionReq);

            if (r.hasScanner()) {
                var hs = new Uint8Array(2);
                hs[0] = 04;
                hs[1] = 01;
                
                ws.send(hs);
            }
        };
    
        ws.onmessage = function (e) { 
            // Received data (a byte array) from SparkGateway Agent
            if (r) {
                r.writeAgent(e.data);
            }
        };
    
        ws.onclose = function () {
            if (r) {
                r.onagentmessage = null;
            }
            if (ws){
                ws = null;
                if (!_connected) {
                    if (port >= 8097){//last try (8095-8097)
                        hi5.notifications.notify('Failed to connect to the Agent. Plase make sure the Agent is running. Local hardware redirection will be disabled.');
                    }else{
                        svGlobal.logger.info('Failed to connect to the agent on port ' + port);
                        connectAgent(r, port + 1);
                    }
                } else {
                    hi5.notifications.notify('Agent was disconencted. Plase make sure the Agent is running. Local hardware redirection will be disabled.');
                }
            }
        };
    
        ws.onerror = function (evt) {
            svGlobal.logger.warn("Error", evt);
            if (ws) {
                ws.close();
            }

            if (!r.hasScanner() && !r.running()) {//// With scanner, rdp should be connected after the user selects the preferred DS
                r.run();
            }
        };

    }


    svGlobal.logger.info('Starting agent, ssl:' + isSSL);
    //check if agent is already running
    var host = (isSSL ? "wss" : "ws") + "://localhost"
    var wsAddrs = [host + ":8095", host + ":8096", host + ":8097"];
    hi5.tool.scanAnyGood(wsAddrs, 
        function(url){
            svGlobal.logger.info("agent is already running on " + url);
            var idx = url.lastIndexOf(":") + 1;
            var port = parseInt(url.substring(idx));
            connectAgent(r, port);
        }, 
        function(){
            svGlobal.logger.info("agent is not running, start..");
            startAgent(r);
        }
    );

}
