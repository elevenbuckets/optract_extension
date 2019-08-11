import Reflux from "reflux";
import React from "react";

import DlogsStore from "../store/DlogsStore";
import {Modal, Button} from "react-bootstrap";

import DlogsActions from "../action/DlogsActions";
import { createCanvasWithAddress } from "../util/Utils";



class SideBarView extends Reflux.Component {

    constructor(props) {
        super(props);
        this.store = DlogsStore;
        this.state = {
            modalOpen: false
        }

    }

    componentDidMount() {
        createCanvasWithAddress(this.refs.canvas, this.state.address);
    }

    claim = () => {
        this.setState({modalOpen: true})

        var port = chrome.runtime.connect();
        port.postMessage(JSON.stringify({ type: "Connect_WS-RPC", text: "This is the request for connect RPC", id: "dapp_1" }));
        window.postMessage({ type: "Connect_WS-RPC", text: "This is the request for connect RPC", id: "dapp_1" }, "*");
    }


    handleClose = () => {
        this.setState({modalOpen: false})
    }


    render() {
        return (
            <div>
                <div className="address">
                    <canvas className="avatar" ref='canvas' width="90px" height="90px" style={
                        this.state.address in this.state.passManaged ? this.state.passManaged[this.state.address] === true ? { border: '4px solid rgba(255,255,255,0.73)' } : { border: '4px solid rgba(255,0,0,0.73)' } : { border: '4px solid rgba(255,255,255,0.73)' }
                    } />
                </div>
                <div>
                    The status: {this.state.memberShipStatus}
                </div>
                <div>
                    <input type="button" className="button" defaultValue="Claim"
                        onClick={this.claim} />
                </div>
                <Modal show={this.state.modalOpen} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Claim Rewards</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                  </Button>
                        <Button variant="primary" onClick={this.handleClose}>
                            Save Changes
                  </Button>
                    </Modal.Footer>
                </Modal>
            </div>);
    }

}

export default SideBarView;
