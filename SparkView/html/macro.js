/**
 * 
 * @param rdp the Rdp object, optional
 * @returns MacroRecorder object
 */
function MacroRecorder(rdp){
    var commands = [''];
    var delays = [0];
    var recording = false;
    var preTime = 0, currTime = 0, playIndex = 0, timeoutId = 0;
    
    rdp = rdp || svManager.getInstance();
    
    this.setData = function(_cmds, _delays, index){
        commands = _cmds;
        delays = _delays;
        playIndex = index || 0;
    };
    
    function _record(s){
        var len = commands.length;
        commands[len] = s;
        currTime = new Date().getTime();
        if (preTime){
            delays[len] =  currTime - preTime;
        }
        preTime = currTime;
    }
    
    /**
     * start recording
     * @param keep if playing from the beginning
     */
    this.start = function(keep){
        if (!keep){
            commands.length = 0;
            delays.length = 1;
        }
        rdp.onactivity = _record;

        recording = true;
    };
    
    /**
     * stop recording
     */
    this.stop = function(){
        rdp.onactivity = null;
        recording = false;
    };
    
    function _playNext(){
        if (playIndex < commands.length){
            rdp.writeRawInput(commands[playIndex++]);
            timeoutId = setTimeout(_playNext, delays[playIndex]);
        }else if (this.onplayfinished){
            this.onplayfinished();
        }
    }
    
    /**
     * play recorded data
     * @param continue if continue playing
     */
    this.play = function(_continue){
        if (recording){
            this.stop();
        }
        
        if (!_continue){
            playIndex = 0;
        }
        _playNext();
    };
    
    this.stopPlay = function(){
        clearTimeout(timeoutId);
    };
    
    
    /**
     * Generate replay script based on the recording, for reference only
     */
    this.getScript = function(){
        var w = rdp.getDesktop().width;
        var h = rdp.getDesktop().height;
        var color = rdp.getColor();
        var script ="var _cmds = " + JSON.stringify(commands) + ";\n";
        script += "var _delays = " + JSON.stringify(delays) + ";\n";
        script += "var r = new svGlobal.Rdp('" + rdp.getURL() + "', " + w + ", " + h + ", " + color + ");\n";
        script += "r.addSurface(new svGlobal.LocalInterface());\n";
        script += "r.onloggedin = function(){\n";
        script += "    var rec = new MacroRecorder(r);\n";
        script += "    rec.setData(_cmds, _delays);\n";
        script += "    rec.play();\n";
        script += "}\n";
        script += "r.run();\n";
        
        return script;
    };
}