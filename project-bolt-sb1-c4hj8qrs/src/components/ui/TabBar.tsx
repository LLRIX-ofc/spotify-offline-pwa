import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Library, Settings } from 'lucide-react';

const TabBar: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-dark-500 border-t border-dark-300 flex items-stretch z-20">
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center flex-1 p-2 transition-colors ${
            isActive 
              ? 'text-primary-600 font-medium' 
              : 'text-gray-400 hover:text-white'
          }`
        }
        end
      >
        {({ isActive }) => (
          <>
            <Compass size={24} className={isActive ? 'text-primary-600' : ''} />
            <span className="text-xs mt-1">Explore</span>
          </>
        )}
      </NavLink>
      
      <NavLink 
        to="/library" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center flex-1 p-2 transition-colors ${
            isActive 
              ? 'text-primary-600 font-medium' 
              : 'text-gray-400 hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Library size={24} className={isActive ? 'text-primary-600' : ''} />
            <span className="text-xs mt-1">Library</span>
          </>
        )}
      </NavLink>
      
      <NavLink 
        to="/settings" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center flex-1 p-2 transition-colors ${
            isActive 
              ? 'text-primary-600 font-medium' 
              : 'text-gray-400 hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Settings size={24} className={isActive ? 'text-primary-600' : ''} />
            <span className="text-xs mt-1">Settings</span>
          </>
        )}
      </NavLink>
    </div>
  );
};

export default TabBar;