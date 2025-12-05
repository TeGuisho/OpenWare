import React from "react";
import {Notification, SubscribingWindow} from './index';
import './Monitor.css';

export default function Monitor() {
    return (
        <div className="monitor">
            <SubscribingWindow/>
            <Notification/>
        </div>
    );
}