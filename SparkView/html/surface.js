"use strict";
var svGlobal = svGlobal || {
    logger: new hi5.Logger(),
    util: {}
};

svGlobal.version = '6.1.0';
svGlobal.build = '1012';



function cancelDefault(e) {
    if (e.preventDefault)
        e.preventDefault();
    if (e.stopPropagation)
        e.stopPropagation();
    return false;
}

function LocalInterface(_canvas, ui_option) {
    if (!_canvas) {
        _canvas = hi5.$('remotectrl');
    }

    if (!ui_option){
        ui_option = {};
    }

    // if (!ui_option.fileContainer)
    //     ui_option.fileContainer = hi5.$('filecontainer');
    // };
    if (!ui_option.pcKey){
        ui_option.pcKey = hi5.$('pc_key');
    }
    if (!ui_option.toolbar){
        ui_option.toolbar = hi5.$('svToolbar');
    }

    // if (!ui_option.appInfo){
    //     ui_option.appInfo = hi5.$('appinfo');
    // }

    // if (!ui_option.tmContainer){
    //     ui_option.tmContainer = hi5.$('tmContainer');
    // }

    if (!ui_option.frmLogin){
        ui_option.frmLogin = hi5.$('frmLogin');
    }

    var notifications = ui_option.notifications || hi5.notifications;


    if (window.svSurface && svSurface.canvas == _canvas && svSurface.railWin) {
        svSurface.railWin.mainWin = null;
        return window.svSurface;
    }
    var _browser = hi5.browser;
    var isTouch = _browser.isTouch;
    var _queryChild = _browser.getChildByNameOrId;
    var controller = null, autoScale = false, mScale = 1, mScaleY = 1, scaleWidth = 0, scaleHeight = 0, ignoreAspectRatio = false;
    _canvas.style.outline = 'none';
    var widthFace = 0, heightFace = 0, caretX = 0, caretY = 0;
    //http://blogs.adobe.com/webplatform/2014/04/01/new-canvas-features/
    var ctxRdp = _canvas.getContext('2d', {alpha: true}), keyboard = null, touchKeyboard = null;//, fastCopy = false;
    var ctrlDown = false, altDown = false, shiftDown = false;
    var byMe = false, clipSynced = false, fileHandler = null, useClipboard = true, copyToLocal = false, copyToRemote = false, ctrlcSent = false, ctrlvDown = false, lastCopyTime = 0;
    this.context = ctxRdp;
    this.fileProgress = null;
    this.blurTime = 0;
    this.focusTime = 0;
    var myLI = this;
    var allowInput = true, _touchpad = false, playerMode = false, allowMouseMove = true;
    var touchDiv = null, timeoutId = null, fileDlg = null, imgCursor = null, currCursor = null, touchHandler = null;
    var touchInput = null, touchInputing = 0;
    var priorX = -1, priorY = -1, priorOffX = 0, priorOffY = 0, isMoved = false, _overflow = null;
    var _mousePos = {x: 0, y: 0, offX: 0, offY: 0, left: 0, top: 0, right: 0, bottom: 0, primary: false, isMultiMon: false, btnDown: -1, mouseDown: []};
    var _dropZoneFull = null, _dropZoneDlg = null, _prePaint = 0, __draw, _running = false, _feature = 0, _animationId = 0, forceKeyboard = false;
    var _pointMgr = null;
    //    var _devicePixelRatio = window.devicePixelRatio || 1;
    this._cr = [82, 69, 77, 79, 84, 69, 83, 80, 65, 82, 75];//copyright remotespark

    window.svSurface = this;

    if (!hi5.appcfg){
		hi5.appcfg = {img:{}, toolbar:{fadable:true}, displayMsg: true};
	}

    var appcfg = hi5.appcfg;
    
    if (appcfg.toolbar.draggable == undefined) {
        appcfg.toolbar.draggable = true;
    }
    //Out of iframe mouse up event can not be captured if preventDefault in mousedown
    var _defaultEvent = window.clipboardData ? true : !!appcfg.defaultEvent;

    var useImageCurosr = _browser.isIE && !appcfg.disableCursor;// && (appcfg.useImageCursor != false);

    var directClipAccess = _browser.isChromeApp || _browser.isIE || appcfg.directClipAccess == true;

    var forceScancode = !!appcfg.forceScancode;

    this.setConfig = function (cfg) {
        appcfg = cfg;
    };

    this.toolbar = null;
    this.railWin = null;
    this.focused = false;
    this.showToolbar = false;
    this.canvas = _canvas;
    this.alwaysPaste = false;
    this.forceTextArea = false;

    if ('visible' in appcfg.toolbar) {
        this.showToolbar = appcfg.toolbar.visible;
    }

    var getMousePos = _browser.getMousePos;
    var calMousePos = _browser.calMousePos;

    this.getWindow = function () {
        return window;
    };

    this.setImageCursor = function(v){
        useImageCurosr = v;
    };

    this.setMonitor = function (left, top, right, bottom) {
        _mousePos.left = left;
        _mousePos.top = top;
        _mousePos.right = right;
        _mousePos.bottom = bottom;
        _mousePos.primary = left == 0 && top == 0;
        if (right != 0 && bottom != 0) {
            _mousePos.isMultiMon = false;
            myLI.setSize(right - left + 1, bottom - top + 1)
            _mousePos.isMultiMon = true;
            checkUI('hidden');
            appcfg.disableScrollbars = true;
        }
    };

    this.configMonitor = function(){
		var left = window.screenX;//(screen.left == undefined) ? window.screenX : screen.left;
		var top = window.screenY;//(screen.top == undefined) ? window.screenY : screen.top;
        if (window.outerWidth < window.innerWidth){//chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=1281939
            var off = (window.innerWidth - window.outerWidth) / 2;
            console.warn("*** screenX:" + window.screenX + " screenY:" + window.screenY + " outerWidth:" + window.outerWidth + " innerWidth:" + window.innerWidth + " off:" + off)
            left -= off;
            top -= off;
        }
        var w = screen.width & ~3;//This could be invalid number if the screen is scaled.
        var h = screen.height & ~3;
		var right = w + left - 1;
		var bottom = h + top - 1;
        myLI.setMonitor(left, top, right, bottom);
        svGlobal.logger.info('monitor, l:' + left + ' t:' + top + ' r:' + right + ' b:' + bottom);
	};

    this.isClipSynced = function (timeInMs) {
        // console.log('clipSync ' + clipSynced + ' ' + (Date.now() - myLI.blurTime));
        if (!clipSynced) {
            return false;
        }
        var t = Date.now() - myLI.blurTime;

        if (timeInMs && (t > timeInMs)) {
            return false;
        }
        svGlobal.logger.info('clip synced in ' + t);
        return true;
    };

    this.getScale = function () {
        return { x: mScale, y: mScaleY };
    };

    var thumbCanvas = null;
    var __pckey = null;

    var useCopyEvent = !_browser.isChromeApp && !appcfg.copyDialog && !appcfg.directClipAccess && !_browser.isIE;


    this.getThumbnail = function (w) {
        w = w || 64;
        if (!thumbCanvas) {
            thumbCanvas = document.createElement('canvas');
        }

        var h = Math.floor((_canvas.height / _canvas.width) * w);

        if (thumbCanvas.width != w) {
            thumbCanvas.width = w;
        }

        if (thumbCanvas.height != h) {
            thumbCanvas.height = h;
        }

        thumbCanvas.getContext('2d').drawImage(_canvas, 0, 0, _canvas.width, _canvas.height, 0, 0, w, h);
        return thumbCanvas.toDataURL();
    };

    this.getThumbnailBlob = function (w, callback) {
        w = w || 64;
        var h = Math.floor((_canvas.height / _canvas.width) * w);

        if (!thumbCanvas) {
            if (window.OffscreenCanvas){
                thumbCanvas = new OffscreenCanvas(w, h);
            }else{
                thumbCanvas = document.createElement('canvas');
            }
        }


        if (thumbCanvas.width != w) {
            thumbCanvas.width = w;
        }

        if (thumbCanvas.height != h) {
            thumbCanvas.height = h;
        }

        thumbCanvas.getContext('2d').drawImage(_canvas, 0, 0, _canvas.width, _canvas.height, 0, 0, w, h);
        return thumbCanvas.toBlob(callback);
    };


    this.initChat = function (user) {
        var elm = document.getElementById('chatWindow');
        hi5.Draggable(elm);
        return new hi5.Chat(elm, user);
    };

    this.equals = function (another) {
        return _canvas == another.canvas;
    };

    function fixiOSHeight(h) {
        // if (hi5.browser.isiOS){//on iOS, innerHeight is not correct sometiems
        var off = h - hi5.browser.innerHeight;
        if ((off > 10) && (off < 22)) {
            h = hi5.browser.innerHeight;
        };
        // }
        return h;
    }


    this.getFreeSpace = function () {
        var pos = hi5.tool.getPos(_canvas);
        var w = window.innerWidth - pos.x;
        var h = fixiOSHeight(window.innerHeight) - pos.y;

        // var scrW = (w > h) ? Math.max(hi5.browser.getScreenWidth(), hi5.browser.getScreenHeight()) : Math.min(hi5.browser.getScreenWidth(), hi5.browser.getScreenHeight())
        // var scrH = (w > h) ? Math.min(hi5.browser.getScreenWidth(), hi5.browser.getScreenHeight()) : Math.max(hi5.browser.getScreenWidth(), hi5.browser.getScreenHeight())

		// if (w > scrW) {//happen on ChromeApp
        //     w = scrW;
        // }
        // if (h > scrH) {
        //     h = scrH;
        // }
        return { 'width': w, 'height': h };
    };

    function focusAndFix(target) {
        //////////////////////////////////////
        //CS: focus causes scrolling to occur if control is wrapped in scrolling div.To compensate, we reapply the scroll position after the focus is set. Wrapper will be two elements up.
        if (appcfg.detectInput && isTouch && currCursor) {//disable it by default unless we make it better
            if (forceKeyboard || currCursor.system == 'text' || currCursor.system == 'none') {
                setTimeout(function () {
                    setSoftKeyboard(true);
                }, 5);
            } else {

                setTimeout(function () {
                    setSoftKeyboard(false);
                }, 5);
            }
        }
        if (document.activeElement != target || !myLI.focused) {
            var elm = target, styles, overflow, elms = [];
            while (elm.parentElement) {
                elm = elm.parentElement;
                styles = getComputedStyle(elm);
                if (styles) {
                    overflow = styles.getPropertyValue('overflow');
                    if (styles.getPropertyValue('display') == 'block') {
                        elms.push([elm, elm.scrollTop, elm.scrollLeft]);
                    }
                }
            }

            target.focus();//focus may cause screen scrolling if edit area is not invisible

            if (elms.length) {
                for (var i = 0, len = elms.length; i < len; i++) {
                    elm = elms[i];
                    if (elm[0].scrollTop != elm[1] || elm[0].scrollLeft != elm[2]) {
                        elm[0].scrollTop = elm[1];
                        elm[0].scrollLeft = elm[2];
                    }
                    elms[i] = null;
                }
                elms = null;
            }
        }



        //////////////////////////////////////
    }

    var keyboardLayout = new function () {
        var layout = 0x409;//US
        var isFF = _browser.isFirefox;
        var isMac = _browser.isMacOS || _browser.isiOS;

        var codeTable = [0 | 0];//US layout
        var currentTable = null;

        //K1033 K1043(Dutch (Netherlands))
        codeTable[3] = 0xC5;//break with Ctrl
        codeTable[8] = 0x0E;//backspace
        codeTable[9] = 0x0F;//tab
        codeTable[12] = 0x4c;//NumPad5
        codeTable[13] = 0x1C;//enter

        codeTable[16] = 0x2A;//shift
        codeTable[17] = 0x1D;//ctrl
        codeTable[18] = 0x38;//alt
        codeTable[19] = 0xC5;//pause break TODO.
        codeTable[20] = 0x3A;//caps lock
        codeTable[27] = 1;//escape
        codeTable[32] = 0x39;//space
        codeTable[33] = 0xC9;//page up
        codeTable[34] = 0xD1;//page down
        codeTable[35] = 0xCF;//end
        codeTable[36] = 0xC7;//home
        codeTable[37] = 0xCB;//left
        codeTable[38] = 0xC8;//up
        codeTable[39] = 0xCD;//right

        codeTable[40] = 0xD0;//down
        codeTable[44] = 0x37;//PrtScn
        codeTable[45] = 0xD2;//insert
        codeTable[46] = 0xD3;//delete

        codeTable[48] = 0x0B;//0	48
        codeTable[49] = 0x02;//1	49
        codeTable[50] = 0x03;//2	50
        codeTable[51] = 0x04;//3	51
        codeTable[52] = 0x05;//4	52
        codeTable[53] = 0x06;//5	53
        codeTable[54] = 0x07;//6	54
        codeTable[55] = 0x08;//7	55
        codeTable[56] = 0x09;//8	56
        codeTable[57] = 0x0A;//9	57

        codeTable[65] = 0x1E;//a	65
        codeTable[66] = 0x30;//b	66
        codeTable[67] = 0x2E;//c	67
        codeTable[68] = 0x20;//d	68
        codeTable[69] = 0x12;//e	69
        codeTable[70] = 0x21;//f	70
        codeTable[71] = 0x22;//g	71
        codeTable[72] = 0x23;//h	72
        codeTable[73] = 0x17;//i	73
        codeTable[74] = 0x24;//j	74
        codeTable[75] = 0x25;//k	75
        codeTable[76] = 0x26;//l	76
        codeTable[77] = 0x32;//m	77
        codeTable[78] = 0x31;//n	78
        codeTable[79] = 0x18;//o	79
        codeTable[80] = 0x19;//p	80
        codeTable[81] = 0x10;//q	81
        codeTable[82] = 0x13;//r	82
        codeTable[83] = 0x1F;//s	83
        codeTable[84] = 0x14;//t	84
        codeTable[85] = 0x16;//u	85
        codeTable[86] = 0x2F;//v	86
        codeTable[87] = 0x11;//w	87
        codeTable[88] = 0x2D;//x	88
        codeTable[89] = 0x15;//y	89
        codeTable[90] = 0x2C;//z	90


        codeTable[91] = 0xDB; //VK_WINDOWS:
        codeTable[92] = 0xDC; //VK_WINDOWS_RIGHT
        codeTable[93] = 0xDD; //VK_CONTEXT_MENU:

        codeTable[96] = 0x52;//numpad 0
        codeTable[97] = 0x4F;//numpad 1
        codeTable[98] = 0x50;//numpad 2
        codeTable[99] = 0x51;//numpad 3
        codeTable[100] = 0x4B;//numpad 4
        codeTable[101] = 0x4C;//numpad 5
        codeTable[102] = 0x4D;//numpad 6
        codeTable[103] = 0x47;//numpad 7
        codeTable[104] = 0x48;//numpad 8
        codeTable[105] = 0x49;//numpad 9

        codeTable[106] = 0x37;//multiply
        codeTable[107] = 0x4E;//add
        codeTable[109] = 0x4A;//subtract
        codeTable[110] = 0x53;//decimal point
        codeTable[111] = 0xB5;//divide 0x35 | 180

        codeTable[112] = 0x3B;//F1
        codeTable[113] = 0x3C;
        codeTable[114] = 0x3D;
        codeTable[115] = 0x3E;
        codeTable[116] = 0x3F;
        codeTable[117] = 0x40;
        codeTable[118] = 0x41;
        codeTable[119] = 0x42;
        codeTable[120] = 0x43;
        codeTable[121] = 0x44;//F10
        codeTable[122] = 0x57;//F11
        codeTable[123] = 0x58;//F12

        codeTable[144] = 0x45;//numlock
        codeTable[145] = 0x46;//scrolllock

        codeTable[154] = 0xB7;//printscreen


        codeTable[166] = 0x3b;//CrOS F1
        codeTable[167] = 0x3c;//CrOS F2
        codeTable[168] = 0x3d;//CrOS F3
        codeTable[173] = 0x42;//CrOS F8
        codeTable[174] = 0x43;//CrOS F9
        codeTable[175] = 0x44;//CrOS F10
        codeTable[182] = 0x3f;//Cros F5
        codeTable[183] = 0x3e;//Cros F4
        codeTable[216] = 0x40;//CrOS F6
        codeTable[217] = 0x41;//CrOS F7


        codeTable[186] = 0x27;//semi-colon	186
        codeTable[187] = 0x0D;//equal sign	187
        codeTable[188] = 0x33;//comma	188
        codeTable[189] = 0x0C;//dash	189
        codeTable[190] = 0x34;//period	190
        codeTable[191] = 0x35;//forward slash	191
        codeTable[192] = 0x29;//grave accent	192
        codeTable[219] = 0x1A;//open bracket	219
        codeTable[220] = 0x2B;//back slash	220
        codeTable[221] = 0x1B;//close braket	221
        codeTable[222] = 0x28;//single quote	222

        codeTable[224] = 0x1d;//Meta key in Linux; Command key in Mac
        codeTable[225] = 0xb8;//altgr
        codeTable[226] = 0x56;//\|
        codeTable[235] = 0x7B;//无变换
        codeTable[255] = 0x79;//变换


        //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values#Code_values_on_Windows
        var codeToScancode = {
            "Escape": 1,
            "Digit1": 2,
            "Digit2": 3,
            "Digit3": 4,
            "Digit4": 5,
            "Digit5": 6,
            "Digit6": 7,
            "Digit7": 8,
            "Digit8": 9,
            "Digit9": 0xA,
            "Digit0": 0xB,
            "Minus": 0xC,
            "Equal": 0xD,
            "Backspace": 0xE,
            "Tab": 0xF,
            "KeyQ": 0x10,
            "KeyW": 0x11,
            "KeyE": 0x12,
            "KeyR": 0x13,
            "KeyT": 0x14,
            "KeyY": 0x15,
            "KeyU": 0x16,
            "KeyI": 0x17,
            "KeyO": 0x18,
            "KeyP": 0x19,
            "BracketLeft": 0x1A,
            "BracketRight": 0x1B,
            "Enter": 0x1C,
            "ControlLeft": 0x1D,
            "KeyA": 0x1E,
            "KeyS": 0x1F,
            "KeyD": 0x20,
            "KeyF": 0x21,
            "KeyG": 0x22,
            "KeyH": 0x23,
            "KeyJ": 0x24,
            "KeyK": 0x25,
            "KeyL": 0x26,
            "Semicolon": 0x27,
            "Quote": 0x28,
            "Backquote": 0x29,
            "ShiftLeft": 0x2A,
            "Backslash": 0x2B,
            "KeyZ": 0x2C,
            "KeyX": 0x2D,
            "KeyC": 0x2E,
            "KeyV": 0x2F,
            "KeyB": 0x30,
            "KeyN": 0x31,
            "KeyM": 0x32,
            "Comma": 0x33,
            "Period": 0x34,
            "Slash": 0x35,
            "ShiftRight": 0x36,
            "NumpadMultiply": 0x37,
            "AltLeft": 0x38,
            "Space": 0x39,
            "CapsLock": 0x3A,
            "F1": 0x3B,
            "F2": 0x3C,
            "F3": 0x3D,
            "F4": 0x3E,
            "F5": 0x3F,
            "F6": 0x40,
            "F7": 0x41,
            "F8": 0x42,
            "F9": 0x43,
            "F10": 0x44,
            "NumLock": 0x45,//pause includes 0x45 too
            "ScrollLock": 0x46,
            "Numpad7": 0x47,
            "Numpad8": 0x48,
            "Numpad9": 0x49,
            "NumpadSubtract": 0x4A,
            "Numpad4": 0x4B,
            "Numpad5": 0x4C,
            "Numpad6": 0x4D,
            "NumpadAdd": 0x4E,
            "Numpad1": 0x4F,
            "Numpad2": 0x50,
            "Numpad3": 0x51,
            "Numpad0": 0x52,
            "NumpadDecimal": 0x53,
            // "PrintScreen": 0x54,
            "IntlBackslash": 0x56,
            "F11": 0x57,
            "F12": 0x58,
            "NumpadEqual": 0x59,//Widnows doesn't support this key
            "F13": 0x5B,//TODO: F13 - F24, Chrome is different with FF
            "F14": 0x5C,
            "F15": 0x5D,
            "F16": 0x63,
            "F17": 0x64,
            "F18": 0x65,
            "F19": 0x66,
            "F20": 0x67,
            "F21": 0x68,
            "F22": 0x69,
            "F23": 0x6A,
            "F24": 0x6B,
            "KanaMode": 0x70,//KEY_Maco)
            "Lang2": 0x71, // (Hanja key without Korean keyboard layout)
            "Lang1": 0x72, //(Han/Yeong key without Korean keyboard layout)
            "IntlRo": 0x73,
            "Convert": 0x79,//变换 keycode 255 Edge
            "NonConvert": 0x7B,//无变换 keycode 235 Edge
            "IntlYen": 0x7D,
            "NumpadComma": 0x7E,
            "Paste": 0x8A,
            "MediaTrackPrevious": 0x90,
            "Cut": 0x97,
            "Copy": 0x98,
            "MediaTrackNext": 0x99,
            "NumpadEnter": 0x9C,
            "ControlRight": 0x9D,
            // "LaunchMail": 0x9E,
            "VolumeMute": 0xA0,
            "AudioVolumeMute": 0xA0,
            "LaunchApp2": 0xA1,
            "MediaPlayPause": 0xA2,
            "MediaStop": 0xA4,
            "Eject": 0xAC,
            "VolumeDown": 0xAE,
            "AudioVolumeDown": 0xAE,
            "VolumeUp": 0xB0,
            "AudioVolumeUp": 0xB0,
            "BrowserHome": 0xB2,
            "NumpadDivide": 0xB5,
            "PrintScreen": 0xB7,
            "AltRight": 0xB8,
            "Help": 0xBB,
            "Pause": 0xC5,
            "Home": 0xC7,
            "ArrowUp": 0xC8,
            "PageUp": 0xC9,
            "ArrowLeft": 0xCB,
            "ArrowRight": 0xCD,
            "End": 0xCF,
            "ArrowDown": 0xD0,
            "PageDown": 0xD1,
            "Insert": 0xD2,
            "Delete": 0xD3,
            "OSLeft": 0xDB,
            "MetaLeft": 0xDB,
            "OSRight": 0xDC,
            "MetaRight": 0xDC,
            "ContextMenu": 0xDD,
            "Power": 0xDE,
            "BrowserSearch": 0xE5,
            "BrowserFavorites": 0xE6,
            "BrowserRefresh": 0xE7,
            "BrowserStop": 0xE8,
            "BrowserForward": 0xE9,
            "BrowserBack": 0xEA,
            "LaunchApp1": 0xEB,
            "LaunchMail": 0xEC,
            "LaunchMediaPlayer": 0xED
            // "Lang2": 0xE0F1,//(Hanja key with Korean keyboard layout)
            // "Lang1": 0xE0F2,//Han/Yeong key with Korean keyboard layout)
        }

        this.isPrintableScancode = function(code, e){
            if ((e.keyCode > 95) && (e.keyCode < 112)){
                return true;//numpad number
            }

            if (code == 0 && e){//for IE
                var c = e.char || e.key;
                if (c && c.length == 1){
                    var charCode = c.charCodeAt(0);
                //http://en.wikipedia.org/wiki/C0_and_C1_control_codes
                    return !(charCode <= 0x1F || charCode == 0x7F || (charCode >= 0x80 && charCode <= 0x9F));
                }
            }

            if (e.altKey && (code > 0x46) && (code < 0x53) && (code != 0x4A) && (code != 0x4E)){//numpad0-9
                return true;//alt + numpad number
            }

            return ((code > 1) && (code < 0xE)) ||  //2 - 0, - =
                    ((code > 0xF) && (code < 0x1C)) ||  //Q - P, BracketLeft,  BracketRight
                    ((code > 0x1D) && (code < 0x2A)) || //A - L, Semicolon, quote, Backquote
                    ((code > 0x2A) && (code < 0x36)) || code == 0x39 || code == 0x56 ||   //Backslash, z-m, comma, period, slash, IntlBackSlash
                    code == 0x73 || code == 0x7D; //IntlRo, IntlYen
        };

        var verifyKey = function (e) {
            var code = e.keyCode;
            if (isFF) {
                switch (code) {
                    case 173: return 189;
                    case 61: return 187;//EQUALS
                    case 59: return 186;
                    //                case 61: return isMac ? 187 : 61;//EQUALS
                    //                case 220: return isMac ? 222 : 220;//BACK_SLASH
                    //                case 222: return isMac ? 192 : 222;
                    case 224: return 17;//Mac applet/command key
                }
                return code;
            }

            /*
            if (_browser.isOpera) {
                switch (code) {
                case 59: return 186;
                case 61: return 187;
                case 109: return 189;
                case 219: return 91;
                case 57351: return 93;
                }
                return code;
            }
            */

            return code;

        };

        this.converMacCtrl = true;
        this.mapCmdToCtrl = true;

        var verifyMacKey = isMac ? function (code) {
            switch (code) {
                //                case 224:
                case 91: return keyboardLayout.mapCmdToCtrl ? 17 : 91;//command -> ctrl
                case 93: return keyboardLayout.mapCmdToCtrl ? 17 : 93;//command -> ctrl
                case 17: return keyboardLayout.converMacCtrl ? 91 : 17;//ctrl -> window
                case 229: return 69;//
            }
            return 0;
        } : null;

        this.setLayout = function (id) {
            layout = id;
            currentTable = getCodeTableById(id);
            if (currentTable !== null) {
                svGlobal.logger.info('Keyboard layout: ' + layout);
            }
        };

        this.getKeyCode = function (e) {
            var keyCode = 0;
            if (verifyMacKey) {
                keyCode = verifyMacKey(e.keyCode);
            };
            if (!keyCode) {
                keyCode = verifyKey ? verifyKey(e) : e.keyCode;
            }
            return keyCode;
        };

        this.getScancode = function (e) {
            var scancode = 0;
            if (e.code){
                scancode = codeToScancode[e.code] || 0;
            }else{
                var keyCode = keyboardLayout.getKeyCode(e);
                switch (keyCode) {//ctrl
                case 16://shift
                    scancode = (e.location == 2) ? 0x36 : 0x2a;
                    break;
                case 17: scancode = (e.location == 2) ? 0x9d : 0x1d;
                    break;
                case 18: scancode = (e.location == 2) ? 0xB8 : 0x38;
                    break;
                case 33://pageup
                    scancode = (e.location == 3) ? 0x49 : 0xC9;
                    break;
                case 34://pagedown
                    scancode = (e.location == 3) ? 0x51 : 0xD1;
                    break;
                case 35://end
                    scancode = (e.location == 3) ? 0x4F : 0xCF;
                    break;
                case 36://home
                    scancode = (e.location == 3) ? 0x47 : 0xC7;
                    break;
                case 37://Left
                    scancode = (e.location == 3) ? 0x4B : 0xCB;
                    break;
                case 38://UP
                    scancode = (e.location == 3) ? 0x48 : 0xC8;
                    break;
                case 39://Right
                    scancode = (e.location == 3) ? 0x4D : 0xCD;
                    break;
                case 40://Down
                    scancode = (e.location == 3) ? 0x50 : 0xD0;
                    break;
                case 45://Insert
                    scancode = (e.location == 3) ? 0x52 : 0xD2;
                    break;
                case 46://Del
                    scancode = (e.location == 3) ? 0x53 : 0xD3;
                    break;
                
                default: 
                    if (currentTable){
                        scancode = currentTable[keyCode] || 0;
                    }
                }
            }
            if (isMac){
                switch (scancode){
                    case 0x1D: 
                        if (this.converMacCtrl){
                            scancode = 0xDB;//CtrlL -> MetaL
                        }
                        break;
                    case 0x9D:
                        if (this.converMacCtrl){
                            scancode = 0xDC;//CtrlR -> MetaR
                        }
                        break;
                    case 0xDB : 
                        if (this.mapCmdToCtrl){
                            scancode = 0x1D;//MetaL -> CtrlLeft
                        }
                        break;
                    case 0xDC: 
                        if (this.mapCmdToCtrl){
                            scancode = 0x9D;//MetaR -> CtrlRight
                        }
                        break;
                }
            }
            return scancode;
        };

        this.getScancodeByKeyCode = function (keyCode) {
            return currentTable ? (currentTable[keyCode] || 0) : 0;
        };

        function getCodeTableById(id) {
            var table = null;

            var key = 'K' + id;
            if (key in layoutCreator) {
                table = layoutCreator[key]();
            }

            if (table === null) {//} && (id == 1033 || id ==2070 || id == 1046 || id == 66582 || id < 0 || id > 3758096384)){
                table = codeTable;
            }

            return table;
        }

        this.getCodeTable = function () {
            return currentTable;
        };

        this.getLayoutCreator = function () {
            return layoutCreator;
        };

        var layoutCreator = new function () {

            this.K3758162961 = function jpTable() {//Japanese
                var tbl = codeTable.slice(0);
                tbl[244] = 0x29;//half/full Hanzi, up(first) = 244, down = 229 when Hanzi
                tbl[243] = 0x29;//half/full Hanzi, up(first) = 243, down = 229 when half

                //===============
                tbl[189] = 0x0C;//-=  down = 229 (when Full Hanzi), up = 189
                tbl[222] = 0x0D;//^~ down = 229
                tbl[220] = 0x7D;//\| down = 229

                //==============
                tbl[192] = 0x1A;//@` down = 229
                tbl[219] = 0x1B;//[{ down = 229

                //=============
                tbl[187] = 0x27;//;+ down = 229
                tbl[186] = 0x28;//:* down = 229
                tbl[221] = 0x2B;//]} down = 229


                tbl[188] = 0x33;//,< down = 229
                tbl[190] = 0x34;//.> down = 229
                tbl[191] = 0x35;///? down = 229
                tbl[226] = 0x73;//\_ down = 229

                tbl[29] = 0x7B;//No Convert down = 229
                tbl[28] = 0x79;//Convert down = 229
                tbl[240] = 0x70;//Kana? up first down = 229
                tbl[242] = 0x70;//Kana? up first down = 229

                if (isFF) {
                    tbl[173] = 0x0C;//FF 173 = 189
                    tbl[160] = 0x0D;//FF 160 = 222

                    tbl[64] = 0x1A;//FF 64 = 192

                    tbl[59] = 0x27;//FF 59 = 186
                    tbl[58] = 0x28;//FF 58 = 186

                    verifyKey = function (e) {
                        return (e.keyCode == 220 && e.key == '_') ? 226 : e.keyCode;
                    };
                }

                return tbl;
            };

            function IT_IT() {
                var tbl = codeTable.slice(0);
                tbl[220] = 0x29;//grave accent	192

                tbl[219] = 0x0C;//dash	189
                tbl[221] = 0x0D;//equal sign	187

                tbl[186] = 0x1A;//open bracket	219
                tbl[187] = 0x1B;//close braket	221
                tbl[191] = 0x2B;//back slash	220

                tbl[192] = 0x27;//semi-colon	186
                //    			    codeTable[222] = 0x28;//single quote	222

                //    			    codeTable[188] = 0x33;//comma	188
                //    			    codeTable[190] = 0x34;//period	190
                tbl[189] = 0x35;//forward slash	191

                tbl[226] = 0x56;//

                if (isFF){
                            
    					verifyKey = function(e){
    						var code = e.keyCode;
    						var key = e.key;
    						switch (code){
                            case 0:
                                if (key == 'è' || key == 'é' || key == '['){
                                    return 186;
                                }else if (key == 'ò' || key == 'ç' || key == '@'){
                                    return 192;
                                }else if (key == 'à' || key == '°'  || key == '#'){
                                    return 222;
                                }else if (key == 'ù' || key == '§'){
                                    return 222;
                                }
                                break;
                            case 60:
                                return 226;
                            case 160:
                                return 221;
                            case 171:
                                return 187;
                            case 173:
                                return 189;
    						case 222:
    							return 219;
    						}
    						return code;
    					};
    				}

    				return tbl;
            }

            //
            //1034: es Spanish (International Sort) 
            //66570 Spanish Variation 2058: es-mx Spanish (Mexico) 1040: Italian 66576: Italian 142
            this.K1034 = this.K66570 = this.K2058 = this.K1040 = this.K66576 = IT_IT;

            this.K2057 = function EN_GB() {
                var tbl = codeTable.slice(0);
                tbl[223] = 0x29;//grave accent	192

                //    				tbl[219] = 0x0C;//dash	189
                //    				tbl[221] = 0x0D;//equal sign	187

                //    				tbl[186] = 0x1A;//open bracket	219
                //    				tbl[187] = 0x1B;//close braket	221
                tbl[222] = 0x2B;//back slash	220

                //    				tbl[192] = 0x27;//semi-colon	186
                tbl[192] = 0x28;//single quote	222

                //    			    tbl[188] = 0x33;//comma	188
                //    			    tbl[190] = 0x34;//period	190
                //    				tbl[189] = 0x35;//forward slash	191

                tbl[220] = 0x56;//

                if (isFF) {
                    tbl[192] = 0x29;//grave accent	192

                    tbl[173] = 0x0C;//dash	189
                    tbl[61] = 0x0D;//equal sign	187

                    tbl[59] = 0x27;//semi-colon	186
                    tbl[222] = 0x28;//single quote	222

                    tbl[163] = 0x2B;//back slash	220
                }

                return tbl;
            };

            function DE_DE() {
                var tbl = codeTable.slice(0);
                tbl[220] = 0x29;//grave accent	192

                tbl[219] = 0x0C;//dash	189
                tbl[221] = 0x0D;//equal sign	187

                tbl[186] = 0x1A;//open bracket	219
                tbl[187] = 0x1B;//close braket	221
                tbl[191] = 0x2B;//back slash	220

                tbl[192] = 0x27;//semi-colon	186
                //    			    tbl[222] = 0x28;//single quote	222

                //    			    tbl[188] = 0x33;//comma	188
                //    			    tbl[190] = 0x34;//period	190
                tbl[189] = 0x35;//forward slash	191

                tbl[226] = 0x56;//

                tbl[90] = 0x15;//y	89
                tbl[89] = 0x2C;//z	90

                if (isFF) {
                    verifyKey = function (e) {
                        var code = e.keyCode;
                        var key = e.key;
                        switch (code) {
                            case 60: return 226; //<>
                            case 160: return 220;

                            case 63: return 219;
                            case 192: return 221;

                            case 171: return 187;
                            case 163: return 191;
                            case 173: return 189;
                            case 0:
                                if (key == 'ö' || (key == 'Ö' && e.shiftKey)) {
                                    return 192;
                                } else if (key == 'ä' || (key == 'Ä' && e.shiftKey)) {
                                    return 222;
                                } else if (key == 'ü' || (key == 'Ü' && e.shiftKey)) {
                                    return 186;
                                }
                                break;
                        }
                        return code;
                    };

    				}else if (hi5.browser.isLinux){//for Chrome
                        verifyKey = function(e){
    						var code = e.keyCode;
    						var key = e.key;
                            switch (code){
                                case 187:
                                    if (key == 'Dead'){
                                        return 221;
                }
                                    break;
                                case 192:
                                    if (key == 'Dead' || key == '°'){
                                        return 220;
                                    }
                                    break;
                                case 220:
                                    return 226;

                            }

    						return code;
    					};
                    }

                return tbl;
            }

            this.K1031 = this.K4106 = this.K5130 = this.K6154 = this.K7178 = this.K8202 = this.K9226 =
                this.K10250 = this.K11274 = this.K12298 = this.K13322 = this.K14346 = this.K15370 =
                this.K16395 = this.K17418 = this.K18442 = this.K19466 = this.K20490 = this.K99997 =
                this.K66567 = this.K2952791047 = DE_DE;

                function PT_PT(){
    				var tbl = codeTable.slice(0);
    				tbl[220] = 0x29;//grave accent	192

    				tbl[219] = 0x0C;//dash	189
    				tbl[221] = 0x0D;//equal sign	187

    				tbl[186] = 0x1B;//open bracket	219
    				tbl[187] = 0x1A;//close braket	221
    				tbl[191] = 0x2B;//back slash	220
    				
    				tbl[192] = 0x27;//semi-colon	186
//    			    tbl[222] = 0x28;//single quote	222
    			    
//    			    tbl[188] = 0x33;//comma	188
//    			    tbl[190] = 0x34;//period	190
    				tbl[189] = 0x35;//forward slash	191
    			    
    				tbl[226] = 0x56;//

    				return tbl;
    			}

                this.K2070 = PT_PT;

    			
    			
            function FR_BE() {
                var tbl = codeTable.slice(0);
                tbl[222] = 0x29;//grave accent	192

                tbl[219] = 0x0C;//dash	189
                tbl[189] = 0x0D;//equal sign	187

                tbl[221] = 0x1A;//open bracket	219
                tbl[186] = 0x1B;//close braket	221
                //    				tbl[220] = 0x2B;//back slash	220

                tbl[77] = 0x27;//semi-colon	186
                tbl[192] = 0x28;//single quote	222

                tbl[188] = 0x32;//comma	188
                tbl[190] = 0x33;//period	190
                tbl[191] = 0x34;//forward slash	191
                tbl[187] = 0x35;//=

                tbl[226] = 0x56;//

                tbl[65] = 0x10;//q	81
                tbl[90] = 0x11;//w	87
                tbl[81] = 0x1E;//a	65
                tbl[87] = 0x2C;//z	90

                if (isFF) {
                    verifyKey = function (e) {
                        var code = e.keyCode;
                        var key = e.key;
                        switch (code) {
                            case 60: return 226; //<>
                            //    						case 160: return 220;

                            case 169: return 219;
                            case 173: return 189;

                            case 160: return 221;
                            case 164: return 186;

                            case 165: return 192;
                            //    						case 163: return 191;
                            //    						case 173: return 189; 

                            case 59: return 190;
                            case 58: return 191;
                            case 61: return 187;
                            case 0:
                                if (key == '²' || (key == '³' && e.shiftKey)) {
                                    return 222;
                                } else if (key == 'µ' || (key == '`µ') || key == 'DeadGrave' || (key == '£' && e.shiftKey)) {
                                    return 220;
                                } else if ((key == '`' || key == '``') && e.ctrlKey && e.altKey) {
                                    return 220;
                                }
                                break;
                        }
                        return code;
                    };

                }

                return tbl;
            }

            this.K2060 = this.K99998 = this.K2067 = FR_BE;

            function FR_CA() {
                var tbl = codeTable.slice(0);
                tbl[222] = 0x29;//grave accent	192

                //    				tbl[219] = 0x0C;//dash	189
                //    				tbl[221] = 0x0D;//equal sign	187

                //    				tbl[186] = 0x1A;//open bracket	219
                //    				tbl[187] = 0x1B;//close braket	221
                //    				tbl[222] = 0x2B;//back slash	220

                //    				tbl[192] = 0x27;//semi-colon	186
                tbl[192] = 0x28;//single quote	222

                //    			    tbl[188] = 0x33;//comma	188
                //    			    tbl[190] = 0x34;//period	190
                //    				tbl[189] = 0x35;//forward slash	191

                tbl[226] = 0x56;//

                if (isFF) {
                    verifyKey = function (e) {
                        var code = e.keyCode;
                        var key = e.key;
                        switch (code) {
                            case 0:
                                if (key == '°' || (key == '¬' && e.ctrlKey && e.altKey)) {
                                    return 222;
                                } else if (key == 'ç' || (key == 'Ç' && e.shiftKey)) {
                                    return 221;
                                } else if (key == 'à' || key == 'DeadGrave' || (key == 'À' && e.shiftKey)) {
                                    return 220;
                                } else if (key == 'è' || (key == 'È' && e.shiftKey)) {
                                    return 192;
                                } else if (key == 'é' || (key == 'É' && e.shiftKey)) {
                                    return 191;
                                } else if (key == 'ù' || (key == 'Ù' && e.shiftKey)) {
                                    return 226;
                                } else if (key == 'DeadTilde') {
                                    return 221;
                                }
                                break;
                            case 173:
                                return 189;
                            case 61:
                                return 187;
                            case 160:
                                return 219;
                            case 59:
                                return 186;
                        }
                        return code;
                    };
                }

                return tbl;
            }

            this.K3084 = this.K4105 = FR_CA;


            function FR_FR() {
                var tbl = codeTable.slice(0);
                tbl[222] = 0x29;//grave accent	192

                tbl[219] = 0x0C;//dash	189
                tbl[187] = 0x0D;//equal sign	187

                tbl[221] = 0x1A;//open bracket	219
                tbl[186] = 0x1B;//close braket	221
                tbl[220] = 0x2B;//back slash	220

                tbl[77] = 0x27;//semi-colon	186
                tbl[192] = 0x28;//single quote	222

                tbl[190] = 0x33;//comma	188
                tbl[191] = 0x34;//period	190
                tbl[223] = 0x35;//forward slash	191

                tbl[226] = 0x56;//

                tbl[65] = 0x10;//q	81
                tbl[90] = 0x11;//w	87
                tbl[81] = 0x1E;//a	65
                tbl[87] = 0x2C;//z	90
                tbl[188] = 0x32;//m	77


                if (isFF) {
                    verifyKey = function (e) {
                        var code = e.keyCode;
                        var key = e.key;
                        switch (code) {
                            case 0:
                                if (key == '²') {
                                    return 222;
                                } else if (key == 'ç' || (key == 'Ç' && e.shiftKey)) {
                                    return 221;
                                } else if (key == 'à' || (key == 'À' && e.shiftKey)) {
                                    return 220;
                                } else if (key == 'è' || (key == 'È' && e.shiftKey)) {
                                    return 192;
                                } else if (key == 'é' || (key == 'É' && e.shiftKey)) {
                                    return 189;
                                } else if (key == 'ù' || (key == 'Ù' && e.shiftKey)) {
                                    return 226;
                                } else if (key == 'DeadTilde') {
                                    return 221;
                                }
                                break;
                            case 60:
                                return 226;
                            case 169:
                                return 219;
                            case 61:
                                return 187;

                            case 160:
                                return 221;
                            case 164:
                                return 186;
                            case 170:
                                return 220;

                            //    						case 77:
                            //    							return 220;
                            case 165:
                                return 192;

                            case 59:
                                return 190;
                            case 58:
                                return 191;
                            case 161:
                                return 223;

                        }
                        return code;
                    };
                }

                return tbl;
            }

            this.K1036 = FR_FR;


            function FR_CH() {//French (Switzerland)
                var tbl = codeTable.slice(0);
                tbl[191] = 0x29;//grave accent	192

                tbl[219] = 0x0C;//dash	189
                tbl[221] = 0x0D;//equal sign	187

                tbl[186] = 0x1A;//open bracket	219
                tbl[192] = 0x1B;//close braket	221
                tbl[223] = 0x2B;//back slash	220

                tbl[222] = 0x27;//semi-colon	186
                tbl[220] = 0x28;//single quote	222

                tbl[188] = 0x33;//comma	188
                tbl[190] = 0x34;//period	190
                tbl[189] = 0x35;//forward slash	191

                tbl[226] = 0x56;//

                tbl[90] = 0x15;//y	89
                tbl[89] = 0x2C;//z	90


                if (isFF) {
                    verifyKey = function (e) {
                        var code = e.keyCode;
                        var key = e.key;
                        switch (code) {
                            case 0:
                                if (key == '§' || (key == '°' && e.shiftKey)) {
                                    return 191;
                                } else if (key == 'à' || (key == 'ä' && e.shiftKey) || (key == '{' && e.ctrlKey && e.altKey)) {
                                    return 220;
                                } else if (key == 'è' || (key == 'ü' && e.shiftKey) || (key == '[' && e.ctrlKey && e.altKey)) {
                                    return 186;
                                } else if (key == 'é' || (key == 'ö' && e.shiftKey)) {
                                    return 222;
                                }
                                break;
                            case 222:
                                return 219;
                            case 160:
                                return 221;
                            case 161:
                                return 192;
                            case 164:
                                return 223;


                            case 173:
                                return 189;
                            case 60:
                                return 226;

                        }
                        return code;
                    };
                }

                return tbl;
            }

            this.K4108 = this.K2055 = FR_CH;



            function NO_NO() {//Norwegian
                var tbl = codeTable.slice(0);
                tbl[220] = 0x29;//grave accent	192

                tbl[187] = 0x0C;//dash	189
                tbl[219] = 0x0D;//equal sign	187

                tbl[221] = 0x1A;//open bracket	219
                tbl[186] = 0x1B;//close braket	221
                tbl[191] = 0x2B;//back slash	220

                tbl[192] = 0x27;//semi-colon	186
                tbl[222] = 0x28;//single quote	222

                //    			    tbl[188] = 0x33;//comma	188
                //    			    tbl[190] = 0x34;//period	190
                tbl[189] = 0x35;//forward slash	191

                tbl[226] = 0x56;

                if (isFF) {
                    verifyKey = function (e) {
                        var code = e.keyCode;
                        var key = e.key;
                        switch (code) {
                            case 0:
                                if (key == 'å' || (key == 'Å' && e.shiftKey)) {
                                    return 221;
                                } else if (key == 'ø' || (key == 'Ø' && e.shiftKey) || (key == 'ö' && e.ctrlKey && e.altKey)) {
                                    return 192;
                                } else if (key == 'æ' || (key == 'Æ' && e.shiftKey) || (key == 'ä' && e.ctrlKey && e.altKey)) {
                                    return 222;
                                    //    							}else if (key == 'é' || (key == 'ö' && e.shiftKey)){
                                    //    								return 222;
                                }
                                break;
                            case 172:
                                return 220;
                            case 171:
                                return 187;
                            case 220:
                                return 219;

                            case 160:
                                return 186;
                            case 222:
                                return 191;

                            case 173:
                                return 189;
                            case 60:
                                return 226;

                        }
                        return code;
                    };
                }

                return tbl;
            }

            this.K1044 = this.K1083 = this.K1030 = NO_NO;


                function IS_IS(){//Icelandic
    				var tbl = codeTable.slice(0);
    				tbl[220] = 0x29;//grave accent	192
    	
    				tbl[187] = 0x0C;//dash	189
    				tbl[219] = 0x0D;//equal sign	187

    				tbl[221] = 0x1A;//open bracket	219
    				tbl[186] = 0x1B;//close braket	221
    				tbl[191] = 0x2B;//back slash	220
    				
    				tbl[192] = 0x27;//semi-colon	186
    			    tbl[222] = 0x28;//single quote	222
    			    
    				tbl[189] = 0x35;//forward slash	191
    			    
    				tbl[226] = 0x56;
    				
    				if (isFF){
    					verifyKey = function(e){
    						var code = e.keyCode;
    						var key = e.key;
    						switch (code){
    						case 0:
                                if (key == 'Dead'){
                                    return 220;
                                }else if (key == 'ö' || key == 'Ö' || key == '\\'){
                                    return 187;
                                }else if (key == 'ð' || key == 'Ð'){
                                    return 221;
                                }else if (key == 'æ' || key == 'Æ'){
                                    return 192;
                                }else if (key == 'þ' || key == 'Þ'){
                                    return 189;
                                }

    							break;
    						case 173:
    							return 219;
    						case 222:
    							return (key == 'Dead' || key == '\'') ? 222 : 186;
    						case 171:
    							return 191;
    						case 60:
    							return 226;

    						}
    						return code;
    					};
    				}
    				
    				return tbl;
    			}

                /*
                220-0-dead       187-0-öÖ 219-173
                221-0-ððð 186-222
                192-0-æÆ 222-Dead 191-171
                226-60    188 190 189-0-þÞ
                */
                this.K1039 = IS_IS;
    			
            function SV_SV() {//Swedish
                var tbl = codeTable.slice(0);
                tbl[220] = 0x29;//grave accent	192

                tbl[187] = 0x0C;//dash	189
                tbl[219] = 0x0D;//equal sign	187

                tbl[221] = 0x1A;//open bracket	219
                tbl[186] = 0x1B;//close braket	221
                tbl[191] = 0x2B;//back slash	220

                tbl[192] = 0x27;//semi-colon	186
                tbl[222] = 0x28;//single quote	222

                //    			    tbl[188] = 0x33;//comma	188
                //    			    tbl[190] = 0x34;//period	190
                tbl[189] = 0x35;//forward slash	191

                tbl[226] = 0x56;

                if (isFF) {
                    verifyKey = function (e) {
                        var code = e.keyCode;
                        var key = e.key;
                        switch (code) {
                            case 0:
                                if (key == '§' || (key == '½' && e.shiftKey)) {
                                    return 220;
                                } else if (key == 'å' || (key == 'Å' && e.shiftKey)) {
                                    return 221;
                                } else if (key == 'ø' || (key == 'Ø' && e.shiftKey) || (key == 'ö' && e.ctrlKey && e.altKey)) {
                                    return 192;
                                } else if (key == 'ä' || (key == 'Ä' && e.shiftKey)) {
                                    return 222;
                                }
                                break;
                            case 171:
                                return 187;
                            case 192:
                                return 219;

                            case 160:
                                return 186;
                            case 222:
                                return 191;

                            case 173:
                                return 189;
                            case 60:
                                return 226;

                        }
                        return code;
                    };
                }

                return tbl;
            }

            this.K1053 = SV_SV;
            this.K1055 = function () {
                var tbl = codeTable.slice(0);
                tbl[220] = 0x34;

                tbl[223] = 0x0C;//dash	189
                tbl[189] = 0x0D;//equal sign	187

                //    				tbl[221] = 0x1A;//open bracket	219
                //    				tbl[186] = 0x1B;//close braket	221
                tbl[191] = 0x33;//back slash	220

                //    				tbl[192] = 0x27;//semi-colon	186
                //    			    tbl[222] = 0x28;//single quote	222

                tbl[188] = 0x2B;//comma	188
                tbl[190] = 0x35;//period	190
                //    				tbl[189] = 0x35;//forward slash	191

                tbl[226] = 0x56;

                if (isFF) {
                    verifyKey = function (e) {
                        var code = e.keyCode;
                        var key = e.key;
                        switch (code) {
                            case 0:
                                if (key == 'ğ' || (key == 'Ğ' && e.shiftKey) || (e.ctrlKey && e.altKey && e.code == 'BracketLeft')) {
                                    return 219;
                                } else if (key == 'ü' || (key == 'Ü' && e.shiftKey) || (e.ctrlKey && e.altKey && e.code == 'BracketRight')) {
                                    return 221;
                                } else if (key == 'ş' || (key == 'Ş' && e.shiftKey) || (e.ctrlKey && e.altKey && e.code == 'Semicolon')) {
                                    return 186;
                                } else if (key == 'ö' || (key == 'Ö' && e.shiftKey)) {
                                    return 191;
                                } else if (key == 'ç' || (key == 'Ç' && e.shiftKey)) {
                                    return 220;
                                }
                                break;
                            case 73:
                                return 222;
                            case 60:
                                return 226;
                            case 173:
                                return 189;
                            case 170:
                                return 223;
                            case 162:
                                return 192;
                        }
                        return code;
                    };
                }

                return tbl;
            };

            this.K6153 = function Irish() {
                var tbl = codeTable.slice(0);
                tbl[223] = 0x29;//grave accent	192
                tbl[189] = 0xC;
                tbl[187] = 0xD;

                tbl[219] = 0x1A;
                tbl[221] = 0x1B;

                tbl[186] = 0x27;
                tbl[192] = 0x28;
                tbl[222] = 0x2B;

                tbl[220] = 0x56;
                tbl[188] = 0x33;
                tbl[190] = 0x34;
                tbl[191] = 0x35;
                return tbl;
            };

        };

    };

    this.getKeyboardMgr = function () {
        return keyboardLayout;
    }


    function ClipboardData() {
        var _data = [];
        this.sent = 0;
        this.types = [];
        var _cbMe = this;

        this.datas = _data;

        /**
         * data must be string or base 64 encoded array
         */
        this.setData = function (type, data) {
            if (type == 'text/plain' || type == 'text/html') {
                if ((data.length > 2) && (data.substring(0, 3) == '`\t`')) {//double check, it may happen
                    data = data.substring(3);
                }
                data = data.replace(/\r?\n/g, '\r\n');//replace \n with \r\n
            }

            _cbMe.types.push(type);
            _data.push(data);
        };

        this.getData = function (type) {
            var result = _data[_cbMe.types.indexOf(type)];
            if (!result && type == 'text/richtext') {
                // result = _data[_cbMe.types.indexOf('text/html')] || _data[_cbMe.types.indexOf('text/plain')];
                result = _data[_cbMe.types.indexOf('text/rtf')];
            }
            return result;
        };

        this.removeData = function (type) {
            var idx = _cbMe.types.indexOf(type);
            if (idx != -1) {
                _cbMe.types.splice(idx, 1);
                _data.splice(idx, 1);
            }
        };

        this.equals = function (another) {
            if (!another) return false;
            if (!hi5.Arrays.equals(_cbMe.types, another.types)) return false;

            var t, v0, v1, types = _cbMe.types;
            for (var i = 0, j = types.length; i < j; i++) {
                t = types[i];
                v0 = _cbMe.getData(t);
                v1 = another.getData(t);
                if (v0 != v1) return false;
            }
            return true;

        };
    }

    var _clipboard = new function Clipboard() {
        // var lastCopyTime = 0;

        function isHTML(s) {
            return s.search(/<.*(font|color|img|table|style|class).*>/gmi) > -1;
        }

        this.hasCopyCmd = document.queryCommandSupported('copy')
        this.hasPasteCmd = document.queryCommandSupported('paste');
        this.pasteEventFired = false;
        this.clipboardRead = 'denied';//'granted', 'denied' or 'prompt'
        this.clipboardWrite = 'denied';
        // var _thisClip = this;

        this.init = function(){
            if (navigator.permissions){
                navigator.permissions.query({name: 'clipboard-read'}).then(
                    function(permissionStatus) {
                        if (!_clipboard) return;
                        _clipboard.clipboardRead = permissionStatus.state;
                        // Listen for changes to the permission state
                        permissionStatus.onchange = function() {
                            if (!_clipboard) return;
                            _clipboard.clipboardRead = permissionStatus.state;
                            if (_clipboard.clipboardRead == "granted"){
                                enableDirectClipAccess();
                            }
                            svGlobal.logger.info("clipboard-read change: " + _clipboard.clipboardRead);       
                        };
                        if (_clipboard.clipboardRead == "granted"){
                            enableDirectClipAccess();
                        }
                        svGlobal.logger.info("clipboard-read: " + _clipboard.clipboardRead);       
                    }
                ).catch(
                    function(reason){
                        svGlobal.logger.info(reason);
                    }
                );
                navigator.permissions.query({name: 'clipboard-write'}).then(
                    function(permissionStatus) {
                        if (!_clipboard) return;
                        _clipboard.clipboardWrite = permissionStatus.state;
                        // Listen for changes to the permission state
                        permissionStatus.onchange = function() {
                            if (!_clipboard) return;
                            _clipboard.clipboardWrite = permissionStatus.state;
                            svGlobal.logger.info("clipboard-write change: " + _clipboard.clipboardWrite);
                        };
                        svGlobal.logger.info("clipboard-write: " + _clipboard.clipboardWrite);
                    }
                ).catch(
                    function(reason){
                        svGlobal.logger.info(reason);
                    }
                );
            }
        };
          

        this.release = function () {
            _clipboard.clipData = null;
            // _thisClip = null;
        };

        this.clipData = null;

        
        
        this.read = function(callback){
            var cd = new ClipboardData();
            if (_clipboard.clipboardRead != 'denied'){//FF has only writeText now Feb 3, 2019
                if (navigator.clipboard.read){
                    navigator.clipboard.read().then(
                        function(data){
                            var len = data.length;
                            var count = 0;
                            for (var i = 0; i < len; i++){
                                // console.log(data[i]);
                                var _type = data[i].types[0];
                                data[i].getType(_type).then(
                                    function(blob){
                                        if (_type == 'text/plain' || _type == 'text/html' || _type == 'text/rtf'){
                                            hi5.browser.blobToText(blob,
                                                function(txt){
                                                    cd.setData(_type, txt);
                                                    count++;
                                                    if (count == len){
                                                        callback(cd);
                                                    }
                                                }
                                            );
                                        }else if (_type == 'image/png'){
                                            hi5.browser.blobToArray(blob,
                                                function(arr){
                                                    var imgB64 = hi5.Base64.enc(arr);
                                                    cd.setData('image/png', imgB64);
                                                    count++;
                                                    if (count == len){
                                                        callback(cd);
                                                    }
                                                }
                                            );                                    
                                        }
                                    }
                                ).catch(
                                    function(err){
                                        callback(cd);
                                        svGlobal.logger.warn(err.message);
                                    }
                                );
                            }
                        }
                    ).catch(
                        function(err){
                            svGlobal.logger.warn(err.message);
                        }
                    );
                }else if (navigator.clipboard.readText){
                    navigator.clipboard.readText().then(
                        function(clipText){
                            cd.setData('text/plain', clipText);
                            callback(cd);
                        }
                    ).catch(
                        function(err){
                            callback(null)
                        }
                    );
                }
            }else if (window.clipboardData){
                cd.setData('text/plain', window.clipboardData.getData('Text'));
                callback(cd);
            }else{
                callback(null);
                return false;
            }

            return true;
        };

        this.paste = function (callback, e) {
            var ecd = window.clipboardData || e.clipboardData;
            if (ecd.files && ecd.files.length > 0 && fileHandler){
                fileHandler.addFiles(ecd.files, true);
                return;
            }

            var cd = new ClipboardData(),
                i = 0,
                blob = null,
                _text = window.clipboardData ? ecd.getData('Text') : ecd.getData('text/plain'),
                _rtf = '',
                _html = '',
                len = 0;

            if (ecd.types) {
                _html = ecd.getData('text/html');//Edge return '' for now
            }

            if (_html && !_text) {//only happens on Safari
                _text = hi5.browser.html2text(_html);
            }

            if (_text) {
                cd.setData('text/plain', _text);
            }

            if (appcfg.pasteTextOnly) {
                e.preventDefault();
                callback(cd);
                return;
            }

            //check image
            var items = ecd.items;
            if (items) {
                for (i = 0, len = items.length; i < len; i++) {
                    if (items[i].type == 'image/png') {
                        blob = items[i].getAsFile();
                        break;
                    }
                }
            } else if (ecd.files) {//IE support files http://ie.microsoft.com/testdrive/browser/Editing_Paste_Image/ http://blogs.msdn.com/b/ie/archive/2013/10/24/enhanced-rich-editing-experiences-in-ie11.aspx
                var files = ecd.files;
                for (i = 0, len = files.length; i < len; i++) {
                    if (files[i].type.indexOf('image/png') != -1) {
                        blob = files[i];
                        break;
                    }
                }
            }

            if (blob) {//process the image only
                e.preventDefault();
                // var reader = new FileReader();
                // reader.onloadend = function (e) {
                //     if (e.target.readyState == FileReader.DONE) {
                //         var imgB64 = hi5.Base64.enc(new Uint8Array(e.target.result));
                //         cd.setData('image/png', imgB64);
                //         callback(cd);
                //     }
                // };
                // reader.readAsArrayBuffer(blob);
                hi5.browser.blobToArray(blob, function(arr){
                    var imgB64 = hi5.Base64.enc(arr);
                    cd.setData('image/png', imgB64);
                    callback(cd);
                });
                return;
            }

            if (!_text) {//no html, rtf
                // console.log('paste, no text');
                e.preventDefault();
                callback(cd);
                return;
            }

            //now for html, rtf format
            if (ecd.types) {//ecd.getData('text/rtf');//IE11 throw "Invalid parameters" error
                var hasRTF = ecd.types.indexOf ? ecd.types.indexOf('text/rtf') != -1 : ecd.types.contains('text/rtf');//ecd.types is DOMStringList in Firefox
                _rtf = ecd.getData('text/rtf');
                if (_rtf) {
                    if (_rtf.charCodeAt(_rtf.length - 1) == 0) {
                        _rtf = _rtf.substring(0, _rtf.length - 1);
                    }
                    cd.setData('text/rtf', _rtf);
                }
                if (_html) {
                    i = _html.lastIndexOf('</html>');
                    if ((i + 7) < _html.length) {
                        _html = _html.substring(0, i + 7);//When copy from Word, Chrome has "\r\nO�f=���N" at the end
                    }
                    cd.setData('text/html', _html);
                }
                var needHTML = hasRTF && !_rtf && !_html;//html can be converted to rtf on gateway
                if (!needHTML) {
                    // console.log('paste, no html');
                    e.preventDefault();
                    callback(cd);
                    return;
                }
            }

            //get html from the div.innerHTML for browsers don't support getData('text/html'): IE,  old Safari
            if ('TEXTAREA' == e.target.nodeName) {//IE
                // console.log('paste, command');
                e.preventDefault();
                if (document.queryCommandSupported('paste')){
                    cd = _clipboard.getClipContent(cd);
                }
                callback(cd);
                return;
            }

            //Edge, Old Safari goes here
            if (keyboard) {
                keyboard.disableTextInput = true;
            }

            if (touchKeyboard) {
                touchKeyboard.disableTextInput = true;
            }

            e.target.innerHTML = '';

            var saveOpacity = e.target.style.opacity;
            e.target.style.opacity = 0.01;//make sure the pasted text invisible

            setTimeout(function () {
                var newV = e.target.innerHTML;
                if (newV && newV != _text) {
                    cd.setData('text/html', '<body>' + newV + '</body>');

                    if (keyboard) {
                        keyboard.init();
                    } else {
                        e.target.innerHTML = "";
                    }

                }
                callback(cd);

                e.target.style.opacity = saveOpacity;

                if (keyboard) {
                    keyboard.disableTextInput = false;//TODO: remove the dependence
                }
                if (touchKeyboard) {
                    touchKeyboard.disableTextInput = false;//TODO: remove the dependence
                }
            }, 300);

        };

        this.onCopy = function (e) {
            if (e.target != wsInput.element) {//} || (touchInput && (e.target != touchInput))){
                return;
            }

            if (!allowInput || !useClipboard) {
                cancelDefault(e);
            }
            var isCopy = e.type == 'copy';
            var scancode = isCopy ? 0x2E : 0x2D;//C : X
            var cx = isCopy ? 67 : 88;//C : X
            
            if (!ctrlcSent) {
                sendScancode(true, 0x1d, 'Control');
                sendKeyCode(true, cx, scancode);
                sendKeyCode(false, cx, scancode);
                sendScancode(false, 0x1d, 'Control');
            }
            // if (fastCopy) {
            //     var curr = Date.now();
            //     var d = curr - lastCopyTime;
            //     lastCopyTime = curr;
            //     if (d > 500) return;//not a double copy/cut
            // }

            if (_browser.isMacOS){//Mac will eat C or X up
                sendKeyCode(false, cx, scancode);
            }

            if (!useClipboard || directClipAccess || !copyToLocal) return;

            if ((Date.now() - lastCopyTime) > 999){
                var valueCopied = controller.getClipData(e.type);
                _setClipData(e, valueCopied);
                _clipboard.clipData = null;
                clipSynced = true;//clipboard are sync now
            }

            lastCopyTime = Date.now();

            svGlobal.logger.info('clip synced: true');
        }

        this.onPaste = function (e) {
            // console.log("on paste .. " + (e.target == wsInput.element) + ' ' + !!ieOperation + ' ' + allowInput + ' ' + useClipboard);
            if (e.target != wsInput.element) {// && (e.target != touchInput)){
                return;
            }

            if (ieOperation) {
                ieOperation.cancelCtrlV();
            }


            if (!allowInput || !useClipboard) {
                return cancelDefault(e);
            }

            if (!copyToRemote){
                clipSynced = true;
            }

            if (!myLI.alwaysPaste && clipSynced) {
                var _sendCtrlV = true;
                if (myLI.onclipdata) {
                    _sendCtrlV = !myLI.onclipdata(_clipboard.clipData, true);
                }
                if (_sendCtrlV) {
                    setTimeout(sendCtrlV, 300);
                }
                svGlobal.logger.info('Ctrl+V only');
                return cancelDefault(e);
            }

            clipSynced = true;

            _clipboard.paste(onClipboardData, e);

            return true;
        }

        this.parseClipData = function (v) {
            var idx = v.indexOf(';');
            var t = v.substring(0, idx);
            var v = v.substring(idx + 1);

            return { type: t, value: v };
        }

        function _setClipData(e, value) {
            //IE use execCommand, only consider Chrome, Firefox, Safari, Edge here.
            var _data = _clipboard.parseClipData(value);

            if (appcfg.copyTextOnly && _data.type != 'text/plain') {
                return;
            }

            if (_clipboard.processFileGroup(_data)) {
                return;
            }

            //You can use execCommand('copy') in Chrome, but not work on Firefox
            var isImg = _data.value.startsWith('<img data-sv-img');
            var imgToWrite =  isImg && _clipboard.clipboardWrite != 'denied' && navigator.clipboard.write;
            if (imgToWrite){
                e.preventDefault();
                setTimeout(function(){
                    _clipboard.copyImageToClipboard(_data.value);
                    // console.log('ccc image', _data);
                }, 20);
            }else{
                if (_data.type != 'text/plain'&& !isImg) {
                    var txt = hi5.browser.html2text(_data.value);
                    if (txt) {
                        e.clipboardData.setData('text/plain', txt);
                    }
                }
                
                if (isImg){
                    _clipboard.processImgCopy(_data.value);
                }
                e.clipboardData.setData(_data.type, _data.value);
                e.preventDefault();
            }

            //TODO: doesn't work on iOS
        }

        this.getClipContent = function (cd) {
            if (!document.queryCommandSupported('paste')) {
                return cd;
            }

            var tmpInput = makeEditable(appcfg.pasteTextOnly ? 'textarea' : 'div');
            tmpInput.focus();


            try {
                if (document.queryCommandEnabled('paste')) {
                    var success = document.execCommand('paste');
                    if (success) {
                        if (!cd) {
                            cd = new ClipboardData()
                        }
                        if (!appcfg.pasteTextOnly) {
                            cd.setData('text/html', '<body>' + tmpInput.innerHTML + '</body>');
                        }
                        if (cd.types.indexOf('text/plain') == -1) {
                            cd.setData('text/plain', appcfg.pasteTextOnly ? tmpInput.value : (tmpInput.innerText || hi5.browser.html2text(tmpInput.innerHTML)));
                        }
                        return cd;
                    }
                }
            }
            finally {
                myLI.focused = true;
                tmpInput.parentNode.removeChild(tmpInput);
                if (wsInput) {
                    wsInput.focus();
                }
            }
            return cd;
        }

        this.accessClip = function (callback, format) {
            function _onerror(err){
                callback(null);
            }

            var useAsync = _clipboard.clipboardRead != 'denied' && navigator.clipboard.readText;
            if (useAsync){
                if (format == 'text/plain'){
                    navigator.clipboard.readText().then(
                        function(clipText) {
                            var cd = new ClipboardData();
                            cd.setData('text/plain', clipText);
                            callback(cd);
                        }
                    ).catch(_onerror);

                    return true;
                }else if (navigator.clipboard.read){
                    navigator.clipboard.read().then(
                        function(items) {
                            if (!items.length){
                                _onerror();
                                return;
                            }
                            items[0].getType(format).then(
                                function(blob){
                                    if (format == 'image/png'){
                                        hi5.browser.blobToArray(blob, function(arr){
                                            var imgB64 = hi5.Base64.enc(arr);
                                            var cd = new ClipboardData();
                                            cd.setData('image/png', imgB64);
                                            callback(cd);
                                        });
                                    }else if (format == 'text/html'){
                                        blob.text().then(function(s){
                                            var cd = new ClipboardData();
                                            cd.setData('txt/html', s);
                                            callback(cd);
                                        }).catch(_onerror);
                                    }
                                }
                            ).catch(_onerror);
                        }
                    ).catch(_onerror);
                    return true;

                }
            }

            if (!document.queryCommandSupported('paste')) {
                callback(null);
            }

            var tmpInput = makeEditable(appcfg.pasteTextOnly ? 'textarea' : 'div');
            tmpInput.focus();
            tmpInput.addEventListener('paste', function (e) {
                e.stopPropagation();
                // myLI.showMessage('onPaste..');
                _clipboard.pasteEventFired = true;
                _clipboard.paste(function (cd) {
                    myLI.focused = true;
                    if (tmpInput.parentNode) {
                        tmpInput.parentNode.removeChild(tmpInput);
                    }
                    if (wsInput) {
                        wsInput.focus();
                    }
                    callback(cd);
                }, e);
            }, false);
            _clipboard.pasteEventFired = false;
            //IE execCommand return true if user denied the clipboard permission, but return false in debug mode
            if (!document.queryCommandEnabled('paste') || !document.execCommand('paste') || !_clipboard.pasteEventFired) {
                setTimeout(function(){
                    // myLI.showMessage('exePaste failed');
                    clipSynced = true;
                    if (!_clipboard.pasteEventFired){
                        callback(null);
                    }
                    myLI.focused = true;
                    if (tmpInput.parentNode) {
                        tmpInput.parentNode.removeChild(tmpInput);
                    }
                    if (wsInput) {
                        wsInput.focus();
                    }
                }, 55);
                return false;
            }
            else{
                // myLI.showMessage('exePaste fine');
                return true;
            }
        }

        this.getContent = function () {
            var cd = _clipboard.getClipContent();
            if (wsInput) {
                wsInput.element.removeEventListener("click", _clipboard.getContent, false);
            }
            if (cd && !cd.equals(_clipboard.clipData)) {
                _clipboard.clipData = cd;
                controller.send('880text/plain,text/html\t0');
                return true;
            } else {
                return false;
            }
        };

        this.startPasteCmd = function () {
            if (wsInput && document.queryCommandSupported('paste')) {
                wsInput.element.addEventListener("click", _clipboard.getContent);
            }
        };

        this.waitingCopyContent = false;
        this.copyContent = null;

        function checkCopyContent() {
            if (!_clipboard) return;
            if (_clipboard.copyContent) {
                _clipboard.copyToClipboard(_clipboard.copyContent.type, _clipboard.copyContent.value);
                _clipboard.copyContent = null;
            }
            _clipboard.waitingCopyContent = false;
        }

        this.waitForCopyContent = function () {
            _clipboard.waitingCopyContent = true;
            setTimeout(checkCopyContent, 700);
        };

        this.prePaste = function () {
            if (clipSynced || (!document.queryCommandEnabled('paste') && !window.clipboardData)) return;//only supported in IE or CEF

            _clipboard.accessClip(function (cd) {
                if (!cd) return;
                var noChange = cd.types.length === 0 || cd.equals(_clipboard.clipData);
                var types = noChange ? '' : cd.types.join(',');
                if (!noChange) {
                    // if (types.indexOf('text/html') != -1 && types.indexOf('text/rtf') == -1) {
                    //     types += ',text/rtf';
                    // }
                    var s = cd.getData('text/plain');
                    var hash = s ? s.hashCode() : 0;

                    controller.send('880' + types + '\t' + hash);
                    _clipboard.clipData = cd;
                    clipSynced = true;
                }

            });
        };

        this.copyImageToClipboard = function(value){
            var idx = value.indexOf('src="') + 5;
            var end = value.indexOf('"', idx);
            var src = value.substring(idx, end);
            fetch(src//, {credentials: 'include'} //This will fail if it's same origion
                ).then(
                    function(response){
                        if (response.ok){
                            return response.blob();
                        }
                        throw new Error('Nework error, access ' + stc);
                    }
                ).then(
                    function(blob){
                        var item = new ClipboardItem({'image/png': blob});
                        navigator.clipboard.write([item]);
                    }
                ).catch(
                    function(e){
                        svGlobal.logger.warn(e);
                    }
                );
        };

        this.copyToClipboard = function (type, value) {
            var dialogType = (type == 'text/plain') ? 'textarea' : 'div',
                result = false,
                isImg = value.startsWith('<img data-sv-img'),
                isText = type == 'text/plain',
                ctrlRange;

            if (type == 'text/html'){
                if (!isHTML(value)){
                    type = 'text/plain';
                    isText = true;
                }
            }

            if (isText){
                if (window.clipboardData){
                    window.clipboardData.setData('Text', value);
                    result = true;
                }else if (_clipboard.clipboardWrite != 'denied'){
                    navigator.clipboard.writeText(value).catch(
                        function(e){
                            svGlobal.logger.warn(e);
                        }
                    );
                    result = true;
                }
            }
            if (!isText || !result){
                var useAsync = (isImg || type == 'text/html' || type =='text/rtf')&& _clipboard.clipboardWrite != 'denied' && navigator.clipboard.write;
                if (useAsync){
                    if (isImg){
                        _clipboard.copyImageToClipboard(value);
                    }else{
                        var _item = null;
                        if (type == 'text/html'){
                            var blobHtml = new Blob([value], {type: 'text/html'});
                            var blobText = new Blob([hi5.browser.html2text(value)], {type: 'text/plain'});
                            _item = new ClipboardItem({'text/html': blobHtml, 'text/plain': blobText});
                        }else{//rtf
                            //both Chrome and FF don't support rtf write.
                            //The gaetway will convert Rtf to HTML, so this part is not rechable.
                            myLI.showMessage("Type text/rtf not supported on write");
                            // var blobRtf = new Blob([value], {type: 'text/rtf'});
                            // _item = new ClipboardItem({'text/rtf': blobRtf});
                        }
                        navigator.clipboard.write([_item]);
                    }
                    result = true;
                }else{
                    var tmpInput = makeEditable(dialogType, false);
                    if (dialogType == 'div') {
                        tmpInput.innerHTML = value;
                        tmpInput.focus();
                        if (isImg && document.body.createControlRange) {//IE
                            ctrlRange = document.body.createControlRange();
                            ctrlRange.add(tmpInput.childNodes[0]);
                            isImg = false;
                        } else {
                            _browser.selectEditable(tmpInput);
                        }
                    } else {
                        tmpInput.value = value;
                        tmpInput.focus();
                        tmpInput.select();
                    }

                    try {
                        if (ctrlRange) {
                            result = ctrlRange.execCommand("Copy");
                        } else {
                            result = document.execCommand('copy', false, null);
                        }
                    }
                    catch (e) {
                    }
                    finally {
                        myLI.focused = true;
                        tmpInput.parentNode.removeChild(tmpInput);
                        if (wsInput) {
                            wsInput.focus();
                        }
                    }
                }
            }

            clipSynced = true;

            if (!result && myLI.beforeCopyDialog && myLI.beforeCopyDialog(value, __svi18n.info.imgCopyDownload, type)) {
                return true;
            }

            var imgWarned = isImg && !result && _clipboard.processImgCopy(value);
            if (!result) {//we assume it's synced
                if (!imgWarned && __svi18n.info.userCopy) {
                    myLI.showMessage({ 'title': __svi18n.info.userCopy, 'msg': value, 'timeout': 9999, 'select': true, 'format': type });
                }
            }

            return result;
        };

        this.processFileGroup = function (data) {
            if (data.type == 'application/x-filegroup') {
                var lines = data.value.split('\r\n'), names = '', size = 0;
                var file = null;//first file name
                lines.forEach(function (line) {
                    var vs = line.split('\t');
                    if (vs.length > 1) {
                        if (names) {
                            names += ',';
                        }
                        names += vs[0];
                        if (!file){
                            file = vs[0];
                        }
                        size += parseInt(vs[1], 10);
                    }
                });

                if (names.length > 28) {
                    names = names.substring(0, 28) + '...';
                }
                names = names + '<br>Total: ' + hi5.tool.bytesToSize(size) + ' Qty:' + lines.length;

                if (__svi18n.info.download){
                    myLI.showMessage({'title': __svi18n.info.download, 'msg': names, 'timeout': 9000, 
                        'cbYes': function () {
                            this.destroy();
                            // fileHandler.download();
                            controller.getFile(file, 'clip');
                        },
                        'cbNo': function () {
                            this.destroy();
                        }
                    });
                }
                return true;
            } else {
                return false;
            }
        };

        this.processImgCopy = function (value) {
            if ((value.indexOf('data-sv-img') > 0) && __svi18n.info.imgCopyDownload) {
                myLI.showMessage({ 'title': __svi18n.info.imgCopyDownload, 'msg': value, 'timeout': 9999 });
                return true;
            } else {
                return false;
            }
        };

    }


    function enableDirectClipAccess(){
        directClipAccess = true;
        useCopyEvent = false;
        if (wsInput){
            var element = wsInput.element;
            element.removeEventListener('copy', _clipboard.onCopy, false);
            element.removeEventListener('cut', _clipboard.onCopy, false);
        }
        svGlobal.logger.info("Async clipboard enabled.");
    }


    /*
    function iOSArrowKey(target){
        target.value = "A1B2";
        target.setSelectionRange(2,2);
        var thisAK = this;
        target.onfocus = function(){
            target.setSelectionRange(2,2);
        };
        
        target.o
        
        target.addEventListener('keyup', function(e){
            if (e.keyCode !== 0) return;
            switch (target.selectionStart){
            case 0:
                thisAK.onarrowkey('up');
                break;
            case 1:
                thisAK.onarrowkey('left');
                break;
            case 3:
                thisAK.onarrowkey('right');
                break;
            case 4:
                thisAK.onarrowkey('down');
                break;
            }
            target.setSelectionRange(2,2);
        }, false);
    }
*/


    //workaournd for bug:https://code.google.com/p/chromium/issues/detail?id=118639
    //Using input event instead of textInput which is only available on webkit
    function KeyboardHandler(target) {
        this.unicode = false;
        var _this = this;
        var oldValue = '', keyDownCode = 0;

        var isInput = ('INPUT' == target.nodeName || 'TEXTAREA' == target.nodeName), isDiv = ('DIV' == target.nodeName);

        function getValue() {
            var v = (isInput ? target.value : (_browser.isFirefox ? target.textContent : target.innerText));
            return v;
        }

        this.setValue = function (v) {
            var _save = _this.disableTextInput;
            _this.disableTextInput = true;
            if (isInput) {
                target.value = v;
            } else if (isDiv) {
                target.innerHTML = v;
            }
            _this.disableTextInput = _save;
        };

        function _init() {
            if (_this) {
                var v = '';
                oldValue = v;
                _this.setValue(v);
            }
        }

        function _initLater() {
            setTimeout(_init, 100);
        }


        this.init = _init;

        this.disableTextInput = false;

        _init();

        function _keydown(e) {

            keyDownCode = e.keyCode;

            if (_this.onkeydown) {
                _this.onkeydown(e);
            }
        }

        function _keyup(e) {
            if (_this.onkeyup) {
                _this.onkeyup(e);
            }

            var code = e.keyCode;
            if (code == 13 || (code == 32 && keyDownCode == 32)) {//keyDownCode can be 229 when entering Chinese.
                _initLater();
            }

        }

        function _keypress(e) {
            if (_this.onkeypress) {
                _this.onkeypress(e)
            }
        }

        function _sendBacksapce(times) {
            if (_this.onbackspace) {
                for (var i = 0; i < times; i++) {
                    _this.onbackspace();
                }
            }
        }

        function _input(e) {
            if (_this.disableTextInput) return;
            e.stopPropagation();

            var v = getValue();
            var len = v.length;

            if (v == oldValue) return;

            var oldLen = oldValue.length;
            var index = v.indexOf(oldValue);


            if (v && (index === 0)) {//new char added.
                v = v.substring(oldLen);
                if (v.length > 0 && _this.ontextinput) {
                    _this.ontextinput({ data: v, 'target': target });
                    if (v == '.') {
                        _init();
                        return;
                    }
                }
            } else {//del old one, add new one
                index = oldValue.indexOf(v);
                if (index === 0) {//delete
                    if (keyDownCode != 8) {//backsapce key is not just sent, like delete a char in IME
                        _sendBacksapce(oldLen - len);
                    }
                } else {//modified, like use select another option from the IME
                    if (_browser.isAndroid){
                        _sendBacksapce(oldLen);//delete old one first
                    }
                    if (v.length > 0 && _this.ontextinput) {
                        _this.ontextinput({ data: v, 'target': target });
                    }
                }
            }

            if (getValue() === '') {
                _initLater();
            }

            oldValue = getValue();

        }

        target.addEventListener('keydown', _keydown, false);
        target.addEventListener('keyup', _keyup, false);
        target.addEventListener('keypress', _keypress, false);



        function _textInput(e) {
            if (_this.disableTextInput) return;

            if (!e.data) return;//onpaste will be canceled if we don't do this because of the preventDefault

            e.stopPropagation();
            if (_browser.isIE){
                e.preventDefault();
            }

            if (_this.ontextinput) {
                _this.ontextinput(e);
            }


        }

        if (_browser.isAndroid && _browser.isChrome){
            target.addEventListener('input', _input, false);
            target.addEventListener('mouseup', _init, false);

        }
        else if (window.TextEvent){//prefer textInput event
            target.addEventListener('textInput', _textInput, false);//Webkit
            target.addEventListener('textinput', _textInput, false);//IE
        } 
        else {//use InputEvent
            if (hi5.tool.hasProperty(InputEvent, 'data')){//it's kind of same as textInput
                target.addEventListener('input', _textInput, false);    
            }
            else {
                target.addEventListener('input', _input, false);
                target.addEventListener('mouseup', _init, false);
            }
        }

        function _composition(e){
            if (_this.oncomposition){
                _this.oncomposition(e);
            }
        }

        target.addEventListener('compositionstart', _composition, false);
        target.addEventListener('compositionend', _composition, false);
        target.addEventListener('compositionupdate', _composition, false);

        this.release = function () {
            _this = null;
            target.removeEventListener('keydown', _keydown, false);
            target.removeEventListener('keyup', _keyup, false);
            target.removeEventListener('input', _input, false);//Android chrome backspace key fix
            target.removeEventListener('focus', _init, false);
            target.removeEventListener('textInput', _textInput, false);//Webkit
            target.removeEventListener('textinput', _textInput, false);//IE
            target = null;
        };
        this.select = function () {
            selectElement(target);
        };
    }

    var isMac = _browser.isMacOS || _browser.isiOS;

    var _keyStatus = new function KeyStatus() {
        this.noKeyStuck = false;
        this.ctrlDelayed = false;
        this.onComposition = false;
        this.afterComposition = false;
        this.preKey = {code: 0, down: false};
        this.preScancode = {code: 0, down: false};
        this.noUnicode = false;
        
        var isPreAltGrUp = false, _isAltGr = false, isSingleAltGr = false;
        var keyDownRec = {};

        /**
         * 
         * @param {*} e mouse event
         * @returns 
         */
        this.sendMissKey = function (e) {
            if (_keyStatus.noKeyStuck){
                return;
            }

            for (var key in keyDownRec){//if we aways send Ctrl up, alt up when browser get focused, this could interfere with the file drop which will send Ctrl+V too. 
                if (keyDownRec[key]){
                    var iKey = parseInt(key, 10);
                    if (e){//function keys can be really down
                        switch (iKey){
                            case 0x2a://shift
                            case 0x3b://shift right
                                if (e.shiftKey) return;
                                break;
                            case 0x1d:
                            case 0x9d://control
                                if (isMac){
                                    if (e.metaKey) return;
                                }else{
                                    if (e.ctrlKey) return;
                                }
                                break;
                            case 0x38:
                            case 0xB8://alt
                                if (e.altKey) return;
                                break;
                            case 0xDB:
                            case 0xDC://windows
                                if (isMac){
                                    if (e.ctrlKey) return;
                                }else{
                                    if (e.metaKey) return;
                                }
                                break;
                        }
                    }
                    //printable keys should be all released when mouse pressed
                    sendScancode(false, iKey);
                }
            }
        };

        this.isKeyDown = function(key){
            return keyDownRec[key];
        }

        this.isKeyDownSent = function(down, key){
             var sent = true;
            if (!down){
                sent = keyDownRec[key];
            }

            if (down){
                keyDownRec[key] = down;
            }else{
                delete keyDownRec[key];
            }
            return sent;
        };

        function getModifierFlags(e){
            var flags = 0;
            if (e.getModifierState('CapsLock')){
                flags |= 4;
            }

            if (isMac || _browser.isCrOS){//NumLock is the clear key on Mac which state is always off (on CrOS too)
                flags |= (controller.localLockFlags & 2);
            }else if (e.getModifierState('NumLock')){
                flags |= 2;
            }
            
            if (e.getModifierState('ScrollLock')){
                flags |= 1;
            }
            return flags;
        }

        //This works on both KeyboardEvent and MouseEvent
        //check controller.checkLockFlags before calling this to avoid unnecessary calls.
        this.syncLockKeyStatus = function (e){
            if (e.getModifierState && controller.sendKeyboardSyncFlags){ //&& !keyboard.unicode){//xrdp 0.9.4 will have issue (SAP) on unicode if sending kbdsync
                var flags = getModifierFlags(e);
                // svGlobal.logger.info("sync lock keys, current:" + flags + ' was:' + controller.localLockFlags + ' remote:' + controller.remoteLockFlags);
                if (!controller.sendKeyboardSyncFlags(flags)){//sync failed, need to check again next time
                    controller.checkLockFlags = true;
                }else{
                    controller.checkLockFlags = false;//check alrady, avoid send checking every time.
                }
            }
        }

        this.check = function (e) {
            var code = keyboardLayout.getKeyCode(e);//e.keyCode;
            var down = e.type == 'keydown';
            // console.log('remoteFlags:' + controller.remoteLockFlags + " changed:" + controller.checkLockFlags + " local:" + controller.localLockFlags);
            // console.log('NumLock:' + e.getModifierState('NumLock') + 'CapsLock:' + e.getModifierState('CapsLock'));
            if (controller.checkLockFlags && down && code != 144 & code != 20 && code != 145){//don't send sync when pressing lock keys which can cause confilct
                _keyStatus.syncLockKeyStatus(e);
            }

            if (code == 17){
                ctrlDown = down;
            }

        };

        this.continue = function(down, scancode, unicode){
            //Browser will send CtrlLeft+AltRight for AltGr on non Mac OS, so we need to ignore the extra CtrlLeft
            if (scancode == 0x1D && down){//CtrlLeft
                _keyStatus.ctrlDelayed = true;
                return false;//Make sure we send the delayed ctrlDown before mouse event
            }
            
            if (_keyStatus.ctrlDelayed || (isMac && down)){
                if (scancode == 0xB8){//AltRight
                    _keyStatus.ctrlDelayed = false;
                    _isAltGr = true;
                    isSingleAltGr = true;//assume it's a AltGr Down UP without char in the middle
                }else if (_keyStatus.ctrlDelayed){
                    _keyStatus.ctrlDelayed = false;
                    if (!_isAltGr){
                        sendScancode(true, 0x1D, 'Control'); //send the delayed CtrlDown
                    }
                    return true;
                }
            }
            
            if (scancode == 0x1D){//Ctr, it must be up
                if (_isAltGr && !down){
                    return false;
                }
            }else if (scancode == 0xB8 && _isAltGr){//ignore both AltRigth on unicode keyboard too
                if (!down){
                    _isAltGr = false;
                    isPreAltGrUp = true;
                    if (isSingleAltGr && unicode){
                        sendScancode(true, 0xB8, 'AltGraph');
                        sendScancode(false, 0xB8, 'AltGraph');
                        isSingleAltGr = false;
                    }
                }
                return unicode ? false : true;
            }

            return true;
            //end of processing AltGr


        };
        this.isAltGr = function(down){
            if (_isAltGr){
                isSingleAltGr = false;//not a AltGr Down UP
                return true;
            }
            if (isPreAltGrUp){
                isPreAltGrUp = false;
                if (down){
                    return false;
                }else{
                    return true;
                }
            }else{
                return false;
            }

        };
    }




    function addMouseWheelHandler(elm, callback, useCapture) {
        var total = 0, preTime = 0;
        //https://developer.mozilla.org/en-US/docs/Web/Events/wheel
        function _handleWheel(e) {
            var lines = 0, v = 0, time = 0;
            var pos = getMousePos(e),
                deltaMode = e.deltaMode || 0,//0: pixel, 1: lines (float number), 2: pages
                isHorizon = !!e.deltaX || !!e.wheelDeltaX;

            e.preventDefault();
            e.stopPropagation();
            // console.log(e);
            // if (deltaMode == 1) {//lines
            //     callback(-e.deltaY || -e.deltaX, pos, isHorizon);
            //     return;
            // }
            var hasDeltaY = 'deltaY' in e;
            //
            var lineHeight = (deltaMode == 1) ? 1 : (hasDeltaY ? 40 : (('wheelDelta' in e) ? 120 : 0));
            if (lineHeight) {
                time = Date.now();
                if ((time - preTime) > 100) {
                    total = 0;
                }
                v = -e.deltaY || -e.deltaX || e.wheelDelta;
                if (deltaMode == 3){//Pages
                    v = v * (24 * lineHeight);//suppose it's 24 lines.
                }

                if (v != 0) {//Chrome fire extra mousewheel events when right click on Mac since version 46, but wheelDelta = 0
                    total += v;

                    lines = (total / lineHeight) | 0;
                    total = (total % lineHeight);
                    if (lines !== 0) {
                        callback(lines, pos, isHorizon);
                    }
                }
                preTime = time;
            } else {//https://developer.mozilla.org/en-US/docs/Web/Events/DOMMouseScroll
                lines = -e.detail;
                if (Math.abs(lines) == 32768) {//scroll one page
                    v = (window.innerHeight / 40) | 0;
                    lines = (lines < 0) ? -v : v;
                }
                callback(lines, pos, false);
            }
        }

        // elm.addEventListener('DOMMouseScroll', _handleWheel, true);
        // elm.addEventListener('mousewheel', _handleWheel, true);
        elm.addEventListener('wheel', _handleWheel, true);
    }

    function PointerManager(target) {
        var touchEvt = false;
        var _pm = this;

        function _mousedown(e) {
            if (touchEvt) return;
            if (_pm.onmousedown) {
                _pm.onmousedown(e);
            }
        }

        function _mousemove(e) {
            if (touchEvt) return;
            if (_pm.onmousemove) {
                _pm.onmousemove(e);
            }
        }

        function _mouseup(e) {
            if (myLI && myLI.focused){//in case there are multiple sessions running in one web page, prevent mouse up meesage sending to the server
                if (touchEvt) {
                    touchEvt = false;
                    return;
                }
                if (_pm.onmouseup) {
                    _pm.onmouseup(e);
                }
            }
        }

        function _mouseout(e){
            if (appcfg.releaseOnMouseOut){
                releaseStuckedMouse();
            }
        }

        function _touch(e) {
            var type = e.type;
            if (type == 'touchstart') {
                touchEvt = true;
            }
            if (_pm.ontouch) {
                _pm.ontouch(e);
            }
        }

        var isPointer = navigator.pointerEnabled || navigator.msPointerEnabled || false;
        if (('ontouchstart' in window) || !isPointer) {
            target.addEventListener('touchstart', _touch, false);
            target.addEventListener('touchend', _touch, false);
            target.addEventListener('touchmove', _touch, false);
            target.addEventListener('touchcancel', _touch, false);

            document.addEventListener('mousemove', _mousemove, false);
            target.addEventListener('mousedown', _mousedown, false);
            target.addEventListener('mouseout', _mouseout, false);
            document.addEventListener('mouseup', _mouseup, false);
        }
        else if (navigator.pointerEnabled) {
            target.addEventListener('pointerdown', _touch, false);
            target.addEventListener('pointerup', _touch, false);
            target.addEventListener('pointermove', _touch, false);
            target.addEventListener('pointerout', _mouseout, false);
            target.addEventListener('pointercancel', _touch, false);
        } else if (navigator.msPointerEnabled) {
            target.addEventListener('MSPointerDown', _touch, false);
            target.addEventListener('MSPointerUp', _touch, false);
            target.addEventListener('MSPointerMove', _touch, false);
            target.addEventListener('MSPointerCancel', _touch, false);
        }

        this.release = function(){
            if (('ontouchstart' in window) || !isPointer) {
                target.removeEventListener('touchstart', _touch, false);
                target.removeEventListener('touchend', _touch, false);
                target.removeEventListener('touchmove', _touch, false);
                target.removeEventListener('touchcancel', _touch, false);
    
                document.removeEventListener('mousemove', _mousemove, false);
                target.removeEventListener('mousedown', _mousedown, false);
                document.removeEventListener('mouseup', _mouseup, false);
            }
            else if (navigator.pointerEnabled) {
                target.removeEventListener('pointerdown', _touch, false);
                target.removeEventListener('pointerup', _touch, false);
                target.removeEventListener('pointermove', _touch, false);
                target.removeEventListener('pointercancel', _touch, false);
            } else if (navigator.msPointerEnabled) {
                target.removeEventListener('MSPointerDown', _touch, false);
                target.removeEventListener('MSPointerUp', _touch, false);
                target.removeEventListener('MSPointerMove', _touch, false);
                target.removeEventListener('MSPointerCancel', _touch, false);
            }
            this.onmousedown = null;
            this.ontouch = null;
            this.onmousemove = null;
            this.onmouseup = null;
        };
    }

    this.requestCredential = function (serverInfo, callback) {

        appcfg.closeOnDisconn = false;

        var div = null,
            frmLogin = ui_option.frmLogin;
        if (!frmLogin){
            var value = __svi18n.template.login;
            if (!value) {
                myLI.showMessage('No value for login template');
                return;
            }
            div = document.createElement('div');
            div.className = 'appdlg';
            div.innerHTML = value;
            document.body.appendChild(div);
            frmLogin = hi5.$('frmLogin');
        }else{
            div = ui_option.frmLogin;
        }
        

        var domainElm = _queryChild(frmLogin, 'loginDomain');
        var isDomainInput = domainElm.tagName.toUpperCase() == "INPUT";
        if (domainElm && serverInfo.nbDomain) {
            if (isDomainInput){
                domainElm.value = serverInfo.nbDomain;
            }else {
                domainElm.innerHTML = serverInfo.nbDomain;
            }
        }

        var dlg = new hi5.ui.Lightbox(div);
        dlg.onclose = function () {
            document.body.removeChild(div);
        };

        dlg.show();
        var elm = _queryChild(frmLogin, 'loginUser');
        if (elm) {
            elm.focus();
        }

        if (frmLogin) {
            frmLogin.onsubmit = function () {
                var user = _queryChild(frmLogin, 'loginUser').value;
                var password = _queryChild(frmLogin, 'loginPassword').value;
                var domain = isDomainInput ? domainElm.value : domainElm.innerHTML;
                dlg.dismiss();
                setTimeout(function () {
                    callback(user, password, domain);
                }, 5);
                return false;
            };
        }

    };

    function isInScreen() {
        return _touchpad ? true : !touchInputing && (widthFace <= window.innerWidth) && (heightFace <= window.innerHeight);
    }

    // function isCloseToEdge(el) {
    
    //     var rect = el.getBoundingClientRect();
    
    //     return  rect.top <= 20 ||
    //             rect.left <= 20 ||
    //             rect.bottom > (window.innerHeight - 20) ||
    //             rect.right > (window.innerWidth - 20);
    // }


    function TouchRemoting(control) {
        var downPointes;
        var ids = [], moved = false;

        function fixId(id) {
            if (id < 256) return id;
            var rst = ids.indexOf(id);
            if (rst != -1) return rst;
            ids.push(id);
            return ids.length - 1;
        }

        function buildData(touches, flags) {
            var t, size = touches.length;
            var data = new Array(size);
            for (var i = 0; i < size; i++) {
                t = touches[i];
                var pos = calMousePos(t.clientX, t.clientY, _canvas);
                data[i] = { 'contactId': fixId(t.identifier), 'contactFlags': flags, 'x': pos.x, 'y': pos.y };
            }
            return data;
        }

        function findDownPointes(contactId) {
            var len = downPointes.length;
            for (var i = 0; i < len; i++) {
                if (downPointes[i].contactId == contactId) {
                    return i;
                }
            }
            return -1;
        }

        //        function logTouchList(tl, tag){
        //            var s = "++++++" + tag;
        //            for (var i = 0, len = tl.length; i < len; i++){
        //                s += " " + i +", id:" + tl[i].identifier + " pX:" + tl[i].pageX + " pY:" + tl[i].pageY + ";";
        //            }
        //            console.log(s);
        //        }


        this.handle = function (e) {
            var type = e.type;

            var touches = e.touches;
            var data, size, changedTouches = e.changedTouches;
            cancelDefault(e);
            switch (type) {
                case 'touchstart':
                    moved = false;
                    //                logTouchList(touches, "--- touchs");
                    //                logTouchList(changedTouches, "--- chaTouchs");
                    size = touches.length;
                    data = buildData(touches, 25);//25= CONTACT_FLAG_DOWN | CONTACT_FLAG_INCONTACT | CONTACT_FLAG_INRANGE
                    downPointes = data;//send later
                    break;
                case 'touchmove':
                    data = buildData(changedTouches, 26);
                    if (!downPointes) {//This happens on IBM MASS browser!!!
                        downPointes = buildData(touches || changedTouches, 25);
                    }
                    var ignore = false;
                    if (downPointes.length > 0 && data.length == 1) {
                        var idx = findDownPointes(data[0].contactId);
                        if (idx != -1 && downPointes[idx].x == data[0].x && downPointes[idx].y == data[0].y) {
                            //ignore this move
                            ignore = true;
                        }
                    }

                    if (ignore) {
                        return;
                    } else if (downPointes.length > 0) {
                        control.redirectTouches(downPointes);
                        downPointes.length = 0;
                    }

                    control.redirectTouches(data);//26= CONTACT_FLAG_UPDATE | CONTACT_FLAG_INCONTACT  | CONTACT_FLAG_INRANGE;
                    moved = true;
                    break;
                case 'touchend':

                    if (!moved) {
                        control.redirectTouches(downPointes);
                        size = downPointes.length;
                        for (var i = 0; i < size; i++) {
                            downPointes[i].contactFlags = 4;
                        }
                        data = downPointes;
                    } else {
                        data = buildData(changedTouches, 4);
                    }
                    control.redirectTouches(data);//CONTACT_FLAG_UP
                    ids.length = downPointes.length = 0;
                    break;
                case 'touchcancel':
                    control.redirectTouches(buildData(changedTouches, 34));
                    ids.length = downPointes.length = 0;
                    break;
            }

        };
    }


    function TouchHandler(control) {
        var pointId = 0, pointes = 0, lastUpTime = 0, startTime = 0, isDoubleClick = false;//, fromEdge = 0;
        var touchStartX = 0, touchStartY = 0, lastX = 0, lastY = 0, isStart = false, flick = false;
        var correction = 3, isGesture = false;
        if (_browser.isIE) {
            correction *= 3;
        }

        this.delay = false;
        var startPointes = [];
        var _th = this;


        function space(ts) {
            var x = ts[1].screenX - ts[0].screenX;
            var y = ts[1].screenY - ts[0].screenY;
            return Math.sqrt(x * x + y * y);
        }
        //        
        function isPinchzoom(ts) {
            if (ts.length != 2) return false;
            var x = ts[1].screenX - ts[0].screenX;
            var y = ts[1].screenY - ts[0].screenY;
            return (Math.abs(y) > 100) || (Math.abs(x) > 350);

        }

        function get2Pointes(ts) {
            //get the lowest one
            var idxMax = 0, idxMin = 0, max = 0, min = 9999;
            for (var i = 0, len = ts.length; i < len; i++) {
                if (ts[i].screenY > max) {
                    max = ts[i].screenY;
                    idxMax = i;
                }

                if (ts[i].screenY < min) {
                    min = ts[i].screenY;
                    idxMin = i;
                }
            }

            return [{ screenX: ts[idxMin].screenX, screenY: ts[idxMin].screenY, identifier: ts[idxMin].identifier },
            { screenX: ts[idxMax].screenX, screenY: ts[idxMax].screenY, identifier: ts[idxMax].identifier }];

        }

        function getGesture(ts, cs) {
            var endPointes = [];
            var p = getPointById(ts, startPointes[0].identifier) || getPointById(cs, startPointes[0].identifier);
            if (p) {
                endPointes.push(p);
            }
            p = getPointById(ts, startPointes[1].identifier) || getPointById(cs, startPointes[1].identifier);
            if (p) {
                endPointes.push(p);
            }
            var gesture = '';
            if (endPointes.length != 2) {
                return gesture;
            }

            var value = space(endPointes) - space(startPointes);


            if (Math.abs(value) < 60) {
                var offset = 80;
                if ((endPointes[0].screenX - startPointes[0].screenX) > offset) {
                    gesture = 'RIGHT';
                } else if ((startPointes[0].screenX - endPointes[0].screenX) > offset) {
                    gesture = 'LEFT';
                } else if ((endPointes[0].screenY - startPointes[0].screenY) > offset) {
                    gesture = 'DOWN';
                } else if ((startPointes[0].screenY - endPointes[0].screenY) > offset) {
                    gesture = 'UP';
                }
            } else {//pinch 
                gesture = (value < 0) ? 'CLOSE' : 'OPEN';
            }

            return gesture;
        }

        function getPointById(ts, id) {
            for (var i = 0, len = ts.length; i < len; i++) {
                if (ts[i].identifier == id) {
                    return ts[i];
                }
            }
            return null;
        }

        function PointEvent(pointer) {
            //        	var pos = calMousePos(pointer.clientX, pointer.clientY, wsInput.element);
            this.identifier = pointer.pointerId;
            //            this.x = pos.x;
            //            this.y = pos.y;
            this.clientX = pointer.clientX;
            this.clientY = pointer.clientY;
            this.pageX = pointer.pageX;
            this.pageY = pointer.pageY;
            this.screenX = pointer.screenX;
            this.screenY = pointer.screenY;
        }

        //hanld Pointer Event, IE only
        this.handlePointer = function (e) {
            if ((e.pointerType == e.MSPOINTER_TYPE_MOUSE) || (e.pointerType == 'mouse')) {
                //TODO: make it more compatible with touch event with cache
                switch (e.type) {
                    case 'MSPointerDown':
                    case 'pointerdown':
                        handleMouseDown(e);
                        break;
                    case 'pointermove':
                    case 'MSPointerMove':
                        handleMouseMove(e);
                        break;
                    case 'pointerup':
                    case 'MSPointerUp':
                        handleMouseUp(e);
                        break;
                }
            } else {//touch and pen
                e.touches = e.changedTouches = [new PointEvent(e)];
                _th.handle(e);
            }
        };


        this.handle = function (e) {
            var type = e.type;

            var duration = 0;
            var touches = e.touches;
            var changedTouches = e.changedTouches;
            var x = 0, y = 0, point = 0, pos;
            // console.log('handle:', e);
            switch (type) {
                case 'touchstart':
                case 'MSPointerDown':
                case 'pointerdown':
                    isGesture = false;
                    pointes = ('touchstart' == type) ? touches.length : (pointes + 1);
                    flick = false;
                    startTime = Date.now();
                    isDoubleClick = (pointes == 1) && (startTime - lastUpTime) < 200;
                    point = touches[0];
                    pointId = point.identifier;
                    pos = calMousePos(point.clientX, point.clientY, _canvas);
                    touchStartX = pos.x | 0;
                    touchStartY = pos.y | 0;
                    isStart = true;
                    //we don't process it here, because it may be a double finger event;
                    isGesture = isPinchzoom(touches);//(pointes == 2) && (distance > (130 * _devicePixelRatio));
                    if (isDoubleClick || (pointes > 1 && !isGesture)) {
                        cancelDefault(e);
                    }
                    if (pointes == 3) {
                        startPointes = get2Pointes(touches);
                        //                    cancelDefault(e);
                    }
                    break;
                case 'pointermove':
                case 'MSPointerMove':
                    if (pointes > 1) {
                        break;
                    }

                case 'touchmove':
                    if (isGesture) {
                        return;
                    }


                    point = changedTouches[touches.length - 1];
                    if (!point) {
                        break;
                    }
                    if (point.identifier != pointId) {
                        point = getPointById(changedTouches, pointId);
                        if (!point) {
                            cancelDefault(e);
                            return;
                        }
                    }
                    pos = calMousePos(point.clientX, point.clientY, _canvas);
                    x = pos.x | 0;
                    y = pos.y | 0;



                    if (isStart) {
                        if ((x - touchStartX) === 0 && (y - touchStartY) === 0) {
                            return;
                        }
                        if ((Math.abs(x - touchStartX) < correction) && (Math.abs(y - touchStartY) < correction)) {
                            cancelDefault(e);
                            return;//iOS workaround
                        }
                        isStart = false;
                        duration = Date.now() - startTime;
                        flick = duration < 88;
                        if (flick && !isInScreen() && pointes == 1) {
                            isGesture = true;
                            return;//we process the flick from edge alone
                        }
                    control.touchstart({'x': touchStartX, 'y': touchStartY, 'flick': flick, 'pointes': pointes,
                        'screenX': point.screenX, 'screenY': point.screenY, 'moved': true, 'target': e.target});
                    }
                    cancelDefault(e);
                control.touchmove({'x': x, 'y': y, 'flick': flick, 'pointes': pointes, 'moved': true, 
                    'screenX': point.screenX, 'screenY': point.screenY, 'target': e.target});
                    break;
                case 'MSPointerUp':
                case 'touchend':
                case 'pointerup':

                    if (isGesture) {
                        return;
                    }

                    if ((changedTouches.length + touches.length) == 3) {
                        control.touchend({'x': x, 'y': y, 'flick': flick, 'pointes': pointes, 'moved': !isStart,
                            'target': e.target, 'gesture': getGesture(touches, changedTouches)});
                        pointes = 0;
                        break;
                    } else {

                        if (pointes > 2) {
                            pointes = 0;
                            break;
                        }

                        point = getPointById(changedTouches, pointId);

                        if (point) {///process the first finger only
                            var currTime = Date.now();
                            pos = calMousePos(point.clientX, point.clientY, _canvas);
                            x = pos.x | 0;
                            y = pos.y | 0;
                            if (!flick) {
                                duration = currTime - startTime;
                                if (isStart) {//no move
                                    lastUpTime = currTime;
                                    if (!isDoubleClick) {
                                        lastX = x;
                                        lastY = y;
                                    } else {
                                        cancelDefault(e);
                                    }
                                    if (duration < 500) {//short press
                                        lastUpTime = currTime;
                                    control.touchstart({'x': lastX, 'y': lastY, 'flick': false, 'pointes': pointes,
                                        'screenX': point.screenX, 'screenY': point.screenY, 'moved': false, 'target': e.target});
                                    control.touchend({'x': lastX, 'y': lastY, 'flick': false, 'pointes': pointes, 'moved': false,
                                        'screenX': point.screenX, 'screenY': point.screenY, 'target': e.target});
                                    } else {//long press
                                    control.longpress({'x': x, 'y': y, 'flick': false, 'pointes': pointes, 'moved': false,
                                        'screenX': point.screenX, 'screenY': point.screenY, 'target': e.target});
                                    }
                                } else {//moved
                                control.touchend({'x': x, 'y': y, 'flick': false, 'pointes': pointes, 'moved': true,
                                    'screenX': point.screenX, 'screenY': point.screenY, 'target': e.target});
                                }
                            } else {
                            control.touchend({'x': x, 'y': y, 'flick': true, 'pointes': pointes, 'moved': !isStart,
                                'screenX': point.screenX, 'screenY': point.screenY, 'target': e.target});
                            }
                        }
                    }
                    pointes = 0;
                    break;
                case 'MSPointerCancel':
                case 'touchcancel':
                    pointes = 0;
                    break;
            }
            if (isDoubleClick) {
                cancelDefault(e);
            }
        };
    }

    function sendBackspace() {
        sendScancode(true, 0xe, 'Backspace');//send backspace key
        sendScancode(false, 0xe, 'Backspace');
    }

    function selectElement(elm) {
        try {
            if (elm.select) {
                elm.select();
            } else {
                _browser.selectEditable(elm);
            }
        } catch (e) {
            svGlobal.logger.info(e);
        }
    }

    function setElementValue(elm, v) {
        if (elm.value) {
            elm.value = v;
        } else {
            elm.innerHTML = v;
        }
    }

    var wsInput = null;

    function ClipboardAccess() {
    	var isTextarea = myLI.forceTextArea || _browser.isIE;//navigator.userAgent.indexOf('MSIE 10.') > 0;
        var input = document.createElement(isTextarea ? 'textarea' : 'div');//On IE10, no event fired on padding/margin area
        var meCC = this;

        this.element = input;

        this.setFontSize = function (v) {
            input.style.fontSize = appcfg.inputFontSize || v;
        };

        if (isTextarea) {//only use textarea on IE
            input.style.opacity = 0;
            input.readOnly = (isTouch && _browser.isMetro) ? true : false;
        } else {
            input.contentEditable = (isTouch && !((_browser.isChrome || _browser.isFirefox) && (_browser.isWindows || _browser.isCrOS))) ? false : true;
        }

        // input.autocomplete = _browser.isChrome ? 'new-password' : 'off';//https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
        //must use setAttribute, otherwise not work on iOS
        input.setAttribute('autocomplete', _browser.isChrome ? 'new-password' : 'off')
        // input.autocorrect = 'off';
        input.setAttribute('autocorrect', 'off');
        // input.autocapitalize = 'off';
        input.setAttribute('autocapitalize', 'off');
        // input.spellcheck = 'false';
        input.setAttribute('spellcheck', 'false');

        input.accessKey = 'f';
        input.id = 'wsinput';
        //        input.style.all = 'initial';
        input.tabIndex = 1;
        input.style.opacity = 0.01;//this can hide the text blink cursor on Edge and Chrome. If it's 0, mouse "wheel" event will not fired on Chrome 88, 89.
        input.style.resize = 'none';
        input.style.position = 'absolute';
        input.style.margin = '0';
        input.style.border = 'none';
        input.style.outline = 'none';
        var pos = hi5.tool.getPos(_canvas, true);
        input.style.left = pos.x + 'px';
        input.style.top = pos.y + 'px';
        input.style.paddingRight = 0;
        input.style.paddingBottom = 0;
        input.style.width = '10px';
        input.style.height = '10px';
        input.style.zIndex = 88;
        input.style.cursor = 'default';
        input.style.fontWeight = 'normal';
        input.style.fonStyle = 'normal';
        input.style.overflow = 'hidden';

        if (isTouch) {//disable auto zoom on iOS and Android
            input.style.fontSize = '2em';
        }

        //hide blink text cursor
        if (_browser.isiOS) {
            input.addEventListener('focus', function (e) {
                setTimeout(function () {
                    e.target.style.fontSize = '0px';
                }, 333);
            }, false);
            input.addEventListener('blur', function (e) {
                e.target.style.fontSize = '1em';
            }, false);
        } else if (_browser.isFirefox) {
            input.style.fontSize = 0;//hide text blinking cursor (caret) since FF 39.0
        } else if (isTextarea){
            input.style.fontSize = '1px';//if it's 0, chrome will not fire input and textInput event
        } else if (!_browser.isChrome) {//blurry canvas if mouse move to the browser tool bar, especially when scale of screen is not 100
            input.style.textIndent = '-999em';//not work on iOS.
        }


        keyboard = new KeyboardHandler(input);
        keyboard.onbackspace = sendBackspace;

        var p = _canvas.parentNode;
        p.appendChild(input);



        function focusInput() {
            meCC.focus();
        }

        function createLink(key, top) {
            var l = document.createElement('a');
            l.href = '#';
            l.accessKey = key;
            l.onfocus = focusInput;
            l.style.position = "absolute";
            l.style.width = 1;
            l.style.height = 1;
            l.style.left = 0;
            l.style.top = top + 'px';
            l.style.pointerEvents = 'none';
            return l;
        }

        if (_browser.isIE) {//Prevent IE menu key shortcut
            p.appendChild(createLink('E'), 60);
            p.appendChild(createLink('V'), 61);
            p.appendChild(createLink('A'), 62);
            p.appendChild(createLink('T'), 63);
            p.appendChild(createLink('H'), 64);
        }

        var _opacity = input.style.opacity;
        var _textIndext = input.style.textIndent || 0;

        this.resetCSS = function () {
            _fontSize = input.style.fontSize;
            _opacity = input.style.opacity;
            input.style.opacity = 0.01;
            input.style.textIndent = 0;
        };

        this.restoreCSS = function () {
            input.style.opacity = _opacity;
            input.style.textIndent = _textIndext;
        };

        this.getValue = function () {
            return isTextarea ? input.value : input.innerHTML;
        };

        this.setValue = function (v) {
            if (keyboard) {
                keyboard.disableTextInput = true;
            }

            if (isTextarea) {
                input.value = v;
            } else {
                input.innerHTML = v;
            }


            if (keyboard) {
                keyboard.disableTextInput = false;
            }
        };

        this.focus = function () {
            meCC.setValue(" ");
            focusAndFix(input);
        };

        //v is string
        this.setContentEditable = function (v) {
            if (isTextarea) {
                var isTrue = (v == 'true');
                if (input.readOnly == isTrue) {
                    input.readOnly = !isTrue;
                }
            } else {
                input.setAttribute('contenteditable', v);
            }
        };

        this.isIMEMode = false;

        /*
        this.setIMEStatus = function (active) {
            if (active) {
                if (!meCC.isIMEMode) {
                    if (isTextarea) {
                        input.style.background = 'transparent';
                        input.style.opacity = 1;
                    }
                    meCC.isIMEMode = true;
                }
            } else if (meCC.isIMEMode) {
                if (isTextarea) {
                    input.style.background = '';//on iE if backgroud is transparent, it will not fire input events
                    input.style.opacity = 0;
                }
                meCC.isIMEMode = false;
            }
        };
        */

        this.adjust = function (aggresive) {
            var pos = hi5.tool.getPos(_canvas, true);
            _mousePos.offX = pos.x;
            _mousePos.offY = pos.y;

            var tw = myLI.railWin ? Math.min(window.innerWidth - pos.x, widthFace) : widthFace;
            var th = myLI.railWin ? Math.min(window.innerHeight - pos.y, heightFace) : heightFace;
            var pl = 0, pt = 0;

            if (isTouch) {
                pl = Math.max(window.pageXOffset + 100, pos.x);
                pt = Math.max(window.pageYOffset + 100, pos.y);
            } else {
                var visibleW = Math.min(window.innerWidth - pos.x, widthFace);
                var visibleH = Math.min(window.innerHeight - pos.y, heightFace);

                pl = Math.round(visibleW * 0.7);
                pt = Math.round(visibleH * (aggresive ? 0.99 : 0.7));
            }


            var w = tw - pl;
            var h = th - pt;

            if (appcfg.disableAdjust) {
                pl = 0;
                pt = 0;
                w = _canvas.offsetWidth;
                h = _canvas.offsetHeight;
            }

            input.style.width = w + 'px';
            input.style.height = h + 'px';
            input.style.paddingLeft = pl + 'px';
            input.style.paddingTop = pt + 'px';
            input.style.left = pos.x + 'px';
            input.style.top = pos.y + 'px';

        };

        this.remove = function () {
            if (keyboard) {
                keyboard.release();
                keyboard = null;
            }
            if (input.parentNode) {
                input.parentNode.removeChild(input);
            }
            input = null;
        };

        this.hide = function () {
            input.style.visibility = 'hidden';
        };

        this.getElement = function () {
            return input;
        };

        this.select = function () {
            selectElement(input);
        };
    }


    if (isTouch) {
        addTouchInput();
    } else {
        var cbxTouch = hi5.$('tmContainer');//touchMode container
        if (cbxTouch) {
            cbxTouch.parentNode.removeChild(cbxTouch);
        }
    }

    if (isTouch && !appcfg.toolbar.draggable) {//TODO: remove this when possible
        window.addEventListener('scroll', function () {
            setTimeout(function () {
                if (__pckey) {
                    var pckeys = ui_option.pcKey;
                    if (pckeys) {
                        pckeys.style.top = window.pageYOffset + 'px';
                        pckeys.style.left = window.pageXOffset + 'px';
                    }
                }
                if (myLI.toolbar) {
                    myLI.toolbar.style.top = window.pageYOffset + 'px';
                    var _left = window.pageXOffset + window.innerWidth * 0.45;//(window.innerWidth - myLI.toolbar.offsetHeight) / 2;
                    myLI.toolbar.style.left = _left + 'px';
                }
            }, 200);
        }, false);
    }


    this.setCaretPos = function (x, y) {
        caretX = x; caretY = y;
    };

    this.showMessage = function (v, timeout) {
        if (v && appcfg.displayMsg)
            notifications.notify(typeof v == 'string' ? { 'msg': v, 'timeout': timeout || 0 } : v);
    };

    this.hideWhenClose = ('hideWhenClose' in appcfg) ? appcfg.hideWhenClose : true;

    this.setReadOnly = function (v, mouseMove) {
        allowInput = !v;
        allowMouseMove = allowInput || mouseMove === true;
    };

    this.setPlayerMode = function () {
        playerMode = true;
        myLI.showToolbar = false;
        myLI.setReadOnly(true);
        myLI.hideWhenClose = false;
    };

    this.showTwoFAQR = function(){
        var appInfo = controller.getAppInfo();
        var twoFADiv = hi5.$('twofainfo');
        
        var imgDiv = hi5.$('barcodeDiv');
        var btnEnable = hi5.$('enableTwoFA');
        var btnDisable = hi5.$('disableTwoFA');

        if (appInfo.twoFAEnabled){
            imgDiv.style.display = 'none';
            btnDisable.style.display = 'block';
            btnEnable.style.display = 'none';
        }else{
            hi5.$('imgBarcode').src = 'data:image/png;base64,' + hi5.Base64.enc(appInfo.twoFAQR);
            imgDiv.style.display = 'block';
            btnDisable.style.display = 'none';
            btnEnable.style.display = 'block';
        }
        var inCode = hi5.$('faCode');
        inCode.value = "";
        var lbFA = new hi5.ui.Lightbox(twoFADiv);
        lbFA.show();

        btnEnable.onclick = btnDisable.onclick = function(e){
            var code = inCode.value;
            var enable = (e.target == btnEnable) ? 1 : 0;
            controller.onauthcoderesult = function(action, sucess){
                //action should be 1
                if (sucess){
                    lbFA.dismiss();
                }else{
                    inCode.value = "";
                    myLI.showMessage(__svi18n.errorCode.S3021 || 'Wrong authentication code', 5000);
                }
            };
            if (code.length != 6){
                hi5.notifications.notify(__svi18n.info.digit6 || "It must be a 6 digit number");
                return;
            }
            controller.authWithCode(code, enable);
        }
    };
    
    this.showTwoFACode = function(){
        var codeDiv = hi5.$('twofacode');
        if (codeDiv){
            var lb = new hi5.ui.Lightbox(codeDiv, {noClose: true});
            lb.show();
            var btnCode = hi5.$('btnTwoFACode');
            var inCode =  hi5.$('faAuthCode');
            inCode.value = '';
            btnCode.onclick = function(){
                var code = inCode.value;
                if (code.length != 6){
                    hi5.notifications.notify(__svi18n.info.digit6 || "It must be a 6 digit number");
                    return;
                }
                controller.onauthcoderesult = function(action, sucess){
                    //action should be 2.
                    if (sucess){
                        lb.dismiss();
                    }else{
                        inCode.value = "";
                        myLI.showMessage(__svi18n.errorCode.S3021 || 'Wrong authentication code', 5000);
                    }
                    controller.onauthcoderesult = null;
                };
                controller.authWithCode(code, 2);
            }
            inCode.addEventListener('keyup', function(e){
                if (e.keyCode == 13){
                    e.preventDefault();
                    btnCode.click();
                }
            });
        }
    };
    

    function hasRoom() {
        var w = window.innerWidth, h = window.innerHeight;
        return (Math.max(widthFace, heightFace) < Math.max(w, h)) && (Math.min(widthFace, heightFace) < Math.min(w, h));
    }

    this.setAutoScale = function (v) {
        var inAppCfg = 'autoScale' in appcfg;
        if (inAppCfg) {
            v = appcfg.autoScale;
        }

        if (v) {
            scaleToWindow(true);
            checkUI('hidden');
        }
        else if (!inAppCfg) {
            scaleToWindow(false);
        }
        autoScale = v;

    };

    function initImgCursor(_nameOnly) {
        if (imgCursor) return;
        var _parent = _canvas.parentNode,
            _name = '', _id = 0;
        imgCursor = _parent.querySelector('canvas[name="svImgCursor"]');//there may be multi session in one page (in div, no iframe)
        if (imgCursor) return;
        imgCursor = document.createElement('canvas');
        // imgCursor.name = 'svImgCursor';//querySelector can not find it on Firefox if set name =
        imgCursor.setAttribute('name', 'svImgCursor');
        imgCursor.style.position = 'absolute';
        imgCursor.style.left = 90;
        imgCursor.style.top = 90;
        imgCursor.scrX = 0;
        imgCursor.scrY = 0;
        imgCursor.hotX = 0;
        imgCursor.hotY = 0;
        imgCursor.width = imgCursor.height = 32;

        imgCursor.__left = 0;
        imgCursor.__top = 0;
        imgCursor.__visible = false;

        imgCursor.style.visibility = 'hidden';
        imgCursor.style.zIndex = 87;

        var clickEffect = null;
        if (!appcfg.disableClickEffect){
            clickEffect = document.createElement('div');
            clickEffect.className = 'mouse-click-off';
            clickEffect.style.zIndex = 89;
        }

        var nameColor = {
           getColor: function(name){
                if (nameColor[name]){
                    return nameColor[name];
                }else{
                    var c = hi5.graphic.colorTable.getNext();
                    nameColor[name] = c;
                    return c;
                }
           } 
        };

        function _textConfig() {
            if (!appcfg.text) {
                appcfg.text = {};
            }
            return appcfg.text;
        }

        function _charHeigth(ctx) {
            return (ctx.measureText('W').width + 1) * 1.2;
        }

        function intToRGB(i) {
            var c = (i & 0x00FFFFFF).toString(16).toUpperCase();
            return "00000".substring(0, 6 - c.length) + c;
        }

        function _drawName(ctx, x, y, w, h) {
            if (_name) {
                var text = _textConfig();
                ctx.fillStyle = text.backgroundFillStyle || 'white';
                ctx.fillRect(x, y - h + 2, w, h);
                ctx.fillStyle = text.fillStyle || '#337788';
                ctx.textBaseline = 'bottom';
                ctx.fillText(_name, x + 3, y - 2);
                ctx.strokeStyle =nameColor.getColor(_name);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + w, y);
                ctx.stroke();
            }
        }

        function _redrawCursor() {
            var ctx = imgCursor.getContext('2d'),
                imgData = ctx.getImageData(0, 0, imgCursor.cursorWidth, imgCursor.cursorHeight);

            if (_name) {
                ctx.font = _textConfig().font || '11px Arial';
                var charHeight = _charHeigth(ctx) + 4;
                imgCursor.width = Math.max(imgCursor.cursorWidth, ctx.measureText(_name).width + 4);
                imgCursor.height = imgCursor.cursorHeight + charHeight;
                _drawName(ctx, 0, imgCursor.height - 1, imgCursor.width, charHeight);
            } else {
                imgCursor.width = imgCursor.cursorWidth;
                imgCursor.height = imgCursor.cursorHeight;
            }
            ctx.putImageData(imgData, 0, 0);
        }

        imgCursor.setCursor = function (cursor) {
            var w = cursor.width, h = cursor.height, data = cursor.rawData, txtW = 0, txtH = 0;
            var ctx = imgCursor.getContext('2d');

            if (_name){
                ctx.font = _textConfig().font || '11px Arial';
                txtW = ctx.measureText(_name).width;
                txtH = _charHeigth(ctx) + 4;
            }

            if (_nameOnly) {
                if (_name){
                    if (_nameOnly){
                        imgCursor.cursorWidth = txtW;
                        imgCursor.cursorHeight = txtH;
                        imgCursor.hotX = cursor.hotX;
                        imgCursor.hotY = -h;
                        imgCursor.width = txtW;
                        imgCursor.height = txtH + 4;
                            
                        _drawName(ctx, 0, imgCursor.height - 1, imgCursor.width, txtH);
                        return;
                    }
                }else{
                    imgCursor.__setVisible(false);
                }
            }

            if (data && w && h) {
                var len = w * h, color = 0, idx = 0;
                var imgData = ctx.createImageData(w, h);
                var pixel = imgData.data,
                    offX = cursor.hotX - imgCursor.hotX,
                    offY = cursor.hotY - imgCursor.hotY;

                imgCursor.cursorWidth = w;
                imgCursor.cursorHeight = h;
                imgCursor.hotX = cursor.hotX;
                imgCursor.hotY = cursor.hotY;
                imgCursor.width = Math.max(w, txtW + 4);
                imgCursor.height = h + txtH + 4;

                if (_name) {
                    _drawName(ctx, 0, imgCursor.height - 1, imgCursor.width, txtH);
                }

                for (var i = 0; i < len; i++) {
                    color = data[i];
                    pixel[idx++] = color & 0xFF;
                    pixel[idx++] = (color >> 8) & 0xFF;
                    pixel[idx++] = (color >> 16) & 0xFF;
                    pixel[idx++] = (color >> 24) & 0xFF;
                }
                ctx.putImageData(imgData, 0, 0, 0, 0, w, h);
                imgCursor.__left -= offX;
                imgCursor.__top -= offY;
                imgCursor.style.left = imgCursor.__left + 'px';
                imgCursor.style.top =  imgCursor.__top + 'px';
            }
        };

        imgCursor.__setVisible = function(v){
            imgCursor.__visible = v;
            imgCursor.style.visibility = v ? 'visible' : 'hidden';
        }

        if (currCursor && currCursor.rawData) {
            imgCursor.setCursor(currCursor);
        } else {
            var pointer = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -1, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -1, -1, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -1, -1, -1, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -1, -1, -1, -1, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -1, -1, -1, -1, -1, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -1, -1, -1, -1, -16777216, -16777216, -16777216, -16777216, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -1, -16777216, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -16777216, -16777216, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -16777216, 0, 0, -16777216, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -16777216, 0, 0, 0, -16777216, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, 0, 0, 0, 0, 0, -16777216, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -1, -1, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -16777216, -16777216, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            imgCursor.setCursor({ 'rawData': pointer, 'width': 32, 'height': 32, 'hotX': 10, 'hotY': 10 });
        }

        imgCursor.moveCursor = function (l, t, name, id, flags) {
            var __left = (l - imgCursor.hotX);
            var __top = (t - imgCursor.hotY);
            imgCursor.__left = __left;
            imgCursor.__top = __top;
            imgCursor.style.left = __left + 'px';
            imgCursor.style.top = __top + 'px';
            if (_name != name || _id != id) {
                _name = name;
                _id = id;
                _redrawCursor();
            }

            if (clickEffect && (flags & 0x8000)){//mouse down
                clickEffect.style.left = (l - 30) + 'px';
                clickEffect.style.top = (t - 30) + 'px';
                clickEffect.className = 'mouse-click-on';
                setTimeout(function(){
                    clickEffect.className = 'mouse-click-off';
                }, 500);
            }
        }

        _parent.appendChild(imgCursor);
        if (clickEffect){
            _parent.appendChild(clickEffect);
        }

    }

    function releaseImageCursor() {
        currCursor = null;
        if (imgCursor) {
            if (imgCursor.parentNode) {
                imgCursor.parentNode.removeChild(imgCursor);
            }
            imgCursor = null;
        }
    }

    if (useImageCurosr) {
        initImgCursor(appcfg.cursorNameOnly);
    }

    this.setTouchpad = function (v) {
        _touchpad = v;
        var cbxTouch = hi5.$('touchpadMode');
        if (cbxTouch) {
            cbxTouch.checked = v;
            cbxTouch.onchange = function (e) {
                _touchpad = e.target.checked;
            };
        }
        if (v) {
            if (!imgCursor) {
                initImgCursor(appcfg.cursorNameOnly);
            }
        }
    };

    this.setExtKeyboard = function (v) {
        if (isTouch) {
            wsInput.adjust(true);
            wsInput.setContentEditable(v ? 'true' : 'false');
            touchInputing = v ? 1 : 0;
            if (_browser.isChrome) {
                wsInput.setFontSize('2em');
            }
            if (v) {
                wsInput.focus();
            }

            var _extKBD = hi5.$('extKBD');
            if (_extKBD && _extKBD.checked != v) {
                _extKBD.checked = v;
            }
        }
    };

    this.focus = function () {
        if (wsInput) {
            focusAndFix(wsInput.element);
        }
    };

    this.getInputElement = function () {
        return wsInput;
    };

    function checkUI(flow) {
        if (appcfg.disableScrollbars === false) return;
        var r = document.body;
        if (flow) {
            _overflow = flow;
            r.style.overflow = flow;
            return;
        }
        var noScroll = (widthFace <= window.innerWidth) && (heightFace <= window.innerHeight);
        _overflow = (noScroll) ? 'hidden' : 'visible';
        r.style.overflow = _overflow;

    }

    function scaleToWindow(positive) {
        var root = _canvas.parentNode;
        // if (hasRoom()) {
        //     if (mScale != 1) {
        //         hi5.tool.scale(root, 1);
        //         mScale = mScaleY = 1;
        //     }
        //     return;
        // }
        document.body.style.overflow = 'hidden';
        mScale = mScaleY = positive ? Math.min(window.innerWidth / widthFace, window.innerHeight / heightFace) : 1;
        hi5.tool.scale(root, mScale, mScale);
    }

    this.scaleTo = function (width, height, _ignoreAspectRatio) {
        scaleWidth = width;
        scaleHeight = height;
        ignoreAspectRatio = _ignoreAspectRatio;

        if (_canvas && widthFace > 50) {
            var xScale = width / widthFace, yScale = height / heightFace;

            if (!ignoreAspectRatio) {
                xScale = Math.min(xScale, yScale);
                yScale = xScale;
                mScale = xScale;
                mScaleY = xScale;
            } else {
                mScale = xScale;
                mScaleY = yScale;
            }
            hi5.tool.scale(_canvas.parentNode, xScale, yScale);
        }
    };

    function initWsInput() {
        if (!wsInput) {
            wsInput = new ClipboardAccess();
        }
        wsInput.adjust();
    }

    this.setSize = function (w, h, flow) {
        if (_mousePos.isMultiMon) {//multi monitor
            return;
        }

        if (_mousePos.right != (_mousePos.left + w - 1)) {
            _mousePos.right = _mousePos.left + w - 1;
            _mousePos.bottom = _mousePos.top + h - 1;
        }

        widthFace = w;
        heightFace = h;

        if (!autoScale) {
            checkUI(flow);
        }

        _canvas.width = widthFace;
        _canvas.height = heightFace;

        // if (controller) {
        //     myLI.drawText(__svi18n.wait);
        // }else{
        //     ctxRdp.save();//if Alpha: false for ctx, the background is black in Chrome
        //     ctxRdp.fillStyle = 'white';
        //     ctxRdp.fillRect(0, 0, widthFace, heightFace);
        //     ctxRdp.restore();
        // }

        if (autoScale) {
            scaleToWindow(true);
        }else if (scaleWidth && scaleWidth != w){
            myLI.scaleTo(scaleWidth, scaleHeight, ignoreAspectRatio);
        }

        if (isTouch) {
            addTouchInput();
        }
        {
            initWsInput();
        }


        // if (fileDlg && fileDlg.visible()) {
        //     fileDlg.dismiss();
        // }

    };

    this.reposition = function () {
        wsInput.adjust();
    };

    this.setController = function (ctrl) {
        controller = ctrl;
        __draw = ctrl.draw;
        if (!controller.sendInput) {
            controller.sendInput = controller.send;
        }

        if (isTouch) {
            _browser.setOrientaionHandler(function () {
                var noChange = (window.innerWidth > window.innerHeight) == (widthFace > heightFace);//this also fires 2 times when switch back from another app on iOS (first noChange is false, second is true)
                // myLI.showMessage('myLI.showMessage:' + noChange + " nw:" + window.innerWidth + ' nh:' + window.innerHeight + ' w:' + widthFace + ' h:' + heightFace + ' time:' + Date.now());
                if (noChange) return;
                if (autoScale) {
                    scaleToWindow(true);
                } else {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(function () {
                        var noChange = (window.innerWidth > window.innerHeight) == (widthFace > heightFace);
                        if (noChange){
                            return;
                        }
                        // myLI.showMessage("nw:" + window.innerWidth + ' nh:' + window.innerHeight + ' w:' + widthFace + ' h:' + heightFace + ' time:' + Date.now());
                        controller.onorientationchange({ svSurface: myLI, innerWidth: window.innerWidth, innerHeight: fixiOSHeight(window.innerHeight) });
                        if (!appcfg.disableScoll) {
                            window.scrollTo(0, 0);
                        }
                    }, 555);
                }
            });
        }

    };

    function delCloudButton() {
        if (myLI.toolbar) {
            myLI.toolbar.removeButton('svCloud');
        } else {
            var elm = hi5.$('svCloud');
            if (elm) {
                elm.parentNode.removeChild(elm);
            }
        }
    }

    this.setFileHandler = function (v) {
        if (!('FileReader' in window)) {
            v = null;
        }

        if (v) {
            if (!fileHandler && !playerMode) {
                fileHandler = v;
                fileHandler.addEvent('uploaded', function (pasted, status) {
                    if (pasted) {
                        return;
                    }
                    if (hi5.$('filecontainer') && (_feature & 0x10)) {
                        if (hi5.$('__cancelUpload')) {
                            hi5.$('__cancelUpload').style.visibility = 'hidden';
                        }
                        if (myLI.fileProgress){
                            myLI.fileProgress.maxValue = 0;
                            myLI.fileProgress.style.display = 'none';
                        }
                        myLI.refreshFiles(!fileDlg);
                        if (!status.cancelled && __svi18n.file.uploadDone && status.size && status.duration){
                            myLI.showMessage(__svi18n.file.uploadDone + ' ' + hi5.tool.bytesToSize(status.size / (status.duration / 1000)) + "/s", 5000);
                        }
                    }
                });
                fileHandler.addEvent('uploadstarted', function (pasted) {
                    if (pasted) {
                        setTimeout(sendCtrlV, 999);
                    }
                });
                if (hi5.$('filecontainer')) {
                    hi5.$('filecontainer').className = 'h5-form';
                    if (hi5.$('total')){
                        myLI.fileProgress = new hi5.ProgressBar(hi5.$('total'));
                    }
                    var cancelUpload = hi5.$('__cancelUpload');
                    if (cancelUpload) {
                        cancelUpload.addEventListener("click", function () {
                            fileHandler.cancelAll();
                        }, false);
                    }
                    fileHandler.addEvent('beforeupload', function (file, path, pasted) {
                        if (pasted) return;

                        if (cancelUpload) {
                            cancelUpload.style.visibility = 'visible';
                        }
                        if (myLI.fileProgress){
                            myLI.fileProgress.style.display = 'block';
                            myLI.fileProgress.maxValue += file.size;
                        }

                    });
                    fileHandler.addEvent('progress', function (_sent) {
                        if (myLI.fileProgress){
                            myLI.fileProgress.setProgress(_sent);
                        }
                    });
                } else {
                    delCloudButton();
                }
            }
        } else {
            fileHandler = null;
            myLI.fileProgress = null;
            delCloudButton();
            if (_dropZoneFull) {
                _dropZoneFull.release();
                _dropZoneFull = null;
            }
        }
        initToolbar();
        initFileShareDnD();
    };

    this.setFeature = function (feature) {
        _feature = feature;

        var elm, noFile = playerMode || (!(feature & 0x10) && !(feature & 0x10000)),
            noDrive = !(feature & 0x10), noFileClip = !(feature & 0x10000);

        if (noDrive || playerMode) {//no drive rederection
            delCloudButton();
        }


        if (feature & 0x80) { //no upload
            elm = hi5.$('uploadfile');
            if (elm) {
                elm.style.visibility = 'hidden';
            }
        }

        if (feature & 0x00020000){//no downlaod
            elm = hi5.$('__sv_download__');
            if (elm) {
                elm.parentNode.removeChild(elm);
            }
            elm = hi5.$('__sv_view__');
            if (elm) {
                elm.parentNode.removeChild(elm);
            }
        }

        if (feature & 0x00100000){//file not viwalbe, security conerns when view html directly in browser.
            elm = hi5.$('__sv_view__');
            if (elm) {
                elm.parentNode.removeChild(elm);
            }
        }

        if (!(feature & 0x100)) {//shadowing
            elm = hi5.$('shadowing');
            if (elm) {
                elm.parentNode.removeChild(elm);
            }
        }

        if (!(feature & 0x400)) {//saveSession
            elm = hi5.$('ssParent');
            if (elm) {
                elm.parentNode.removeChild(elm);
            }
        }

        if ((noFileClip && noDrive) || playerMode) {
            myLI.setFileHandler(null);
        }
    };


    function appWinMax() {
        var current = chrome.app.window.current();
        if (current) {
            current.fullscreen();
        }
    }

    var pdfDialog = new function () {
        var _pdfQue = [], isProcessing = false, showPDFLink = false,
            _pdfDlg = null; 

        this.clearPDF = function () {
            _close();
        };

        function _close() {
            if (_pdfQue.length === 0) {
                isProcessing = false;
                if (!showPDFLink) {//close it automatically
                    var p = hi5.$('_sv_pdf_parent');
                    if (p && _pdfDlg && _pdfDlg.visible()) {
                        _pdfDlg.dismiss();
                    }
                    if (p && p.parentNode) {
                        setTimeout(function () {//make sure printing done under --kiosk-printing mode
                            if (p && p.parentNode) {
                                p.parentNode.removeChild(p);
                            }
                        }, 9999);
                    }
                    if (_browser.isFirefox && controller && controller.restoreResize){
                        controller.restoreResize();
                    }
                }
            } else {
                processNext();
            }
        }

        function _showPDF(value) {
            var div = hi5.$('_sv_pdf_parent');
            var info = __svi18n.info.printready || 'Your document is ready.';
            
            var isText = value.endsWith('.txt');
            showPDFLink = !isText && (_browser.isAndroid || _browser.isiOS || !!appcfg.showPDFLink);

            var innerHTML = showPDFLink ? '<p style="text-align:center;line-height:4em"><a href="' + value + '" target="_blank">' +
                info + '</a></p>' : ((_browser.isChromeApp ? '<webview' : '<iframe') +
                    ' src="' + value + '" width="100%" height="100%" id="_iFramePDF">' +
                    (_browser.isChromeApp ? '</webview>' : '</iframe>'));

            if (div && div.visible && div.visible() && div.dismiss) {
                div.dismiss();
            }
            if (div && div.parentNode) {
                div.parentNode.removeChild(div);
            }


            div = document.createElement('div');
            div.style.backgroundColor = 'white';
            div.style.width = showPDFLink ? '30%' : '70%';
            div.style.height = showPDFLink ? '4elm' : '70%';
            div.id = '_sv_pdf_parent';
            // if (!showPDFLink && !_browser.isSafari){//Safari doesn't support auto print
            // div.style.opacity = 0;//hide the pdf iframe
            // }
            if (showPDFLink) {
                div.style.overflow = 'scroll';
            }else{
                //firefox will fire onresize event with the "You PDF file may not display correctly toolbar"
                if (!isText && _browser.isFirefox && controller.saveResize){
                    controller.saveResize(false);
                }
            }

            div.innerHTML = innerHTML;

            document.body.appendChild(div);

            _pdfDlg = new hi5.ui.Lightbox(div, {close:{top: '-20px', right: '-15px'}});
            _pdfDlg.onclose = _close;
            _pdfDlg.show();

            if (isText){
                var _frame = document.getElementById('_iFramePDF').contentWindow;
                _frame.focus();
                _frame.print();
            }
        }
        
        function processNext() {
            var pdf = _pdfQue.shift();
            if (pdf) {
                _showPDF(pdf);
            }            
    		isProcessing = true;
        }

        this.showPDF = function (value) {
            _pdfQue.push(value);
    		if (!isProcessing){
                processNext();            
            }
        };
    };

    function cleanUI() {
        if (_pointMgr){
            _pointMgr.release();
            _pointMgr = null;
        }

        if (document) {
            if (wsInput){
                var element = wsInput.element;
                document.removeEventListener('mousemove', handleMouseMove, false);
                element.removeEventListener('mousedown', handleMouseDown, false);
                document.removeEventListener('mouseup', handleMouseUp, false);
                element.removeEventListener('mouseleave', hideImgCursor, false);
                element.removeEventListener('mouseenter', hideImgCursor, false);
                //            addMouseWheelHandler(element, handleMouseWheel, false);

                element.removeEventListener('paste', _clipboard.onPaste, false);
                element.removeEventListener('copy', _clipboard.onCopy, false);
                element.removeEventListener('cut', _clipboard.onCopy, false);

                element.removeEventListener('focus', focusEvent, false);
                element.removeEventListener('blur', blurEvent, false);
            }

            if (_clipboard) {
                document.removeEventListener('paste', _clipboard.onPaste, false);
                document.removeEventListener('copy', _clipboard.onCopy, false);
                document.removeEventListener('cut', _clipboard.onCopy, false);
            }
        }

        if (window) {
            window.removeEventListener('resize', _onresize, false);
            window.removeEventListener('beforeunload', _beforeunload, false);
            window.removeEventListener("unload", _unload, false);

            releaseImageCursor();

            if (myLI && myLI.toolbar) {
                myLI.toolbar.setFadable = null;
                myLI.toolbar.startFade = null;
                myLI.toolbar.style.display = 'none';
                hi5.ui.clean(myLI.toolbar);
                myLI.toolbar = null;
            }

            try {
                if (touchDiv && touchDiv.parentNode) {
                    touchDiv.parentNode.removeChild(touchDiv);

                    touchDiv = null;
                }

                if (wsInput) {
                    wsInput.remove();
                    wsInput = null;
                }
            } catch (e) { }


        }
    }

    this.close = function () {
        _running = false;
        // if (!controller) {
        //     return;
        // }
        svGlobal.logger.info('close ui...');
        allowInput = false;
        if (_animationId) {
            cancelAnimationFrame(_animationId);
        }

        _unload();

        cleanUI();

        //release memory
        if (_clipboard) {
            _clipboard.release();
            _clipboard = null;
        }

        if (_dropZoneDlg) {
            _dropZoneDlg.release();
            _dropZoneDlg = null;
        }

        if (_dropZoneFull) {
            _dropZoneFull.release();
            _dropZoneFull = null;
        }

        if (touchKeyboard) {
            touchKeyboard.release();
            touchKeyboard = null;
        }

        keyboardLayout = null; _keyStatus = null; thumbCanvas = null;
        touchKeyboard = null;

        fileHandler = null;
        fileDlg = null, imgCursor = null, currCursor = null, touchHandler = null;
        __draw = null; controller = null; myLI.fileProgress = null;

        if (pdfDialog){
            pdfDialog.clearPDF();
        }
        pdfDialog = null;

        if (autoScale) {
            myLI.setAutoScale(false);
        }

        if (__pckey) {
            __pckey.setVisibility(false);
            __pckey.release();
            __pckey = null;
        }


        if (!('clearScreen' in appcfg) || appcfg.clearScreen) {
            ctxRdp.fillRect(0, 0, _canvas.width, _canvas.height);
        }

        if (window.svSurface && window.svSurface == myLI){
            window.svSurface = null;
        }

        byMe = true;

        if (!window || playerMode) return;//may closed already

        try {

            if (notifications.notifySize() > 0) {
                notifications.onempty = function () {
                    myLI.close();
                    notifications.onempty = null;
                };
                return;
            }

            if (appcfg.closeOnDisconn) {
                window.close();
            } else {
                this.hide();
                if (_browser.isChromeApp) {
                    var current = chrome.app.window.current();
                    if (current && !appcfg.disableMaxFullScn) {
                        current.onMaximized.removeListener(appWinMax);
                        //                        current.onBoundsChanged.removeListener(_onresize);
                        if (current.isFullscreen()) {
                            current.restore();
                            current.restore();
                        }
                    }
                }
            }

        }
        catch (e) { };

        myLI.context = null;
        ctxRdp = null;
        _canvas = null;
        myLI = null;
        svGlobal.logger.info('closed ui');
    };

    //TODO:remove this func in future
    this.setFastCopy = function (v) {
        // fastCopy = v;
    };


    this.drawLicense = function (value) {
        if (appcfg.drawLicense != false) {
            var c = value.charAt(0);
            ctxRdp.save();
            ctxRdp.font = '12pt Arial';
            ctxRdp.fillStyle = (c == 'W') ? 'red' : 'black';
            var s = value.substring(1);
            ctxRdp.fillText(s, 10, (heightFace - 24));
            ctxRdp.restore();
        }
    };

    this.drawText = function (s) {
        var text = appcfg.text || {};//{backgroundFillStyle: '#000', fillStyle: '#fff', textAlign: 'center', textBaseline: 'top', font: 'bold 16px Segoe UI,Tahoma,Verdana,Arial,sans-serif'};
        ctxRdp.save();
        var fillStyle = text.backgroundFillStyle || 'white';
        var w = _canvas.width;
        var h = _canvas.height;
        ctxRdp.fillStyle = fillStyle;
        ctxRdp.fillRect(0, 0, w, h);

        var x = 20, y = 50;
        if (text.textAlign == 'center') {
            x = w / 2;
            y = h / 2;
        }


        ctxRdp.font = text.font || '18pt Arial';
        ctxRdp.fillStyle = text.fillStyle || 'black';
        if (text.textAlign) {
            ctxRdp.textAlign = text.textAlign;
        }
        if (text.textBaseline) {
            ctxRdp.textBaseline = text.textBaseline;
        }

        ctxRdp.fillText(s, x, y);
        ctxRdp.restore();
    };

    this.showPDF = function (value) {
        pdfDialog.showPDF(value);
    };

    function makeEditable(type, editable) {
        var id = '_tmpEditable';
        var div = document.getElementById(id);
        if (!type) {
            type = 'div';
        }

        var body = document.body;
        if (div && div.nodeName != type.toUpperCase()){
            body.removeChild(div);
            div = null;
        }
        var isNew = !div;
        if (isNew) {
            div = document.createElement(type);
            div.id = id;
	        if (type == 'div' && editable !== false) {
	            div.contentEditable = true;
	            if (_browser.isIE) {
	                div.style.textIndent = '-999px';//hide text blinking cursor (caret)
	            }
	        }
	        div.style.position = 'absolute';
	        div.style.zIndex = 9999;
	        div.style.left = (body.scrollLeft + 50) + 'px';//make sure it's visible, otherwise it may cause scrolling
	        div.style.top = (body.scrollTop + 50) + 'px';
	        div.style.width = '4px';
	        div.style.height = '4px';
	        //div.style.all = 'initial';
	        div.tabIndex = 2;
	        div.style.outline = 'none';
	        div.style.opacity = 0.01;
            div.style.overflow = 'hidden';
	        body.appendChild(div);
        }
        return div;
    }

    function focusEvent(e) {
        // console.log(Date.now() + ' focus: ' + myLI.focused + ' useClipboard:' + useClipboard + ' myLI.onreqpaste:' + !!myLI.onreqpaste + ' directClipAccess:' + directClipAccess);
        if (myLI.focused){//makeEditable could switch the focus
            return;
        }
        pdfDialog.clearPDF();
        myLI.focused = true;
        
        if (controller){
            controller.onfocus(e);
        }
        myLI.focusTime = Date.now();
        if (useClipboard) {
            if (controller.fromSyncedSurface) {//vnc, telnet don't support it
                clipSynced = controller.fromSyncedSurface(200);
                //For desktop, clipSynced remain the same if it swtich back from another window in 1.3 seconds (assue user have no time to copy)
                //For remtoeapp, it's sycned if user comes from another synced remoteapp window
            } else {
                clipSynced = false;
            }
            if (!clipSynced) {//let server know local clipboard changed
                if (_clipboard) {
                    _clipboard.clipData = null;
                }
                // console.log('send clipboard change notification');
                if ((myLI.onreqpaste || directClipAccess)){
                    controller.send('8911');
                }else {
                    _clipboard.read(function(cd){
                        if (cd && !cd.equals(_clipboard.clipData)){
                            controller.send('8911');
                            _clipboard.clipData = cd;
                        }else{
                            controller.send('8910');
                        }
                    });
                }
            }
        }
        if (controller){
            controller.checkLockFlags = true;
        }
        
        _keyStatus.sendMissKey();

        if (_keyStatus.ctrlDelayed){
            _keyStatus.ctrlDelayed = false;
        }

        // console.log('focus, clipSynced:' + clipSynced);

    }

    function _beforeunload(e) {
        var m = __svi18n.remoteApp.close;
        var nostop = byMe || (!myLI.railWin) || (!myLI.railWin.isRunning()) || !m;
        if (nostop) return;//we can not return anything here ("", null), IE will show the close warning dialog
        if (!e) {
            e = window.event;
        }

        if (controller.getAppMode() != 2) {//not a join session
            myLI.showMessage(m);
            if (e) {
                e.returnValue = m;
            }
            return m;
        }
    }

    function _unload(e) {
        if (myLI) {
            myLI.focused = false;
            if (myLI.onunload) {
                myLI.onunload();
            }
        }
    }

    function disableEvents() {
        if (wsInput) {
            wsInput.element.oncontextmenu = function () { return false; };
            if (!_browser.isIE) {//You can not select content (selectEditable()) using code with this on IE.
                wsInput.element.onselectstart = function () { return false; };
            }
        }
    }

    function enableEvents() {
        if (wsInput) {
            wsInput.element.oncontextmenu = null;
            wsInput.element.onselectstart = null;
        }
    }

    function _onresize(e) {
        if (wsInput) {
            wsInput.adjust();
        }
        if (autoScale) {
            scaleToWindow(true);
        } else {
            if (touchInputing && ((Date.now() - touchInputing) < 2500)) {
                return;//This is caused by virtual keyboard display
            }

            var isWindowsDesktop = _browser.isWindows && !_browser.isMetro;
            if (!isTouch || (isWindowsDesktop && !touchInputing) || _browser.isCrOS || _browser.isChromeApp) {
                controller.onresize(e);
            }
        }

    }

    function blurEvent(e) {
        // console.log(Date.now() + ' blur: ' + myLI.focused + ' ' + e.target.nodeName);
        if (controller){
            controller.checkLockFlags = true;
        }

        if (myLI) {
            myLI.focused = false;
            myLI.blurTime = Date.now();
        }
    }

    function initEvents() {
        if (!window.svSurface) {
            window.svSurface = myLI;
        }

        window.addEventListener('resize', _onresize, false);
        if (playerMode) {
            return;
        }

        var notRuntime = !_browser.isChromeApp;
        if (notRuntime) {
            window.addEventListener('beforeunload', _beforeunload, false);
        }
        if (notRuntime) {
            window.addEventListener("unload", _unload, false);
        } else {
            chrome.runtime.onSuspend.addListener(_unload);
        }

        disableEvents();
        wsInput.element.addEventListener('focus', focusEvent, false);
        wsInput.element.addEventListener('blur', blurEvent, false);

        if (_browser.isChromeApp && !appcfg.disableMaxFullScn) {
            chrome.app.window.current().onMaximized.addListener(appWinMax);
            //            chrome.app.window.current().onBoundsChanged.addListener(_onresize);//don't need this. window.reize event is enough.
        }

        var elm = hi5.$('saveSession');
        if (elm) {
            elm.addEventListener('change', function (e) {
                controller.saveSession({ save: e.target.checked });
            });
        }

        elm = hi5.$('reqFullscr');
        if (elm){
            elm.onclick = function(e){
                myLI && myLI.requestFullscreen(true);
            };
        }

    }

    this.hide = function () {
        if (myLI.hideWhenClose) {
            _canvas.height = 1;
            _canvas.width = 1;
        }
        if (wsInput) {
            wsInput.hide();
        }
    };

    var btnTimeoutId = 0, copyWarned = false;

    function escapeHTML(v) {
        return v.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }


    this.copyToClip = function (value, type) {

        if (!useClipboard || !copyToLocal) return;

        var _data = _clipboard.parseClipData(value);
        if (appcfg.copyTextOnly && _data.type != 'text/plain') {
            return;
        }

        if (_clipboard.processFileGroup(_data)) {
            return;
        }

        if (_clipboard.waitingCopyContent) {
            _clipboard.copyContent = _data;
            return;
        }

        // setTimeout(function () {

            var _v = _data.value;

            var useDialog = appcfg.copyDialog || 
                            (_v.startsWith('<img data-sv-img') && (!navigator.clipboard || !navigator.clipboard.write));


            if (!useDialog || _clipboard.hasCopyCmd || navigator.clipboard) {
                useDialog = !_clipboard.copyToClipboard(_data.type, _v);
            }

        // }, 50);
    };

    __pckey = new function TouchPcKeys() {
        var btnCtrl = null, btnAlt = null, btnShift = null;
        var stickyKey = {ctrl: false, alt: false, shift: false};

        this.release = function(){
            stickyKey = null;
        };

        function showPcKeys(e) {
            touchInputing = Date.now();
            var pckeys = ui_option.pcKey;
            if (!pckeys) return;
            pckeys.style.display = 'block';
            pckeys.style.top = window.pageYOffset + 'px';

            if (touchKeyboard) {
                touchKeyboard.setValue('`\t`');
                touchKeyboard.select();
            }
        }

        function hidePcKeys(e) {
            touchInputing = 0;
            var elm = ui_option.pcKey;
            if (!elm) return;
            elm = hi5.$('shortcuts');
            if (elm && elm.checked) return;
            pckeys.style.display = 'none';
        }

        this.setStickyKey = function(sk){
            stickyKey = sk;
        };

        this.setVisibility = function (v) {
            if (v) {
                showPcKeys();
            } else {
                hidePcKeys();
            }
        };

        function updateStatus() {
            if (btnCtrl) {
                if (ctrlDown) {
                    hi5.html.addClass(btnCtrl, 'button_selected');
                } else {
                    hi5.html.removeClass(btnCtrl, 'button_selected');
                }
            }
            if (btnAlt) {
                if (altDown) {
                    hi5.html.addClass(btnAlt, 'button_selected');
                } else {
                    hi5.html.removeClass(btnAlt, 'button_selected');
                }
            }
            if (btnShift) {
                if (shiftDown) {
                    hi5.html.addClass(btnShift, 'button_selected');
                } else {
                    hi5.html.removeClass(btnShift, 'button_selected');
                }
            }
        }

        this.resetModifier = function () {
            if (altDown && !stickyKey.alt) {
                altDown = false;
                sendScancode(false, 0x38, 'Alt');
            }
            if (ctrlDown && !stickyKey.ctrl) {
                ctrlDown = false;
                sendScancode(false, 0x1d, 'Control');
            }
            if (shiftDown && !stickyKey.shift) {
                shiftDown = false;
                sendScancode(false, 0x2a, 'Shift');
            }
            updateStatus();
        };

        function processPcKeys(e) {
            // cancelDefault(e);

            var target = e.target;
            var key = target.innerHTML;
            key = key.replace(/\u2190/g, 'left').replace(/\u2191/g, 'up').replace(/\u2192/g, 'right').replace(/\u2193/g, 'down');//replace left, r, u, d

            switch (key) {
                case 'Ctrl':
                    if (!btnCtrl) {
                        btnCtrl = target;
                    }
                    if (ctrlDown) {
                        sendScancode(false, 0x1d, 'Control');
                    } else {
                        sendScancode(true, 0x1d, 'Control');
                    }
                    ctrlDown = !ctrlDown;
                    updateStatus();
                    return;
                case 'Alt':
                    if (!btnAlt) {
                        btnAlt = target;
                    }
                    if (altDown) {
                        sendScancode(false, 0x38, 'Alt');
                    } else {
                        sendScancode(true, 0x38, 'Alt');
                    }
                    altDown = !altDown;
                    updateStatus();
                    return;
                case 'Shift':
                    if (!btnShift) {
                        btnShift = target;
                    }
                    if (shiftDown) {
                        sendScancode(false, 0x2a, 'Shift');
                    } else {
                        sendScancode(true, 0x2a, 'Shift');
                    }
                    shiftDown = !shiftDown;
                    updateStatus();
                    return;
                case '...':
                    var more = _queryChild(ui_option.pcKey, 'pc_key_more');
                    if (more) {
                        more.style.display = (more.style.display == 'block') ? 'none' : 'block';
                    }
                    return;
                case 'Start':
                    key = 'Ctrl+Esc';//no break;
                default:
                    myLI.writeKeyComb(key);
                    __pckey.resetModifier();
            }
        }

        var pckeys = ui_option.pcKey;
        if (!pckeys) return;
        var keys = pckeys.getElementsByTagName('span');
        var len = keys.length;


        var touchstart = _browser.isFirefox ? 'mousedown' : 'touchstart';//don't know why firefox doesn't support touchstart here
        if (!('ontouchstart' in window)) {
            if (navigator.pointerEnabled) {
                touchstart = 'pointerdown';
            } else if (navigator.msPointerEnabled) {
                touchstart = 'MSPointerDown';
            }
        }
        for (var i = 0; i < len; i++) {
            var kk = keys[i];
            kk.className = 'button';
            kk.addEventListener(touchstart, processPcKeys, false);
            if (touchstart != 'mousedown') {
                kk.addEventListener('mousedown', processPcKeys, false);
            }
        }

        pckeys.style.position = 'absolute';

    }

    this.setStickyKey = function(sk){
        __pckey.setStickyKey(sk);
    };


    var _element = hi5.$('shortcuts');
    if (_element) {
        _element.addEventListener('change', function (e) {
            __pckey.setVisibility(e.target.checked);
        });
    }


    /*
    function LongPressListener(elm, handler, time){
    	var _pressTimeout = 0;
    	var touchUp = false;
    	
    	
    	function _touchStart(e){
    		_pressTimeout = setTimeout(_callback, time);
    		touchUp = false;
    	}
    	
    	function _callback(){
    		if (!touchUp){
    			handler(elm);
    		}
    	}
    	
    	function _touchDone(){
    		touchUp = true;
    	}
    	
    	elm.addEventListener('touchstart', _touchStart, false);
    	elm.addEventListener('touchend', _touchDone, false);
    	elm.addEventListener('touchcancel', _touchDone, false);
    }
    */

    function addTouchInput() {
        if (touchInput) {
            return;
        }

        var gesture = hi5.$('touchGesture');
        if (gesture) {
            gesture.style.display = "block";
        }

        var _extKBD = hi5.$('extKBD');
        if (_extKBD) {
            _extKBD.onchange = function (e) {
                myLI.setExtKeyboard(e.target.checked);
            };
        }

        touchInput = hi5.$('svTouchInput');
        try {
            if (window.parent != window && !touchInput) {
                touchInput = window.parent.document.getElementById('svTouchInput');
            }
        } catch (e) { };

        if (!touchInput) return;

        if (touchInput.nodeName != 'IMG') {//compatibility
            var newElm = document.createElement('img');
            newElm.id = 'svTouchInput';
            newElm.src = appcfg.img && appcfg.img.kbd || 'kbd.png';
            touchInput.parentNode.replaceChild(newElm, touchInput);
            touchInput = newElm;
        }


        /*
        if (_browser.isiOS){
            var iak = new iOSArrowKey(touchInput);
            iak.onarrowkey = function(key){
                alert(key);
                controller.writeKeyComb(key);
            };
        }*/

    }

    this.setKeysVisibility = function (v) {
        if (__pckey) {
            __pckey.setVisibility(v);
        }
    };

    function showInput() {
        if (!touchDiv) return;
        touchDiv.style.display = 'block';
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(inputTimeout, 3000);
    }

    this.setDirectory = function(dir){
        var filePath = hi5.$('parentPath');
        if (!filePath) return;
        if ('.' != dir) {
            filePath.currentDir = dir;
        }
    };

    function refreshFileList(dir, lb) {
        var filePath = hi5.$('parentPath');
        if (!filePath.currentDir) {
            filePath.currentDir = '/';
        }
        if ('.' == dir) {
            dir = filePath.currentDir;
        } else {
            filePath.currentDir = dir;
        }

        filePath.currentDir = dir;

        if (lb){
            if (lb.visible()){
                hi5.tool.disableInput(hi5.$('filecontainer'));
            }else{
                lb.onopen = function(){
                    hi5.tool.disableInput(hi5.$('filecontainer'));
                }
            }
        }else{
            hi5.tool.disableInput();
        }


        function createNode(dataPath, txt) {
            var c = document.createElement('span');
            c.data_path = dataPath;
            c.className = 'path';
            c.innerHTML = txt;
            c.onclick = function () {
                refreshFileList(this.data_path, lb);
            };
            return c;
        }

        function createPathLink(path) {
            var p = filePath;//hi5.$("parentPath");
            while (p.hasChildNodes()) {
                p.removeChild(p.firstChild);
            }

            var node = createNode('/', '&nbsp&nbsp&nbsp/');
            p.appendChild(node);
            if (path == '/' || path === '') {
                return;
            }

            var vs = path.split('/');
            var s = '/';
            for (var i = 0, len = vs.length; i < len; i++) {
                var v = vs[i];
                if (v === '') continue;
                s = s + vs[i] + '/';
                node = createNode(s, v + '/');
                p.appendChild(node);
            }
        }
        var tbl = new hi5.DataGrid(hi5.$('filelist'));
        tbl.clear();

        function callback(obj) {
            if (obj.error && __svi18n.file[obj.error]) {
                myLI.showMessage(__svi18n.file[obj.error]);
            }
            var ds = new hi5.DataTable(obj);

            tbl.dataTable = ds;
            var bytesToSize = hi5.tool.bytesToSize;
            tbl.beforeDisplayValue = function (col, value) {
                var name = ds.cols[col].name;
                if (name == 'Date Modified') {
                    return new Date(value).toLocaleString();
                } else if (name == 'Size') {
                    return bytesToSize(value);
                } else if (name == 'Type' && 'folder' == value) {
                    return __svi18n.file.folder;
                } else if (name == 'Name') {
                    //file name is URL encoded
                    return decodeURIComponent(value);
                } else {
                    return value;
                }
            };

            //we need to normalize the path here, otherwise, browser will simply remove them
            //file name is URL encoded
            function getFileName(name) {
                if (!name) {
                    name = tbl.getValue('Name');
                }
                var f = obj.parent;
                if (f === '' || f.charAt(f.length - 1) != '/') {
                    f += '/';
                }
                
                if (name == "."){
                    return f;
                }else if (name == ".."){
                    var len = f.length;
                    if (len == 1){//it's /
                        return f;
                    }

                    var i = f.lastIndexOf('/', f.length - 2);
                    if (i != -1){
                        return f.substring(0, i + 1);
                    }
                }

                f += name;
                return f;
            }

            tbl.onrowclick = function (e) {
                var name = tbl.getValue('Name');
                var type = tbl.getValue('Type');
                var f = getFileName(name);
                var action = e.target.name;

                if (action == 'delete') {
                    fileHandler.removeFile(f);
                    refreshFileList(obj.parent, lb);
                    return;
                }

                if (type == 'folder') {
                    // var p = (obj.parent == '/') ? '' : obj.parent;
                    refreshFileList(f, lb);
                    return;
                }

                // if (action == 'view') {
                //     f += '&action=view';
                // }

                if (action){//download or view file name is URL encoded
                    controller.getFile(decodeURIComponent(f), null, action);
                }
            };
            tbl.beforeAppendRow = function (r) {
                var elm, type = ds.getValue(ds.getColNo('Type'));
                if (type == 'folder') {
                    elm = r.querySelector('img[name="download"]');
                    if (elm) {
                        elm.style.visibility = 'hidden';
                    }
                    return;
                }
                // r.draggable = true;

                var n = tbl.getValue('Name');
                var f = getFileName(n);
                //file name is URL encoded
                f = 'application/octet-stream:' + n + ':' + controller.getFileLink(decodeURIComponent(f));

                // r.addEventListener('dragstart', function (e) {
                //     e.dataTransfer.setData('DownloadURL', f);
                // }, false);
                if (n.length > 10 && n.substring(n.length - 10) == '.uploading') {
                    elm = r.querySelector('img[name="download"]');
                    if (elm) {
                        elm.style.visibility = 'hidden';
                    }
                    elm = r.querySelector('img[name="view"]');
                    if (elm) {
                        elm.style.visibility = 'hidden';
                    }
                }

            };
            tbl.open();
            createPathLink(obj.parent);
            var diskSpace = document.getElementById('__diskSpace');
            if (diskSpace) {
                diskSpace.innerHTML = hi5.tool.bytesToSize(obj.freeSpace) + '/' + hi5.tool.bytesToSize(obj.totalSpace);
            }
            if (lb){
                lb.__position = '\\\\tsclient\\' + obj.name + obj.parent.replace(new RegExp('/', 'g'), '\\');
                lb.__workdir = obj.parent;
            }
            hi5.tool.enableInput();
        }

        controller.getShareFiles(dir, callback);
    }


    function displayFiles(e) {
        if (!fileHandler) return;
        
    	if (e){
    		cancelDefault(e);
    	}
        var c = hi5.$('filecontainer');
        fileDlg = new hi5.ui.Lightbox(c);
        refreshFileList('.', fileDlg);
        fileDlg.show();
        // hi5.tool.disableInput(c);
        fileDlg.onclose = function(){
            hi5.tool.enableInput();
            myLI.focus();
        };

        var elm = document.getElementById('__sv_folder__');
        if (elm && fileHandler.mkdirs) {
            elm.onclick = function () {
                var elmName = document.getElementById('__sv_folder_name_');
                if (elmName && elmName.value) {
                    fileHandler.mkdirs(elmName.value);
                    refreshFileList('.', fileDlg);
                    elmName.value = '';
                }
            };
        }

        elm = document.getElementById('__sv_position__');
        if (elm) {
            elm.onclick = function () {
                if (controller.setWorkDir){
                    controller.setWorkDir(fileDlg.__position, fileDlg.__workdir);
                }
                fileDlg.dismiss();
            };
        }

    }

    this.refreshFiles = function (inline) {
        if (inline){//display without the Lightbox
            refreshFileList('.', null);
            var elm = document.getElementById('__sv_folder__');
            if (elm && !elm.onclick && fileHandler.mkdirs) {
                elm.onclick = function () {
                    var elmName = document.getElementById('__sv_folder_name_');
                    if (elmName && elmName.value) {
                        fileHandler.mkdirs(elmName.value);
                        refreshFileList('.', null);
                        elmName.value = '';
                    }
                };
            }
        }else{
            if (!fileDlg || !fileDlg.visible()) {
                displayFiles(null);
            } else {
                refreshFileList('.', fileDlg);
            }
        }
    };

    this.showConnectonInfo = function(){
        var appInfo = controller.getAppInfo();
        var elm = hi5.$('numericId');
        if (elm) {
            elm.innerHTML = appInfo.numericId;
        }
        elm = hi5.$('connectingTo');
        if (elm) {
            elm.innerHTML = appInfo.server;
        }

        elm = hi5.$('joinLink');
        if (elm) {
            elm.href = elm.innerHTML = appInfo.joinLink;
            var share = document.getElementById('shareSession');
            if (share){
                if (navigator.share){
                    share.onclick = function(e){
                        navigator.share({url: appInfo.joinLink});
                    };
                }else{
                    share.style.display = 'none';
                }
            }
        }

        var lb = new hi5.ui.Lightbox(hi5.$('appinfo'));
        lb.show();
        enableEvents();
        lb.onclose = disableEvents;

        var btnTwoFA = hi5.$('btnTwoFA');
        var twoFADiv = hi5.$('twofainfo');
        if (twoFADiv && btnTwoFA){
            if (!appInfo.twoFAEnabled && !appInfo.twoFAQR){
                btnTwoFA.disabled = true;
            }else{
                btnTwoFA.onclick = function(){
                    myLI.showTwoFAQR();
                }
            }
        }
    };

    this.setupTwoFA = function(display){
        
    };

    function initToolbar() {
        var _toolbar = ui_option.toolbar;
        if (!_toolbar) return;

        var childrean = _toolbar.childNodes;
        var hasExtra = false;//check if there are user added elements
        for (var i = 0, len = childrean.length; i < len; i++) {
            if (childrean[i].nodeType == 1 && ['svTouchInput', 'svCloud', 'svInfo'].indexOf(childrean[i].id) == -1) {
                hasExtra = true;
                break;
            }
        }

        var appinfo = hi5.$('appinfo');
        if (appinfo) {
            appinfo.className = 'h5-form';
        }
        var _showToolbar = myLI.showToolbar || (isTouch || fileHandler || appinfo || hasExtra);
        if (_showToolbar) {
            _toolbar.style.left = (window.innerWidth * 0.45) + 'px';
            var isNew = myLI.toolbar === null;
            if (isNew)
                myLI.toolbar = new hi5.Toolbar(_toolbar, appcfg.toolbar.draggable, appcfg.img.handle || 'handle.png');//Dragable
            if (!isTouch) {
                var elm = hi5.$('svTouchInput');
                if (elm) {
                    elm.parentNode.removeChild(elm);
                }
            }

            var imgBtn = myLI.toolbar.getButton('svCloud');
            if (imgBtn) {
                if (fileHandler) {
                    imgBtn.style.display = '';
                    //                    if (isNew){
                    imgBtn.onclick = displayFiles;
                    //                    }
                } else {
                    imgBtn.style.display = 'none';
                }
            }

            var fadeDelay = appcfg.toolbar.fadeDelay || 5000;

            new hi5.Fadable(myLI.toolbar, fadeDelay, wsInput.element, 'inline-block');

            var fadable = appcfg.toolbar.fadable;
            myLI.toolbar.setFadable(fadable);
            if (fadable) {
                myLI.toolbar.style.display = 'none';
            }

            imgBtn = myLI.toolbar.getButton('svInfo');
            if (imgBtn) {
                if (appinfo) {
                    imgBtn.style.display = '';
                    if (isNew) {
                        imgBtn.onclick = function (e) {
                            cancelDefault(e);
 
                            myLI.showConnectonInfo();
                        };
                    }
                } else {
                    imgBtn.style.display = 'none';
                }
            }
            if (myLI.onloadtoolbar) {
                myLI.onloadtoolbar(myLI.toolbar);
            }
        }
    }

    this.processLink = function (link) {

        if (myLI.beforeOpenLink) {
            return myLI.beforeOpenLink(link);
        }

        if (!myLI.toolbar){
            return false;
        }


        function openLink(e) {
            window.open(link);
            e.target.parentNode.removeChild(e.target);
        }

        clearTimeout(btnTimeoutId);

        var toolbar = myLI.toolbar;
        var img = toolbar.getButton('_svLinkInfo');
        if (img) {
            img.onclick = openLink;
        } else {
            img = toolbar.addButton(((appcfg.img.link) ? appcfg.img.link : 'link.png'), openLink);
            img.id = '_svLinkInfo';
        	// img.className = 'pulse';
        }
        img.title = link;
        toolbar.startFade();

        btnTimeoutId = setTimeout(function () {
            if (myLI.toolbar){//maybe called after this.close()
                myLI.toolbar.removeButton('_svLinkInfo');
            }
        }, 10000);//removed it 10 seconds later

        return true;
    };

    this.setUnicode = function (unicode) {
        if (!wsInput) return;

        if (!unicode && isTouch && (_browser.isiOS || _browser.isAndroid)) {
            unicode = true;
        }

        svGlobal.logger.info('Unicode:' + unicode);

        keyboard.onkeydown = keyboard.onkeyup = unicode ? handleUniCode : handleKey;
        keyboard.ontextinput = unicode ? handleTextInput : null;
        keyboard.unicode = unicode;
        if (unicode){
            keyboard.oncomposition = handleComposition;
        }
    };

    this.forceScancode = function(v){
        forceScancode = v;
    };

    function getDropZone() {
        return wsInput.element;
    }

    function uploadFiles(e) {
        fileHandler.addFiles(e.target.files, false);
        //make sure can upload same file twice or more
        //TODO: use .value = '', and test different browser
        var oldChild = hi5.$('uploadfile');
        var newChild = oldChild.cloneNode(true);
        var pNode = oldChild.parentNode;
        pNode.replaceChild(newChild, oldChild);
        newChild.addEventListener('change', uploadFiles, false);
    }

    function initFileShareDnD() {
        var dropZone = getDropZone();
        if (_dropZoneFull) {
            _dropZoneFull.release();
        }

        _dropZoneFull = new svGlobal.util.MapDisk(dropZone, fileHandler, true);
        if (hi5.$('filecontainer')) {
            _dropZoneDlg = new svGlobal.util.MapDisk(hi5.$('filecontainer'), fileHandler, false);
            hi5.$('uploadfile').addEventListener('change', uploadFiles, false);
        }
    }

    this.setTouchRemoting = function (v) {
        if (v === true) {
            touchHandler = new TouchRemoting(myLI, _canvas);
            svGlobal.logger.info('touch remoting');
            if (__svi18n.info.touchremoting){
                myLI.showMessage(__svi18n.info.touchremoting);
            }
        } else {
            touchHandler = new TouchHandler(myLI);
        }
    };

    this.setClipboard = function (v, local, remote) {
        useClipboard = v;
        if (useClipboard){
            copyToLocal = (local == undefined) ? true : local;
            copyToRemote = (remote == undefined) ? true : remote;
            _clipboard.init();
        }else{
            copyToLocal = false;
            copyToRemote = false;
        }
        useCopyEvent = v ? (!_browser.isChromeApp && !appcfg.copyDialog && !appcfg.directClipAccess && !_browser.isIE) : false;
    };

    this.setJoinMode = function (v) {
        controller.setJoinMode(v);
    };

    this.requestControl = function () {
        controller.requestControl();
    };

    this.repaint = function (l, t, r, b) {

        if (_mousePos.isMultiMon) {
            if (l < _mousePos.left) {
                l = _mousePos.left;
            }

            if (t < _mousePos.top) {
                t = _mousePos.top
            }

            if (r > _mousePos.right) {
                r = _mousePos.right;
            }

            if (b > _mousePos.bottom) {
                b = _mousePos.bottom;
            }

            if (l <= _mousePos.right && t <= _mousePos.bottom) {//in screen
                var painting = controller.refresh(l, t, r, b);
                if (painting) {
                    ctxRdp.putImageData(painting.imgData, painting.left - _mousePos.left, painting.top - _mousePos.top, 0, 0, painting.width, painting.height);
                }
            }
        } else {
            var painting = controller.refresh(l, t, r, b);
            if (painting) {
                ctxRdp.putImageData(painting.imgData, painting.left, painting.top, 0, 0, painting.width, painting.height);
            }
        }
    };

    function hideImgCursor(e) {
        if (imgCursor) {//hide it
            imgCursor.__setVisible(false);
        }
    }

    this.running = function () {
        return _running;
    };

    /**
     * converMacCtrl: map ctrl key to Windows key on Mac if it's true
     * noKeyStuck: true, no need to sedn missing keys, for example, on SSH and Telnet session.
     * mapCmdToCtrl: map cmd key to Ctrl key on Mac, otherwise, map to Widows key.
     */
    this.run = function (kbd, converMacCtrl, noKeyStuck, mapCmdToCtrl) {
        _running = true;
        keyboardLayout.converMacCtrl = converMacCtrl !== false;
        keyboardLayout.mapCmdToCtrl = mapCmdToCtrl !== false;
        _keyStatus.noKeyStuck = !!noKeyStuck;
        if (!keyboardLayout.mapCmdToCtrl && _browser.isMacOS){//since the keyboard copy/paste is not working on Mac (Only Cmd+C/X/V can fire oncopy/paste evnts). we disable it
            enableDirectClipAccess();
        }

        initWsInput();
        notifications.clearAll();//clean all existing message
        if ((kbd == 3758162961 || kbd == 3758162962) && wsInput) {
            wsInput.setContentEditable('false');
        }

        keyboardLayout.setLayout(kbd);

        var unicode = [99997, 99998, 99999].indexOf(kbd) != -1;

        if (appcfg.closeOnDisconn == undefined){
            appcfg.closeOnDisconn = !!window.opener && !_browser.isChromeApp;
        }

        if (!appcfg.disableScoll) {
            window.scrollTo(0, 0);//this is useful on iPad
        }

        initToolbar();


        initEvents();

        var element = wsInput.element;


            if (!playerMode) {
                touchHandler = new TouchHandler(myLI);
                _pointMgr = new PointerManager(element);
                _pointMgr.ontouch = handleTouch;
                _pointMgr.onmousedown = handleMouseDown;
                _pointMgr.onmousemove = handleMouseMove;
                _pointMgr.onmouseup = handleMouseUp;


                element.addEventListener('mouseleave', hideImgCursor, false);
                element.addEventListener('mouseenter', hideImgCursor, false);
                addMouseWheelHandler(element, handleMouseWheel, false);

                element.addEventListener('paste', _clipboard.onPaste, false);
                if (useClipboard) {
                    if (useCopyEvent) {
                        if (copyToLocal){
                            element.addEventListener('copy', _clipboard.onCopy, false);
                            element.addEventListener('cut', _clipboard.onCopy, false);
                        }
                    }
                }
            }

            if (appcfg.autoFocus !== false) {
                focusAndFix(element);
            }

        myLI.setUnicode(unicode);


        this.drawText(__svi18n.wait);

        if (myLI.onstart) {
            myLI.onstart(_canvas);
        }


        function firstClick(e) {
            e.target.removeEventListener('click', firstClick, false);//it'll cause memory leak if use element here.
            controller.send('884');//shared clip check, this is for second RemoteApp window which fire onloggedin event. 
        }

        element.addEventListener('click', firstClick, false);


        if (__draw) {
            _animationId = requestAnimationFrame(_animationFrame);
        }

        wsInput.adjust();
        if (!appcfg.disableScoll) {
            window.scrollTo(0, 0);
        }


    };

    var _animationInterval = appcfg.animation || 42;
    if (_browser.isIE) {
        _animationInterval *= 2;
    }

    function _animationFrame(timestamp) {
        if (ctxRdp) {
            if ((timestamp - _prePaint) > _animationInterval) {
                if (_mousePos.isMultiMon) {
                    var painting = __draw(_mousePos.left, _mousePos.top, _mousePos.right, _mousePos.bottom);
                    if (painting) {
                        ctxRdp.putImageData(painting.imgData, painting.left - _mousePos.left, painting.top - _mousePos.top, 0, 0, painting.width, painting.height);
                        _prePaint = timestamp;
                    }
                } else {
                    var painting = __draw(0, 0, _mousePos.right, _mousePos.bottom);
                    if (painting) {
                        ctxRdp.putImageData(painting.imgData, painting.left, painting.top, 0, 0, painting.width, painting.height);
                        _prePaint = timestamp;
                    }
                }
            }

            _animationId = requestAnimationFrame(_animationFrame);
        }
    }

    var HTMLESCAPE = {"&euro;": "�", "&nbsp;": " ", "&quot;": '"',  "&amp;": "&", "&lt;" : "<", "&gt;" : ">", "&iexcl;": "�", "&cent;": "�",
        "&pound;": "�", "&curren;": "�", "&yen;": "�", "&brvbar;": "�", "&sect;": "�", "&uml;": "�", "&copy;": "�", "&ordf;": "�",
            "&reg;": "�"};

    function unescapeHTML(v) {
        v = v.replace(/<br\/?>/gi, "\r\n").replace(/(<([^>]+)>)/gi, "");
        return v.replace(/&[^;]+;/gi, function (match) {
            return HTMLESCAPE[match] || match;
        });
    }



    function moveCursor(xStep, yStep, localOnly, scrollIfNeeded) {
        // if (!imgCursor) return;
        if (!imgCursor) {
            initImgCursor(appcfg.cursorNameOnly);
        }

        if (!imgCursor.__visible){
            imgCursor.__setVisible(true);
        }
        var x = imgCursor.scrX, y = imgCursor.scrY;
        var tmpX = x + xStep, tmpY = y + yStep;
        if (tmpX < 0) {
            tmpX = 0;
        } else if (tmpX > widthFace) {
            tmpX = widthFace - 1;
        }

        if (tmpY < 0) {
            tmpY = 0;
        } else if (tmpY > heightFace) {
            tmpY = heightFace - 1;
        }

        imgCursor.scrX = tmpX;
        imgCursor.scrY = tmpY;

        var l = tmpX - imgCursor.hotX;
        var t = tmpY - imgCursor.hotY;
        if (_browser.isIE) {
            l = (l / mScale) | 0;
            t = (t / mScaleY) | 0;
        }

        imgCursor.style.left = (l + _mousePos.offX) + 'px';
        imgCursor.style.top = (t + _mousePos.offY) + 'px';

        if (allowInput && !localOnly) {
            controller.sendInput('82' + tmpX + '\t' + tmpY);
        }
        _mousePos.x = tmpX;
        _mousePos.y = tmpY;

        if (scrollIfNeeded ){
            var rect = imgCursor.getBoundingClientRect();

            if (rect.top < 3){
                window.scrollBy(0, -20);
            }else if (rect.left < 3){
                window.scrollBy(-20, 0);
            }else if (rect.bottom > (window.innerHeight)){
                window.scrollBy(0, 20);
            }else if (rect.right > (window.innerWidth)){
                window.scrollBy(20, 0);
            }
        }
    }

    this.moveCursorBy = this.movCursorBy = moveCursor;

    /**
     * x, y is from mouse event. 
     */
    function moveCursorTo(x, y, localOnly) {
        x = (x / mScale) | 0;
        y = (y / mScaleY) | 0;
        myLI.moveCursor(x, y, localOnly);
    }

    this.moveCursor = function (x, y, localOnly, name, id, flags) {
        // if (currCursor && currCursor.system){
        //     return;
        // }
        x -= _mousePos.left;
        y -= _mousePos.top;

        if (x < 0 || y < 0 || x >= widthFace || y >= heightFace) {
            return;
        }

        if (!imgCursor) {
            initImgCursor(appcfg.cursorNameOnly);
        }

        // if (imgCursor.style.visibility != 'visible') {
        //     imgCursor.style.visibility = 'visible';
        // }

        if (!imgCursor.__visible){
            imgCursor.__setVisible(true);
        }

        imgCursor.scrX = x;
        imgCursor.scrY = y;

        // if (name && name.length > 9) {
        //     name = name.substring(0, 9);
        // }
        
        imgCursor.moveCursor(x + _mousePos.offX, y + _mousePos.offY, name, id, flags);

        if (allowInput && !localOnly) {
            controller.sendInput('82' + x + '\t' + y);
        }
        _mousePos.x = x;
        _mousePos.y = y;
    };

    function setSoftKeyboard(visible) {
        if (wsInput) {
            wsInput.setContentEditable(visible ? 'true' : 'false');
        } else {//iOS is null sometimes, bug?
            var elm = document.getElementById('wsinput');
            if (elm) {
                input.setAttribute('contenteditable', visible ? 'true' : 'false');
            }
        }
        touchInputing = visible ? 1 : 0;
        if (__pckey) {
            __pckey.setVisibility(visible);
        }
        if (myLI.toolbar) {
            var btn = myLI.toolbar.getButton('svTouchInput')
            if (btn) {
                btn.className = visible ? 'h5-img-btn-on' : 'h5-img-btn';
            }
        }
    }

    function forceSoftKeyboard() {
        forceKeyboard = !forceKeyboard;
        if (forceKeyboard && wsInput) {
            wsInput.adjust();//make sure the cursor is visible, so disable the auto scroll
        }

        setSoftKeyboard(forceKeyboard);
        // setTimeout(function(){
        if (wsInput) {
            wsInput.element.blur();//we need to do this to make the softkeybaord work on ios (may not worko on iphone)
            wsInput.element.focus();
        }
        // }, 99);
    }

    this.switchSoftKeyboard = forceSoftKeyboard;
    this.isSoftKeyboardOn = function(){
        return forceKeyboard;
    };

    var _touchInput = hi5.$('svTouchInput');

    if (_touchInput) {
        _touchInput.addEventListener('click', function () {
            forceSoftKeyboard();
        }, false);
    }



    //
    //    function checkInput(x, y) {
    //        var xoff = x - caretX;
    //        return Math.abs(y - caretY) < 30 && (xoff > -10 && xoff < 100);
    //    }

    function handleTouchpad(type, currX, currY, isDrag) {
        var offX, offY, ignore;
        switch (type) {
            case 'touchstart':
                isMoved = false;
                //            touchStartX = currX;
                //            touchStartY = currY;
                if (imgCursor.scrX === 0 && imgCursor.scrY === 0) {
                    moveCursorTo(currX - 50, currY - 50);
                }
                if (isDrag) {
                    if (myLI.beforemousedown) {
                        myLI.beforemousedown(imgCursor.scrX, imgCursor.scrY, 0);
                    }
                    controller.sendInput('80' + imgCursor.scrX + '\t' + imgCursor.scrY + '\t0');//0 left button
                }
                break;
            case 'touchmove':
                offX = currX - priorX;
                offY = currY - priorY;
                if (offX === 0 && offY === 0) return;

                ignore = Math.abs(priorOffX) < 5 && Math.abs(priorOffY) < 5 && (Math.abs(offX) > 7 || (Math.abs(offY) > 7));
                if (!ignore) {
                    moveCursor(offX, offY, false, true);
                    isMoved = true;
                }
                priorOffX = offX; priorOffY = offY;


                break;
            case 'touchend':
                var isClick = !isMoved && !isDrag;
                if (isClick) {
                    if (myLI.beforemousedown) {
                        myLI.beforemousedown(imgCursor.scrX, imgCursor.scrY, 0);
                    }
                    controller.sendInput('80' + imgCursor.scrX + '\t' + imgCursor.scrY + '\t0');
                }
                if (isClick || isDrag) {
                    controller.sendInput('81' + imgCursor.scrX + '\t' + imgCursor.scrY + '\t0');//up
                    if (myLI.aftermouseup) {
                        myLI.aftermouseup(imgCursor.scrX, imgCursor.scrY, 0);
                    }
                }

                //            if (isClick){
                //                checkInput(imgCursor.scrX, imgCursor.scrY);
                //            }

                break;
        }
        priorX = currX;
        priorY = currY;
    }

    function rightClick(x, y) {
        moveCursorTo(x, y);
        sendMouseDown(x, y, 2);
        sendMouseUp(x, y, 2);
    }


    this.touchstart = function (e) {
        switch (e.pointes) {
            case 1:
                if (_touchpad) {
                    if (!imgCursor) {
                        initImgCursor(appcfg.cursorNameOnly);
                    }
                    handleTouchpad('touchstart', e.screenX, e.screenY, !e.flick);
                } else if (!e.flick || isInScreen()) {
                    sendMouseDown(e.x, e.y, 0);

                }
                break;
            case 2:
                priorX = e.screenX;
                priorY = e.screenY;
                break;
            /*
            case 3:
                //send alt+space and left
                if (e.moved){
                    sendScancode(true, 0x38);
                    sendScancode(true, 0x39);
                    sendScancode(false, 0x39);
                    sendScancode(false, 0x38);
    
                    sendKeyCode(true, 77);
                    sendKeyCode(false, 77);
    
                    sendScancode(true, 203);
                    sendScancode(false, 203);
                }
                
                break;
                */
        }
    };

    this.touchmove = function (e) {
        switch (e.pointes) {
            case 1:
                if (_touchpad) {
                    handleTouchpad('touchmove', e.screenX, e.screenY, !e.flick);
                } else if (!e.flick || isInScreen()) {
                    sendMouseMove(e.x, e.y);
                }
                break;
            case 2:
                // console.log('offy:' + Math.abs(e.screenY - priorY));
                
                if (Math.abs(e.screenY - priorY) > 19) {
                    sendMouseWheel(e.x, e.y, ((e.screenY - priorY) > 0) ? 0 : 1);
                    priorX = e.screenX;
                    priorY = e.screenY;
                }
                break;
        }
    };

    this.touchend = function (e) {
        var pointes = e.pointes;

        switch (pointes) {
            case 1:
                if (_touchpad) {
                    handleTouchpad('touchend', e.screenX, e.screenY, !e.flick);
                } else {
                    moveCursorTo(e.x, e.y, true);
                    if (!e.flick || isInScreen()) {
                        sendMouseUp(e.x, e.y, 0);
                    }
                }
                break;
            case 2:
                if (!e.moved) {//2 fingers click as right click
                    rightClick(_touchpad ? imgCursor.scrX : (e.x), _touchpad ? imgCursor.scrY : (e.y));
                }
                break;
            case 3:
                if (e.gesture) {// && e.flick){
                    switch (e.gesture) {
                        case 'OPEN':
                            sendScancode(true, 219);//win
                            sendScancode(true, 200);//up
                            sendScancode(false, 200);
                            sendScancode(false, 219);
                            break;
                        case 'CLOSE':
                            sendScancode(true, 219);//win
                            sendScancode(true, 208);//Down
                            sendScancode(false, 208);
                            sendScancode(false, 219);
                            break;
                        case 'LEFT'://next window
                            sendScancode(true, 0x38);//Alt
                            sendScancode(true, 1);//Esx
                            sendScancode(false, 1);
                            sendScancode(false, 0x38);
                            break;
                        case 'RIGHT':
                            sendScancode(true, 0x2a);//Shift
                            sendScancode(true, 0x38);//Alt
                            sendScancode(true, 1);//Esx
                            sendScancode(false, 1);
                            sendScancode(false, 0x38);
                            sendScancode(false, 0x2a);
                            break;
                        case 'UP'://Win+Shift+M
                            sendScancode(true, 0x2a);
                            sendScancode(true, 219);
                            sendKeyCode(true, 77, 0x32);
                            sendKeyCode(false, 77, 0x32);
                            sendScancode(false, 219);
                            sendScancode(false, 0x2a);
                            break;
                        case 'DOWN'://Win+M
                            sendScancode(true, 219);
                            sendKeyCode(true, 77, 0x32);
                            sendKeyCode(false, 77, 0x32);
                            sendScancode(false, 219);
                            break;
                    }
                } else {
                    forceSoftKeyboard();
                }
        }
    };

    this.flick = function (e) {
        switch (e.from) {//from bottom, send page down
            case 4:
                controller.sendInput('84' + '0\t' + 209);
                controller.sendInput('84' + '49152\t' + 209);
                break;
            case 2://from top, send page up
                controller.sendInput('84' + '0\t' + 201);
                controller.sendInput('84' + '49152\t' + 201);
                break;
        }
    };

    this.longpress = function (e) {
        if (_touchpad) {
            e.pointes = 2;
        }

        switch (e.pointes) {
            case 1:
                rightClick(e.x, e.y);
                break;
            case 2:
                if (imgCursor) {
                    sendMouseDown(imgCursor.scrX, imgCursor.scrY, 2, 1);
                    sendMouseUp(imgCursor.scrX, imgCursor.scrY, 2, 1);
                }
                break;
        }
    };

    function handleTouch(e) {
        if (allowInput && touchHandler) {
            if (e.touches || e.changedTouches) {
                touchHandler.handle(e);
            } else {
                touchHandler.handlePointer(e);
            }
        }
    }

    this.redirectTouches = function (touches) {
        if (!allowInput) return;
        var len = touches.length;
        var t, s = '90' + len;
        for (var i = 0; i < len; i++) {
            t = touches[i];
            s = s + '\t' + t.contactId + ';' + t.contactFlags + ';' + Math.floor(t.x / mScale) + ';' + Math.floor(t.y / mScaleY);
        }
        controller.send(s);
    };


    var keyWithModifer = 0;
    //for unicode keyboard key down/up
    function handleUniCode(e) {
        if (!allowInput) return false;

        if (wsInput.element.contentEditable == 'false' && (_browser.isiOS || _browser.isAndroid)){
            return handleKey(e);
        }

        //we only prrocess ctrl, alt key here.
        e.stopPropagation();

        _keyStatus.check(e);

        var code = keyboardLayout.getKeyCode(e);//e.keyCode;
        var down = e.type == 'keydown';

        // if (down) {
        //     if (wsInput) {
        //         wsInput.setIMEStatus(code == 229);
        //     }
        // }

        if (processShortcut(e, code, down))
            return cancelDefault(e);


        if (code == 17 && !down) {//ctrl up
            ctrlcSent = false;
            if (isMac && _keyStatus.preKey.down){//Cmd+key, key up missing on Mac
                sendKeyCode(false, _keyStatus.preKey.code, keyboardLayout.getScancodeByKeyCode(_keyStatus.preKey.code));
            }
        }
        var scanCode = keyboardLayout.getScancode(e);
        var isPrintable = keyboardLayout.isPrintableScancode(scanCode, e);
        // console.log('cc:' + scanCode + " isPrintalbe:" + isPrintable + " down:" + down);
        if (e.location == 3){//numpad (excludes NumpadEqual which desn't work on Windows)
            isPrintable = (scanCode == 0x59) ? true : false;
        }
        
        if (!isPrintable) {//non-printable
            if (_keyStatus.afterComposition && down){
                _keyStatus.afterComposition = false;
            }
            //do nothing, ther is a backspace keyup meesage after compositionend event
            if (_keyStatus.onComposition || (_keyStatus.afterComposition && !down)){
                return true;
            }else{
                if (_keyStatus.continue(down, scanCode, true)){
                    sendScancode(down, scanCode, e.key);
                    // console.log('s1, down:' + down + ' code:' + scanCode);
                }
                if (code == 17 || ((ctrlDown || e.metaKey) && (code == 86 || code == 67 || code == 88))) {//ctrl V
                    if (down) {
                        if (code == 17 && useCopyEvent && wsInput && copyToLocal) {//it'll be too late if we put it in Ctrl+C down for Safari 6 (Firefox is ok)
                            if (e.target == wsInput.element){
                                wsInput.setValue('Copying... Please try again');//make sure there is somthing, otherwise, oncopy doens't occur
                                wsInput.select();
                            }else{
                                touchKeyboard.setValue('Copying... Please try again');
                                touchKeyboard.select();
                            }
                        }
                        if (code == 67 || code == 88) {//c or x
                            ctrlcSent = true;
                        }
                    }
        
                    if (code == 17 && !down) {//ctrl up
                        ctrlcSent = false;
                    }
        
                    return true;
                }

                if (e.location == 3){
                    _keyStatus.noUnicode = true;    
                }else if (down){
                    _keyStatus.noUnicode = false;
                }
                
                if  (code == 9 && appcfg.tabCapture === false){
                    return true;
                }

                return cancelDefault(e);
            }
        }
        //pritable code with modifer, not AltGr
        var isAltGr = _keyStatus.isAltGr(down);
        if (isAltGr){
            ctrlDown = false;
            altDown = false;
        }
        else if (_keyStatus.noUnicode) {
            _keyStatus.noUnicode = false;
        }


        var withModifer = !isAltGr && (e.ctrlKey || e.altKey || e.metaKey);
        // console.log('22 isAltGr:' + isAltGr + ' withModifier:' + withModifer);
        if (e.altKey && withModifer){
            if ((scanCode > 0x46) && (scanCode < 0x53) && (scanCode != 0x4A) && (scanCode != 0x4E)){//numpad0-9
                if (_keyStatus.preScancode.code == 0x38 || _keyStatus.preScancode.code == 0xB8){
                    // sendScancode(false, _keyStatus.preScancode.code);
                    sendScancode(true, 1, 'Escape');//cancel the alt
                    sendScancode(false, 1, 'Escape');
                    // console.log('33');
                }
                withModifer = false;
            }
        }

        if (withModifer){//ctrlDown || (e.altKey && !isAltGr) || e.metaKey) {
            var isCtrlV = (code == 86) && (e.ctrlKey || e.metaKey) && !(e.ctrlKey && e.altKey) && useClipboard;
            if (!isCtrlV) {//ignore Ctrl+V
                sendKeyCode(down, code, keyboardLayout.getScancode(e));
                // console.log('44 down:' + down + ' code:' + code);
            }
            if (down) {
                keyWithModifer = code;
            }


            if (code == 17 || ((e.ctrlKey || e.metaKey) && (code == 86 || code == 67 || code == 88))) {//ctrl V
                if (down) {
                    if (code == 67 || code == 88) {
                        ctrlcSent = true;
                    }
                }


                return true;
            }

            return ((e.altKey && !e.ctrlKey) || (e.ctrlKey && !e.altKey) || e.metaKey) ? cancelDefault(e) : true;//ctrl+alt = AltGr
        }
        else {
            if ((code == keyWithModifer) && !down && !(e.ctrlKey && e.altKey)) {//alt down, key down, alt up, key down
                sendKeyCode(false, code, keyboardLayout.getScancode(e));
                // console.log('55 down:' + down + ' code:' + code);
                keyWithModifer = 0;
                return cancelDefault(e);
            }
            keyWithModifer = 0;
            return true;
        }

    }

    function handleComposition(e){
        _keyStatus.onComposition = e.type != 'compositionend';
        _keyStatus.afterComposition = !_keyStatus.onComposition;
    }

    function processShortcut(e, code, down) {
        // if (!e.altKey) return false;
        switch (code) {
            case 8:
            case 35: //backsapce, end => del
                if (!ctrlDown && !e.metaKey) { return false; }
                if (!e.altKey || appcfg.disableShortcuts || e.location == 3) return false;
                sendScancode(down, 211, 'Delete');
                break;
            case 33: //pgup -> tab
                if (!e.altKey || appcfg.disableShortcuts || e.location == 3) return false;
                sendScancode(down, 0xf, 'Tab'); 
                break;
            case 34: //pddown -> shift tab
                if (!e.altKey || appcfg.disableShortcuts || e.location == 3) return false;
                if (down) {
                    sendScancode(true, 0x2a, 'Shift');//shift
                    sendScancode(true, 0xf, 'Tab');//tab
                } else {
                    sendScancode(false, 0xf, 'Tab');//tab
                    sendScancode(false, 0x2a, 'Shift');//shift
                }
                break;
            case 45://insert -> Esc
                if (!e.altKey || appcfg.disableShortcuts) return false;
                sendScancode(down, 1, 'Escape');
                break;
            case 36://home -> Ctrl + Esc
                if (!e.altKey || appcfg.disableShortcuts || e.location == 3) return false;
                if (down) {
                    sendScancode(false, 0x38, 'Alt');//alt
                    sendScancode(true, 0x1d, 'Control');//ctrl
                    sendScancode(true, 1, 'Escape');//esc
                } else {
                    sendScancode(false, 1, 'Escape');
                    sendScancode(false, 0x1d, 'Control');//ctrl
                }
                break;
            // case 124://F13
            //     sendScancode(down, 0x3b);//F1
            //     break;
            // case 125://F14
            //     sendScancode(down, 0x3e);//F4
            //     break;
            // case 126://F15
            //     sendScancode(down, 0x3f);//F5
            //     break;

            // case 127://F16
            //     sendScancode(down, 0x40);//F6
            //     break;
            // case 128://F17
            //     sendScancode(down, 0x57);//F11
            //     break;
            // case 129://F18
            //     sendScancode(down, 0x58);//F12
            //     break;
            // case 132://F21
            //     sendScancode(down, 0x57);//F11
            //     break;
            default:
                return false;
        }
        return true;
    }

    function handleKey(e) {
        if (!allowInput) return false;

        //        checkExtKeyboard();

        _keyStatus.check(e);

        var code = keyboardLayout.getKeyCode(e);//e.keyCode;
        var down = e.type == 'keydown';//, preKeyCode = _keyStatus.preKeyCode;
    
        var scanCode = keyboardLayout.getScancode(e);
        

        if (processShortcut(e, code, down))
            return cancelDefault(e);


        var isCtrlV = (code == 86) && ((ctrlvDown && !down) || ((e.ctrlKey || e.metaKey) && !(e.ctrlKey && e.altKey))) && useClipboard;

        if (scanCode > 0) {
            if (isCtrlV) {//we send ctrl+V later after get the format except IE
                if (ieOperation && down) {//IE onpaste event will not fire if it's pasting image because we use textarea for IE
                    ieOperation.sendCtrlVLater();
                }
            } else {
                if (_keyStatus.continue(down, scanCode, false)){
                    if (handleSpecialKey(code, down, e)) return cancelDefault(e);
                    sendScancode(down, scanCode, e.key);
                }
            }
        }

        if (code != 17) {
            ctrlvDown = isCtrlV;
        }

        if (code == 17 || ((ctrlDown || e.metaKey) && (code == 86 || code == 67 || code == 88))) {//ctrl V
            if (down) {
                if (code == 17 && useCopyEvent && wsInput && copyToLocal) {//it'll be too late if we put it in Ctrl+C down for Safari 6 (Firefox is ok)
                    wsInput.setValue('Copying... Please try again');//make sure there is somthing, otherwise, oncopy doens't occur
                    wsInput.select();
                }
                if (code == 67 || code == 88) {//c or x
                    ctrlcSent = true;
                }
            }

            if (code == 17 && !down) {//ctrl up
                ctrlcSent = false;
            }

            return true;
        }

        var doDefault = code == 144 || code == 16 || (code == 9 && appcfg.tabCapture === false);// || code == 17 || (code == 88 || e.ctrlKey);

        return doDefault ? false : cancelDefault(e);
    }

    function handleTextInput(e) {
        if (!allowInput) return;// || _keyStatus.noUnicode
        // console.log('texinput, noUnicode:' + _keyStatus.noUnicode + " data:" + e.data);
        if (_keyStatus.noUnicode){
            _keyStatus.noUnicode = false;
            return;
        }

        var s = e.data;
        // if (!isTouch && forceScancode && s.length == 1 && s.charCodeAt(0) < 128) {
        //     return;
        // }
        if (s == '`\t`') return;
        var isCtrlOrAlt = ctrlDown || altDown;
        if (isCtrlOrAlt) {
            s = s.toLowerCase();
        }
        s = s.replace(/\u00a0/g, ' ');//replace non break space to normal space

        if (myLI.onunicode){
            var modifiers = myLI.onunicode(s);
            if (modifiers){
                isCtrlOrAlt = modifiers.ctrl || modifiers.alt;
            }
        }
        if (appcfg.scancode && appcfg.scancode[s]){
            var codes = appcfg.scancode[s];
            if (typeof codes == 'number'){
                __scancode(true, codes);
                __scancode(false, codes);
            }else {//must be an array object
                for (var i = 0, len = codes.length; i < len; i++){
                    __scancode(codes[i].down, codes[i].key);
                }
            }
        }else{
            controller.sendInput('86' + s + '\t' + ((isCtrlOrAlt || forceScancode) ? 1 : 0));
        }
        if (__pckey){
            __pckey.resetModifier();
        }
    }

    this.setIgnorePaste = function (ignore) {
        //    	if (ignore){
        clipSynced = ignore;
        //    	}
    };

    function clipReqResponse(cd, fmt) {
        var v = cd ? cd.getData(fmt) : null;
        // console.log('clipReqResponse:', cd, fmt);
        // myLI.showMessage('cd:' + (!!cd));

        if (!v && cd){
            v = cd.getData(cd.types[0]);
        }

        if (v && fmt == 'text/plain') {
            var i = 0, c = '';
            for (var len = v.length; i < len; i++) {
                c = v.charAt(i);
                if (c != '\r' && c != '\n') {
                    break;
                }
            }
            if (i) {
                v = v.substring(i);
            }
        }

        if (v) {//don't check sent
            controller.send('881' + fmt + '\t' + v);
            cd.sent = Date.now();
            return true;
        }
        else {
            if (myLI.onreqpaste) {
                myLI.onreqpaste(fmt, function (content) {
                    controller.send('881' + fmt + '\t' + content);
                }, function () {
                    controller.send('881ERROR\t');
                });
                return true;
            } else {
                // console.log('send null');
                // myLI.showMessage('send null');
                controller.send('881' + fmt + '\t' + '');
                return false;
            }
        }

    }

    this.processClipReq = function (fmt) {
        // console.log('xxx clip req: ' + fmt);

        if (!useClipboard) {
            controller.send('881ERROR\t');
            return true;
        }

        var cd = _clipboard.clipData;

        //       console.log('clip req, null:' + !!cd + ' synced:' + clipSynced);
        if (cd || clipSynced) {
            clipReqResponse(cd, fmt);
            return true;
        } else {
            return _clipboard.accessClip(function (newCD) {
                clipReqResponse(newCD, fmt);
            }, fmt);
        }

        // return document.queryCommandSupported('paste');

    };

    function sendCtrlV() {
        controller.writeKeyComb('ctrl+v', 20);
    }

    var ieOperation = _browser.isIE ? new function(){
        var _ctrvTimeout;
        this.sendCtrlVLater = function () {
            _ctrvTimeout = setTimeout(sendCtrlV, 333);
        };
        this.cancelCtrlV = function () {
            clearTimeout(_ctrvTimeout);
        };
        return this;
    } : null;

    function onClipboardData(cd) {
        //    	console.log('paste data done:' + cd.getData('text/richtext'));
        //    	console.log(cd);
        var noChange = cd.types.length === 0 || cd.equals(_clipboard.clipData);
        var types = noChange ? '' : cd.types.join(',');
        var _sendCtrlV = true;
        // console.log('onclipdata, noChange:' + noChange, cd);
        if (!noChange) {
            if (types.indexOf('text/html') != -1 && types.indexOf('text/richtext') == -1) {
                types += ',text/richtext';
            }
            var s = cd.getData('text/plain');
            var hash = s ? s.hashCode() : 0;

            controller.send('880' + types + '\t' + hash);
            _clipboard.clipData = cd;
        }

        if (myLI.onclipdata) {
            _sendCtrlV = !myLI.onclipdata(cd, noChange);
        }


        //this will also support copy/paste from browser's edit menu, need to let rdp host know past is happening
        if (_sendCtrlV) {
            setTimeout(sendCtrlV, 500);//we must delay it to allow rdp host has time to process "880" message
        }

    }

    function handleSpecialKey(code, down, e) {
        if (code == 44) {// we only got key_release event for VK_PRINTSCREEN
            if (!down){
                if (ctrlDown || e.shiftKey) {
                    sendScancode(true, (0x80 | 0x37));
                    sendScancode(false, (0x80 | 0x37));
                } else {
                    sendScancode(true, (0x80 | 0x2a));
                    sendScancode(true, (0x80 | 0x37));
                    sendScancode(false, (0x80 | 0x37));
                    sendScancode(false, (0x80 | 0x2a));
                }
            }
            return true;
        }
        return false;
    }

    /**
     * 
     * @param {*} down 
     * @param {*} scancode 
     * @param {*} key https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
     * @returns 
     */
    function __scancode(down, scancode, key) {
        if (scancode == 0x3A && keyboard.unicode){//capslock, xrdp 0.9.4 will have issue (SAP), if CapsLock is on (with capslock key or sync), 'a' will becomes A and A will become a. 
            return;
        }

        if (myLI.onscancode) {
            var keys = myLI.onscancode(down, scancode);
            if (keys) {
                for (var i = 0, len = keys.length; i < len; i++) {
                    controller.sendInput('84' + (keys[i].down ? 0 : 0xC000) + '\t' + keys[i].key);
                }
                return;
            }
        }
        var s = '84' + (down ? 0 : 0xC000) + '\t' + scancode;
        if (key){
            s += '\t' + key;
        }
        controller.sendInput(s);
        _keyStatus.preScancode.code = scancode;
        _keyStatus.preScancode.down = down;
    }

    function sendScancode(down, scancode, key) {
        if (!allowInput) return;

        switch (scancode) {
            case 221:
                if (down && !appcfg.disableKbdSync) {//Context key, fix (chrome) no up event issue
                    __scancode(true, 221, key);
                    __scancode(false, 221, key);
                    return;
                }
                break;
            case 58://capslock
                if (down) {
                    if (isMac && !appcfg.disableKbdSync) {//caps lock
                        __scancode(true, 58, key);
                        __scancode(false, 58, key);//send extra up on Mac, workaround
                        return;
                    }
                    controller.localLockFlags ^= 4;//toggle 3rd bit
                }
                break;
            case 69://Numlock
                if (down) {
                    controller.localLockFlags ^= 2;
                }
                break;
            case 70://ScrollLock
                if (down) {
                    controller.localLockFlags ^= 1;
                }
                break;
        }


        var keyDownSent = _keyStatus.isKeyDownSent(down, scancode);
        if (!keyDownSent && ((Date.now() - myLI.focusTime) > 999)){//when just focused, Keepass etc applications may send extra key up events to it
            __scancode(true, scancode, key);
        }
        __scancode(down, scancode, key);        

    }


    function sendKeyCode(down, keyCode, scanCode) {
        if (!allowInput) return;
        
        var s = '8B' + (down ? 0 : 0xC000) + '\t' + keyCode;
        if (scanCode) {
            s += '\t' + scanCode;
        }

        if (_keyStatus.ctrlDelayed){
            _keyStatus.ctrlDelayed = false;
            sendScancode(true, 0x1D, 'Control');
        }
        controller.sendInput(s);
        _keyStatus.preKey.code = keyCode;
        _keyStatus.preKey.down = down;
    }


    function __mouse(type, s){
        if (_keyStatus.ctrlDelayed){
            _keyStatus.ctrlDelayed = false;
            sendScancode(true, 0x1D, 'Control');
        }
        controller.sendInput(type + s);
    }

    function releaseStuckedMouse(){
        //https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
        for (var i = 0; i < 5; i++){
            if (_mousePos.mouseDown[i]) {//release stucked mouse button, for example, we couldn't capture the mouseup if it's in iframe
                __mouse('81', _mousePos.x + '\t' + _mousePos.y + '\t' + i);
                _mousePos.mouseDown[i] = false;
            }
        }
    }

    function sendMouseDown(x, y, button, ratio, ratioY) {
        if (!allowInput) return false;
        focusAndFix(wsInput.element);

        if (!ratio) {
            ratio = mScale;
        }
        if (!ratioY) {
            ratioY = mScaleY;
        }

        releaseStuckedMouse();

        _mousePos.mouseDown[button] = true;

        x = ((x / ratio) | 0) + _mousePos.left;
        y = ((y / ratioY) | 0) + _mousePos.top;

        if (myLI.beforemousedown) {
            myLI.beforemousedown(x, y, button)
        }

        _mousePos.x = x;
        _mousePos.y = y;

        __mouse('80', x + '\t' + y + '\t' + button);
    }

    function handleMouseDown(e) {
        // var target = e.target;

        // focusAndFix(target);
        // if (wsInput) {
        //     wsInput.setIMEStatus(false);
        // }

        // if (!(ctrlDown || e.shiftKey || e.metaKey || e.altKey)) {
            _keyStatus.sendMissKey(e);
        // }

        var pos = getMousePos(e);

        sendMouseDown(pos.x, pos.y, e.button);

        return _defaultEvent ? true : cancelDefault(e);
    }

    function sendMouseMove(x, y, ratio, ratioY) {
        if (!ratio) {
            ratio = mScale;
        }
        if (!ratioY) {
            ratioY = mScaleY;
        }

        x = ((x / ratio) | 0) + _mousePos.left;
        y = ((y / ratioY) | 0) + _mousePos.top;

        if (x < 0) {
            x = 0;
        }

        if (y < 0) {
            y = 0;
        }

        if (myLI.onmousemove) {
            myLI.onmousemove(x, y);
        }

        _mousePos.x = x;
        _mousePos.y = y;
        __mouse('82', x + '\t' + y);
    }

    this.getMousePosition = function () {
        return _mousePos;
    }

    function handleMouseMove(e) {
        if (controller.checkLockFlags){
            _keyStatus.syncLockKeyStatus(e);
        }

        if (!allowMouseMove || !wsInput) return false;

        if (e.target != wsInput.element && !_mousePos.mouseDown[0]) {//ignore it, we send this only when left button is down, for Windows Snap and multi monitores
            return false;
        }

        var pos = getMousePos(e, wsInput.element);
        if (useImageCurosr && (_browser.isAndroid || _browser.isiOS || !(currCursor && currCursor.system))) {
            moveCursorTo(pos.x, pos.y, true);
        }
        else{
            if (imgCursor && imgCursor.__visible) {
                // imgCursor.hideCursor();
                imgCursor.__setVisible(false);
            }
        }

        sendMouseMove(pos.x, pos.y);
        return cancelDefault(e);
    }

    function sendMouseUp(x, y, button, ratio, ratioY) {
        if (!ratio) {
            ratio = mScale;
        }
        if (!ratioY) {
            ratioY = mScaleY;
        }

        if (_mousePos.mouseDown[button]){
            _mousePos.mouseDown[button] = false;
        }else {
            return;
        }

        x = ((x / ratio) | 0) + _mousePos.left;
        y = ((y / ratioY) | 0) + _mousePos.top;

        if (x < 0) {
            x = 0;
        }

        if (y < 0) {
            y = 0;
        }


        __mouse('81', x + '\t' + y + '\t' + button);
        
        if (myLI.aftermouseup) {
            myLI.aftermouseup(x, y, button)
        }


        if (_browser.isChrome && _clipboard && _clipboard.clipboardWrite == 'denied') {
            _clipboard.waitForCopyContent();
        }

        if (controller.resumeAudio){
            controller.resumeAudio();
            controller.resumeAudio = null;
        }
    }

    function handleMouseUp(e) {
        if (!allowInput) return false;

        var target = e.target;

        var pos = getMousePos(e, wsInput.element);
        sendMouseUp(pos.x, pos.y, e.button);

        return _defaultEvent ? true : cancelDefault(e);
    }

    function sendMouseWheel(x, y, dir, ratio, ratioY) {
        if (!ratio) {
            ratio = mScale;
        }
        if (!ratioY) {
            ratioY = mScaleY;
        }

        x = ((x / ratio) | 0) + _mousePos.left;
        y = ((y / ratioY) | 0) + _mousePos.top;

        if (myLI.onmousewheel) {
            if (myLI.onmousewheel(x, y, dir)) {
                return;
            }
        }

        __mouse('83', x + '\t' + y + '\t' + dir);
    }

    function handleMouseWheel(lines, pos) {
        if (!allowInput) return false;

        var count = Math.abs(lines), direction = lines < 0 ? 1 : 0;
        for (var i = 0; i < count; i++) {
            sendMouseWheel(pos.x, pos.y, direction);
        }

        return false;
    }

    this.writeKeyComb = function (s) {
        controller.writeKeyComb(s);
    };

    function rawDataToDataURL(data, w, h) {
        var _rawDataCanvas = document.createElement('canvas'),
            ctx = _rawDataCanvas.getContext('2d'),
            imgData = ctx.createImageData(w, h),
            pixel = imgData.data,
            len = w * h,
            dpr = window.devicePixelRatio || 1,
            i = 0,
            idx = 0,
            color = 0;

        _rawDataCanvas.width = w;
        _rawDataCanvas.height = h;
        for (; i < len; i++) {
            color = data[i];
            pixel[idx++] = color & 0xFF;
            pixel[idx++] = (color >> 8) & 0xFF;
            pixel[idx++] = (color >> 16) & 0xFF;
            pixel[idx++] = (color >> 24) & 0xFF;
        }
        ctx.putImageData(imgData, 0, 0, 0, 0, w, h);

        if (dpr == 1) {
            return _rawDataCanvas.toDataURL();
        } else if (_rawDataCanvas.toDataURLHD) {
            return _rawDataCanvas.toDataURLHD();
        } else {//this will not work on Mac Chrome and Safari which are using data url, 
            var newCanvas = document.createElement('canvas');
            var newCtx = newCanvas.getContext('2d');
            newCanvas.width = (w * dpr) | 0;
            newCanvas.height = (h * dpr) | 0;
            newCtx.scale(dpr, dpr);
            newCtx.drawImage(_rawDataCanvas, 0, 0);
            return newCanvas.toDataURL();
        }
    }

    function cursor2url(obj) {
        if (obj.none) {
            return 'none';
        } else if (obj.system) {
            return obj.system;
        } else if (useImageCurosr) {
            return 'none';
        } else {
            return 'url(' + (obj.url || rawDataToDataURL(obj.rawData, obj.width, obj.height)) + ') ' + obj.hotX + ' ' + obj.hotY + ', default';
            //https://bugzilla.mozilla.org/show_bug.cgi?id=1260214
        }
    }

    this.setCursor = function (cursor) {

        if (!cursor || appcfg.disableCursor) return;

        currCursor = cursor;
        if (imgCursor) {
            imgCursor.setCursor(cursor);
        }

        if (imgCursor && useImageCurosr && !cursor.system){
            imgCursor.__setVisible(true);
            moveCursorTo(_mousePos.x, _mousePos.y, true);
        }

        if (!playerMode) {
            if (!cursor.result) {
                cursor.result = appcfg.cursorNameOnly ? 'none' : cursor2url(cursor);
            }
            if (wsInput) {
                wsInput.element.style.cursor = cursor.result;
            } else {
                _canvas.style.cursor = cursor.result;
            }
        }
    };

    this.setVisible = function (visible, delay) {
        var v = visible ? 'visible' : 'hidden';
        if (typeof delay == 'number') {
            setTimeout(function () { _canvas.style.visibility = v; }, delay);
        }
        else {
            _canvas.style.visibility = v;
        }
    };

    this.initWhiteboard = function(w, h){
        var p = _canvas.parentNode;
        var c = p.querySelector('canvas[name="svWhiteboard"]');
        if (!c){
            c = document.createElement('canvas');
            c.setAttribute('name', 'svWhiteboard')
            c.width = w || widthFace;
            c.height = h || heightFace;
            c.style.zIndex = 80;

            var elm = wsInput.element;
            c.style.position = elm.style.position;
            c.style.left = elm.style.left;
            c.style.top = elm.style.top;
            p.appendChild(c);
        }
        return c;
    };

    this.removeWhiteboard = function(){
        var p = _canvas.parentNode;
        var c = p.querySelector('canvas[name="svWhiteboard"]');
        if (c){
            p.removeChild(c);
        }        
    };

    function fullscreenChange(){
        if (document.fullscreenElement){
            if (navigator.keyboard){
                navigator.keyboard.lock();
            }
        }else{
            if (navigator.keyboard){
                navigator.keyboard.unlock();
            }
        }
    }

    this.requestFullscreen = function(lockKeyboard){
        if (!document.fullscreenElement){
            if (lockKeyboard !== false){
                document.addEventListener('fullscreenchange', fullscreenChange, false);
            }
            document.body.requestFullscreen();
        }else{
            document.exitFullscreen();
            document.removeEventListener('fullscreenchange', fullscreenChange, false);
        }
    };
    this.requestUsbDevices = function(filters, callback){
        var devices = [];
        var usbElm = document.getElementById("usbPicker");
        var elm = document.getElementById('addUSB');
        var select = document.getElementById('selectedUSB');
        elm.onclick = function(){
            navigator.usb.requestDevice(filters).then(function(device){
                var found = devices.find(function(e) {
                        return e.serialNumber == device.serialNumber && e.vendorId == device.vendorId && 
                        e.productId == device.productId;
                    }
                );
                if (found){
                    return;
                }
                device.open().then(function(){
                    devices.push(device);
                    var option = document.createElement('option');
                    option.innerHTML = (device.productName || 'Unknown USB device');
                    select.appendChild(option);
                    device.close();
                }).catch(
                    function(e){
                        hi5.notifications.notify("Failed to open " + device.productName + ' Error:' + e);
                    }
                );
            });
        };

        var usbDlg = new hi5.ui.Lightbox(usbElm);
        usbDlg.onclose = function(){
            elm.onclick = null;
            select.length = 0;
            callback(devices);
        };
        var frmUSB = document.getElementById('frmUsbPicker');
        frmUSB.onsubmit = function(e){
            e.preventDefault();
            usbDlg.dismiss();
            return false;
        };
        usbDlg.show();
    };
    
}
//LocalInterface end
if (!svGlobal.LocalInterface) {
    svGlobal.LocalInterface = LocalInterface;
}

