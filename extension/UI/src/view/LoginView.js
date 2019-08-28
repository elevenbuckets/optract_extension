import Reflux from "reflux";
import React from "react";

import DlogsStore from "../store/DlogsStore";
import { Form, Button } from "react-bootstrap";

import DlogsActions from "../action/DlogsActions";
import { createCanvasWithAddress } from "../util/Utils";

import Dropdown from 'react-bootstrap/Dropdown';


class LoginView extends Reflux.Component {

    constructor(props) {
        super(props);
        this.store = DlogsStore;
        this.state = {
            log: false
        }

    }

    componentDidMount() {
	    if (this.state.wsrpc !== true) {
		    DlogsActions.connectRPC();
	    } else {
		    DlogsActions.allAccounts();
	    }
    }

    handleSelect = (eventkey, event) => {
	this.setState({account: eventkey});
    }

    unlock = (event) => {
        if (event.keyCode == 13) {
            // var port = chrome.runtime.connect();
            let variable = this.refs.ps.value;
            this.refs.ps.value = "";

            DlogsActions.unlock(variable);
        }
    }

    listAccounts = () =>
    {
	return (
		<Dropdown.Menu>
		{
		  this.state.allAccounts.map((acc) => {
			return <Dropdown.Item eventKey={acc} style={{color: '#28a745', fontSize: '20px'}}>{acc}</Dropdown.Item>
		  })
	        }
		</Dropdown.Menu>
	);
    }

    handleClose = () => {
        this.setState({ modalOpen: false })
    }


    render() {
	    console.log(`DEBUG: wsrpc = ${this.state.wsrpc}`)
	    console.dir(this.state.allAccounts)
	    document.getElementById('app').style.backgroundImage = 'url(assets/loginbg.jpg)';
        return (
            <div className="item contentxt">
                { this.state.wsrpc === false ? <div className="item login"><div className="item loader"></div>
                    <label className="loaderlabel">Starting local node, should takes about 15 secs or so...</label></div> :
		  this.state.logining ? <div className="item login"><div className="item loader"></div>
		    <label className="loaderlabel">Connect and retrieve article streams ...</label>
                    </div> : <div className="item login"><div>
			<Dropdown onSelect={this.handleSelect}>
			  <Dropdown.Toggle style={{fontSize: '20px'}} variant="success" id="dropdown-basic">
				{this.state.account === null ? "Please select an account" : this.state.account}
			  </Dropdown.Toggle>
			  {this.listAccounts()}
			</Dropdown>
			<label style={{ margin: '10px', alignSelf: "flex-end" }}>Password: </label>
                        <input autoFocus style={{ alignSelf: 'flex-start' }} type="password" ref="ps" onKeyUp={this.unlock} />
			</div></div>}
            </div>);
    }

}

export default LoginView;
