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

	        this.allAccounts = () => 
	        {
			console.log(`DEBUG: OptractService: allAccounts called ...`)
			this.opt.call('allAccounts').then((rc) => {
				   DlogsActions.updateState({allAccounts: rc});
			})
		}

		this.connect = () => 
		{
			port.postMessage({test: 'wsrpc'});
			console.log(`OptractService connect called`);
			connectRPC(1).then((rc) => {
				if (!rc) throw "wait for socket";
				this.allAccounts();
			})
			.catch((err) => {
				connectRPC(0).then((rc) => {
					if (!rc) throw "wait for socket";
					this.allAccounts();
				}).catch((err) => { true })
			})

		}

		this.unlockRPC = (pw, account, callback) => {
			console.log(`stat = ${stat}`);
		    const unlockRPCWithRetry = () => {
			   if (stat === false) {
				   DlogsActions.updateState({login: false, logining: false});
				   return;
			   }

			   let args = account === null ? [pw] : [pw, account];

			   this.opt.call("password", args).then(() => {
				    this.opt.call('validPass').then((rc) => {
					if (rc === false) throw "wrong password"
					this.opt.call("userWallet").then(rc => {
						if (account === null) account = rc.OptractMedia;
						console.dir(rc);
						let state = { account, wsrpc: stat };
						this.account = account;
						DlogsActions.updateState(state);
						if (callback) callback();
/*
						this.opt.call('reports').then((data) => {
							let reports = { reports: data }

							let os = data.optract.synced;
							if (data.optract.synced > 5) {
								os = data.optract.synced - 5;
								if (data.dbsync && data.optract.opStart < os) os = data.optract.opStart;
							}
							this.getBkRangeArticles(os, data.optract.synced, true, callback);
							if (data.optract.lottery.drawed === true) {
								this.getClaimArticles(data.optract.opround, true);
								this.getClaimTickets(this.account);
								DlogsActions.newBlock({});
							}

							DlogsActions.updateState(reports);
						})
						 .catch((err) => { console.trace(err); })
*/
						this.subscribeBlockData(DlogsActions.newBlock);
						this.blockDataDispatcher({});
					})
					.catch((err) => { console.trace(err); setTimeout(this.unlockRPC, 5000, pw, callback); })

				     })
				     .catch((err) => { console.trace(err); DlogsActions.updateState({login: false, logining: false}); setTimeout(this.unlockRPC, 5000, pw, callback); })
			    })
			    .catch((err) => {
				    console.trace(err);
				    DlogsActions.updateState({login: false, logining: false});
			    })
		    }

		    unlockRPCWithRetry();
		}

		this.getBkRangeArticles = (startB, endB, parsing, callback) => {
		    console.log(`DEBUG: getBkRangeArticle called`)
		    return this.opt.call('getBkRangeArticles', [startB, endB, parsing]).then((data) => {
			DlogsActions.updateState({articles: data});
			if (callback) callback()
			return {articles: data} 
		    }).catch((err) => { console.trace(err); 
			    if (endB > startB) endB = endB-1; 
			    setTimeout(this.opt.call, 5000, 'getBkRangeArticles', [startB, endB, parsing]); 
		    })
		}

		this.getNewBkRangeArticles = (startB, endB, parsing, callback) => {
		    console.log(`DEBUG: newBkRangeArticle called`)
		    return this.opt.call('getBkRangeArticles', [startB, endB, parsing]).then((data) => {
			DlogsActions.updateState({articles: data});
			if (callback) callback()
			return {articles: data} 
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
		    this.refreshArticles().then((rc) => {
			console.log(`DEBUG: refresh output:`); console.log(rc);
			if (!rc) return;
			if (!this.blockDataHandler) {
				console.log("No valid handler for blockData events")
			} else {
		    		console.log("Getting blockData events")
				this.blockDataHandler({...rc[0], ...rc[1]})
			}
		    })
		}

	    this.getNewClaimArticles = (op, parsing, callback) => {
		return this.opt.call('getClaimArticles', [op, parsing]).then((data) => {
		    DlogsActions.updateState({claimArticles: data});
		    if (callback) callback() 
		    return {claimArticles: data}
		}).catch((err) => { console.trace(err); })
	    }

	    this.getReports = (callback) => {
		this.opt.call('reports').then((data) => {
		    let reports = { reports: data }
		    DlogsActions.updateState(reports);
		    if (callback) {
			callback()
		    }
		}).catch((err) => { console.trace(err); setTimeout(this.opt.call, 5000, 'reports'); })
	    }

	    this.refreshArticles = (callback = null) => {
		return this.opt.call('reports').then((data) => {
		    let p = [];

		    if (this.account) {
			let os = data.optract.synced;
			if (data.optract.synced > 5) {
				os = data.optract.synced - 5;
				if (data.dbsync && data.optract.opStart < os) os = data.optract.opStart;
			}
			p.push(this.getBkRangeArticles(os, data.optract.synced, true, callback));
			if (data.optract.lottery.drawed === true) {
				p.push(this.getClaimArticles(data.optract.opround, true));
				p.push(this.getClaimTickets(this.account));
			}

			return Promise.all(p)
			              .catch((err) => { console.trace(err); setTimeout(this.refreshArticles, 5000); })
		    } else {
			console.log(`DEBUG: account not set`);
			setTimeout(this.refreshArticles, 10000);
		    }
		}).catch((err) => { console.trace(err); setTimeout(this.refreshArticles, 5000); return false; })
	    }

	    this.getClaimTickets = (addr) => {
		this.opt.call('getClaimTickets', [addr]).then((data) => {
		    DlogsActions.updateState({ claimTickets: data });
		    return {claimTickets: data};
		}).catch((err) => { console.trace(err); })
	    }

	    this.getClaimArticles = (op, parsing, callback) => {
		return this.opt.call('getClaimArticles', [op, parsing]).then((data) => {
		    console.log(`DEBUG: in OptractService getClaimArticles:`); console.dir(data);
		    DlogsActions.updateState({claimArticles: data});
		    if (callback) callback()
		    return {claimArticles: data}
		}).catch((err) => { console.trace(err); })

	    }
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
