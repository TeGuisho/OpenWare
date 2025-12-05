import React from "react";
import './SubscribingWindow.css';

export default function SubscribingWindow() {

    function handleClick(e) {
        e.preventDefault();
        const element = document.querySelector(".subscribing-win")
        element.setAttribute("style", "display: none;")
    }
    return (
        <div className="subscribing-win">
            <div className="subs-header">
                <span>Eboda PhotoChat </span>
                <span className="close-button" onClick={handleClick}>X</span>
            </div>

            <div className="subscribing-offer">
                <p>Veuillez renouvelez votre abonnement</p>
                <span>13.10€</span>
                <div className="button">S'abonner</div>
            </div>
        </div>
    );
}