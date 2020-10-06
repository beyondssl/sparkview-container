//check exampleToolbar.html

function MyToolbar(rdp){
    var toolbar = document.getElementById('pc_key_box'),
        handle = document.getElementById('pc_key_right'),
        extra = document.getElementById('pc_key_extra'),
        modifiers = {ctrl: false, alt: false, shift: false},
        btnCtrl, btnAlt, btnShift;
    
    var _self = this;

    var start_pos = {x: 0, y: 0};

    hi5.Draggable(toolbar, handle, _dragstart, _drag, _dragend, _onclick);

    function _onclick(e){
        // console.log('onclick, x:' + e.pageX + ' y:' + e.pageY);
        // hi5.notifications.notify('onclick, x:' + e.pageX + ' y:' + e.pageY);

        if (extra.classList.contains('pc_key_hidden')){
            extra.classList.remove('pc_key_hidden');
        }else{
            extra.classList.add('pc_key_hidden')
        }
    }

    function _drag(e){
        console.log('drag, x:' + e.pageX + ' y:' + e.pageY);
    
        var x = e.pageX;//x is the pageX of the draggin handle
        if (x < 300){
            x = 300;
        }else if (x > 700){
            x = 700;
        }

        return {pageX: x , pageY: start_pos.y};
    }

    function _dragstart(e){
        console.log('dragstart, x:' + e.pageX + ' y:' + e.pageY);
        start_pos.x = e.pageX;
        start_pos.y = e.pageY;
    }

    function _dragend(e){
        console.log('dragend, x:' + e.pageX + ' y:' + e.pageY);
    }

    function updateStatus(target, keyDown) {
        if (keyDown) {
            target.classList.add('button_selected');
        } else {
            target.classList.remove('button_selected');
        }
    }


    function btnClick(e){
        var target = e.target,
            txt = target.innerHTML;
        // console.log(txt);
        txt = txt.replace(/\u2190/g, 'left').replace(/\u2191/g, 'up').replace(/\u2192/g, 'right').replace(/\u2193/g, 'down');//replace left, r, u, d
        if ('Start' == txt){
            txt = 'Ctrl+Esc';
        }

        if (_self.onkeyclick){
            _self.onkeyclick(txt);
        }

        switch (txt){
            case 'Ctrl':
                modifiers.ctrl = !modifiers.ctrl;
                updateStatus(e.target, modifiers.ctrl);
                rdp.writeScancode(modifiers.ctrl, 0x1D);
                return;
            case 'Alt':
                modifiers.alt = !modifiers.alt;
                updateStatus(e.target, modifiers.alt);
                rdp.writeScancode(modifiers.alt, 0x38);
                return;
            case 'Shift':
                modifiers.shift = !modifiers.shift;
                updateStatus(e.target, modifiers.shift);
                rdp.writeScancode(modifiers.shift, 0x2A);
                return;
            default:
                rdp.writeKeyComb(txt);
                _resetModifier();


        }
    }

    var buttons = toolbar.getElementsByTagName('span');
    for (var i = 0, len = buttons.length; i < len; i++){
        buttons[i].className = "button";
        buttons[i].addEventListener('click', btnClick, false);
        switch (buttons[i].innerHTML){
            case 'Ctrl': 
                btnCtrl = buttons[i];
                break;
            case 'Alt':
                btnAlt = buttons[i];
                break;
            case 'Shift':
                btnShift = buttons[i];
                break;
        }
    }

    function _resetModifier(){
        if (modifiers.alt) {
            modifiers.alt = false;
            rdp.writeScancode(false, 0x38);
            updateStatus(btnAlt, false);
        }
        if (modifiers.ctrl) {
            modifiers.ctrl = false;
            rdp.writeScancode(false, 0x1d);
            updateStatus(btnCtrl, false);
        }
        if (modifiers.shift) {
            modifiers.ctrl = false;
            rdp.writeScancode(false, 0x2a);
            updateStatus(btnShift, false);
        }
    };

    this.resetModifier = _resetModifier;

    this.getModifiers = function(){
        return modifiers;
    };


}

