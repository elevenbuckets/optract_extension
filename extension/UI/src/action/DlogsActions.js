import Reflux from "reflux"

let DlogsActions = Reflux.createActions(["connectRPC", "saveNewBlog", "fetchBlogContent", "unlock", "refresh",
 "deleteBlog", "editBlog", "updateTab", "updateState", "vote", "claim", "closeToast", "ticketWon", "closeOpt", "allAccounts", "serverCheck"]);

export default DlogsActions
