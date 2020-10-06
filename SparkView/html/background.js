//Entrance of Chrome Packaged app
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('rdp.html', {
    bounds: {
      width: 1024,
      height: 768
    }
  });
});

