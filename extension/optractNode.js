
const PubSubNode = require('./pubsubNode.js');

//Main
class OptractNode extends PubSubNode {
	constructor(cfgObj) {
		super(cfgObj);

		// this.appCfgs = { ...config }; // can become part of cfgObj
		// this.appName = 'OptractMedia';

		// //const FileServ = new IPFS(this.appCfgs.ipfs);
		// const Ethereum = new OptractMedia(this.appCfgs);
		// const mixins = 
		// [
		//    'call', 
        //            'sendTk',
		//    'ethNetStatus',
		//    'linkAccount',
		//    'password',
        //            'validPass',
		//    'allAccounts',
        //            'connected',
		//    'makeMerkleTreeAndUploadRoot',
        //            'configured',
        //            'memberStatus',
		//    'unlockAndSign',
		//    'verifySignature'
		// ];		

		// mixins.map((f) => { if (typeof(this[f]) === 'undefined' && typeof(Ethereum[f]) === 'function') this[f] = Ethereum[f] });

		// this.networkID = Ethereum.networkID;
		// this.abi = Ethereum.abi;
		// this.userWallet = Ethereum.userWallet;

		// IPFS related
		//this.ipfs = FileServ.ipfs;
		this.ipfs = new ipfsClient('127.0.0.1', '5001', {protocol: 'http'})

		this.get = (ipfsPath) => { return this.ipfs.cat(ipfsPath) }; // returns promise that resolves into Buffer
		this.put = (buffer)   => { return this.ipfs.add(buffer) }; // returns promise that resolves into JSON
		
		// IPFS string need to convert to bytes32 in order to put in smart contract
                this.IPFSstringtoBytes32 = (ipfsHash) =>
                {
                        // return '0x'+bs58.decode(ipfsHash).toString('hex').slice(4);  // return string
                        return ethUtils.bufferToHex(bs58.decode(ipfsHash).slice(2));  // return Buffer; slice 2 bytes = 4 hex  (the 'Qm' in front of hash)
                }

                this.Bytes32toIPFSstring = (hash) =>  // hash is a bytes32 Buffer
                {
                        return bs58.encode(Buffer.concat([Buffer.from([0x12, 0x20]), hash]))
                }

		// Event related		
		this.currentTick = 0; //Just an epoch.
		this.pending = { txdata: {}, payload: {}, txhash: {} }; // format ??????
		this.newblock = {};
		this.myNonce = 0;
		this.myEpoch = 0;

		const observer = (sec = 300000) =>
		{
        		return setInterval(() => {
				this.currentTick = Math.floor(Date.now() / 1000);
				this.myEpoch = (this.currentTick - (this.currentTick % 300)) / 300;
				this.emit('epoch', { tick: this.currentTick, epoch: this.myEpoch }) 
			}, sec);
		}

		// pubsub handler
		this.connectP2P();
		this.join('Optract');

		//const compare = (a,b) => { if (a.nonce > b.nonce) { return 1 } else { return -1 }; return 0 };

		this.setIncommingHandler((msg) => 
		{

			let data = msg.data;
			let account = ethUtils.bufferToHex(data.account);

			this.memberStatus(account).then((rc) => { return rc[0] === 'active'; })
			    .then((rc) => {
				if (!rc) return; // check is member or not ... not yet checking different tiers of memberships.
				try {
					if ( !('v' in data) || !('r' in data) || !('s' in data) ) {
					        return;
					} else if ( typeof(this.pending['txhash'][account]) === 'undefined' ) {
					        this.pending['txhash'][account] = [];
					} else if (this.pending['txhash'][account].length >= 120) {
					        return;
					}
				} catch(err) {
					console.trace(err);
					return;
				}
	
				let nonce = ethUtils.bufferToInt(data.nonce);
				let since = ethUtils.bufferToInt(data.since);
				let content = ethUtils.bufferToHex(data.content);
				let badge = ethUtils.bufferToHex(data.badge); 

				if (badge === '0x') badge = '0x0000000000000000000000000000000000000000000000000000000000000000';

				let _payload = this.abi.encodeParameters(
					['uint', 'address', 'bytes32', 'uint', 'bytes32'],
					[nonce,  account,  content,  since,  badge]
				);

				let payload = ethUtils.hashPersonalMessage(Buffer.from(_payload));
	                        let sigout = {
					originAddress: account,
	                                v: ethUtils.bufferToInt(data.v),
	                                r: data.r, s: data.s,
					payload,
	                                netID: this.networkID
	                        };
				console.dir(sigout);

			        if (this.verifySignature(sigout)){
					let pack = msg.data.serialize();
					let txhash = ethUtils.bufferToHex(ethUtils.sha256(pack));
	                                this.pending['txhash'][account].push(txhash);
					this.pending['txhash'][account] = Array.from(new Set(this.pending['txhash'][account])).sort();
	                                this.pending['txdata'][txhash]  = pack;
	                                this.pending['payload'][txhash] = payload;

					console.log(`INFO: Got ${txhash} from ${account}`); 
	                        }
			    })
		})

		this.newArticle = (url, badge = '0x0000000000000000000000000000000000000000000000000000000000000000') => 
		{
            console.log("new Article")
			let account = this.userWallet[this.appName];

			const __msgTx = (result, badge) =>
			{
				return this.put(Buffer.from(JSON.stringify(result))).then((out) => {
					let content = this.IPFSstringtoBytes32(out[0].hash);
					let since = Math.floor(Date.now() / 1000);
					let payload = this.abi.encodeParameters(
						['uint', 'address', 'bytes32', 'uint', 'bytes32'],
						[this.myNonce + 1, account, content, since, badge]
					);

					return this.unlockAndSign(account)(Buffer.from(payload)).then((sig) => {
						let params = {
							nonce: this.myNonce + 1,
							account, content, badge, since,
							v: Number(sig.v), r: sig.r, s: sig.s
						};
						let rlp = this.handleRLPx(mfields)(params);
						this.publish('Optract', rlp.serialize());
						this.myNonce = this.myNonce + 1;
						return rlp;
					}).catch((err) => { console.trace(err); })
				})
			}

			if (parseInt(badge, 16) === 0) {
				return mr.parse(url).then((result) => {	
					return __msgTx(result, badge);
				}).catch((err) => { console.trace(err); })

			} else {
				//TODO: Original content. url should mimic mr output with similar object.
				//      (could we have mercury parsing extension local article page???)
				//TODO: validate badge active period from smart contract.
				return __msgTx(url, badge);
			}
		}

		this.setOnpendingHandler((msg) => 
		{
			// merge with own pending pool
			let data = msg.data;
			if ( !('v' in data) || !('r' in data) || !('s' in data) ) {
			        return;
			}

			let account = ethUtils.bufferToHex(data.validator);
			let cache = ethUtils.bufferToHex(data.cache);
			let nonce = ethUtils.bufferToInt(data.nonce);
			let since = ethUtils.bufferToInt(data.since);
			let pending = ethUtils.bufferToInt(data.pending);
			// TODO: validate signature against a list of validator address from smart contract
			let _payload = this.abi.encodeParameters(
				['uint', 'uint', 'address', 'bytes32', 'uint'],
				[nonce, pending, account, cache, since] //PoC code fixing pending block No to "1"
			);
			let payload = ethUtils.hashPersonalMessage(Buffer.from(_payload));
	                let sigout = {
				originAddress: account,
	                        v: ethUtils.bufferToInt(data.v),
	                        r: data.r, s: data.s,
				payload,
	                        netID: this.networkID
	                };

			if (this.verifySignature(sigout)){
				let ipfsHash = this.Bytes32toIPFSstring(data.cache); console.log(`Snapshot IPFS: ${ipfsHash}`);
				let p = [
					this.get(ipfsHash).then((buf) => { return JSON.parse(buf.toString()) }),
					this.packSnap()
				];

				Promise.all(p).then((results) => {
					let pending = results[0];
					let mystats = results[1];
					if (pending[0].length === 0) return;
					let acquire = missing(mystats[0], pending[0]);
					if (acquire.length === 0 ) return; 
					console.dir(acquire);
					this.mergeSnapShot(pending, acquire);
				}).catch((err) => { console.log(`OnpendingHandler: `); console.trace(err); })
			}
		})

		this.parseMsgRLPx = (mRLPx) => { return this.handleRLPx(mfields)(mRLPx); }

		this.mergeSnapShot = (remote, dhashs) =>
		{
			dhashs.map((thash) => {
				return setTimeout((hash) => {
					let idx = remote[0].indexOf(hash);
					let data = this.handleRLPx(mfields)(Buffer.from(remote[2][idx]));
					let account = ethUtils.bufferToHex(data.account);
					let sigout = {
						originAddress: account,
						payload: Buffer.from(remote[1][idx]),
						v: ethUtils.bufferToInt(data.v),
						r: data.r, s: data.s,
						netID: this.networkID // FIXME: we need to include networkID in snapshot
					}
	
					if (this.verifySignature(sigout)){
						if (typeof(this.pending['txhash'][account]) === 'undefined') {
							this.pending['txhash'][account] = [];
						}

						let pack = Buffer.from(remote[2][idx]); let payload = Buffer.from(remote[1][idx]);
		                                this.pending['txhash'][account].push(hash);
						this.pending['txhash'][account] = Array.from(new Set(this.pending['txhash'][account])).sort();
		                                this.pending['txdata'][hash]  = pack;
		                                this.pending['payload'][hash] = payload;
	
						console.log(`INFO: Got ${hash} by ${account} from snapshot`); 
					}
				}, 0, thash);
			})
		}
	
		this.otimer = observer(150000);

		this.packSnap = () =>
		{
			let _tmp = { ...this.pending };
			let _tdt = { ..._tmp.txdata }; 
			let _tpd = { ..._tmp.payload }; 
			let _ths = { ..._tmp.txhash }; 

			let txhs = []; let txdt = []; let txpd = []; 

			Object.values(_ths).map((a) => { 
				txhs = [...txhs, ...a];
				a.map((h) => {
					txpd = [ ...txpd, _tpd[h] ];
					txdt = [ ...txdt, _tdt[h] ];
				})
			});

			return [txhs, txpd, txdt];
		}

		this.on('epoch', (tikObj) => {
			let account  = this.userWallet[this.appName];
			let snapshot = this.packSnap(); 
			if (snapshot[0].length === 0) return;

			// Need to create fixed length buffer and concat elements with just a little bit padding... still need works
			//this.put(Buffer.from([Buffer.from(snapshot[0]), Buffer.from(snapshot[1]), Buffer.from(snapshot[2])])).then((out) => {
			this.put(Buffer.from(JSON.stringify(snapshot))).then((out) => {
				let cache  = this.IPFSstringtoBytes32(out[0].hash);
				let payload = this.abi.encodeParameters(
					['uint', 'uint', 'address', 'bytes32', 'uint'],
					[tikObj.epoch, 1, account, cache, tikObj.tick] //PoC code fixing pending block No to "1"
				);

				return this.unlockAndSign(account)(Buffer.from(payload)).then((sig) => {
					let params = {
						nonce: tikObj.epoch,
						pending: 1,
						validator: account,
						cache, 
						since: tikObj.tick,
						v: Number(sig.v), r: sig.r, s: sig.s
					};
					let rlp = this.handleRLPx(pfields)(params);
					this.publish('Optract', rlp.serialize());
					//console.dir(rlp);
				}).catch((err) => { console.trace(err); })
			})
		});
	}
}

module.exports = OptractNode;