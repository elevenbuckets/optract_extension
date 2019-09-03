import Reflux from "reflux";
import React from "react";
import { Tabs, Tab, Toast } from "react-bootstrap";

import DlogsStore from "../store/DlogsStore";
import DlogsActions from "../action/DlogsActions";
import BlogView from "./BlogView";
import SideBarView from "./SideBarView";
import LoginView from "./LoginView"
import renderHTML from 'react-render-html';
import marked from "marked";


class MainView extends Reflux.Component {

    constructor(props) {
        super(props);
        this.state = {
            view: "List",
            currentBlog: "",
	    readAID: [],
	    readCount: 0
        }

        this.store = DlogsStore;
    }

    pickLeadImage = (article) =>
    {
	// special cases
	if (article.page.domain.match('slashdot.org')) return 'assets/slashdot_optract_logo.png';
	
	// normal cases
	if (article.page.lead_image_url) {
		return article.page.lead_image_url;
	} else {
		return 'assets/optract_logo.png'
	}
    }

    genExcerpt = (article) =>
    {
	try {
	    if (article.page.excerpt === '') article.page.excerpt = '(no preview texts)';
	    return renderHTML(marked(article.page.excerpt.substring(0, 140) + '...'))
	} catch (err) {
	    articles.page.excerpt = '(no preview texts)';
	    return renderHTML(marked(article.page.excerpt))
	}
    }

    genVoteButtons = (article) =>
    {
	let aid = article.myAID;
    	return (<div className="aidclk" onClick={()=>{}}>
		  <div className="button" 
		       style={{ textAlign: 'center', right: '25px', cursor: 'pointer', display: 'inline-block' }} 
		       onClick={typeof(this.state.voted) === 'undefined' ? this.vote.bind(this, article, aid) : this.goToArticle.bind(this, article)}>
		      { this.state.voted === aid 
		? <p style={{padding: '0px', margin: '0px'}}><span className="dot dotOne">-</span><span className="dot dotTwo">-</span><span className="dot dotThree">-</span></p> 
		: 'Vote'} 
		  </div>
		</div>)
    }

    genClaimButtons = (article) =>
    {
	let aid = article.myAID;
    	if (this.state.ticketCounts > 0) {
		   return (<div className="aidclk" onClick={()=>{}}>
			<div className="button" 
			     style={{ textAlign: 'center', right: '25px', cursor: 'pointer', display: 'inline-block' }} 
			     onClick={typeof(this.state.claimed) === 'undefined' ? this.claim.bind(this, article, aid) : this.goToArticle.bind(this, article)}>
			{this.state.claim === aid ? <p style={{padding: '0px', margin: '0px'}}><span className="dot dotOne">-</span><span className="dot dotTwo">-</span><span className="dot dotThree">-</span></p> : 'Claim'}
			</div>
		   </div>)
	} else {
		return (<div className="item aidclk" onClick={()=>{}} style={
			{minHeight: '94px', color: 'darkred', backgroundColor: '#dee2e6', fontSize: '20px', textAlign: 'center', gridTemplateColumns: '1fr', borderTop: "1px solid #dee2e6"}} 		       onClick={this.goToArticle.bind(this, article)}>You have 0 ticket left to vote!
		</div>)
	}
    }

    handleNoArticles = (activeTab) =>
    {
	    if (activeTab === 'claim') {
		    return (<div className="item noticeBoard"><p>No articles for reward claiming yet...</p></div>)
	    } else {
		    return (<div className="item noticeBoard"><p>No articles for category {activeTab} yet...</p></div>)
	    }
    }

