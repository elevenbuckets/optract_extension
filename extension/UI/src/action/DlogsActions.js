import Reflux from "reflux"

let DlogsActions = Reflux.createActions(["connectRPC", "saveNewBlog", "fetchBlogContent", "unlock", "refresh", "loadMore", "opStateProbe", 'newAccount',
 "deleteBlog", "editBlog", "updateTab", "updateState", "vote", "claim", "closeToast", "ticketWon", "closeOpt", "allAccounts", "serverCheck"]);

export default DlogsActions
