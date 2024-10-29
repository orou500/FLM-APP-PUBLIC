import { Link } from "react-router-dom";
import "../style/Navbar.css";
import { Toggle } from "./Toggle";

export const Navbar = ({isChecked, handleChange, auth}) => {
    return (
        <nav>
            <input type="checkbox" id="active" />
            <label htmlFor="active" className="menu-btn"><span></span></label>
            <label htmlFor="active" className="close"></label>
            <div className="wrapper">
                <Toggle
                    isChecked={isChecked}
                    handleChange={handleChange}
                />
                <ul>
                    <li><Link to='/'>בית</Link></li>
                    {
                        auth.length !== 0 ? (
                            <>
                                {/*יכול להוסיף עד 6 אופציות*/}
                                <li><Link to='/profile'>פרופיל</Link></li>
                                <li><Link to='/leagues'>כל הליגות</Link></li>
                                {
                                    !auth.createdLeague || auth.admin ? (<li><Link to='/createleague'>צור ליגה חדשה</Link></li>) : (<></>)
                                }
                            </>
                        ) : (
                            <>
                                {/*יכול להוסיף עד 6 אופציות*/}
                                <li><Link to='/login'>התחבר</Link></li>
                            </>
                        )
                    }
                </ul>
            </div>
      </nav>
    );
  };