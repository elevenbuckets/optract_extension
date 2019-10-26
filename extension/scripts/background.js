const WSClient = require('rpc-websockets').Client;
var opt;
var tport
var state = {
	rpcConnected: false,
	rpcStarted: false,
	optConnected: false,
	activeLogin: false,
	curate: false,
	missing: 0
}
var myid = chrome.i18n.getMessage("@@extension_id");
var myTabId = {};

function openTab(filename) {
	chrome.windows.getCurrent(function (win) {
		chrome.tabs.query({ 'windowId': win.id }, function (tabArray) {
			for (var i in tabArray) {
				if (tabArray[i].url == "moz-extension://" + myid + "/" + filename) { // console.log("already opened");
					myTabId[win.id] =  tabArray[i].id;
					chrome.tabs.update(tabArray[i].id, { active: true });
					console.log(`In Window ${win.id}, Optract tab already opened in ${myTabId[win.id]}`)
					return;
				}
			} 
			chrome.tabs.create({ url: chrome.extension.getURL(filename) }, function(tab) {
				myTabId[win.id] = tab.id;
				console.log(`In Window ${win.id}, Optract tab opened in ${myTabId[win.id]}`)
			});
		});
	});
}

function isNewTab(tab) {
	return (
		tab.active && tab.url === 'about:newtab'
	)
}

