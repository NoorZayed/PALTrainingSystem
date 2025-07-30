import React from "react";
import { Link } from "react-router-dom";
import "../../components/css/Footer.css";
import logo from '../../components/images/pp1.png';

const Footer: React.FC = () => {
    return (
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="logo">
              <img src={logo} alt="Logo" className="navbar-logo" />
              <span><h3>PAL Training System</h3></span>
            </div>
            <div className="contact-info">
              <p>Call now: +9501776078</p>
              <p>456 Birzeit university, Birzeit, Ramallah</p>
            </div>
          </div>
          <div className="footer-right">
            <h3>Quick Link</h3>
            <Link to="/contact">Contact</Link>
            <Link to="/aboutus">About Us</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </div>
        </div>
        <p className="copyright">&copy; {new Date().getFullYear()} PAL Training System</p>
      </footer>
    );
};

export default Footer;
