'use strict';
import DlogsActions from "../action/DlogsActions";

class OptractRest {
    constructor() {
		this.get = url =>{
			return fetch(url).then(resp =>{
				return resp.json();
			})
		}
    }
}

const optractRest = new OptractRest();
export default optractRest;
