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
    }

    componentDidMount() {
	    if (this.state.wsrpc !== true) DlogsActions.connectRPC();
    }

    componentDidUpdate() {
	    if (this.state.wsrpc === true && this.state.account === null && this.state.readiness === true) {
		    if (this.state.accListSize === -1) DlogsActions.allAccounts();
		    if (this.state.validPass === false) {
	    	    	    console.log(`DEBUG: did update...`)
			    DlogsActions.serverCheck();
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

    handleClose = () => 
    {
        this.setState({ modalOpen: false })
    }

    genNewAccount = () => 
    {
	 this.setState({generate: true});
	 DlogsActions.newAccount();
    }


    //document.getElementById('app').style.background = 'linear-gradient(180deg,#52a9ff 0,#2eff43),url(assets/loadbg3.png)';
    //if (this.state.wsrpc === false || this.state.logining) document.getElementById('app').style.animation = 'colorful 11s ease 1.11s infinite alternate';
    render() {
	    console.log(`DEBUG: wsrpc = ${this.state.wsrpc}`)
	    console.log(`DEBUG: account = ${this.state.account}`)
	    console.log(`DEBUG: readiness = ${this.state.readiness}`)
	    console.log(`DEBUG: validPass = ${this.state.validPass}`)
	    console.dir(this.state.allAccounts);

	    if (this.state.wsrpc === false || this.state.logining) {
		    document.getElementById('app').background = 'url(assets/loginbg2.png),linear-gradient(-10deg,lightgray 0, #000000aa)';
		  //Hue-Rotation enabled themes:  (uncomment the animation as well as one of the three following line)
    		  //document.getElementById('app').style.animation = 'colorful 11s ease 1.11s infinite alternate'; 
		  // contour theme:
    		    //document.getElementById('app').style.background = 'linear-gradient(180deg,#52a9ff 0,#2eff43),url(assets/loadbg3.png)';
		  // ribbin theme:
    		    //document.getElementById('app').style.background = 'linear-gradient(180deg,#52a9ff 0,#2eff43),url(assets/loadbg2.png)';
		  // Optract theme:
    		    //document.getElementById('app').style.background = 'linear-gradient(180deg,#52a9ff 0,#2eff43),url(assets/loadbg.png)';
	    } else {
	    	    document.getElementById('app').style.animation = 'fadeInOpacity 2s ease-in-out 1';
	    	    document.getElementById('app').style.background = 'url(assets/loginbg2.png)';
		  //Hue-Rotation enabled themes:  (uncomment one of the three following line accordingly)
		  // contour theme:
    		    //document.getElementById('app').style.background = 'linear-gradient(180deg,#52a9ff 0,#2eff43),url(assets/loadbg3.png)';
		  // ribbin theme:
    		    //document.getElementById('app').style.background = 'linear-gradient(180deg,#52a9ff 0,#2eff43),url(assets/loadbg2.png)';
		  // Optract theme:
    		    //document.getElementById('app').style.background = 'linear-gradient(180deg,#52a9ff 0,#2eff43),url(assets/loadbg.png)';
	    }

            document.getElementById('app').style.backgroundBlendMode = 'multiply';
            document.getElementById('app').style.animation = '';
            document.getElementById('app').style.backgroundOrigin = 'border-box';
            document.getElementById('app').style.backgroundRepeat = 'no-repeat';
            document.getElementById('app').style.backgroundPosition = 'center';
            document.getElementById('app').style.backgroundSize = 'cover';



        return (
	    <div className="content">
            <div className="item contentxt">
                { this.state.wsrpc === false ? <div className="item login" style={{height: 'calc(100vh - 100px)'}}><div className="textloader" style={{backgroundColor: 'rgba(0,0,0,0)'}}>Starting Node...</div></div> :
		  this.state.logining ? <div className="item login" style={{height: 'calc(100vh - 100px)'}}><div className="textloader" style={{backgroundColor: 'rgba(0,0,0,0)'}}>Connecting...</div></div> : <div className="item login" style={{height: 'calc(100vh - 100px)'}}>
			<div style={{display: 'inline-block', margin: '0px 30px 15px 30px', padding: '5px', alignSelf: 'end'}}>
			<div className="item" style={{backgroundColor: 'rgba(0,0,0,0)', minWidth: '30vw', margin: '24px', borderBottom: '1px solid white'}}>
			     Welcome to Optract
			</div>
			{ this.state.accListSize === 0 
				? this.state.readiness ? this.state.validPass ? <div className="item newAccount" onClick={this.genNewAccount.bind(this)}>{this.state.generate ? <p style={{ padding: '0px 90px', margin: '0px' }}><span className="dot dotOne">-</span><span className="dot dotTwo">-</span><span className="dot dotThree">-</span></p> : `Create New Account`}</div> : <div className="item" style={{ backgroundColor: 'rgba(0,0,0,0)'}}> Please Enter Your Master Password: </div> : <div className="item" style={{ backgroundColor: 'rgba(0,0,0,0)'}}> Please Set Your Master Password: </div>
				: typeof(this.state.account) !== 'undefined' && this.state.MemberStatus === 'not member' 
				?  <div className="item" style={{ backgroundColor: 'rgba(0,0,0,0)'}}> <label>Your Address:</label><div className="item AccountShow">{this.state.account}</div><br/> Please Visit www.optract.com to Register </div>
				: <Dropdown onSelect={this.handleSelect} style={{backgroundColor: 'rgba(0,0,0,0)'}}>
			  <Dropdown.Toggle style={{fontSize: '20px', fontFamily: 'monospace'}} variant="success" id="dropdown-basic">
				{typeof(this.state.account) === 'undefined' ? " Please select your login account... " : this.state.account}
			  </Dropdown.Toggle>
			  {this.listAccounts()}
			</Dropdown> }
			</div>
			{ !this.state.validPass ? <div style={{display: 'inline-block', margin: '15px 30px 30px 30px', alignSelf: 'start'}}>
			<label style={{ margin: '10px', alignSelf: "flex-end", fontSize: '24px'}}>Password: </label>
			<input autoFocus 
			       style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: '0px'}} 
			       type="password" ref="ps" onKeyUp={this.unlock} />
			</div> : <div style={{display: 'inline-block', margin: '15px 30px 30px 30px', alignSelf: 'start'}}>
                        <label style={{ margin: '10px', alignSelf: "flex-end", fontSize: '24px'}}>Master Password Unlocked.</label></div>}
		    </div>}
            </div></div>);
    }

}

export default LoginView;
