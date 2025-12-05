import './GoToDesktop.css';
import {  useNavigate } from "react-router-dom";

export default function GoToScreen() {
    const navigate = useNavigate();
    function GoToScreen() {
      navigate("/screen");
    }
    return (
        <div className="gotoscreen" onClick={GoToScreen}>
            Screen
        </div>
    );
}