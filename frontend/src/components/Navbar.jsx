import React from 'react';
import { Shield, LogOut, Sun, Moon, Menu, X, User } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, theme, toggleTheme, user, logout, setMobileMenuOpen, mobileMenuOpen }) {
  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-white/5 backdrop-blur-md bg-cyber-bg/70 dark:bg-cyber-bg/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActivePage('landing')}>
            <div className="relative">
              <Shield className="w-8 h-8 text-cyber-cyan filter drop-shadow-[0_0_8px_rgba(0,242,254,0.5)] animate-pulse" />
              <div className="absolute inset-0 bg-cyber-cyan/20 blur-sm rounded-full filter animate-ping"></div>
            </div>
            <span className="font-orbitron font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-blue to-cyber-purple">
              FORENZIC AI
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-1 items-center">
            {[
              { id: 'landing', label: 'Home' },
              { id: 'detection', label: 'Scan Terminal' },
              { id: 'dashboard', label: 'Analytics' },
              { id: 'about', label: 'Technology' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => setActivePage(link.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm tracking-wide transition-all duration-200 ${
                  activePage === link.id
                    ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 shadow-neon-cyan'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Secondary Controls (Theme, Auth, Mobile toggle) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 border border-white/5"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-cyber-purple" />}
            </button>

            {/* Authentication Widget */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-white/10">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-white">{user.name}</span>
                  <span className="text-[10px] text-cyber-cyan tracking-wider font-orbitron font-semibold uppercase">
                    {user.tier}
                  </span>
                </div>
                <div className="relative group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyber-cyan to-cyber-purple p-[1px] shadow-neon-cyan">
                    <div className="w-full h-full rounded-full bg-cyber-bg flex items-center justify-center">
                      <User className="w-4 h-4 text-cyber-cyan" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-gray-400 hover:text-cyber-red hover:bg-cyber-red/10 transition-all duration-200 border border-transparent"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActivePage('login')}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActivePage('signup')}
                  className="px-4 py-2 text-sm font-medium text-cyber-bg font-semibold bg-cyber-cyan rounded-lg hover:shadow-neon-cyan hover:brightness-110 transition-all duration-300"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-cyber-purple" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-x-0 border-t border-white/10 animate-fade-in absolute w-full left-0 bg-cyber-bg/95">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {[
              { id: 'landing', label: 'Home' },
              { id: 'detection', label: 'Scan Terminal' },
              { id: 'dashboard', label: 'Analytics' },
              { id: 'about', label: 'Technology' }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActivePage(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  activePage === link.id
                    ? 'text-cyber-cyan bg-cyber-cyan/10 border-l-2 border-cyber-cyan'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}

            {user ? (
              <div className="pt-4 pb-2 border-t border-white/10 mt-4 px-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-cyber-cyan font-orbitron">{user.tier}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-cyber-red px-3 py-1.5 rounded-lg bg-cyber-red/10 border border-cyber-red/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Exit</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-white/10 mt-4 flex flex-col space-y-2 px-2">
                <button
                  onClick={() => {
                    setActivePage('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium text-gray-300 hover:text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActivePage('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold text-cyber-bg bg-cyber-cyan rounded-lg"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
