if (window.location.href.match(/^about\:.*/g) !== null) {
	console.log(`DEBUG: match found: ${window.location.href}`)
	false;
} else {
	console.log(`content script loaded!`)
	chrome.runtime.sendMessage({landing: true}, 
	  function(response) {
	    console.log(`DEBUG: got response from background`)
	    if (response.yourParent === 'orphanized') return;
	    if (response.yourParent.includes('moz-extension://')) {
	    	    console.log(`DEBUG: This is an Optract recommended page!`);
	
		    // Optract in-page popup CSS
		    var sty = document.createElement("style");
		    var styles = 
			'#OptractPopUp { '
			    + 'display: grid !important; '
		            + 'font-family: sans !important; '
		            + 'font-size: 22px !important; '
			    + 'align-items: center !important; ' 
			    + 'justify-content: center !important; ' 
			    + 'width: 320px !important; height: 346px; '
			    + 'position: absolute; ' 
		            + 'border: 2px solid lightgrey !important; '
		            + 'box-shadow: 2px 2px 5px black !important; '
			    + 'top: 15px !important; '
			    + 'right: -330px; '
		            + 'background-color: aliceblue !important; '
			    + 'z-index: 2147483638 !important; } '
		      + '#OptractTitle { '
		            + 'height: fit-content !important; '
		            + 'max-height: 28px !important; '
		            + 'text-align: center !important; '
		            + 'width: 300px !important; '
		            + 'margin: 3px 0px 3px 0px !important; '
		            + 'padding: 0px !important; '
		            + 'border: 3px solid black !important; '
		            + 'font-weight: bold !important; '
		            + 'align-self: center !important; '
		            + 'color: white !important; '
		            + 'background-color: black !important; '
		            + 'justify-self: center !important; } '
		      + '#OptractVote { ' 
		            + 'font-size: 22px !important; '
		            + 'font-family: sans !important; '
		            + 'background-color: goldenrod !important; '
		            + 'color: black !important; '
		            + 'border: 1px solid slategrey !important; '
		            + 'width: 100% !important; '
		            + 'height: fit-content !important; '
		            + 'max-height: 35px !important; '
		            + 'padding: 2px !important; '
		            + 'justify-self: center !important; '
			    + 'cursor: pointer !important; }'
		      + '#OptractVote:disabled { '
		            + 'background-color: slategray !important; '
		            + 'color: lightgray !important; '
		            + 'cursor: not-allowed !important; } '
		      + '#OptractSelection { '
		            + 'border-radius: 0% !important; '
		            + 'font-size: 16px !important; '
		            + 'margin: 0px !important; '
		            + 'border-top: 1px solid rgb(169,169,169) !important; '
		            + 'border-left: 1px solid rgb(169,169,169) !important; '
		    	    + 'box-shadow: 4px 5px 7px #e3e3e3 inset !important; '
		            + 'background-color: white !important; '
		            + 'justify-self: center !important; '
		            + 'width: 300px !important; '
		            + 'height: 264px !important; }';
	
		    sty.appendChild(document.createTextNode(styles));
	            document.body.appendChild(sty);
	
		    // Optract in-page popup div
		    var div = document.createElement("div");
		    div.setAttribute('id', 'OptractPopUp');

		    var tit = document.createElement("div");
		    tit.setAttribute('id', 'OptractTitle');
		    tit.innerHTML = 'Optract';
	            
		    div.appendChild(tit);
	
		    // hightlight-to-quote textarea
		    var txt = document.createElement("textarea"); 
		    txt.setAttribute('id', 'OptractSelection');
	
	            div.appendChild(txt);
	
		    // vote-with-quote button
		    var btn = document.createElement("input");
		    btn.setAttribute('id', 'OptractVote');
		    btn.type = 'button';
		    btn.value = 'Vote with quote';
	
	            div.appendChild(btn);
	
		    // inject elements in DOM
		    document.body.style.overflowX = 'hidden';
		    document.body.style.position = 'relative';
	            document.body.appendChild(div);
		    
		    window.addEventListener('message', function (e) {
			    if (e.source != window) return;
			    if (e.data.type === 'OPTRACT_QUOTE') {
				    let url = window.location.href;
				    console.log(`DEBUG: ContentScript get quote and vote event. URL = ${url}`);
				    console.log(`DEBUG: ${e.data.txt}`);
	
				    chrome.runtime.sendMessage({myParent: response.yourParent, highlight: e.data.txt, voteRequest: url, domain: e.data.domain, title: e.data.title });
			    }
		    })
	
		    var actualCode = 
			'var OptractSelectTimer; var voteCasted = false; '
		      + 'function selectionCheck (e) { setTimeout(getSelected, 180) }; '
		      + 'function getSelected () { let txt = window.getSelection().toString(); '
		      +                          ' clearTimeout(OptractSelectTimer); ' 
		      +                          ' let pop = document.getElementById("OptractSelection"); pop.value = txt; '
		      +                          ' let div = document.getElementById("OptractPopUp"); '
		      +                          ' let btn = document.getElementById("OptractVote"); '
		      +                          ' let title = document.title; '
		      +                          ' let domain = document.domain; '
		      +                          ' if (txt) { ' 
		      +                          '     if (voteCasted === true) { ' 
	              +                          '           btn.disabled = true; btn.value = "Already Voted"; '
		      +                          '           div.style.height = "82px"; '
		      +                          '           pop.style.display = "none"; '
		      +                          '     } '
		      + '     btn.onclick = () => { window.postMessage({type: "OPTRACT_QUOTE", txt, title, domain}); voteCasted = true; window.getSelection().removeAllRanges(); }; '
		      +                          '     OptractSelectTimer = setTimeout(() => { div.style.position = "fixed"; div.style.right = "26px"; }, 1200); '
		      +                          ' } else { '
		      +                          '     div.style.position = "absolute"; div.style.right = "-330px"; '
		      +                          ' } '
	              +                         '} '
		      + 'document.addEventListener("selectionchange", selectionCheck); ';
		    var script = document.createElement('script');
	            script.textContent = actualCode;
	            (document.head||document.documentElement).appendChild(script);
	            script.remove();
	
	    }    
	  }
	);
}
