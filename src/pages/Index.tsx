
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/AuthForm';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

const Index = () => {
  const { user, loading, connectionStatus, retryConnection } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading Signal Vault...</p>
          <p className="text-sm text-purple-300 mt-2">
            {connectionStatus === 'connecting' ? 'Establishing connection...' : 'Setting up your workspace'}
          </p>
          {connectionStatus === 'error' && (
            <div className="mt-4">
              <p className="text-red-300 text-sm mb-2">Connection issues detected</p>
              <Button
                variant="outline"
                size="sm"
                onClick={retryConnection}
                className="text-white border-white hover:bg-white hover:text-purple-900"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {connectionStatus === 'offline' && (
        <div className="bg-red-100 border-b border-red-300 px-4 py-2">
          <div className="flex items-center justify-center space-x-2 text-red-700">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">You're offline. Some features may not work.</span>
          </div>
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2">
          <div className="flex items-center justify-center space-x-2 text-yellow-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Connection issues detected.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={retryConnection}
              className="text-yellow-700 hover:text-yellow-900 p-1 h-auto"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      <Header />
      <Dashboard />
    </div>
  );
};

export default Index;
