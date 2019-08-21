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

        this.state = {
            originalHashes:["QmfNaysDYn5ZCGcCSiGRDL4qxSHNWz5AXL7jw3MBj4e3qB"],
	    claimArticles: {},
	    newArticles: {},
            articles : {},
            following: [],
            displayBlogs: [],
            onlyShowForBlogger: "",
            currentBlogContent: "",
            login: false,
            logining: false,
            account: "",
            memberShipStatus: "active",
            address: "0xaf7400787c54422be8b44154b1273661f1259ccd",
            passManaged : ["0xaf7400787c54422be8b44154b1273661f1259ccd"],
            activeTabKey : "finalList",
            curentBlockNO : 41,
            showVoteToaster: false,
	    wsrpc: false
        }

    }

    onFetchBlogContent = (article) => {
        this.setState({ currentBlogContent: article.page.content });
    }

    onNewBlock = (obj) =>
    { 
	    let articles = this.state.articles; 
	    let newArticles = this.state.newArticles; 
	    let out = { ...articles, ...newArticles };

	    if (Object.keys(this.state.claimArticles).length > 0) {
            	Object.keys(this.state.claimArticles).map((aid) => { 
		    	if (typrof(out[aid]) === 'undefined') return;
		    	out[aid] = {...out[aid], claim: true}; 
	    	}); 
	    }
		
	    this.setState({newArticles : out})
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
    }

    onUnlock = (pw) => {
        this.setState({logining : true});
        this.unlockRPC(pw, this.unlocked);   
    }

    unlocked = ()=>{
        this.setState({ login: true, logining : false })
    }

    onUpdateState = (state) =>{
        this.setState(state);
    }

    onUpdateTab = activeKey =>{
        let state ={activeTabKey: activeKey};
        if(Object.keys(this.state.newArticles) > 0) {
            state = {...state, articles: this.state.newArticles, newArticles : {} };
        }
        this.setState(state);

    } 

    onVote(block, leaf) {
        OptractService.newVote(block, leaf).then(data =>{
            console.dir(data);
            this.setState({showVoteToaster: true})
        });
    }

    onCloseToast() {
        this.setState({showVoteToaster: false})
    }


}


DlogsStore.id = "DlogsStore"

export default DlogsStore;
