console.log(`content script loaded!`)
chrome.runtime.sendMessage({landing: 'good job'}, 
  function(response) {
    console.log(`DEBUG: got response from background: my parent is:`)
    console.dir(response.yourParent);
  }
);
