import React from "react";
import './TrackingWindow.css';  

export default function TrackingWindow() {
    function handleClick(e) {
        e.preventDefault();
        const element = document.querySelector(".tracking")
        element.setAttribute("style", "display: none;")
    }

    return (
        <div className="tracking">
            <div className="subs-header-track">
                <span> Tracker.io </span>
                <span className="close-button" onClick={handleClick}>X</span>
            </div>
            <div className="legend-tracker">
                <h1>Achetez du fromage de Raclette pour un prix raisonnable !</h1>
                <span><a href="https://commons.wikimedia.org/wiki/File:Raclette_-_001.jpg">source</a></span>
            </div>
            <img className="raclette" src="/src/assets/img/raclette.png" alt="raclette" />
        </div>
    );
}