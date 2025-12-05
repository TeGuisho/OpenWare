import React from "react";
import {Notification, SubscribingWindow, TrackingWindow, Downloader} from './index';
import './Monitor.css';

export default function Monitor() {
    return (
        <div className="monitor">
            <Downloader/>
            <TrackingWindow/>
            <SubscribingWindow/>
            <Notification/>
        </div>
    );
}