//You don't even need this file if you don't want to change the default values
var hi5 = hi5 || {};
//hi5.libPath = '';//Configure this libPath (raltive path to your web server root) if the Spark View JavaScript libraray is not in the same directory as the web page.
hi5.appcfg = {
//		displayMsg: false,//If display error or warning message, default is true
//		appTimeout: 800,//Close the RemoteApp if no Windows found after this period, default is 800 ms.
//		reconnectOnResize: false,//If reconnect when resize the browser window, default is true
//		reconnectTimes: 2,//Automatically reconnecting time, default 0.
//		windowState: 0,//state of RemoteApp main window, 3: always maximized, 0: controlled by user, default is 3
//		openLink: false,//if show the link button when user copy a link in remote computer, default is true
//		setTitle: false,//set server name as title, default is true
//		audioBuffer: 2, //delay(seconds) for audio buffering, default is 0
//		useWSS: true,//force use websocket secure connection or not
//		remoteAppLogin:false,//display RemoteApp login details, default is true, deprecated, please use hideLogin instead
//		hideLogin: true, //hide login procedure, default is false
//		noPrintPreview: true,//don't display print view (PDF) dialog, only work on Chrome, default is false
//		printInNewTab: true,//Open print dialog in  new tab/window
//		autoScale: false,//auto scale window when in join and player modes, default is true.
//		domain:'defaultdomain',//default domain name
//		hiddenDomain: true,//Don't display the default domain name to user.
//		numlock: true, //enable numlock
		params: 'url',//using url to transfer parameters, you can also choose 'cookie' or 'object', please check manual section 4.2.3
//      defaultPort: 20010,
//		copyDialog: true,//using dialog to inform user when copying instead of writing local clipboard directly, default is false
//      closeOnDisconn: false,//close popup window if RDP sessin get disconnected, default is true
//      disableJoinedAppResize: true,//Disable remoteapp window resizing on joined sessions, default is false
//		disableScrollbars: false, //Disable browser scrollbars, default is true
//		disableDVC: true,
		wsPost: true,
//       startup:{//start up a server or remoteapp automatically after login.
//       	server: "",//if server is "" or not found, the first one will be opened instead.
//       	newWindow: false //if open in new window
//       },
//      existingFile: "replace", //replace, rename (default) when uploading,
//		noConnected: true,//don't show connected computers to the user (for the drop list on rdp.html)
//		joinCloseMode: 1,//1: keep joined sessions open after main session is closed. 0 (default): closed joined sessions too if main session is closed
//		clearScreen: false,//if clear screen after session is disconnected, default is true,
//    	pingInterval: 5,
//      useImageCursor: true,
//      disableCursor: true,
//		disableAdjust: true,
//		disableDVC: true,
//		noMinimize: false,
		// directClipAccess: true,
//		disableMaxFullScn: true,
		//  directClipAccess: true,
//		enableTSMF: true,
//		noCursorName: true,
		// noMinimize: false,
		// disableShortcuts: true,
		// copyTextOnly: true,
		//detectInput: true,
//		useWorker: false,
		// loadbalanceTokenName: 'token',
		// disableClickEffect: true,
		// detectNetwork: true, //Detect network automatically.
		//closeRemoteApp: true, //try close all remoteapps too when session is closed.
		ssh: {
			theme: 'light',
		},
		img: {
//			close: 'close.png',
//			cloud: 'cloud.png',
//			del: 'del.png',
//			download: 'download.png',
//			info: 'info.png',
//			kbd: 'kbd.png',
//			ok: 'ok.png',
//			shadowing: 'info.png',
//			view: 'view.png',
//			link: 'link.png',//img for copied link
//			copy: 'copy.png'//img for copy dialog
		},
		toolbar: {fadable: true, draggable: true},
		page:{
//		    join: 'join.html',
//          joinvnc: 'joinvnc.html',	    
//		    rail: 'rail.html'
		}
};