svGlobal.rdpFile = {
    loadRdpFile: function (config, form) {
        var elms = form.elements;
        var pair = config.split('\r\n');
        if (pair.length < 2)
            pair = config.split('\n');
        if (pair.length < 2) return false;
        var gw = hi5.$('gateway');
        var gwValue = gw.value;
        form.reset();
        gw.value = gwValue;
        for (var i = 0, l = pair.length; i < l; i++) {
            var s = pair[i];
            var idx = s.indexOf(':');
            var key = s.substring(0, idx);
            var value = s.substring(idx + 3);

            key = key.toLowerCase();
            switch (key) {
                case 'full address':
                    idx = value.indexOf(':');
                    if (idx > 0) {
                        elms['server'].value = value.substring(0, idx);
                        elms['port'].value = value.substring(idx + 1);
                    } else {
                        elms['server'].value = value;
                    }
                    break;
                case 'username':
                    elms['user'].value = value;
                    break;
                case 'domain':
                    elms['domain'].value = value;
                    break;
                case 'connect to console':
                    elms['useConsole'].checked = value != '0';
                    break;
                case 'desktopwidth':
                    elms['width'].value = value;
                    break;
                case 'desktopheight':
                    elms['height'].value = value;
                    break;
                case 'session bpp':
                    elms['server_bpp'].value = value;
                    break;
                case 'audiomode':
                    elms['playSound'].value = value;
                    break;
                case 'alternate shell':
                    if (value.length > 0) {
                        elms['command'].value = value;
                        if (!hi5.$('app').checked) {
                            hi5.$('shell').checked = true;
                        }
                    }
                    break;
                case 'shell working directory':
                    elms['directory'] = value;
                    break;
                case 'redirectclipboard':
                    elms['mapClipboard'].checked = value != '0';
                    break;
                case 'redirectprinters':
                    elms['mapPrinter'].checked = value != '0';
                    break;
                case 'server port':
                    if (value.length > 0)
                        elms['port'].value = value;
                    break;
                case 'disable wallpaper':
                    elms['background'].checked = value == '0';
                    break;
                case 'disable themes':
                    elms['styles'].checked = value == '0';
                    break;
                case 'disable menu anims':
                    elms['animation'].checked = value == '0';
                    break;
                case 'disable full window drag':
                    elms['contents'].checked = value == '0';
                    break;
                case 'allow font smoothing':
                    elms['smoothfont'].checked = value != '0';
                    break;
                case 'allow desktop composition':
                    elms['composition'].checked = value != '0';
                    break;
                case 'bitmapcachepersistenable':
                    elms['bitmap'].checked = value != '0';
                    break;
                case 'remoteapplicationprogram':
                    elms['exe'].value = value;
                    break;
                case 'remoteapplicationcmdline':
                    elms['args'].value = value;
                    break;
                case 'remoteapplicationmode':
                    hi5.$('app').checked = value == '1';
                    break;
                case 'loadbalanceinfo':
                    elms['loadBalanceInfo'].value = value;
                    break;
            }
        }
        return true;
    },

    handleFiles: function (files, form) {
        if (files.length != 1) {
            hi5.notifications.notify({ 'msg': 'Please one file only' });
            return;
        }

        var f = files[0];
        var name = f.name;
        var l = name.length;
        var isRdp = l > 4 && name.substring(l - 4).toLowerCase() == '.rdp';
        if (!isRdp) {
            hi5.notifications.notify({ 'msg': 'Sorry, Please .rdp file only' });
            return;
        }


        var reader = new FileReader();
        var retried = false;
        reader.onload = function (e) {
            var result = e.target.result;
            if (!result) return;
            var success = svGlobal.rdpFile.loadRdpFile(result, form);
            if (!success && !retried) {
                retried = true;
                reader.readAsText(f);
            }
        };

        reader.readAsText(f, 'UTF-16LE');
    }

};

