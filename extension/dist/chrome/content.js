console.log(`content script loaded!`)
chrome.runtime.sendMessage({landing: true}, 
  function(response) {
    console.log(`DEBUG: got response from background`)
    if (response.yourParent.includes('chrome-extension://')) {
    	    console.log(`DEBUG: This is an Optract recommended page!`);

	    //var txt = document.createElement("textarea"); 
	    //txt.setAttribute('id', 'OptractSelection');
	    //var sty = document.createElement("style"); 
	    //styles = '#OptractSelection { width: 300px; height: 120px; pointer-events: none; position: fixed; top: 5px; right: 10px; display: none; } ';
	    //sty.appendChild(document.createTextNode(styles));

            //document.body.appendChild(txt);
            //document.body.appendChild(sty);
	    
	    window.addEventListener('message', function (e) {
		    if (e.source != window) return;
		    if (e.data.type === 'OPTRACT_QUOTE') {
			    console.log(`DEBUG: ContentScript get quote:`);
			    console.dir(e.data);
		    }
	    })

	    var actualCode = 
		'var OptractSelectTimer; '
	      + 'function selectionCheck (e) { setTimeout(getSelected, 180) }; '
	      + 'function getSelected () { let txt = window.getSelection().toString(); '
	      +                          ' clearTimeout(OptractSelectTimer); ' 
	      +                          ' if (txt) OptractSelectTimer = setTimeout(window.postMessage, 1200, {type: "OPTRACT_QUOTE", txt}); }'
	      + 'document.addEventListener("selectionchange", selectionCheck); ';
	    var script = document.createElement('script');
            script.textContent = actualCode;
            (document.head||document.documentElement).appendChild(script);
            script.remove();

    }    
  }
);
