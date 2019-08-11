function openTab(filename) { var myid = chrome.i18n.getMessage("@@extension_id"); chrome.windows.getCurrent( function(win) { chrome.tabs.query({'windowId': win.id}, function(tabArray) { for(var i in tabArray) { if(tabArray[i].url == "chrome-extension://" + myid + "/" + filename) { // console.log("already opened");
 chrome.tabs.update(tabArray[i].id, {active: true}); return; } } chrome.tabs.create({url:chrome.extension.getURL(filename)}); }); }); }

openTab("index.html")
chrome.browserAction.onClicked.addListener(function(activeTab)
{
   openTab("index.html")
});

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
       handleMessageFromContent(msg, port);
    });
  });


  handleMessageFromContent = (msg, port) =>{
    let tport = chrome.runtime.connectNative('optract'); 
      try{
          let data = JSON.parse(msg);
          if(data.type == "Connect_WS-RPC"){
            console.log(msg);
            port.postMessage("Response from extension for : " + msg);
          }
      }catch(e){
        console.log(msg);
        port.postMessage("Response from extension for : " + msg);
      }
  }