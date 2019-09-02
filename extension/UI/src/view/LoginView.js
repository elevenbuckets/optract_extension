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
	this.log = false;
    }

    componentDidMount() {
	    if (this.state.wsrpc !== true) DlogsActions.connectRPC();
    }

    componentDidUpdate() {
	    if (this.state.wsrpc === true && this.state.account === null) {

		    if (this.state.allAccounts.length === 0) DlogsActions.allAccounts();
		    if (this.log === false) {
	    	    	    console.log(`DEBUG: did update...`)
			    DlogsActions.serverCheck();
		            this.log = true;
		    }
	    }
    }

    handleSelect = (eventkey, event) => {
	console.log(`account: ${eventkey}`)
	this.setState({account: eventkey});
    }

    unlock = (event) => {
        if (event.keyCode == 13) {
            let variable = this.refs.ps.value;
	    let account = this.state.account || null;
            this.refs.ps.value = "";

            DlogsActions.unlock(variable, account);
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
	    console.log(`DEBUG: account = ${this.state.account}`)
	    console.dir(this.state.allAccounts);
        return (
            <div className="item contentxt" style={{backgroundImage: 'url(assets/loginbg.jpg)'}}>
                { this.state.wsrpc === false ? <div className="item login"><div className="item loader"></div>
                    <label className="loaderlabel">Starting local node, should takes about 15 secs or so...</label></div> :
		  this.state.logining ? <div className="item login"><div className="item loader"></div>
		    <label className="loaderlabel">Connect and retrieve article streams ...</label>
                    </div> : <div className="item login">
			<div style={{display: 'inline-block', margin: '30px 30px 15px 30px', padding: '5px', alignSelf: 'end'}}>
			<div className="item" style={{backgroundColor: 'rgba(0,0,0,0)', minWidth: '30vw', margin: '24px', borderBottom: '1px solid white'}}>
			     Welcome to Optract
			</div>
			<Dropdown onSelect={this.handleSelect} style={{backgroundColor: 'rgba(0,0,0,0)'}}>
			  <Dropdown.Toggle style={{fontSize: '20px', fontFamily: 'monospace'}} variant="success" id="dropdown-basic">
				{typeof(this.state.account) === 'undefined' ? " Please select your login account... " : this.state.account}
			  </Dropdown.Toggle>
			  {this.listAccounts()}
			</Dropdown>
			</div>
			<div style={{display: 'inline-block', margin: '15px 30px 30px 30px', alignSelf: 'start'}}>
			<label style={{ margin: '10px', alignSelf: "flex-end", fontSize: '24px'}}>Password: </label>
                        <input autoFocus 
			       style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: '0px'}} 
			       type="password" ref="ps" onKeyUp={this.unlock} />
			</div>
		    </div>}
            </div>);
    }

}

export default LoginView;