//===============dnd begin
function initDragDrop(dropZone, form) {

    if (!('FileReader' in window)) {
        return;
    }

    var savedColor = dropZone.style.backgroundColor;



    function fileOpen(e) {
        svGlobal.rdpFile.handleFiles(e.target.files, form);
    }

    var elm = hi5.$('rdpfile');
    if (elm) {
        elm.addEventListener('change', fileOpen, false);
    }

    function handleFileSelect(evt) {
        cancelDefault(evt);
        dropZone.style.backgroundColor = savedColor;

        var files = evt.dataTransfer.files; // FileList object.
        svGlobal.rdpFile.handleFiles(files, form);
    }

    function handleDragOver(evt) {
        cancelDefault(evt);
        dropZone.style.backgroundColor = 'yellow';
    }

    function handleDragLeave(evt) {
        cancelDefault(evt);
        dropZone.style.backgroundColor = savedColor;
    }

    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', handleDragLeave, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
}

//===============dnd end
svGlobal.util.initDragDrop = initDragDrop;

svGlobal.util.initMapDisk = svGlobal.util.MapDisk = function (dropZone, handler, preferPaste) {
    if (!('FileReader' in window)) {
        return;
    }

    dropZone.__oldColor = dropZone.style.backgroundColor;
    dropZone.__oldOpacity = dropZone.style.opacity;

    function handleDragOver(e) {
        cancelDefault(e);
        if (!handler) return;
        if (dropZone.style.opacity != '0.6')
            dropZone.style.opacity = '0.6';
        dropZone.style.backgroundColor = 'yellow';
    }

    function handleDragLeave(e) {
        cancelDefault(e);
        if (!handler) return;
        dropZone.style.opacity = dropZone.__oldOpacity;
        dropZone.style.backgroundColor = dropZone.__oldColor;
    }

    function handleFiles(e) {
        cancelDefault(e);
        if (!handler) return;
        dropZone.style.opacity = dropZone.__oldOpacity;
        dropZone.style.backgroundColor = dropZone.__oldColor;
        var entries = hi5.file.getEntries(e);
        if (entries.length && (location.protocol != 'file:' || (hi5.browser.isElectron || !hi5.browser.isChrome))){//} && location.protocol != 'file:') {//Chrome doesn't allow this on local file, but Electron can
            hi5.file.getFilesFromEntries(entries, function (files) {
                if (handler.addFiles) {
                    handler.addFiles(files, preferPaste);
                } else {
                    handler.addFile(files[0])
                }
            });
        } else {
            if (handler.addFiles) {
                handler.addFiles(e.dataTransfer.files, preferPaste);// FileList object.
            } else {
                handler.addFile(e.dataTransfer.files[0]);// FileList object.
            }
        }
    }

    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', handleDragLeave, false);
    dropZone.addEventListener('drop', handleFiles, false);
    this.release = function () {
        dropZone.removeEventListener('dragover', handleDragOver, false);
        dropZone.removeEventListener('dragleave', handleDragLeave, false);
        dropZone.removeEventListener('drop', handleFiles, false);
        handler = null;
        dropZone = null;
    };
};

