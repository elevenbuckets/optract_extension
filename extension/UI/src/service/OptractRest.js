'use strict';
import DlogsActions from "../action/DlogsActions";

class OptractRest {
    constructor() {
		this.optract_base_url = "http://optract-api-service.default:80/";
		this.get = path =>{
			return fetch(this.optract_base_url + path).then(resp =>{
				return resp.json();
			})
		}
    }
}

const optractRest = new OptractRest();
export default optractRest;
