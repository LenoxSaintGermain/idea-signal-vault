
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Coins, Lightbulb } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Signal Vault
            </h1>
          </div>

          {user && (
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium">{user.signalPoints.toLocaleString()}</span>
                  <span className="text-purple-300">pts</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">{user.ideasInfluenced}</span>
                  <span className="text-purple-300">ideas</span>
                </div>
                <div className="text-green-400 font-semibold">
                  ${user.estimatedTake.toLocaleString()} est.
                </div>
              </div>
              <Button variant="outline" onClick={logout} className="text-white border-white/30 hover:bg-white/10">
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
