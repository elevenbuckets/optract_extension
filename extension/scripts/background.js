const WSClient = require('rpc-websockets').Client;
var opt;
var tport
var state = {
	rpcConnected: false,
	rpcStarted: false
}
var myid = chrome.i18n.getMessage("@@extension_id");

function openTab(filename) {
	chrome.windows.getCurrent(function (win) {
		chrome.tabs.query({ 'windowId': win.id }, function (tabArray) {
			for (var i in tabArray) {
				if (tabArray[i].url == "chrome-extension://" + myid + "/" + filename) { // console.log("already opened");
					chrome.tabs.update(tabArray[i].id, { active: true }); return;
				}
			} chrome.tabs.create({ url: chrome.extension.getURL(filename) });
		});
	});
}

// openTab("index.html")

function isNewTab(tab, url) {
	return (
		typeof url === 'undefined' && tab.active && tab.url === 'chrome://newtab/'
	)
}

function stopRPCServer() {
	console.log("sending pong to native app")
	tport.postMessage({ text: "pong" })
	state.rpcStarted = false;
}

function startRPCServer() {
	tport = chrome.runtime.connectNative('optract');
	tport.onMessage.addListener(function (msgs) {
		console.log(msgs);
	})
	tport.postMessage({ text: "ping" })
	state.rpcStarted = true;
}

chrome.browserAction.onClicked.addListener(function (activeTab, url) {
	if (isNewTab(activeTab, url)) {
		openTab("index.html")
	} else {
		try {
			if(!state.rpcStarted){
				startRPCServer();
			}
			opt = new WSClient('ws://127.0.0.1:59437', { max_reconnects: 10 });
			opt.on('open', function (event) { 
				console.log(`!!!!!!!!!!!!!!! CONNECTED`); 
			});

			opt.on('close', function (event) { 
				stopRPCServer()
				console.log(`!!!!!!!!!!!!!!! Connection Closed`); 
			});

		} catch (err) {
			console.error(err);
		}
	}

});

chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (msg) {
		// Need to put nativeApp.py under dist directory, and update the optract.json under ~/.config/google-chrome/NativeMessagingHosts 
		// to use nativeApp.py
		if(!state.rpcStarted){
			startRPCServer();
		}
	});

	port.onDisconnect.addListener(function () {
		// tport.disconnect();
		if(opt){
			opt.close();
		}else{
			stopRPCServer();
		}
		
	})
});

var parentTabURL;
var lastKnownActive;

chrome.tabs.onActivated.addListener(function(activeInfo) {
    //chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.get(activeInfo.tabId, function(active_tab) {
	try {    
		chrome.tabs.get(active_tab.openerTabId, function(parent_tab) {
			parentTabURL = parent_tab.url;	
			if (parent_tab.url === "chrome-extension://" + myid + "/index.html") {
				lastKnownActive = activeInfo.tabId;
			}
			console.dir({parentTabURL, lastKnownActive})
		})
	} catch(err) {
		parentTabURL = undefined;
	}
    })
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(`got message from tab! DEBUG...`)
    console.dir(sender);
    if (sender.tab.id === lastKnownActive) {
	sendResponse({yourParent: parentTabURL});
    } else {
	sendResponse({yourParent: 'Not from Optract'});
    }
})
    /*chrome.tabs.get(activeInfo.tabId, function(active_tab) {
        chrome.tabs.get(active_tab.openerTabId, function(parent_tab) {
	    //alert(parent_tab.url);
	    console.log(`tabs get called from ${activeInfo.tabId}, parent: ${parent_tab.url}`);
            if (parent_tab.url === "chrome-extension://" + myid + "/index.html") {
		    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
			    console.log(`got message from tab! DEBUG...`)
			    console.dir(sender);
			    if (sender.tab.id === activeInfo.tabId) {
			    	sendResponse({yourParent: parent_tab.url});
			    } else {
			    	sendResponse({yourParent: 'not from Optract'});
			    }
		    })
		    //chrome.tabs.sendMessage(activeInfo.tabId, {greeting: "hello"}, function(response) {
		    //	    console.log("active tab say: " + response.farewell + "! Round trip between extension to active tab done");
		    //})
	    }
        });     
    });*/

