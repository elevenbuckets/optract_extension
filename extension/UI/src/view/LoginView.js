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
            modalOpen: false
        }

    }

    componentDidMount() {
    }

    unlock = (event) => {
        if (event.keyCode == 13) {
            var port = chrome.runtime.connect();
            let variable = this.refs.ps.value;
            this.refs.ps.value = "";
            port.postMessage(JSON.stringify({ type: "Connect_WS-RPC", text: "This is the request for connect RPC", id: "dapp_1" }));
            port.onMessage.addListener(function (msg) {
                console.log(msg);
                DlogsActions.unlock(variable);
            });

        }
    }



    handleClose = () => {
        this.setState({ modalOpen: false })
    }


    render() {
        return (
            <div className="item contentxt">
                <div className="item login"> <label style={{ margin: '10px', alignSelf: "flex-end" }}>Password: </label>
                    <input autoFocus style={{ alignSelf: 'flex-start' }} type="password" ref="ps" onKeyUp={this.unlock} />
                </div></div>);
    }

}

export default LoginView;
