import Reflux from "reflux";
import React from "react";

import DlogsStore from "../store/DlogsStore";
import DlogsAction from "../action/DlogsActions";

import DlogsActions from "../action/DlogsActions";
import { createCanvasWithAddress } from "../util/Utils";



class SideBarView extends Reflux.Component {

    constructor(props) {
        super(props);
        this.store = DlogsStore;
        
    }

    componentDidMount(){
        createCanvasWithAddress( this.refs.canvas,this.state.address);
    }

    claim = () =>{
        
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
            </div>);
    }

}

export default SideBarView;
