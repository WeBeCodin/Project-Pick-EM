import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Users, TrendingUp, Calendar } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Calendar,
      title: 'Weekly Picks',
      description: 'Make your picks for every NFL game each week',
    },
    {
      icon: Trophy,
      title: 'Leaderboards',
      description: 'Compete with friends and climb the rankings',
    },
    {
      icon: TrendingUp,
      title: 'Live Scoring',
      description: 'Track your performance in real-time',
    },
    {
      icon: Users,
      title: 'Social Gaming',
      description: 'Join leagues and challenge your friends',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              NFL Pick 'Em
              <span className="text-blue-600 dark:text-blue-400"> Challenge</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Test your NFL knowledge and compete with friends in the ultimate 
              football prediction game. Make your picks, track your progress, 
              and climb the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to win
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Powerful features to make your NFL Pick 'Em experience unforgettable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to make your picks?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of NFL fans making their predictions every week
          </p>
          <Link href="/register">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-gray-100"
            >
              Start Playing Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
