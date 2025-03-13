import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navigation.css';

function Navigation() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <NavLink className="navbar-brand" to="/">Farming App</NavLink>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/crop-monitoring">Crop Monitoring</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/pest-detection">Pest Detection</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/legal-info">Legal Info</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/pricing-info">Pricing Info</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink className="nav-link" to="/offline-data">Offline Data</NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navigation;