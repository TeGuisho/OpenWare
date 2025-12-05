import './GoToDesktop.css';
import {  useNavigate } from "react-router-dom";

export default function GoToDesktop() {
    const navigate = useNavigate();
    function GoDesktop() {
      navigate("/");
    }
    return (
        <div className="gotodesktop" onClick={GoDesktop}>
            Screen
        </div>
    );
}