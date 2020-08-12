function getLibPath(f) {
	var result = window.__sv_lib_path || (window.hi5 && hi5.appcfg && hi5.appcfg.libpath) || '';
	if (result){
		return result;
	}
	var tags = document.getElementsByTagName('script');
	var j, s, len = tags.length;
	for (var i = 0; i < len; i++) {
		s = tags[i].src;
		j = s.indexOf(f);
		if (j > -1) {
			result = s.substring(0, j);
			break;
		}
	}
	return result;
}

function svloadResource() {

    function createScript(name) {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = name;
        return s;
    }

    var nl = navigator.language || navigator.userLanguage;

    var libPath = getLibPath('resource.js');

    if (!libPath) {
        return;
    }

    var lan = 'en';

    if (nl == 'en' || (nl.indexOf('en-') == 0)) {
        lan = 'en';
    }else if (nl.indexOf('zh-CN') == 0) {
        lan = 'zh-CN';
    }else if (nl.indexOf('zh-TW') == 0) {
        lan = 'zh-TW';
    }else if (nl == 'de' || (nl.indexOf('de-') == 0)) {
        lan = 'de';
    }else if (nl == 'es' || (nl.indexOf('es-') == 0)) {
    	lan = 'es';
    }

    libPath += ('strings-' + lan + '.js');
    
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = libPath;
    var elm = document.head || document.body || document.documentElement;
    elm.insertBefore(script, elm.firstChild);
}

svloadResource();
