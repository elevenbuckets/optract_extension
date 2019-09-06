import Reflux from "reflux";
import DlogsActions from "../action/DlogsActions";
import DLogsAPI from "../client/DLogsAPI"
import FileService from "../service/FileService";
import OptractService from "../service/OptractService";
import Mercury from '@postlight/mercury-parser';
import { toHexString } from "multihashes";


const fs = null

class DlogsStore extends Reflux.Store {
    constructor() {
        super();
        this.listenables = DlogsActions;
        this.ipfs = FileService.ipfs;
        this.ipfsClient = FileService.ipfsClient;
        this.opt = OptractService.opt;
        this.unlockRPC = OptractService.unlockRPC;
        this.connect = OptractService.connect;
	this.shutdown = OptractService.shutdown;
	this.allAccounts = OptractService.allAccounts;

        this.state = {
            originalHashes:["QmfNaysDYn5ZCGcCSiGRDL4qxSHNWz5AXL7jw3MBj4e3qB"],
	    claimTickets: [],
	    ticketCounts: 0,
	    claimArticles: {},
	    claimArticleCounts: 0,
	    newArticles: {},
            articles : {},
	    articleTotal: 0,
	    finalList: {},
	    finalListCounts: 0,
            following: [],
            displayBlogs: [],
            onlyShowForBlogger: "",
            currentBlogContent: "",
            login: false,
            logining: false,
	    allAccounts: [],
            account: null,
            memberShipStatus: "active",
            activeTabKey : "totalList",
            showVoteToaster: false,
	    wsrpc: false,
	    voted: undefined,
	    claimed: undefined,
	// opStats
	    EthBlock: 0,
	    OptractBlock: 0,
            OproundNo: 0,
	    PeerCounts: 0,
	    Account: null,
	    MemberStatus: null,
	    pending: { txdata: {}, payload: {}, txhash: {}, nonces: {}},
	    pendingSize: 0,
	// vault
	    voteAID: [],
            voteCounts: 0,
	// double claim prevention
	    claimAID: [],
	    claimCounts: 0
        }

	this.probeTout;
    }

    onFetchBlogContent = (article) => {
        this.setState({ currentBlogContent: article.page.content });
    }

    onTicketWon = (tic) =>
    {
	    console.log(`DEBUG: ticketWon action is called...`);
	    if (typeof(tic) === 'object' && Object.keys(tic).length > 0) {
		let outics = [];
		Object.keys(tic).map((bn) => {
			tic[bn].map((t) => { outics.push({block: bn, txhash: t})})
		})

		this.setState({claimTickets: outics, ticketCounts: outics.length});
	    } else {
		this.setState({claimTickets: [], ticketCounts: 0});
	    	console.log(`claimTickets for ${this.state.account} is empty ... skipped`)
	    }
    }

    onConnectRPC = () =>
    {
	    if (this.state.wsrpc === true) {
		    console.log(`connected`)
		    return
	    }

	    console.log(`DEBUG: connecting RPC...`)
	    this.connect();
    }

    onCloseOpt = () =>
    {
	    this.shutdown();
	    window.close();
    }

    onUnlock = (pw, acc) => 
    {
        this.setState({logining : true});
        this.unlockRPC(pw, acc, this.unlocked);   
    }

    onServerCheck = () =>
    {
	console.log(`DEBUG: service check called!!`)
	OptractService.serverCheck().then((rc) => {
        	this.setState({logining : true});
		if (rc) {
			this.unlocked(true);
		} else {
        		this.setState({account: undefined, login: false, logining: false })
		}
	})	
    }

    onAllAccounts = () => 
    {
	this.allAccounts();
    }

    unlocked = (dispatch = false) =>{
        this.setState({ login: true, logining : false })
	OptractService.subscribeBlockData(DlogsActions.newBlock);
	OptractService.subscribeOpStats();
        if (dispatch) {
		OptractService.blockDataDispatcher({});
	} else {
		console.log(`DEBUG: active dispatch is off..`);
	}
        OptractService.statProbe();
    }

    onUpdateState = (state) =>{
        this.setState(state);
    }

    onUpdateTab = activeKey => {
	console.log(`DEBUG: updateTab action is called..`)
        let state ={activeTabKey: activeKey};
        if(Object.keys(this.state.newArticles) > 0) {
	    console.log(`DEBUG: updateTab action is causing articles update..`)
            state = {...state, articles: this.state.newArticles, newArticles : {} };
        }
        this.setState(state);

    } 

    onVote(block, leaf, aid) {
        OptractService.newVote(block, leaf).then(data =>{
            console.dir(data);
	    let voteAID = [ ...this.state.voteAID ];
	    voteAID.push(aid);
	    let voteCounts = voteAID.length;
            this.setState({voted: undefined, showVoteToaster: true, voteAID, voteCounts})
	    clearTimeout(this.probeTout);
	    this.probeTout = setTimeout(OptractService.statProbe, 30000);
        });
    }

    onClaim(block, leaf, aid) {
	if (this.state.claimTickets.length <= 0) return
	
	let tickets = [...this.state.claimTickets];
	let ticket  = tickets.shift(0);

        OptractService.newClaim(ticket.block, ticket.txhash, block, leaf, 'sent from optract client').then( data => {
            console.dir(data);
	    let claimAID = [ ...this.state.claimAID ];
	    claimAID.push(aid);
	    let claimCounts = claimAID.length;
            this.setState({claimTickets: tickets, ticketCounts: tickets.length, claimed: undefined, showVoteToaster: true, claimAID, claimCounts})
	    clearTimeout(this.probeTout);
	    this.probeTout = setTimeout(OptractService.statProbe, 30000);
        });
    }

    onCloseToast() {
        this.setState({showVoteToaster: false})
    }


}


DlogsStore.id = "DlogsStore"

export default DlogsStore;
