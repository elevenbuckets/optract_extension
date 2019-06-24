import Reflux from "reflux";
import React from "react";

import DlogsStore from "../store/DlogsStore";
import DlogsAction from "../action/DlogsActions";

import renderHTML from 'react-render-html';
import marked from "marked";
import ReactQuill from "react-quill";



class NewBlog extends Reflux.Component {

    constructor(props) {
        super(props);
        this.state = props.currentBlog === "" ? {
            isEditable: true,
            blogContent: "",
            blogTitle: "",
            blogTLDR: ""
        } : {
                isEditable: true,
                blogContent: props.currentBlogContent,
                blogTitle: props.currentBlog.title,
                blogTLDR: props.currentBlog.TLDR
            }

        this.store = DlogsStore;
    }

    getEditView = () => {
        let modules = {
            toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image'],
                [{'align': []}],
                ['code-block'],
                ['clean']
            ],
        };

        let formats = [
            'header',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image', 'align', 'code-block'
        ];
        return <form className="newForm" style={{ width: '96vw', height: '85vh', textAlign: 'center' }}>
            <textarea placeholder="Title" style={{
                width: '100%', height: '30px', backgroundColor: 'rgba(0,0,0,0)',
                border: '2px solid white', color: 'white'
            }} onChange={this.udpateBlog.bind(this, "blogTitle")} value={this.state.blogTitle}></textarea>
            <textarea placeholder="TL;DR" style={{
                width: '100%', height: '5vh', backgroundColor: 'rgba(0,0,0,0)',
                border: '2px solid white', color: 'white'
            }} onChange={this.udpateBlog.bind(this, "blogTLDR")} value={this.state.blogTLDR}></textarea>
            <ReactQuill value={this.state.blogContent} theme='snow' onChange={this.handleChangeBlogContent} modules={modules} formats={formats} style={{width: "100%", height: '90%'}}/>
        </form>

    }

    udpateBlog = (field, event) => {
        this.setState({ [field]: event.target.value })
    }

    handleChangeBlogContent = content =>{
        this.setState({ "blogContent": content })
    }

    saveNewBlog = () => {
        this.props.saveNewBlog(this.state.blogTitle, this.state.blogTLDR, this.state.blogContent);
    }

    changeEditable = () => {
        this.setState({ isEditable: !this.state.isEditable })
    }

    getBlogPreview = () => {
        return <div className="newForm"><div style={{ textAlign: 'center', fontSize: '25px', padding: "35px", textDecoration: 'underline' }}>{this.state.blogTitle}</div>
            <div style={{ overflow: 'scroll', maxHeight: "85vh", color: 'white', padding: "10px" }}>
                {renderHTML(marked(this.state.blogContent))}
            </div></div>
    }


    render() {

        return (

            <div className="item newDiv" >
                {this.state.isEditable ? this.getEditView() : this.getBlogPreview()}

                <input type="button" className="button pbutton" defaultValue={this.state.isEditable ? "Preview" : "Edit"} onClick={this.changeEditable} />
                <input type="button" className="button sbutton" defaultValue="Save" onClick={this.saveNewBlog} />
                <input type="button" className="button bbutton" defaultValue="Back" onClick={this.props.goBack} />

            </div>);

    }

}

export default NewBlog;
