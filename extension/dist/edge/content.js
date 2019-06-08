(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
var port = chrome.runtime.connect();

window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  if (event.source != window)
    return;

  if (event.data.type && (event.data.type == "Connect_WS_RPC")) {
    console.log("Content script received: " + event.data.text);
    port.postMessage(event.data.text);
  }


  if (event.data.type && (event.data.type == "Connect_WS-RPC")) {
    console.log("Content script received: " + event.data.text);
    port.postMessage(JSON.stringify(event.data));
  }
}, false);

port.onMessage.addListener(function(msg) {
    console.log(msg);
    alert(msg);
    window.postMessage({ type: "Connect_WS_RPC_Confirm", text: "Hello from server" }, "*");
});
},{}]},{},[1])

//# sourceMappingURL=../sourcemaps/content.js.map
