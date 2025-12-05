import React from "react";
import './Downloader.css';

export default function Downloader() {
    return (
        <div className="downloader">
            <div className="os-card">
                <img src="/src/assets/img/linuxlogo.png" alt="logo de linux" />
                <h1>Télécharger Linux</h1>
            </div>
            <div className="os-card">
                <img src="/src/assets/img/windowslogo.png" alt="logo de windows" />
                <h1>Télécharger Windows</h1>
            </div>
        </div>
    );
}