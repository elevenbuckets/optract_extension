'use strict';

// Third-party packages
import Reflux from "reflux";
import React from "react";
import { Tabs, Tab, Toast, Modal } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import renderHTML from 'react-render-html';
import marked from "marked";
import Form from "react-bootstrap/Form";

// Store
import DlogsStore from "../store/DlogsStore";

// Actions
import DlogsActions from "../action/DlogsActions";

// Views
import BlogView from "./BlogView";
import LoginView from "./LoginView";

// Misc 
import { createCanvasWithAddress } from "../util/Utils";


class MainView extends Reflux.Component {

    constructor(props) {
        super(props);
        this.state = {
            view: "List",
            currentBlog: "",
            readAID: [],
            readCount: 0,
            showModal: false,
	    loading: false,
	    opSurveyAID: null
        }

        this.store = DlogsStore;
	this.loadTimer;
    }

    componentDidUpdate() {
        if (typeof (this.refs.canvas) !== 'undefined') {
            createCanvasWithAddress(this.refs.canvas, this.state.account);
        }
    }

    getImgSize = ({ target: img }) => {
        if (img.naturalWidth < 420 || img.naturalWidth / img.naturalHeight < 2.1) img.style.minWidth = '415px';
        if (img.naturalHeight < 200 || img.naturalWidth / img.naturalHeight > 2.1) img.style.minHeight = '200px';
    }

    pickLeadImage = (article) => {
        // special cases
	try {
        	if (article.page.domain.match('slashdot.org')) return (<img src='assets/slashdot_optract_logo.png'></img>)
	} catch (err) {
		console.log(`DEBUG: pickLeadImage:`)
		console.trace(err);
		console.dir(article);
		return <img src='assets/optract_logo.png'></img>
	}

        // normal cases
        if (article.page.lead_image_url) {
            return (<img onLoad={this.getImgSize.bind(this)} src={article.page.lead_image_url}></img>)
        } else {
            return <img src='assets/optract_logo.png'></img>
        }
    }

    genExcerpt = (article) => {
        try {
            if (article.page.excerpt === '') article.page.excerpt = '(no preview texts)';
            return renderHTML(marked(article.page.excerpt.substring(0, 140) + '...'))
        } catch (err) {
            article.page.excerpt = '(no preview texts)';
            return renderHTML(marked(article.page.excerpt))
        }
    }

    genVoteButtons = (article) => {
        let aid = article.myAID;
        return (<div className="aidclk" onClick={() => { }}>
            <div className="button"
                style={{ textAlign: 'center', right: '25px', cursor: 'pointer', display: 'inline-block' }}
                onClick={typeof (this.state.voted) === 'undefined' ? this.vote.bind(this, article, aid) : this.goToArticle.bind(this, article)}>
                {this.state.voted === aid
                    ? <p style={{ padding: '0px', margin: '0px' }}><span className="dot dotOne">-</span><span className="dot dotTwo">-</span><span className="dot dotThree">-</span></p>
                    : 'Vote'}
            </div>
        </div>)
    }

    // need to prepare questions more or equal to user ticket counts
    // this function should eventually takes aid as input, and return
    // proper questionire based on the aid category and other keywords
    opSurveyPoC = (aid) => 
    {
	    if (this.state.opSurveyAID !== null && this.state.opSurveyAID !== aid) {
		let readAID = this.state.readAID;
	    	readAID.splice(readAID.indexOf(this.state.opSurveyAID), 1);
		this.setState({readAID, opSurveyAID: aid, readCount: readAID.length});
	    } else if (this.state.opSurveyAID === null) {
		this.setState({opSurveyAID: aid});
	    }

	    let Qs = {
		"Do you think Ethereum 2.0 will be released on time as planned?":
		    {'Yes.': 0, 'No.': 1, 'Yes, but delayed.': 2, 'No, it will never be done.': 3},
		"Do you think you will lose your current job to AI or robots?" : 
		    {'Yes.': 0, 'No.': 1, 'Yes, but not any time soon': 2, 'No, not in my life time.': 3},
		"Will your next smartphone be an iPhone from Apple?"           : 
		    {'Yes.': 0, 'No.': 1, 'Yes, but not any time soon': 2, 'No, switching to Android': 3},
		"How much would you pay for 5G data plan on mobile?"	       : 
		    {'The same price as my current plan': 0, 'No more than 15% more': 1, 'No more than 20% more': 2, 'Do not plan to switch': 3},
		"Are you enjoying Optract so far? If so, how much would you pay for it monthly?":
		    {'Yes, $1/mo.': 0, 'Yes, $2/mo.': 1, 'Yes, ad-supported freemium.': 2, 'No.': 3}
	    };

	    let i = this.state.ticketCounts;
	    let Q = Object.keys(Qs).sort()[Math.floor(Math.random()*i)]; // cheating for PoC.

	    return {Q, S: Qs[Q]};
    }

