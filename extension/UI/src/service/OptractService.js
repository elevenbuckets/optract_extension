'use strict';

// import IPFS from 'ipfs';
// import ipfsClient from 'ipfs-http-client';

import DlogsActions from "../action/DlogsActions";
var port = chrome.runtime.connect();
var stat = 'disconnected';

class OptractService {
    constructor() {
        this.opt
        this.account;

        const WSClient = require('rpc-websockets').Client;
        const connectRPC = (mn) => {
            this.opt = new WSClient('ws://127.0.0.1:59437', {max_reconnects: mn});
            const __ready = (resolve, reject) => {
                this.opt.on('open', function (event) { resolve(true) });
                this.opt.on('error', function (error) { reject(false) });
            }

            return new Promise(__ready).catch((err) => { setTimeout(connectRPC, 1200) });
        }

	this.connect = () => 
	{
		console.log(`OptractService connect called`);
		port.postMessage(JSON.stringify({test: 'wsrpc'}));
		        connectRPC(1).then((rc) => {
				stat = 'connected';
				return;
			})
		        .catch((err) => {
		        	connectRPC(25).then((rc) => {
					stat = 'connected';
		   		})
			})

	}

        this.unlockRPC = (pw, callback) => {
            const unlockRPCWithRetry = () => {
		   console.log('DEBUG: unlockRPCWithRetry called')
		   if (stat !== 'connected') return setTimeout(unlockRPCWithRetry, 5000)
                   this.opt.call("password", [pw]).then(rc => {
                            this.opt.call('reports').then((data) => {
                                let reports = { reports: data }

				if (!data.dbsync) {
                                	this.getBkRangeArticles(data.optract.synced - 5, data.optract.synced, true, callback);
                                	this.getClaimArticles(data.optract.opround - 2, true);
			        } else {
                                	this.getBkRangeArticles(data.optract.epoch - 5, data.optract.epoch, true, callback);
                                	this.getClaimArticles(data.optract.opround - 2, true);
				}
                            })

                            this.subscribeBlockData();

                            this.opt.call("userWallet").then(rc => {
                                console.dir(rc);
                                let state = { acccount: rc.OptractMeida, wsrpc: stat };
                                this.acccount = rc.OptractMeida;
                                DlogsActions.updateState(state);
                            })
                    })
                    .catch((err) => {
                            console.trace(err);
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
            }).catch((err) => { console.trace(err); })
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
            this.opt.subscribe('blockData');
            this.blockDataHandler = handler;
            this.opt.on('blockData', this.blockDataDispatcher);
        }

        this.blockDataDispatcher = (obj) => {
            console.log("Getting blockData events")
            this.refreshArticles();
            if (!this.blockDataHandler) {
                console.log("No valid handler for blockData events")
            } else {
                this.blockDataHandler(obj)
            }
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
        this.opt.call('reports').then((data) => {
            let reports = { reports: data }

            // get the last 5 blocks
            this.getBkRangeArticles(data.optract.epoch - 5, data.optract.epoch, true, callback);
            this.getClaimArticles(data.optract.opround - 2, true);
            this.getClaimTickets(this.acccount);
        }).catch((err) => { console.trace(err); setTimeout(this.opt.call, 5000, 'reports'); })
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
