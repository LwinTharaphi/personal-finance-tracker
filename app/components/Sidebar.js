// components/Sidebar.js

"use client"; // Client component

import { Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar" style={{ width: '250px', height: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
      <h4 className="text-center">Profile</h4>
      {/* <img src="/profile-pic.jpg" alt="Profile" className="img-fluid mb-3" style={{ borderRadius: '50%', width: '100px' }} /> */}
      <h5 className="text-center">John Doe</h5>
      <Nav className="flex-column">
        <Nav.Link as={Link} href="/dashboard">Dashboard</Nav.Link>
        <Nav.Link as={Link} href="/income">Income</Nav.Link>
        <Nav.Link as={Link} href="/expense">Expenses</Nav.Link>
        <Nav.Link as={Link} href="/budget">Budget</Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
