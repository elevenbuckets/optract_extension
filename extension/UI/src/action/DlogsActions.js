import Reflux from "reflux"

let DlogsActions = Reflux.createActions(["connectRPC", "saveNewBlog", "fetchBlogContent", "unlock", "refresh", "loadMore", "opStateProbe", 'newAccount', 'opSurvey',
 "deleteBlog", "editBlog", "updateTab", "updateState", "vote", "claim", "closeToast", "ticketWon", "closeOpt", "allAccounts", "serverCheck", "streamrSwitch"]);

export default DlogsActions
