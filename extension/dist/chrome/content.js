console.log(`content script loaded!`)
chrome.runtime.sendMessage({landing: true}, 
  function(response) {
    console.log(`DEBUG: got response from background`)
    if (response.yourParent.includes('chrome-extension://')) {
    	    console.log(`DEBUG: This is an Optract recommended page!`);
	    var actualCode = 
	        'var txt = document.createElement("textarea"); '
	      + 'txt.style.width = "300px"; '
	      + 'txt.style.height = "120px"; '
	      + 'txt.style.zIndex = "100"; '
	      + 'function selectionCheck (e) { setTimeout(getSelected, 180) }; '
	      + 'function getSelected () { txt.value = window.getSelection().toString(); console.log(`DEBUG: selection is ${txt.value}`); }'
	      + 'document.addEventListener("selectionchange", selectionCheck); ';
	    var script = document.createElement('script');
            script.textContent = actualCode;
            (document.head||document.documentElement).appendChild(script);
            script.remove();

    }    
  }
);
