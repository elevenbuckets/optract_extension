// function openTab(filename) { var myid = chrome.i18n.getMessage("@@extension_id"); chrome.windows.getCurrent( function(win) { chrome.tabs.query({'windowId': win.id}, function(tabArray) { for(var i in tabArray) { if(tabArray[i].url == "chrome-extension://" + myid + "/" + filename) { // console.log("already opened");
//  chrome.tabs.update(tabArray[i].id, {active: true}); return; } } chrome.tabs.create({url:chrome.extension.getURL(filename)}); }); }); }

// openTab("index.html")