    genClaimButtons = (article) => {
        let aid = article.myAID;
	let svy = this.opSurveyPoC.apply(this, [aid]);

        if (this.state.ticketCounts > 0) {
            return (<div className="item aidsvy" onClick={() => {}}>
		<div className="item svyQ">{svy.Q}</div>
		<div className="item svyS">
		    <Form>
		      <Form.Group>
		    { 
		      Object.keys(svy.S).map((ans) => {
		         return <Form.Check style={{cursor: "pointer"}} type="radio" label={ans} id={aid + '_' + svy.S[ans]}></Form.Check>
		      })
		    }
		      </Form.Group>
		    </Form>
		</div>
                <div className="button svyB"
                    style={{ textAlign: 'center', right: '25px', cursor: 'pointer', display: 'inline-block' }}
                    onClick={typeof (this.state.claimed) === 'undefined' ? this.claim.bind(this, article, aid) : this.goToArticle.bind(this, article)}>
                    {this.state.claimed === aid ? <p style={{ padding: '0px', margin: '0px' }}><span className="dot dotOne">-</span><span className="dot dotTwo">-</span><span className="dot dotThree">-</span></p> : 'Claim'}
                </div>
            </div>)
        } else {
            return (<div className="item aidclk" onClick={() => { }} style={
                { minHeight: '94px', color: 'darkred', backgroundColor: '#dee2e6', fontSize: '20px', textAlign: 'center', gridTemplateColumns: '1fr', borderTop: "1px solid #dee2e6" }} onClick={this.goToArticle.bind(this, article)}>You have 0 ticket left to vote!
		</div>)
        }
    }

