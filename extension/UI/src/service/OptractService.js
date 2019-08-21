'use strict';

// import IPFS from 'ipfs';
// import ipfsClient from 'ipfs-http-client';

import DlogsActions from "../action/DlogsActions";
var port = chrome.runtime.connect();
var stat = false;

class OptractService {
    constructor() {
        this.opt
        this.account;

        const WSClient = require('rpc-websockets').Client;
        const connectRPC = (mn) => {
            this.opt = new WSClient('ws://127.0.0.1:59437', {max_reconnects: mn});
            const __ready = (resolve, reject) => {
                this.opt.on('open', function (event) { 
			console.log(`!!!!!!!!!!!!!!! CONNECTED`); 
			stat = true; 
			DlogsActions.updateState({wsrpc: stat});
			resolve(true) 
		});
                this.opt.on('error', function (error) { reject(false) });
            }

            return new Promise(__ready);
        }

	this.shutdown = () => { 
		this.opt.close(); 

		port.disconnect(); 
	}

	this.connect = () => 
	{
		port.postMessage({test: 'wsrpc'});
		console.log(`OptractService connect called`);
		connectRPC(1).then((rc) => {
			if (!rc) throw "wait for socket";
		})
		.catch((err) => {
			connectRPC(0).then((rc) => {
				if (!rc) throw "wait for socket";
			}).catch((err) => { true })
		})

	}

        this.unlockRPC = (pw, callback) => {
		console.log(`stat = ${stat}`);
            const unlockRPCWithRetry = () => {
		   if (stat === false) {
                           DlogsActions.updateState({login: false, logining: false});
			   return;
		   }

                   this.opt.call("password", [pw]).then(() => {
			    this.opt.call('validPass').then((rc) => {
				if (rc === false) throw "wrong password"
	                        this.opt.call('reports').then((data) => {
        	                        let reports = { reports: data }

					if (data.dbsync) {
						let os = data.optract.synced;
						if (data.optract.synced > 5) os = data.optract.synced - 5;
        	                        	this.getBkRangeArticles(os, data.optract.synced, true, callback);
						if (data.optract.drawed === true) {
							this.getClaimArticles(data.optract.opround, true);
							this.getClaimTickets(this.account);
						}
				        } else {
						let os = data.optract.epoch;
						if (data.optract.epoch > 5) os = data.optract.epoch - 5;
                                		this.getBkRangeArticles(os, data.optract.epoch, true, callback);
					}
                            	})

	                        this.subscribeBlockData(DlogsActions.newBlock);

        	                this.opt.call("userWallet").then(rc => {
                	                console.dir(rc);
					if (typeof(rc.OptractMedia) === 'undefined') throw "wait for linkAccount"; 
                        	        let state = { acccount: rc.OptractMeida, wsrpc: stat };
	                                this.acccount = rc.OptractMedia;
        	                        DlogsActions.updateState(state);
                	        })
				.catch((err) => { console.trace(err); setTimeout(this.unlockRPC, 5000, pw, callback); })
			     })
                    	     .catch((err) => { DlogsActions.updateState({login: false, logining: false}); setTimeout(this.unlockRPC, 5000, pw, callback); })
                    })
                    .catch((err) => {
                            console.trace(err);
                            DlogsActions.updateState({login: false, logining: false});
                    })
            }

            unlockRPCWithRetry();
        }

        this.getBkRangeArticles = (startB, endB, parsing, callback) => {
            this.opt.call('getBkRangeArticles', [startB, endB, parsing]).then((data) => {
                let articles = { articles: data }
                DlogsActions.updateState(articles);
                if (callback) {
                    callback()
                }
            }).catch((err) => { console.trace(err); 
		    if (endB > startB) endB = endB-1; 
		    setTimeout(this.opt.call, 5000, 'getBkRangeArticles', [startB, endB, parsing]); 
	    })
        }

        this.getNewBkRangeArticles = (startB, endB, parsing, callback) => {
            this.opt.call('getBkRangeArticles', [startB, endB, parsing]).then((data) => {
                let articles = { newArticles: data }
                DlogsActions.updateState(articles);
                if (callback) {
                    callback()
                }
            }).catch((err) => { console.trace(err); })

        }

        this.subscribeBlockData = (handler = null) => {
            console.log("subcribing the blockData Event...");
	    //reset
	    this.opt.off('blockData');
	    this.opt.unsubscribe('blockData');

            //subscribe
            this.opt.subscribe('blockData');
            this.blockDataHandler = handler;
            this.opt.on('blockData', this.blockDataDispatcher);
        }

        this.blockDataDispatcher = (obj) => {
            console.log("Getting blockData events")
            this.refreshArticles().then(() => {
            	if (!this.blockDataHandler) {
                	console.log("No valid handler for blockData events")
            	} else {
                	this.blockDataHandler(obj)
            	}
	    })
        }
    }

    getClaimArticles = (op, parsing, callback) => {
        this.opt.call('getClaimArticles', [op, parsing]).then((data) => {
            let claimArticles = { claimArticles: data }
            DlogsActions.updateState(claimArticles);
            if (callback) {
                callback()
            }
        }).catch((err) => { console.trace(err); })

    }

    getNewClaimArticles = (op, parsing, callback) => {
        this.opt.call('getClaimArticles', [op, parsing]).then((data) => {
            let newClaimArticles = { newClaimArticles: data }
            DlogsActions.updateState(newClaimArticles);
            if (callback) {
                callback()
            }
        }).catch((err) => { console.trace(err); })
    }

    getReports = (callback) => {
        this.opt.call('reports').then((data) => {
            let reports = { reports: data }
            DlogsActions.updateState(reports);
            if (callback) {
                callback()
            }
        }).catch((err) => { console.trace(err); setTimeout(this.opt.call, 5000, 'reports'); })
    }

    refreshArticles = (callback = null) => {
        return this.opt.call('reports').then((data) => {
            let reports = { reports: data }

	    if (data.dbsync && this.account) {
		let os = data.optract.synced;
		if (data.optract.synced > 5) os = data.optract.synced - 5;
		this.getNewBkRangeArticles(os, data.optract.synced, true, callback);
		if (data.optract.drawed === true) {
			this.getNewClaimArticles(data.optract.opround, true);
			this.getClaimTickets(this.account);
		}
	    } else {
		let os = data.optract.epoch;
		if (data.optract.epoch > 5) os = data.optract.epoch - 5;
		this.getNewBkRangeArticles(os, data.optract.epoch, true, callback);
	    }
        }).catch((err) => { console.trace(err); setTimeout(this.refreshArticles, 5000, 'reports'); })
    }

    getClaimTickets(addr) {
        this.opt.call('getClaimTickets', [addr]).then((data) => {
            let claimTickets = { claimTickets: data }
            DlogsActions.updateState(claimTickets);
        }).catch((err) => { console.trace(err); })
    }

    getFinalList(op) {
        this.opt.call('getOpRangeFinalList', [arguments]).then((data) => {
            let finalList = { finalList: data }
            DlogsActions.updateState(finalList);
        }).catch((err) => { console.log(`DEBUG: getFinalList:`); console.trace(err); })
    }

    newVote(block, leaf) {
        console.log(`Now vote with args: ${block} ${leaf}`);
        return this.opt.call('newVote', { args: [block, leaf] });
    }

    newClaim(v1block, v1leaf, v2block, v2leaf, comment) {
        return this.opt.call('newClaim', arguments);
    }


}

const optractService = new OptractService();
export default optractService;
