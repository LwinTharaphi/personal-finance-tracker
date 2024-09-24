"use client"; // Client component

import { Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import './Sidebar.css';

const Sidebar = () => {
  const pathname = usePathname(); // Get the current route

  return (
    <div className="sidebar d-flex flex-column" style={{ width: '250px', height: '100%', padding: '20px' }}>
      <div className="profile-section text-center mb-4">
        <h4 className="text-dark">Profile</h4>
        {/* Profile image */}
        {/* <img src="/profile-pic.jpg" alt="Profile" className="img-fluid mb-3 rounded-circle" style={{ width: '100px' }} /> */}
        <h5 className="text-secondary">John Doe</h5>
      </div>

      <Nav className="flex-column nav-links">
        <Nav.Link 
          as={Link} 
          href="/dashboard" 
          className={`sidebar-link ${pathname === '/dashboard' ? 'active' : ''}`}>
          Dashboard
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          href="/income" 
          className={`sidebar-link ${pathname === '/income' ? 'active' : ''}`}>
          Income
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          href="/expense" 
          className={`sidebar-link ${pathname === '/expense' ? 'active' : ''}`}>
          Expenses
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          href="/budget" 
          className={`sidebar-link ${pathname === '/budget' ? 'active' : ''}`}>
          Budget
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
