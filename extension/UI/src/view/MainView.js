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
        let articles = this.state.activeTabKey == "toVote" ? this.state.claimArticles : this.state.articles;
        return Object.keys(articles).filter(aid => {
            if (articles[aid].page.lead_image_url !== null && articles[aid].page.excerpt.length >= 100) {
                if (this.state.activeTabKey == "finalList" || this.state.activeTabKey == "toVote") {
                    return true;
                }
                return articles[aid].tags.tags.includes(this.state.activeTabKey)
            }
        }).map((aid) => {
            let article = articles[aid];
            return <div className="aidcard" onClick={this.goToArticle.bind(this, article)}>
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

    render() {
        return (this.state.login ?
            <div className="content">
                <div className="sidebar" style={{ display: "none" }}>
                    <SideBarView />
                </div>
                <div className="item contentxt">
                    <Tabs defaultActiveKey="finalList" onSelect={this.updateTab}>
                        <Tab eventKey="finalList" title="Final List">

                        </Tab>
                        <Tab eventKey="tech" title="Tech">

                        </Tab>
                        <Tab eventKey="blockchain" title="BlockChain">
                        </Tab>
                        <Tab eventKey="finance" title="Finance">
                        </Tab>
                        <Tab eventKey="toVote" title="To Vote" disabled={this.state.claimArticles == null || Object.keys(this.state.claimArticles).length == 0}>
                        </Tab>
                    </Tabs>
                    {this.state.view === "List" ?
                        this.state.articles.length == 0 ?
                            <div className="item" style={{ width: '100vw', height: '100vh' }}><div className='item loader'></div></div> :
                            <div className="articles"> {this.getArticleList()} </div> :
                        this.state.view === "Content" ?
                            <BlogView blog={this.state.currentBlog} goEdit={this.goToEditBlog} goBack={this.goBackToList} /> :
                            <NewBlog saveNewBlog={this.saveNewBlog} currentBlog={this.state.currentBlog}
                                currentBlogContent={this.state.currentBlogContent} goBack={this.goBackToList} />}
                </div>
                <Toast show={this.state.showVoteToaster} style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    minHeight: '100px',
                    minWidth: '300px',
                    fontSize: "25px",
		    backgroundColor: "#f4fafe"
                }} onClose={this.closeToast} delay={3000} autohide>
                    <Toast.Header>
                    </Toast.Header>
                    <Toast.Body>Vote Success! </Toast.Body>
                </Toast>
            </div> : <LoginView />);

    }

}

export default MainView;
