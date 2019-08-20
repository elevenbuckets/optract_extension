import Reflux from "reflux";
import React from "react";

import DlogsStore from "../store/DlogsStore";
import { Form, Button } from "react-bootstrap";

import DlogsActions from "../action/DlogsActions";
import { createCanvasWithAddress } from "../util/Utils";



class LoginView extends Reflux.Component {

    constructor(props) {
        super(props);
        this.store = DlogsStore;
        this.state = {
            log: false
        }

    }

    componentDidMount() {
	    if (this.state.wsrpc !== 'connected') DlogsActions.connectRPC();
    }

    unlock = (event) => {
        if (event.keyCode == 13) {
            // var port = chrome.runtime.connect();
            let variable = this.refs.ps.value;
            this.refs.ps.value = "";

            DlogsActions.unlock(variable);
        }
    }



    handleClose = () => {
        this.setState({ modalOpen: false })
    }


    render() {
        return (
            <div className="item contentxt">
                {this.state.logining ? <div className="item login"> <label style={{ margin: '10px', alignSelf: "flex-end" }}>Starting the peer, need less than 15 seconds </label>
                    </div> : <div className="item login"> <label style={{ margin: '10px', alignSelf: "flex-end" }}>Password: </label>
                        <input autoFocus style={{ alignSelf: 'flex-start' }} type="password" ref="ps" onKeyUp={this.unlock} />
                    </div>}
            </div>);
    }

}

export default LoginView;
