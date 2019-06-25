import Reflux from "reflux";
import React from "react";

import DlogsStore from "../store/DlogsStore";
import DlogsActions from "../action/DlogsActions";
import BlogView from "./BlogView";
import NewBlog from "./NewBlog";

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

    getBlogList = () => {
        return this.state.blogs.map((blog, idx) => {
            let magic = 1;
            let layout = magic == 0 ? 'rpicDiv' : 'lpicDiv';
            let prefix = magic == 0 ? 'r' : 'l';
            return <div className={layout} onClick={this.goToBlog.bind(this, blog)}>

                <div className={prefix + 'title'} style={{ color: 'rgb(155,155,155,0.85)' }}>
                    <p style={{ fontSize: "28px", color: '#969698' }}>{blog.title}</p>
                    {renderHTML(marked(blog.TLDR))}
                </div>
                <div className={prefix + 'pic'}
                style={{width: '85px', height: '85px' }}>
                <figure class="article_image"
                style={{backgroundImage: `url('assets/erebor.png')`}}>
                </figure>
            </div>
              
                   
            </div>
        })
    }

    goToBlog = (blog) => {
        DlogsActions.fetchBlogContent(blog.url);
        this.setState({ view: "Content", currentBlog: blog });
    }

    goToNewBlog = () => {
        this.setState({ view: "New", currentBlog: "" })
    }

    goToEditBlog = () => {
        this.setState({ view: "Edit" })
    }

    goBackToList = () => {
        this.setState({ view: "List", currentBlog: "" })
    }

    saveNewBlog = (blogTitle, blogTLDR, blogContent) => {
    
        this.state.view == "New"? DlogsActions.saveNewBlog(blogTitle, blogTLDR, blogContent):
        DlogsActions.editBlog(blogTitle, blogTLDR, blogContent,this.state.currentBlog.ipfsHash);
        this.goBackToList()
    }

    unlock = (event) => {
        if (event.keyCode == 13) {
            let variable = this.refs.ps.value;
            this.refs.ps.value = "";
            DlogsActions.unlock(variable);
        }
    }

    refresh = () =>{
        DlogsActions.refresh();
    }

    render() {
        return ( <div className="item contentxt">
            {this.state.view === "List" ? this.state.blogs.length == 0 ? <div className="item" style={{width: '100vw', height: '80vh'}}><div className='item loader'></div></div>: <div className="articles"> {this.getBlogList()} </div> :
                this.state.view === "Content" ? <BlogView blog={this.state.currentBlog} goEdit={this.goToEditBlog} goBack={this.goBackToList} />
                    : <NewBlog saveNewBlog={this.saveNewBlog} currentBlog={this.state.currentBlog}
                    currentBlogContent={this.state.currentBlogContent} goBack={this.goBackToList} />}
        </div> );

    }

}

export default MainView;
