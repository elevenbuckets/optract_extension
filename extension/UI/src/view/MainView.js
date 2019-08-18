import Reflux from "reflux";
import React from "react";
import { Tabs, Tab } from "react-bootstrap";

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

    getArticleList = () =>{
        let articles = this.state.articles;
        return Object.keys(articles).filter(aid =>{
            if(articles[aid].page.lead_image_url !== null && articles[aid].page.excerpt.length >= 100){
                return true;
            }
        } ).map((aid) => {
            let article = articles[aid];
            return <div className="aidcard" onClick={this.goToArticle.bind(this, article)}>
                <div className="aidtitle">
                    <p style={{ padding: '3px', fontWeight: 'bold', color: '#000000' }}>{article.page.title}</p>
                    {renderHTML(marked(article.page.excerpt.substring(0,242) + '...'))}
                </div>
                <div className="aidpic">
                    <img src={article.page.lead_image_url ? article.page.lead_image_url : 'assets/golden_blockchain.png'}></img>
                </div>
                <div className="aidclk">
                    <input type="button" className="button" defaultValue="Vote" style={{ textAlign: 'center', right: '25px' }} onClick={this.props.goBack} />
                </div>
            </div>
        })
    }

    goToArticle = (article) => {
        window.open(article.page.url, '_blank');
        //DlogsActions.fetchBlogContent(article);
        //this.setState({ view: "Content", currentBlog: article });
    }

    goBackToList = () => {
        this.setState({ view: "List", currentBlog: "" })
    }

    updateTab = (activeKey) => {
        DlogsActions.updateTab(activeKey);
        this.goBackToList();
    }

    render() {
        return (this.state.login ?
            <div className="content">
                <div className="sidebar"><SideBarView /></div>
                <div className="item contentxt">
                    {this.state.view === "List" ? 
			    this.state.articles.length == 0 ? 
			      <div className="item" style={{ width: '100vw', height: '100vh' }}><div className='item loader'></div></div> : 
			      <div className="articles"> {this.getArticleList()} </div> : 
			         this.state.view === "Content" ? 
			         <BlogView blog={this.state.currentBlog} goEdit={this.goToEditBlog} goBack={this.goBackToList} /> : 
			         <NewBlog saveNewBlog={this.saveNewBlog} currentBlog={this.state.currentBlog}
                                          currentBlogContent={this.state.currentBlogContent} goBack={this.goBackToList} />}
                </div>
            </div> : <LoginView />);

    }

}

export default MainView;