//get args from parenet window or cookie
svGlobal.util.getServerArgs = function(obj){
    var args = null,
        opr = window.opener;
    if (!obj){
        try {
            if (opr && opr.__sparkUser && opr.__sparkUser.server) {
                obj = opr.__sparkUser.server;
            }

            if (!obj && opr.sparkServer) {
                obj = opr.sparkServer;
            }
        }
        catch (e) {

        }
    }
    if (obj){
        var option = obj.rdp || obj.vnc || obj.ssh || obj.telnet || null;
        if (option && !obj.server){
            option.gateway = obj.gateway;
            option.session = obj.session;
            option.account = obj.account;
            option.server = obj.id;
            option.displayName = obj.displayName;
            option.shadowing = obj.shadowing;

            option.user = option.username || ''
            option.pwd = option.password || '';
            option.useConsole = option.console || false;
            option.server_bpp = option.color;
            option.legacyMode = option.leagacyMode || option.legacyMode || false;
            option.exe = option.remoteProgram || '';
            option.args = option.remoteArgs || '';
            if ((option.exe.length > 0)) {
                option.startProgram = 'app';
            }
            else if (option.command && (option.command.length > 0)) {
                option.startProgram = 'shell';
            }else {
                option.startProgram = 'noapp';
            }

            if (obj.keyboard){
                option.keyboard = obj.keyboard;
            }

            obj = option;
        }
        args = obj;
    }else{//arguments from cookie
        args = hi5.browser.cookie2Obj();
    }
    return args;
};

