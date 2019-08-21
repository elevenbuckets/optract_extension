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
            currentBlog: ""
        }

        this.store = DlogsStore;
    }

    getArticleList = () => {
        let articles = this.state.articles; 
	if (Object.keys(articles).length === 0) return;

        return Object.keys(articles).filter(aid => {
            if (typeof(articles[aid].page) !== 'undefined' && articles[aid].page.lead_image_url !== null) {
                if (this.state.activeTabKey == "finalList" || this.state.activeTabKey == "toVote") {
                    return true;
                }
                return articles[aid].tags.tags.includes(this.state.activeTabKey)
            }
        }).map((aid) => {
            let article = articles[aid];
            return <div title={'Source: ' + article.page.domain} className="aidcard" onClick={this.goToArticle.bind(this, article)}>
                <div className="aidtitle">
                    <p style={{ padding: '3px', fontWeight: 'bold', color: '#000000' }}>{article.page.title}</p>
                    {renderHTML(marked(article.page.excerpt.substring(0, 242) + '...'))}
                </div>
                <div className="aidpic">
                    <img src={article.page.lead_image_url ? article.page.lead_image_url : 'assets/golden_blockchain.png'}></img>
                </div>
                <div className="aidclk">
                    <input type="button" className="button" defaultValue="Vote" style={{ textAlign: 'center', right: '25px' }}
                    onClick={this.vote.bind(this, article)} />
		    {
			typeof(article.claim) !== 'undefined' && article.claim === true ?
                    	<input type="button" className="button" defaultValue="Claim" style={{ textAlign: 'center', right: '25px' }} /> : ''
		    }
                </div>
            </div>
        })
    }

    goToArticle = (article) => {
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

    vote = (article, e) => {
        let l = article.txs.length;
        let i = Math.floor(Math.random() * l);
        DlogsActions.vote(article.blk[i], article.txs[i]);
        e.stopPropagation();
    }

    closeToast = () => {
        DlogsActions.closeToast();
    }

    closeOpt = () =>{
	DlogActions.closeOpt();
    }

    render() {
	    console.dir(this.state.articles)
        return (this.state.login ?
            <div className="content">
		<div className="sidebar" style={{ display: "none" }}>
		        <input type="button" className="button" defaultValue="Close" style={{ justifySelf: 'right', textAlign: 'center', right: '25px' }}
                    onClick={this.closeOpt} />
                </div>
                <div className="item contentxt">
                    <Tabs defaultActiveKey="finalList" onSelect={this.updateTab}>
                        <Tab eventKey="finalList" title="Final List"></Tab>
                        <Tab eventKey="tech" title="Tech"></Tab>
                        <Tab eventKey="blockchain" title="BlockChain"></Tab>
                        <Tab eventKey="finance" title="Finance"></Tab>
                    </Tabs>
                    {this.state.view === "List" ?
                        Object.keys(this.state.articles).length === 0 ?
                            <div className='item'><div className='item loader' style={{position: 'fixed', top: '50%', right: '50%'}}></div>
			    <label style={{ margin: '10px', alignSelf: "flex-end" }}>Loading ...</label></div> :
                            <div className="articles"> {this.getArticleList()} </div> :
                        this.state.view === "Content" ?
                            <BlogView blog={this.state.currentBlog} goEdit={this.goToEditBlog} goBack={this.goBackToList} /> :
                            <NewBlog saveNewBlog={this.saveNewBlog} currentBlog={this.state.currentBlog}
                                currentBlogContent={this.state.currentBlogContent} goBack={this.goBackToList} />}
                </div>
                <Toast show={this.state.showVoteToaster} style={{
                    position: 'fixed',
                    top: 10,
                    right: 10,
		    zIndex: 2000,
                    minHeight: '110px',
                    minWidth: '360px',
                    fontSize: "28px",
		    backgroundColor: "#f4fafe"
                }} onClose={this.closeToast} delay={3000} autohide>
                    <Toast.Header style={{backgroundColor: "#f4fafe", border: '0px'}}>
                    </Toast.Header>
                    <Toast.Body>Vote Success! </Toast.Body>
                </Toast>
            </div> : <LoginView />);

    }

}

export default MainView;
