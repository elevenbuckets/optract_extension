import Reflux from "reflux"

let DlogsActions = Reflux.createActions(["saveNewBlog", "fetchBlogContent", "unlock", "refresh", "deleteBlog", "editBlog"]);

export default DlogsActions