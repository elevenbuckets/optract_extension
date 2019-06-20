'use strict';

// Major third-party modules
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Reflux from 'reflux';

// Reflux store
import WalletStates from '../store/WalletStates';

// Reflux actions
import WalletActions from '../action/WalletActions';

// Views
import Transfer from './Transfer';
import Accounts from './Accounts';

class MainView extends Reflux.Component {
	constructor(props) {
		super(props);
		this.store = WalletStates;
	}


	updateState = (key, e) => {
		this.setState({ [key]: e.target.value });
	}

	passAccRef = () => {
		return ReactDOM.findDOMNode(this.refs.Accounts).firstChild;
	}

	render() {
		console.log("In MainView render(); syncInProgress = " + this.state.syncInProgress);

		if (this.state.connected === false) {
			document.body.style.background = "rgb(17, 31, 47)";
			return (
				<div className="container locked" style={{ background: "rgb(17, 31, 47)" }}>
					<div className="item list" style={{ background: "none" }}>
						<div style={{ border: "2px solid white", padding: "40px", textAlign: "center" }}>
							<div className="loader syncpage"></div><br />
							<p style={{ alignSelf: "flex-end", fontSize: "24px", marginTop: "10px" }}>
								Lost local Ethereum node connection ...
				    </p>
						</div>
					</div>
				</div>
			);
		} else if (this.state.wait4peers === true) {
			document.body.style.background = "rgb(17, 31, 47)";
			return (
				<div className="container locked" style={{ background: "rgb(17, 31, 47)" }}>
					<div className="item list" style={{ background: "none" }}>
						<div style={{ border: "2px solid white", padding: "40px", textAlign: "center" }}>
							<div className="loader syncpage"></div><br />
							<p style={{ alignSelf: "flex-end", fontSize: "24px", marginTop: "10px" }}>
								Awaiting incomming blocks from peers ...
				    </p>
						</div>
					</div>
				</div>
			);
		} else if (this.state.syncInProgress === true) {
			document.body.style.background = "linear-gradient(-180deg, rgb(17, 31, 47), rgb(24, 156, 195))";
			return (
				<div className="container locked" style={{ background: "none" }}>
					<div className="item list" style={{ background: "none" }}>
						<div style={{ border: "2px solid white", padding: "40px", textAlign: "center" }}>
							<div className="loader"></div><br />
							<p style={{ alignSelf: "flex-end", fontSize: "24px", marginTop: "10px" }}>
								Block syncing in progress {this.state.blockHeight} / {this.state.highestBlock} ...
				    </p>
						</div>
					</div>
				</div>
			);
		} else {
			document.body.style.background = "rgb(11, 41, 57)";
			return (
				<div className="item container unlocked">
					<Accounts ref="Accounts" />
					<Transfer />
				</div>
			)
		}
	}
}

export default MainView;

