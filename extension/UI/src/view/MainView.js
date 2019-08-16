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

    // getBlogList = () => {
    //     return this.state.articles.filter(blog => this.state.activeTabKey === "finalList" ? true : blog.tag === this.state.activeTabKey).map((blog, idx) => {
    //         let magic = 1;
    //         let layout = magic == 0 ? 'rpicDiv' : 'lpicDiv';
    //         let prefix = magic == 0 ? 'r' : 'l';
    //         return <div className={layout} onClick={this.goToBlog.bind(this, blog)}>

    //             <div className={prefix + 'title'} style={{ color: 'rgb(155,155,155,0.85)' }}>
    //                 <p style={{ fontSize: "28px", color: '#969698' }}>{blog.title}</p>
    //                 {renderHTML(marked(blog.TLDR))}
    //             </div>
    //             <div className={prefix + 'pic'}
    //                 style={{ width: '85px', height: '85px' }}>
    //                 <figure class="article_image"
    //                     style={{ backgroundImage: `url('assets/erebor.png')` }}>
    //                 </figure>
    //                 <input type="button" className="button" defaultValue="Vote" style={{ position: 'relative', right: '25px' }} onClick={this.props.goBack} />
    //             </div>


    //         </div>
    //     })
    // }

    getArticleList = () =>{

        let articles = this.state.activeTabKey == "toVote"? this.state.claimArticles : this.state.articles;
        return Object.keys(articles).filter(aid =>{
            if(this.state.activeTabKey == "finalList" || this.state.activeTabKey == "toVote"){
                return true;
            }
            return articles[aid].tags.tags.includes(this.state.activeTabKey)
        } ).map((aid) => {
            let magic = 1;
            let layout = magic == 0 ? 'rpicDiv' : 'lpicDiv';
            let prefix = magic == 0 ? 'r' : 'l';
            let article = articles[aid];
            return <div className={layout} onClick={this.goToArticle.bind(this, article)}>

                <div className={prefix + 'title'} style={{ color: 'rgb(155,155,155,0.85)' }}>
                    <p style={{ fontSize: "28px", color: '#969698' }}>{article.page.title}</p>
                    {renderHTML(marked(article.page.excerpt))}
                </div>
                <div className={prefix + 'pic'}
                    style={{ width: '85px', height: '85px' }}>
                    <figure class="article_image"
                        style={{ backgroundImage: `url('assets/erebor.png')` }}>
                    </figure>
                    <input type="button" className="button" defaultValue="Vote" style={{ position: 'relative', right: '25px' }} onClick={this.props.goBack} />
                </div>


            </div>
        })
    }

    goToArticle = (article) => {
        DlogsActions.fetchBlogContent(article);
        this.setState({ view: "Content", currentBlog: article });
    }

    // goToNewBlog = () => {
    //     this.setState({ view: "New", currentBlog: "" })
    // }

    // goToEditBlog = () => {
    //     this.setState({ view: "Edit" })
    // }

    goBackToList = () => {
        this.setState({ view: "List", currentBlog: "" })
    }

    // saveNewBlog = (blogTitle, blogTLDR, blogContent) => {

    //     this.state.view == "New" ? DlogsActions.saveNewBlog(blogTitle, blogTLDR, blogContent) :
    //         DlogsActions.editBlog(blogTitle, blogTLDR, blogContent, this.state.currentBlog.ipfsHash);
    //     this.goBackToList()
    // }

    // unlock = (event) => {
    //     if (event.keyCode == 13) {
    //         let variable = this.refs.ps.value;
    //         this.refs.ps.value = "";
    //         DlogsActions.unlock(variable);
    //     }
    // }

    // refresh = () => {
    //     DlogsActions.refresh();
    // }
    updateTab = (activeKey) => {
        DlogsActions.updateTab(activeKey);
        this.goBackToList();
    }

    render() {
        return (this.state.login ?
            <div className="content">
                <div className="sidebar">
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
                        <Tab eventKey="toVote" title="To Vote" >
                        </Tab>
                    </Tabs>

                    {this.state.view === "List" ? this.state.articles.length == 0 ? <div className="item" style={{ width: '100vw', height: '80vh' }}><div className='item loader'></div></div> : <div className="articles"> {this.getArticleList()} </div> :
                        this.state.view === "Content" ? <BlogView blog={this.state.currentBlog} goEdit={this.goToEditBlog} goBack={this.goBackToList} />
                            : <NewBlog saveNewBlog={this.saveNewBlog} currentBlog={this.state.currentBlog}
                                currentBlogContent={this.state.currentBlogContent} goBack={this.goBackToList} />}
                </div>
            </div> : <LoginView />);

    }

}

export default MainView;
