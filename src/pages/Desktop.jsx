import "./Desktop.css";

import {Alice, Box, Laptop, Phone, Background, GoToScreen} from '../components/index.jsx';
export default function Desktop() {
    return(
        <div className="Desktop">
            <Background/>
            <Box/>
            <Phone/>
            <Laptop/>
            <Alice/>
            <GoToScreen/>
        </div>
    )
}