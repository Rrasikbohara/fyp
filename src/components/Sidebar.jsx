import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <nav>
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/dashboard" 
              className="block p-2 rounded hover:bg-gray-700"
              activeClassName="font-bold"
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/schedule" 
              className="block p-2 rounded hover:bg-gray-700"
              activeClassName="font-bold"
            >
              Schedule
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/feedback"
              className="block p-2 rounded hover:bg-gray-700"
              activeClassName="font-bold"
            >
              Feedback
            </NavLink>
          </li>
          {/* Add additional links as needed */}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
