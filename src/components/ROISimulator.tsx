
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Idea, ROISimulation } from '@/types';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react';

interface ROISimulatorProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
}

const ROISimulator = ({ idea, isOpen, onClose }: ROISimulatorProps) => {
  const { user } = useAuth();
  const [investmentAmount, setInvestmentAmount] = useState<string>('10000');
  const [exitValuation, setExitValuation] = useState<string>('');
  const [simulation, setSimulation] = useState<ROISimulation | null>(null);

  const calculateROI = () => {
    if (!idea || !user) return;

    const investment = parseFloat(investmentAmount) || 0;
    const exit = parseFloat(exitValuation) || 0;
    
    // Mock calculation based on user's signal points contribution to this idea
    const userEquityPercent = (user.signalPoints / (idea.totalPoints * 100)) * 0.01; // 1% total pool
    const equityOwned = userEquityPercent;
    const estimatedExitValue = exit * equityOwned;
    const roi = ((estimatedExitValue - investment) / investment) * 100;

    const newSimulation: ROISimulation = {
      investmentAmount: investment,
      exitValuation: exit,
      equityOwned: equityOwned * 100, // Convert to percentage
      estimatedExitValue,
      roi
    };

    setSimulation(newSimulation);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(4)}%`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            <span>ROI Simulator</span>
          </DialogTitle>
        </DialogHeader>

        {idea && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-1">{idea.title}</h3>
              <p className="text-sm text-gray-600">Current valuation: {formatCurrency(idea.valuationEstimate)}</p>
              <p className="text-sm text-purple-600 font-medium">Your contribution: {user?.signalPoints || 0} Signal Points</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="investment">Investment Amount</Label>
                <Input
                  id="investment"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label htmlFor="exit">Exit Valuation</Label>
                <Input
                  id="exit"
                  type="number"
                  value={exitValuation}
                  onChange={(e) => setExitValuation(e.target.value)}
                  placeholder="5000000"
                />
              </div>
            </div>

            <Button onClick={calculateROI} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate ROI
            </Button>

            {simulation && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                  Simulation Results
                </h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Your Equity:</span>
                    <span className="font-medium text-purple-600">{formatPercentage(simulation.equityOwned)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Exit Value:</span>
                    <span className="font-medium text-green-600">{formatCurrency(simulation.estimatedExitValue)}</span>
                  </div>
                  <div className="flex items-center justify-between col-span-2 pt-2 border-t">
                    <span className="text-gray-600 flex items-center">
                      <Percent className="w-4 h-4 mr-1" />
                      ROI:
                    </span>
                    <span className={`font-bold text-lg ${simulation.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {simulation.roi >= 0 ? '+' : ''}{simulation.roi.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  * Simulation based on current Signal Points contribution and estimated equity pool of 1%
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ROISimulator;
