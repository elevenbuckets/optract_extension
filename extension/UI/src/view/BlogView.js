import Reflux from "reflux";
import React from "react";

import DlogsStore from "../store/DlogsStore";

import renderHTML from 'react-render-html';
import marked from "marked";
import DlogsActions from "../action/DlogsActions";


class BlogView extends Reflux.Component {

    constructor(props) {
        super(props);
        this.store = DlogsStore;
    }

    // delete = () => {
    //     DlogsActions.deleteBlog(this.props.blog.ipfsHash);
    //     this.props.goBack();
    // }


    render() {
        return (
            <div className="readloader">
                <div style={{ overflow: 'scroll', maxHeight: "85vh", color: '#6d6d6d', padding: "10px" }}>
                    <div style={{ textAlign: 'center', fontSize: '25px', padding: "35px", textDecoration: 'underline' }}>{this.props.blog.title}</div>
                    {renderHTML(marked(this.state.currentBlogContent))}
                </div>
                {
                    this.props.blog.author == this.state.account ? <div className="item secondmainctr"> <input type="button" className="button" defaultValue="Back" onClick={this.props.goBack} />
                        <input type="button" className="button" defaultValue="Edit" onClick={this.props.goEdit} />
                        <input type="button" className="button" defaultValue="Delete" onClick={this.delete} /></div> :
                        <div className="item secondmainctr"> <input type="button" className="button" defaultValue="Vote"  />
                            <input type="button" className="button" defaultValue="Back" onClick={this.props.goBack} /> </div>}
            </div>);
    }

}

export default BlogView;
