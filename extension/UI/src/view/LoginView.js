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
	this.accTimer = null;
	this.linecount = 0;
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
	    } else if ( this.state.account !== null 
		     && this.state.readiness === true 
		     && this.state.validPass === true
		     && this.state.MemberStatus === 'not member'
		     && this.state.login === false
	    ) {
		    console.log(`DEBUG: login view did update state probe hook called ...`)
		     if (this.accTimer === null) {
		    	     console.log(`DEBUG: login view did update state probe hook activated ...`)
			     this.accTimer = setInterval(() => { 
				 DlogsActions.opStateProbe(); 
				 this.randomInfo.apply(this, []);
			     }, 30007);
		     }
	    }
    }

    componentWillUnmount() {
	    clearInterval(this.accTimer);
	    this.accTimer = null;
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

    randomInfo = () =>
    {
	let info = [
	    "Optract is an unique content discovery and curation platform that refines what you read online and gain deeper insights. Powered by collective intelligence, it becomes smarter when you are.", "Our goal is to offer means for individuals to join forces on amplifying truly valuable online content while driving away biased influencers and materials.", "Designed to be a co-hosted network, Optract wants to be a place where NO ONE has more power over others", "Anyone can participate the operation of Optract under certain rules that are enforced by software and protocols.", "While we do monetize on user data, you have the right to say no, or you can support us by revealing data the way you see fit and get a share of our revenue from it.", "We understand the importance of PRIVACY and want you to be connected while not giving away any personal information that you don't want to give.", "Being hightly transparent on Optract services and data usage, we want to be the platform that empowers and not enslaves our users", "We hope you will enjoy Optract and help us keep growing our community in order to drive the movement of taking back our data and our Web!"
	];

	document.getElementsByClassName("infoWait")[0].style.alignContent = 'baseline';
	this.linecount > info.length - 1 ? this.linecount = 0 : this.linecount;

	this.props.updateState({signUpInfo: info[this.linecount]});
	this.linecount++;
    }    

    signUpPanel = () =>
    {
	    return (<div className="item" style={{margin: '0px 24px', borderBottom: '1px solid white', backgroundColor: 'rgba(0,0,0,0)'}}> 
		      <div className="item SignUpShow">
		        <label className="item registerInfo">
			   <p style={{ padding: '0px', margin: '0px' }}>
			      Signing You Up, Please Wait
			      <span className="dot dotOne">.</span><span className="dot dotTwo">.</span><span className="dot dotThree">.</span>
			   </p>
		        </label>
			<div className="item infoWait">{this.props.signUpInfo}</div> 
		      </div>
		    </div>)
    }

    render() {
	    console.log(`DEBUG: wsrpc = ${this.state.wsrpc}`)
	    console.log(`DEBUG: account = ${this.state.account}`)
	    console.log(`DEBUG: readiness = ${this.state.readiness}`)
	    console.log(`DEBUG: validPass = ${this.state.validPass}`)
	    console.log(`DEBUG: memberStatus = ${this.state.MemberStatus}`);
	    console.log(`DEBUG: accountBalance = ${this.state.AccountBalance}`);

	    if (this.state.wsrpc === false || this.state.logining) {
		    document.getElementById('app').style.background = 'url(assets/loginbg2.png),linear-gradient(-10deg,lightgray 0, #000000aa)';
	    } else {
		    document.getElementById('app').style.background = 'url(assets/loginbg2.png)';
	    	    document.getElementById('app').style.animation = 'fadeInOpacity 2s ease-in-out 1';
	    }

	    document.getElementById('app').style.backgroundAttachment = 'fixed';

            document.getElementById('app').style.backgroundBlendMode = 'multiply';
            document.getElementById('app').style.animation = '';
            document.getElementById('app').style.backgroundOrigin = 'border-box';
            document.getElementById('app').style.backgroundRepeat = 'no-repeat';
            document.getElementById('app').style.backgroundPosition = 'center';
            document.getElementById('app').style.backgroundSize = 'cover';

        return (
	    <div className="content" style={this.state.wsrpc === false || this.state.logining ? {background: 'unset'} : {background: "inherit"}}>
            <div className="item contentxt" style={this.state.wsrpc === false || this.state.logining ? {background: "unset"} : {background: "inherit"}}>
                { this.state.wsrpc === false ? <div className="item login" style={{height: 'calc(100vh - 100px)'}}><div className="textloader">Starting Node...</div></div> :
		  this.state.logining ? <div className="item login" style={{height: 'calc(100vh - 100px)'}}><div className="textloader">Connecting...</div></div> : <div className="item login" style={{height: 'calc(100vh - 100px)', background: "inherit"}}>
		     <div className="glassTop">
			<div className="item" style={{backgroundColor: 'rgba(0,0,0,0)', minWidth: '30vw', margin: '24px', borderBottom: '1px solid white'}}>
			     Welcome to Optract
			</div>
			{ this.state.accListSize === 0 
				? this.state.readiness ? this.state.validPass ? <div className="item newAccount" onClick={this.genNewAccount.bind(this)}>{this.state.generate ? <p style={{ padding: '0px 90px', margin: '0px' }}><span className="dot dotOne">-</span><span className="dot dotTwo">-</span><span className="dot dotThree">-</span></p> : `Create New Account`}</div> : <div className="item" style={{ backgroundColor: 'rgba(0,0,0,0)'}}> Please Enter Your Master Password: </div> : <div className="item" style={{ backgroundColor: 'rgba(0,0,0,0)'}}> Please Set Your Master Password: </div>
				: typeof(this.state.account) !== 'undefined' && this.state.MemberStatus === 'not member' 
				? this.signUpPanel.apply(this, [])
				: <Dropdown onSelect={this.handleSelect} style={{backgroundColor: 'rgba(0,0,0,0)'}}>
			  <Dropdown.Toggle style={{fontSize: '20px', fontFamily: 'monospace'}} variant="success" id="dropdown-basic">
				{typeof(this.state.account) === 'undefined' ? " Please select your login account... " : this.state.account}
			  </Dropdown.Toggle>
			  {this.listAccounts()}
			</Dropdown>} 
			{!this.state.validPass ? <div>
			<label style={{ margin: '10px', alignSelf: "flex-end", fontSize: '24px'}}>Password: </label>
			<input autoFocus 
			       style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', border: '0px'}} 
			       type="password" ref="ps" onKeyUp={this.unlock} />
			</div> : <div>
                        <label style={{ margin: '10px', alignSelf: "flex-end", fontSize: '24px'}}>Master Password Unlocked.</label></div>}
		     </div>
		     </div>}
            </div></div>);
    }

}

export default LoginView;
