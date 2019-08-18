import Reflux from "reflux"

let DlogsActions = Reflux.createActions(["saveNewBlog", "fetchBlogContent", "unlock", "refresh",
 "deleteBlog", "editBlog", "updateTab", "updateState", "vote","closeToast"]);

export default DlogsActions