import React from "react";
import {Notification, SubscribingWindow, TrackingWindow} from './index';
import './Monitor.css';

export default function Monitor() {
    return (
        <div className="monitor">
            <TrackingWindow/>
            <SubscribingWindow/>
            <Notification/>
        </div>
    );
}