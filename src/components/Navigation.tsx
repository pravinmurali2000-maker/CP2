import React, { useState } from 'react';
import { Menu, X, Home, Users, Calendar, Trophy, BarChart3, Bell, LogOut, Settings, UserCircle, Plus } from 'lucide-react';
import type { User } from '../App';

interface NavigationProps {
  currentPage: string;
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Navigation({ currentPage, currentUser, onNavigate, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicMenuItems = [
    { id: 'landing', label: 'Home', icon: Home },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'setup', label: 'Setup', icon: Settings },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'score', label: 'Live Score', icon: Trophy },
    { id: 'standings', label: 'Standings', icon: BarChart3 },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const managerMenuItems = [
    { id: 'team-view', label: 'My Team', icon: Users },
    { id: 'register', label: 'Register Players', icon: Plus },
    { id: 'standings', label: 'Standings', icon: BarChart3 },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const menuItems = currentUser 
    ? (currentUser.role === 'admin' ? adminMenuItems : managerMenuItems)
    : publicMenuItems;

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-green-600 text-white sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => handleNavigate(currentUser ? 'dashboard' : 'landing')}
            className="flex items-center gap-3"
          >
            <Trophy className="w-6 h-6" />
            <div>
              <div className="font-semibold">Tournament Manager</div>
              {currentUser && (
                <div className="text-xs text-green-100 capitalize">
                  {currentUser.role} • {currentUser.name}
                </div>
              )}
            </div>
          </button>
          
          {currentUser && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-green-700 rounded-lg md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-green-600 text-white">
              <div className="flex items-center gap-3 mb-2">
                <UserCircle className="w-10 h-10" />
                <div>
                  <div className="font-semibold">{currentUser.name}</div>
                  <div className="text-xs text-green-100 capitalize">{currentUser.role}</div>
                </div>
              </div>
            </div>
            
            <nav className="p-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 ${
                      currentPage === item.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      {currentUser && (
        <nav className="hidden md:block bg-white border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 overflow-x-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`flex items-center gap-2 px-4 py-4 border-b-2 whitespace-nowrap ${
                        currentPage === item.id
                          ? 'border-green-600 text-green-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
