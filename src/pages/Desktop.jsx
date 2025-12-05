import React from "react";

import Alice from "../components/Alice.jsx";
import Back from "../components/Back.jsx";
import "./Desktop.css";
import Box from "../components/Box.jsx";
import Laptop from "../components/Laptop.jsx";
import Phone from "../components/Phone.jsx";

export default function Desktop() {
    return(
        <div className="Desktop">
            <Back/>
            <Alice/>
            <Box/>
            <Laptop/>
            <Phone/>
        </div>
    )
}