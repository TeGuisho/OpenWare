import { Monitor, GoToDesktop} from '../components/index';
import './Screen.css'

export default function Screen() {
    return (
        <div className="screen">
            <Monitor/>
            <GoToDesktop/>
        </div>
    );
}