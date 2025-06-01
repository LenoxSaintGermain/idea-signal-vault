
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Bug, Wifi, WifiOff } from 'lucide-react';
import { firebaseDebugService } from '@/services/firebaseDebugService';
import { toast } from '@/hooks/use-toast';

const FirebaseDebugPanel = () => {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>({});

  const runDebugCheck = async () => {
    setLoading(true);
    try {
      firebaseDebugService.debugFirebaseConnection();
      const status = await firebaseDebugService.getConnectionStatus();
      setConnectionStatus(status);
      
      toast({
        title: "Debug check completed",
        description: "Check console for detailed logs",
      });
    } catch (error) {
      toast({
        title: "Debug check failed",
        description: "Could not complete debug check",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await firebaseDebugService.testFirestoreConnection();
      setTestResults({ ...testResults, connection: result });
      
      toast({
        title: result ? "Connection test passed" : "Connection test failed",
        description: result ? "Firestore is working correctly" : "Check console for errors",
        variant: result ? "default" : "destructive"
      });
    } catch (error) {
      setTestResults({ ...testResults, connection: false });
      toast({
        title: "Connection test failed",
        description: "Could not test Firestore connection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const forceOnline = async () => {
    setLoading(true);
    try {
      const result = await firebaseDebugService.forceFirestoreOnline();
      setTestResults({ ...testResults, forceOnline: result });
      
      toast({
        title: result ? "Forced online successfully" : "Force online failed",
        description: result ? "Firestore should now be online" : "Could not force Firestore online",
        variant: result ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Force online failed",
        description: "Could not force Firestore online",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runRecoverySequence = async () => {
    setLoading(true);
    try {
      const result = await firebaseDebugService.performRecoverySequence();
      setTestResults({ ...testResults, recovery: result });
      
      toast({
        title: result ? "Recovery completed" : "Recovery failed",
        description: result ? "Firebase should now be working" : "Recovery sequence failed",
        variant: result ? "default" : "destructive"
      });
      
      if (result) {
        // Refresh status after successful recovery
        await runDebugCheck();
      }
    } catch (error) {
      toast({
        title: "Recovery failed",
        description: "Could not complete recovery sequence",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bug className="w-5 h-5 mr-2" />
          Firebase Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        {connectionStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge className={connectionStatus.network ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {connectionStatus.network ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                Network
              </Badge>
            </div>
            <div className="text-center">
              <Badge className={connectionStatus.auth.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {connectionStatus.auth.isAuthenticated ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                Auth
              </Badge>
            </div>
            <div className="text-center">
              <Badge className={connectionStatus.firebase.hasConfig ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {connectionStatus.firebase.hasConfig ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                Config
              </Badge>
            </div>
            <div className="text-center">
              <Badge className="bg-blue-100 text-blue-800">
                <span className="text-xs">{connectionStatus.firebase.projectId}</span>
              </Badge>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={runDebugCheck}
            disabled={loading}
            variant="outline"
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Bug className="w-4 h-4 mr-2" />}
            Debug Check
          </Button>
          
          <Button
            onClick={testConnection}
            disabled={loading}
            variant="outline"
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Test Connection
          </Button>
          
          <Button
            onClick={forceOnline}
            disabled={loading}
            variant="outline"
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wifi className="w-4 h-4 mr-2" />}
            Force Online
          </Button>
          
          <Button
            onClick={runRecoverySequence}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Recovery
          </Button>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Test Results:</h4>
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test} className="flex items-center justify-between">
                <span className="capitalize">{test}:</span>
                <Badge className={result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {result ? 'Pass' : 'Fail'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FirebaseDebugPanel;