    handleShowButton = (article) =>
    {
	    if (this.state.activeTabKey === 'claim') {
	    	if (this.state.ticketCounts > 0 && this.state.claimAID.indexOf(article.myAID) !== -1) {
		    return (<div className="item aidclk" style={
                     {minHeight: '94px', color: 'darkgreen', backgroundColor: '#dee2e6', fontSize: '20px', textAlign: 'center', gridTemplateColumns: '1fr', borderTop: "1px solid #dee2e6"}
                   } onClick={this.goToArticle.bind(this, article)}>You still have {this.state.ticketCounts} ticket(s)</div>)
		} else {
		    return this.genClaimButtons.apply(this, [article]) 
		}
	    } else if (this.state.activeTabKey === 'finalList') {
		    return (<div className="item aidclk" style={
                     {minHeight: '94px', color: 'darkgreen', backgroundColor: '#dee2e6', fontSize: '20px', textAlign: 'center', gridTemplateColumns: '1fr', borderTop: "1px solid #dee2e6"}
                   } onClick={this.goToArticle.bind(this, article)}>Read It!!!</div>)
	    } else if (this.state.voteCounts > 0 && this.state.voteAID.indexOf(article.myAID) !== -1) {
		    return (<div className="item aidclk" style={
                     {minHeight: '94px', color: 'darkgreen', backgroundColor: '#dee2e6', fontSize: '20px', textAlign: 'center', gridTemplateColumns: '1fr', borderTop: "1px solid #dee2e6"}
                   } onClick={this.goToArticle.bind(this, article)}>You've already voted this.</div>)
	    } else {
		    return this.genVoteButtons.apply(this, [article])
	    }
    }

    handleNoArticles = (activeTab) => {
        if (activeTab === 'claim') {
            return (<div className="item noticeBoard"><p>No articles for reward claiming yet...</p></div>)
        } else if (activeTab === 'finalList') {
            return (<div className="item noticeBoard"><p>No article was elected into final list yet...</p></div>)
        } else {
            return (<div className="item noticeBoard"><p>No articles curated for this category ...</p></div>)
        }
    }

    genOpStatsPage = () => {
        return (<div className="statusBoard">
            <div className="item EthBlk">EthBlock:<br />{this.state.EthBlock}</div>
            <div className="item OptBlk">OptBlock:<br />{this.state.OptractBlock}</div>
            <div className="item OptNo">OptNo:<br />{this.state.OproundNo}</div>
            <div className="item Peers">Peers:<br />{this.state.PeerCounts}</div>
            <div className="item plist">
                <div style={{ alignSelf: 'start' }}>
                    <hr style={{ minWidth: '100%', alignSelf: 'start', borderTop: '1px solid #dee2e6' }} />
                    <Table className="statTable" style={{ margin: '50px 0 25px 0', minWidth: '77vw', alignSelf: 'start' }} striped bordered hover>
                        <tbody>
                            <tr>
                                <td style={{
                                    borderLeft: '1px solid white', borderTop: '1px solid white', borderBottom: '1px solid white',
                                    backgroundColor: 'white', textAlign: 'center'
                                }} rowSpan="2">
                                    <canvas className="avatar" ref='canvas' width="190px" height="190px" />
                                </td>
                                <td>Account Address</td><td>Member Status</td>
                            </tr>
                            <tr>
                                <td style={{ fontFamily: 'monospace', padding: '30px' }}>{this.state.account}</td>
                                <td style={{ fontFamily: 'monospace', padding: '30px' }}>{this.state.MemberStatus}</td>
                            </tr>
                            <tr><td colSpan="3" style={{ backgroundColor: 'white', borderRight: '1px solid white', borderLeft: '1px solid white' }}><br /></td></tr>
                            <tr><td colSpan="3" style={{ backgroundColor: 'white', borderRight: '1px solid white', borderLeft: '1px solid white' }}><br /></td></tr>
                            <tr><td colSpan="3">Pending Transactions {this.state.pendingSize === 0 ? '' : `(Total: ${this.state.pendingSize})`}</td></tr>
                            {this.state.pendingSize === 0
                                ? <tr>
                                    <td colSpan="3" style={{ fontFamily: 'monospace' }}><p style={{ padding: '0px 240px' }}>No pending Transactions</p></td>
                                </tr>
                                : this.state.pending.txhash[this.state.account].map((tx) => {
                                    return <tr><td colSpan="3" style={{ fontFamily: 'monospace' }}>{tx}</td></tr>
                                })}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>)
    }

    getArticleList = () => {
	//timer trick for loader
	if (this.state.loading === true) {
		clearTimeout(this.loadTimer);
		this.loadTimer = setTimeout(() => { this.setState({loading: false}) }, 3500);
	}

        let articles = this.state.articles;
        if (this.state.activeTabKey === 'opStats') return this.genOpStatsPage.apply(this);
        if (this.state.activeTabKey === 'claim') {
            articles = this.state.claimArticles;
        }
        if (this.state.activeTabKey === 'finalList'){
            articles = this.state.finalList;
        }
        if (Object.keys(articles).length === 0) return this.handleNoArticles.apply(this, [this.state.activeTabKey]);

        let pagelist = Object.keys(articles).filter(aid => {
            if ( typeof (articles[aid].page) !== 'undefined' 
	      && typeof (articles[aid].page.err) === 'undefined' 
	      && typeof (articles[aid].page.error) === 'undefined'
	    ) {
                if (this.state.activeTabKey == "totalList" || this.state.activeTabKey == "claim" || this.state.activeTabKey == 'finalList') return true;
                return articles[aid].tags.tags.includes(this.state.activeTabKey)
            }
        })

        if (pagelist.length === 0) return this.handleNoArticles.apply(this, [this.state.activeTabKey]);

        return pagelist.map((aid) => {
            let article = articles[aid];
            article['myAID'] = aid;
            if (article.page.excerpt === null) article.page.excerpt = '(no preview texts)';
            return <div title={'Source: ' + article.page.domain} className="aidcard">
                <div className="aidtitle" onClick={this.goToArticle.bind(this, article)}>
                    <p style={{ padding: '3px', fontWeight: 'bold', color: '#000000' }}>{article.page.title}</p>
                    <p style={{ padding: '5px'}}>{this.genExcerpt.apply(this, [article])}</p>
                </div>
                <div className="aidpic" onClick={this.goToArticle.bind(this, article)}>
                    {this.pickLeadImage.apply(this, [article])}
                </div>
                {this.state.readCount > 0 && this.state.readAID.indexOf(aid) !== -1
                    ? this.handleShowButton.apply(this, [article])
                    : this.state.activeTabKey === 'finalList' ? this.handleShowButton.apply(this, [article]) : <div className="item aidclk" style={
                        { minHeight: '94px', color: 'darkgreen', backgroundColor: '#dee2e6', fontSize: '20px', textAlign: 'center', gridTemplateColumns: '1fr', borderTop: "1px solid #dee2e6" }
                    } onClick={this.goToArticle.bind(this, article)}>Vote will be enabled after reading.</div>

                }
            </div>
        })
    }

    goToArticle = (article) => {
        let readAID = this.state.readAID;
        readAID.push(article.myAID);
        this.setState({ readAID, readCount: readAID.length });
        window.open(article.url, '_blank');
        // DlogsActions.fetchBlogContent(article);
        // this.setState({ view: "Content", currentBlog: article });
    }

    goBackToList = () => {
        this.setState({ view: "List", currentBlog: "" })
    }

    updateTab = (activeKey) => {
        if(activeKey === "claim"){
            this.setShowModal(true);
        }
        DlogsActions.updateTab(activeKey);
        this.goBackToList();
    }

    vote = (article, aid, e) => {
        this.setState({ voted: aid });
        let l = article.txs.length;
        let i = Math.floor(Math.random() * l);
        DlogsActions.vote(article.blk[i], article.txs[i], aid);
        e.stopPropagation();
    }

    claim = (article, aid, e) => {
        this.setState({ claimed: aid, opSurveyAID: null });
        let v2blk = this.state.claimArticles[aid].blk[0];
        let v2txh = this.state.claimArticles[aid].txs[0];
        DlogsActions.claim(v2blk, v2txh, aid);
        e.stopPropagation();
    }

    closeToast = () => {
        DlogsActions.closeToast();
    }

    closeOpt = () => {
        DlogsActions.closeOpt();
    }

    setShowModal =  showModal =>{
        this.setState({showModal: showModal});
    }

    moreArticles = () =>
    {
	if (this.state.loading === false) this.setState({loading: true});
	DlogsActions.loadMore();
    }

    render() {
        console.log(this.state.account);
        console.dir(this.state.aidlist);
        console.log(this.state.loading);

        if (this.state.articleTotal === 0) {
            document.getElementById('app').style.backgroundImage = 'url(assets/loadbg.png)';
        } else {
            document.getElementById('app').style.backgroundImage = 'none';
            document.getElementById('app').style.backgroundColor = 'aliceblue';
        }

        return (
            this.state.login ?
                <div className="content">
                    <div className="ticketNote" style={Object.keys(this.state.articles).length === 0 ? { display: 'none' } : { display: "inline-block" }}>
                        {this.state.ticketCounts === 0 ? '' : `You have ${this.state.ticketCounts} ticket(s)`}</div>
                    <div className="item contentxt">
                        {
                            Object.keys(this.state.articles).length > 0 ?
                                <Tabs defaultActiveKey="totalList" onSelect={this.updateTab}>
                                    <Tab eventKey="totalList" title="ALL"></Tab>
                                    <Tab eventKey="tech" title="Tech"></Tab>
                                    <Tab eventKey="emergingTech" title="Emerging"></Tab>
                                    <Tab eventKey="science" title="Science"></Tab>
                                    <Tab eventKey="blockchain" title="Blockchain"></Tab>
                                    <Tab eventKey="finance" title="Finance"></Tab>
                                    <Tab eventKey="investment" title="Investment"></Tab>
                                    <Tab eventKey="__" disabled title="|"></Tab>
                                    {this.state.finalListCounts > 0 ? <Tab eventKey="finalList" title="Final List"></Tab> : ''}
                                    <Tab eventKey="opStats" title="Status"></Tab>
                                    {this.state.claimArticleCounts > 0 ? <Tab eventKey="claim" style={{ fontWeight: 'bold', color: 'red' }} title="Rewards"></Tab> : ''}
                                </Tabs> : ''}
                        {this.state.view === "List" ?
                            this.state.articleTotal === 0 ?
                                <div className='item' style={{ height: 'calc(100vh - 50px)', width: "100vw" }}><div className='item loader'></div>
                                    <label className='loaderlabel'>Loading ...</label></div> :
                                <div className="articles"> {this.getArticleList()} { this.state.activeTabKey === 'totalList' ? <div className="aidcard" style={{height: '594px', gridTemplateRows: '1fr'}} onClick={this.state.aidlistSize > 0 ? this.moreArticles.bind(this) : () => {} }>{this.state.loading === true ? <p style={{alignSelf: 'center', textAlign: 'center', fontSize: '33px', maxHeight: '34px', minWidth: '100px'}}><span className="dot dotOne">-</span><span className="dot dotTwo">-</span><span className="dot dotThree">-</span></p> : this.state.aidlistSize > 0 ? <p className="item">{this.state.aidlistSize} more articles</p> : <p className="item">"No More New Articles."</p>}</div> : '' }</div> :
                            this.state.view === "Content" ?
                                <BlogView blog={this.state.currentBlog} goEdit={this.goToEditBlog} goBack={this.goBackToList} /> :
                                <NewBlog saveNewBlog={this.saveNewBlog} currentBlog={this.state.currentBlog}
                                    currentBlogContent={this.state.currentBlogContent} goBack={this.goBackToList} />}
                    </div>
                    <Toast show={this.state.showVoteToaster} style={{
                        position: 'fixed',
                        bottom: 15,
                        right: 10,
                        zIndex: 2000,
                        minHeight: '101px',
                        minWidth: '360px',
                        fontSize: "28px",
                        backgroundColor: "#ff4200",
                        color: "white",
                        fontWeight: "bold"
                    }} onClose={this.closeToast} onClick={this.closeToast} delay={1000} autohide>
                        <Toast.Header style={{ color: '#ff4200', closeBmaxHeight: '30px', backgroundColor: '#ff4200', border: '0px' }}></Toast.Header>
                        <Toast.Body style={{ justifyContent: 'center', textAlign: 'center', height: '71px', width: '360px' }}>Vote Success!</Toast.Body>
                    </Toast>
                    <Modal
                        show={this.state.showModal}
                        onHide={() => this.setShowModal(false)}
                        dialogClassName="modal-90w"
                        aria-labelledby="example-custom-modal-styling-title"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="example-custom-modal-styling-title" style={{fontSize:"3rem"}}>
                                Rewards Page
                  </Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{fontSize:"2rem"}}>
                            <p>
                                This is the second round of voting, reward tokens will be issued for your participation.<br/> 
				You need to use one ticket per vote (called "claim"). In each round you will be able to claim
				as many times as long as you still have "winning" tickets, but you will only be eligible to claim
				rewards once per round.
                  	    </p>
                        </Modal.Body>
                    </Modal>
                </div> : <LoginView />);

    }

}

export default MainView;