    getArticleList = () => {
        let articles = this.state.articles; 
	if (this.state.activeTabKey === 'claim') articles = this.state.claimArticles;
	if (Object.keys(articles).length === 0) return this.handleNoArticles.apply(this, [this.state.activeTabKey]);

        return Object.keys(articles).sort().filter(aid => {
            if (typeof(articles[aid].page) !== 'undefined') {
                if (this.state.activeTabKey == "totalList" || this.state.activeTabKey == "claim") return true;
                return articles[aid].tags.tags.includes(this.state.activeTabKey)
            }
        }).map((aid) => {
            let article = articles[aid];
	    article['myAID'] = aid;
	    if (article.page.excerpt === null) articles.page.excerpt = '(no preview texts)';
            return <div title={'Source: ' + article.page.domain} className="aidcard">
                <div className="aidtitle" onClick={this.goToArticle.bind(this, article)}>
                    <p style={{ padding: '3px', fontWeight: 'bold', color: '#000000' }}>{article.page.title}</p>
                    { this.genExcerpt.apply(this, [article]) }
                </div>
                <div className="aidpic" onClick={this.goToArticle.bind(this, article)}>
                    <img src={this.pickLeadImage.apply(this, [article])}></img>
                </div>
		{ this.state.readCount > 0 && this.state.readAID.indexOf(aid) !== -1 
		  ? this.state.activeTabKey === 'claim' ? this.genClaimButtons.apply(this, [article]) : this.genVoteButtons.apply(this, [article])
		  : <div className="item aidclk" style={
		     {minHeight: '94px', color: 'darkgreen', backgroundColor: '#dee2e6', fontSize: '20px', textAlign: 'center', gridTemplateColumns: '1fr', borderTop: "1px solid #dee2e6"}
		   } onClick={this.goToArticle.bind(this, article)}>Vote will be enabled after reading.</div>

		}
            </div>
        })
    }

    goToArticle = (article) => {
	let readAID = this.state.readAID;
	readAID.push(article.myAID);
	this.setState({readAID, readCount: readAID.length});
        window.open(article.url, '_blank');
        // DlogsActions.fetchBlogContent(article);
        // this.setState({ view: "Content", currentBlog: article });
    }

    goBackToList = () => {
        this.setState({ view: "List", currentBlog: "" })
    }

    updateTab = (activeKey) => {
        DlogsActions.updateTab(activeKey);
        this.goBackToList();
    }

    vote = (article, aid, e) => {
	this.setState({voted: aid});
        let l = article.txs.length;
        let i = Math.floor(Math.random() * l);
        DlogsActions.vote(article.blk[i], article.txs[i], aid);
        e.stopPropagation();
    }

    claim = (article, aid, e) => {
	this.setState({claimed: aid});
	let v2blk = this.state.claimArticles[aid].blk[0];
	let v2txh = this.state.claimArticles[aid].txs[0];
        DlogsActions.claim(v2blk, v2txh, aid);
        e.stopPropagation();
    }

    closeToast = () => {
        DlogsActions.closeToast();
    }

    closeOpt = () =>{
	DlogsActions.closeOpt();
    }

    render() {
	console.log(this.state.account);
	console.log(this.state.voted);
	if (this.state.articleTotal === 0) {
		document.getElementById('app').style.backgroundImage = 'url(assets/loginbg.jpg)';
	} else {
		document.getElementById('app').style.backgroundImage = 'none';
		document.getElementById('app').style.backgroundColor = 'aliceblue';
	}

        return (
	    this.state.login ?
            <div className="content">
		        <div className="ticketNote" style={Object.keys(this.state.articles).length === 0 ? {display: 'none'} : {display: "inline-block"}}>
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
			{ this.state.claimArticleCounts > 0 ? <Tab eventKey="claim" title="Rewards"></Tab> : '' }
                     </Tabs> : ''}
		    {this.state.view === "List" ?
                        this.state.articleTotal === 0 ?
                            <div className='item' style={{height: 'calc(100vh - 50px)', width: "100vw"}}><div className='item loader'></div>
			    <label className='loaderlabel'>Loading ...</label></div> :
                            <div className="articles"> {this.getArticleList()} </div> :
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
                    <Toast.Header style={{color: '#ff4200', closeBmaxHeight: '30px', backgroundColor: '#ff4200', border: '0px'}}></Toast.Header>
		    <Toast.Body style={{justifyContent: 'center', textAlign: 'center', height: '71px', width: '360px'}}>Vote Success!</Toast.Body>
                </Toast>
            </div> : <LoginView />);

    }

}

export default MainView;
