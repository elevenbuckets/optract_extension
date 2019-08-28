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
	    claimTickets: {},
	    claimArticles: {},
	    newClaimArticles: {},
	    newArticles: {},
            articles : {},
            following: [],
            displayBlogs: [],
            onlyShowForBlogger: "",
            currentBlogContent: "",
            login: false,
            logining: false,
	    allAccounts: [],
            account: null,
            memberShipStatus: "active",
            address: "0xaf7400787c54422be8b44154b1273661f1259ccd",
            passManaged : ["0xaf7400787c54422be8b44154b1273661f1259ccd"],
            activeTabKey : "finalList",
            curentBlockNO : 41,
            showVoteToaster: false,
	    wsrpc: false,
	    voted: undefined
        }

    }

    onFetchBlogContent = (article) => {
        this.setState({ currentBlogContent: article.page.content });
    }

    onNewBlock = (obj) =>
    {
	    console.log(`DEBUG: newBlock action is called...`);
	    let out = obj.articles;
	    let wow = obj.claimArticles;

	    if (Object.keys(wow).length > 0) {
            	Object.keys(wow).map((aid) => { 
		    	if (typeof(out[aid]) === 'undefined') return;
		    	out[aid] = {...out[aid], claim: true};
			console.log(`article ${aid} is tagged`)
	    	}); 
	    } else {
		console.log(`claimArticle store is empty ... skipped`)
	    }
		
	    this.setState({articles : out, claimArticles: wow})
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

    onUnlock = (pw) => 
    {
        this.setState({logining : true});
	let acc = this.state.account || null;
        this.unlockRPC(pw, acc, this.unlocked);   
    }

    onAllAccounts = () => 
    {
	this.allAccounts();
    }

    unlocked = ()=>{
        this.setState({ login: true, logining : false })
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
            this.setState({voted: undefined, showVoteToaster: true})
        });
    }

    onClaim(block, leaf, aid) {
	// TODO: calculate available winning tickets for claims
	// stop accepting claim when all tickets used.
        //OptractService.newClaim(block, leaf).then(data =>{
        //    console.dir(data);
            this.setState({claimed: undefined, showVoteToaster: true})
        //});
    }

    onCloseToast() {
        this.setState({showVoteToaster: false})
    }


}


DlogsStore.id = "DlogsStore"

export default DlogsStore;
