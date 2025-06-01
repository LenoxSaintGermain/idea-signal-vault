
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, Loader2, WifiOff, AlertCircle, RefreshCw, X } from 'lucide-react';

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const { signIn, signUp, connectionStatus, lastError, retryConnection, clearError } = useAuth();

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'online':
        return { text: 'Connected', color: 'text-green-600', icon: null };
      case 'offline':
        return { text: 'Offline', color: 'text-red-600', icon: WifiOff };
      case 'connecting':
        return { text: 'Connecting...', color: 'text-yellow-600', icon: Loader2 };
      case 'error':
        return { text: 'Connection Error', color: 'text-red-600', icon: AlertCircle };
      default:
        return { text: 'Unknown', color: 'text-gray-600', icon: null };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (connectionStatus === 'offline') {
      toast({
        title: "No internet connection",
        description: "Please check your network connection and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const startTime = performance.now();
    console.log('🔐 Auth process started at:', new Date().toISOString());

    try {
      if (isSignUp) {
        setLoadingStep('Creating your account...');
        console.log('📝 Starting user registration');
        
        const authStart = performance.now();
        await signUp(email, password, displayName);
        console.log(`✅ Registration completed in ${(performance.now() - authStart).toFixed(0)}ms`);
        
        toast({
          title: "Account created!",
          description: "Welcome to Signal Vault. Start earning Signal Points!",
        });
      } else {
        setLoadingStep('Signing you in...');
        console.log('🔑 Starting user authentication');
        
        const authStart = performance.now();
        await signIn(email, password);
        console.log(`✅ Authentication completed in ${(performance.now() - authStart).toFixed(0)}ms`);
        
        toast({
          title: "Welcome back!",
          description: "Ready to explore new ideas?",
        });
      }
      
      const totalTime = performance.now() - startTime;
      console.log(`🎉 Total auth process completed in ${totalTime.toFixed(0)}ms`);
      
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      const errorTime = performance.now() - startTime;
      console.log(`💥 Auth failed after ${errorTime.toFixed(0)}ms`);
      
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const statusInfo = getConnectionStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Signal Vault</h1>
          <p className="text-purple-300">Where ideas meet opportunity</p>
          
          {/* Connection Status */}
          <div className="mt-4 flex items-center justify-center space-x-2">
            {StatusIcon && <StatusIcon className={`w-4 h-4 ${statusInfo.color} ${connectionStatus === 'connecting' ? 'animate-spin' : ''}`} />}
            <span className={`text-sm ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
            {connectionStatus === 'error' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={retryConnection}
                className="text-purple-300 hover:text-white p-1 h-auto"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Enhanced Error Display */}
          {lastError && (
            <div className="mt-3 bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{lastError}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-300 hover:text-white p-1 h-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle>{isSignUp ? 'Create Account' : 'Welcome Back'}</CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Join the idea marketplace and start earning Signal Points'
                : 'Sign in to continue exploring breakthrough ideas'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={isSignUp}
                    placeholder="Your name"
                    disabled={loading || connectionStatus === 'offline'}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  disabled={loading || connectionStatus === 'offline'}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading || connectionStatus === 'offline'}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading || connectionStatus === 'offline'}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingStep || 'Please wait...'}</span>
                  </div>
                ) : connectionStatus === 'offline' ? (
                  'No Connection'
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>
            
            {!loading && connectionStatus !== 'offline' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-purple-600 hover:text-purple-700 underline"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            )}
            
            {connectionStatus === 'error' && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryConnection}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;
