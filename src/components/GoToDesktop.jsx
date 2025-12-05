import React from "react";
import './GoToDesktop.css';
import { Navigate } from "react-router";

export default function GoToDesktop() {

    function GoDesktop() {
      Navigate("/");
    }
    return (
        <div className="gotodesktop" onClick={GoDesktop}>
            Screen
        </div>
    );
}