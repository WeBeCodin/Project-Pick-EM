'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { User, Trophy, Calendar, LogOut, Menu, Users } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              🏈 NFL Pick 'Em
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Make Picks</span>
              </Link>
              <Link
                href={"/leagues" as any}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Leagues</span>
              </Link>
              <Link
                href={"/leaderboard" as any}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {user?.displayName || user?.username}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-gray-700 dark:text-gray-300 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                <span>Make Picks</span>
              </Link>
              <Link
                href={"/leagues" as any}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="h-4 w-4" />
                <span>Leagues</span>
              </Link>
              <Link
                href={"/leaderboard" as any}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </Link>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.displayName || user?.username}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