(function init() {
    function _version(e) {
        var vs = document.getElementsByClassName('ver');
        var l = vs.length;
        for (var i = 0; i < l; i++) {
            vs[i].innerHTML = svGlobal.version;
        }
        window.removeEventListener('load', _version, false);
    }
    window.addEventListener('load', _version, false);

})();

// This only works on Chrome extension
/*
if (_browser.isChromeApp){
    chrome.fileBrowserHandler.onExecute.addListener(function(id, details){
      if (id == "open" && hi5.$id("frmConn")) {
          var entry = details.entries[0];
          if (entry){
              entry.file(function(file) {
                  svGlobal.rdpFile.handleFiles([file], hi5.$id("frmConn"));
              });
          }
      }
    });
}
*/

svGlobal.gatewayError = function(code, value){
	var msg = __svi18n.errorCode['S' + code];
    if (msg){
        if (value){
            msg += '; ' + value;
        }
    }else{
        msg = value;
    }

    hi5.notifications.notify(msg);
};

svGlobal.ui = {
    initMonitors: function(elm){
        if (!('getScreenDetails' in window) || !screen.isExtended){
            return false;
        }

        window.getScreenDetails().then(
            function(details){
                details.screens.forEach(function(item, index){
                    var p = document.createElement('div'); 
                    var cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.value = index;
                    var lab = document.createElement('label');
                    var s = index + ': ' + item.width + ' x ' + item.height + '; (' + item.left + ',' + item.top + ')';
                    if (item == details.currentScreen){
                        s += ' *'
                    }
                    lab.innerHTML = s;
                    cb.onclick = function(){
                        if (cb.checked){
                            svGlobal.monitors = svGlobal.monitors || []; 
                            var scr = details.screens[parseInt(cb.value)];
                            var features = 'left=' + scr.left + ',top=' + scr.top + ',width=' + scr.width + ',height=' + scr.height
                            + ',fullscreen=yes,directories=no,location=no,menubar=no,resizable=no,scroolbars=no,status=no,toolbar=no';
                            var w = window.open('monitor.html', '', features);
                            w.moveTo(scr.left, scr.top);
                            w.resizeTo(scr.width, scr.height);
                            w.document.body.requestFullscreen().catch(function(e) { svGlobal.logger.info(e);});
                            svGlobal.monitors.push(w);
                        }
                    }

                    p.appendChild(cb);
                    p.appendChild(lab);
                    elm.appendChild(p);
                });
            }
        ).catch(function(e){
            hi5.notifications.notify("Failed to get screen details." + e);
        });
        return true;
    }
};

svGlobal.logger.info('ver:' + svGlobal.version);

if (window.devicePixelRatio < 1 || (window.devicePixelRatio > 1 && window.devicePixelRatio < 2)){
    svGlobal.logger.info('Please make sure the zoom level of your browser is 100%');
}