function isOptractTab(tab, url) {
	return ( tab.url === "moz-extension://" + myid + "/index.html" 
	     || ( typeof lastKnownActives[tab.windowId] !== 'undefined' && typeof lastKnownActives[tab.windowId][tab.id] !== 'undefined' && lastKnownActives[tab.windowId][tab.id] === url)
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

const __ready = (resolve, reject) =>
{
	try {
		opt = new WSClient('ws://127.0.0.1:59437', {reconnect: false, max_reconnects: -1});
		opt.on('error', (error) => { opt.close(); reject(false); });
	} catch(err) {
		opt.close();
		return reject(false);
	}

	opt.on('open', (event) => {
		opt.reconnect = true;
		opt.max_reconnects = 0;
		console.log(`!!!!!!!!!!!!!!! CONNECTED`);
		state.optConnected = true;

		opt.removeAllListeners('error');
		opt.on('error', (error) => { 
			console.log(`Background Script WSClient error...`); 
			console.trace(error); 
			opt.reconnect = false;
			opt.max_reconnects = 0;
			state.activeLogin = false;
			chrome.browserAction.setPopup({popup: ''});
			opt.close(); 
		});

		opt.removeAllListeners('close');
		opt.on('close', function (event) {
			state.optConnected = false;
			stopRPCServer();
			console.log(`!!!!!!!!!!!!!!! Connection Closed`);
		});

		resolve(true)
	});
}

const __active = (resolve, reject) =>
{
	if (state.optConnected === false) {
		state.activeLogin = false;
		return reject(false);
	}

	let p = [
		opt.call('validPass'),
		opt.call('userWallet')
	];

	Promise.all(p).then((rc) => {
		if (rc[0] === false) return reject(false);
		if (typeof(rc[1]['OptractMedia']) !== 'undefined') {
			state.activeLogin = true;
			resolve(true);
		}
	})
	.catch((err) => {
		console.log(`DEBUG: background script __active check failed`)
		console.trace(err);
		state.activeLogin = false;
		return reject(false);
	})
}

const sendInfluence = (tabId, windowId, url) =>
{
	let domain = url.split('/')[2];
	chrome.browserAction.getTitle({tabId}, function(title) {
		if (title.includes('Optract Influenced')) return true;
		chrome.extension.getViews({tabId, viewType: 'popup', windowId}, function(winlist) {
			winlist[0].document.title = 'Optract Influenced: ' + domain;
			console.log("influence sent with url : " + url);
		})
		return true; // place holder
	})

}

var optTimer;

chrome.browserAction.onClicked.addListener(function (activeTab) {
	let url = activeTab.url;

	if (isNewTab(activeTab) || (!state.rpcStarted)) {
		openTab("index.html");
	} else {
		console.log(`DEBUG: last known actives, new tab, or optract... skipped`);
	}
});

chrome.runtime.onConnect.addListener(function (port) {
	port.onMessage.addListener(function (msg) {
		// Need to put nativeApp.py under dist directory, and update the optract.json under ~/.config/google-chrome/NativeMessagingHosts 
		// to use nativeApp.py
		if (msg.test === 'wsrpc' && !state.rpcStarted) {
			startRPCServer();
		        new Promise(__ready).catch((err) => { clearTimeout(optTimer); optTimer = setTimeout(() => { return new Promise(__ready); }, 15000) })
		} else if (msg.login === true && state.activeLogin === false) {
			state.activeLogin = true;
			console.log(`DEBUG: account logged in via UI, set active Login state...`);
			if (state.optConnected === false) { 
		        	new Promise(__ready).catch((err) => { clearTimeout(optTimer); optTimer = setTimeout(() => { return new Promise(__ready); }, 15000) })
			}
		}
	});

	port.onDisconnect.addListener(function () {
		// tport.disconnect();
		// if (opt) {
		// 	opt.close();
		// } else {
		// 	stopRPCServer();
		// }

	})
});

chrome.windows.onRemoved.addListener(function (windowId) {
	try { delete lastKnownActives[windowId]; } catch (err) {}
	try { delete myTabId[windowId]; } catch (err) {}
	chrome.windows.getAll(function (wins) {
		console.log("windows number is " + wins.length);
		if (wins.length == 0 && state.rpcStarted == true) {
			console.log("Shutdown optract rpc server.");
			if (opt) {
				opt.reconnect = false;
				opt.max_reconnects = -1;
				opt.close();
				opt = null;
			} else {
				stopRPCServer();
			}
		}

	})
});

const __handlePopup = (tabId, windowId, url) =>
{
	if (state.curate === true) return chrome.browserAction.setPopup({tabId, popup: 'influenced.html'});
	opt.call('addrTokenBalance', ['QOT']).then((rc) => {
		if (rc >= 50000000000000) {
			chrome.browserAction.setPopup({tabId, popup: 'influenced.html'});
			state.curate = true;
		} else if (!url.match('^about:') && !url.match('^moz-extension://')) {
			state.missing = 50 - (rc / 1000000000000);
			chrome.browserAction.setPopup({tabId, popup: 'sorry.html'});
			state.curate = false
		}
	}).catch((err) => { console.trace(err); chrome.browserAction.setPopup({tabId, popup: ''}); })
}

var parentTabURL;
var lastKnownActives = {};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (tab.url === 'about:blank') return;
	try {
		chrome.tabs.get(tab.openerTabId, function (parent_tab) {
			parentTabURL = parent_tab.url;
			if ( parent_tab.url === "moz-extension://" + myid + "/index.html"
			  || parent_tab.url === "moz-extension://" + myid + "/index.html#opsLine"  // if opSurvey is enabled
			) {
				console.log(`DEBUG: (onActivated) Getting tab opened by Optract UI...`)
				if (typeof (lastKnownActives[tab.windowId]) === 'undefined') lastKnownActives[tab.windowId] = {};
				lastKnownActives[tab.windowId][tabId] = tab.url;
				console.dir({ parentTabURL, windowId: tab.windowId, tabId, url: tab.url })
			} else {
				console.log(`set popup in tabs.get...`)
				if (state.activeLogin) __handlePopup(tabId, tab.windowId, tab.url);
			}
		})
	} catch (err) {
		//console.trace(err); console.dir(tab);
		if (isNewTab(tab) || tab.url.includes('moz-extension://') || tab.url.match('^about:')) {
			chrome.browserAction.setPopup({tabId, popup: ''});
		} else {
			if (state.activeLogin) __handlePopup(tabId, tab.windowId, tab.url);
		}
		parentTabURL = undefined;
	}
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log(`got message from tab! DEBUG...`)
	console.dir(sender);
	if (!sender.tab && message.influence) {
		console.log(`DEBUG: got message sent from none tab component`)
		console.log(message.influence);
		console.log(message.category);
		opt.call('newArticle',{args: [message.influence, [message.category], 'sent from Optract']}).then(() => {
			sendResponse({result: true});
		})
		chrome.browserAction.setPopup({tabId: message.tabId, popup: ''});
	} else if (!sender.tab && message.tokenMissing === "QOT") {
		console.log(`DEBUG: popup asking for token missing`);
		sendResponse({missing: state.missing});
	} else if (typeof(myTabId[sender.tab.windowId]) !== 'undefined'
	       && typeof(sender.tab.openerTabId) !== 'undefined'
	       && sender.tab.openerTabId === myTabId[sender.tab.windowId]
	) {
		if (typeof (lastKnownActives[sender.tab.windowId]) !== 'undefined'
		 && typeof (lastKnownActives[sender.tab.windowId][sender.tab.id]) !== 'undefined'
		 && lastKnownActives[sender.tab.windowId][sender.tab.id] !== sender.url
		) {
			if (state.activeLogin) __handlePopup(sender.tab.id, sender.tab.windowId, sender.tab.url);
			sendResponse({ yourParent: 'orphanized' });
		} else {
			sendResponse({ yourParent: "moz-extension://" + myid + "/index.html" });
			if (typeof (lastKnownActives[sender.tab.windowId]) === 'undefined') {
				lastKnownActives[sender.tab.windowId] = {[sender.tab.id]: sender.url};
			} else {
				lastKnownActives[sender.tab.windowId][sender.tab.id] = sender.url;
			}
		}
	} else {
		if (state.activeLogin) __handlePopup(sender.tab.id, sender.tab.windowId, sender.tab.url);
		sendResponse({ yourParent: 'Not from Optract' });
	}
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	let windowId = removeInfo.windowId;
	delete lastKnownActives[windowId][tabId];
});
