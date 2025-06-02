
import { useAuth } from '@/hooks/useSupabaseAuth';
import AuthForm from '@/components/AuthForm';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading Signal Vault...</p>
          <p className="text-sm text-purple-300 mt-2">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <AuthForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Dashboard />
    </div>
  );
};

export default Index;
