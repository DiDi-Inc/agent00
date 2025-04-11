
import { CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResearchStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ResearchProgressProps {
  steps: ResearchStep[];
  searchProgress: number;
  totalSearches: number;
  completedSearches: number;
  isSearching: boolean;
}

const ResearchProgress = ({
  steps,
  searchProgress,
  totalSearches,
  completedSearches,
  isSearching,
}: ResearchProgressProps) => {
  return (
    <div className="space-panel space-glow p-6">
      <h2 className="space-title text-xl font-semibold mb-5">Processing Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center p-3 bg-finance-dark/60 rounded-lg border border-finance-primary/20">
            {step.completed ? (
              <CheckCircle className="text-finance-primary w-6 h-6 mr-3 animate-pulse-slow" />
            ) : (
              <div className={`w-6 h-6 rounded-full border-2 ${step.id === 'searching' && isSearching ? 'border-finance-primary animate-pulse' : 'border-gray-600'} mr-3`} />
            )}
            <span className={`${step.completed ? "text-blue-100" : "text-gray-400"} text-base`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {isSearching && steps.some(step => step.id === 'searching' && step.completed === false) && (
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-100 font-medium">Data acquisition</span>
            <span className="text-finance-primary font-bold">{completedSearches}/{totalSearches}</span>
          </div>
          <Progress 
            value={searchProgress} 
            className="h-2 bg-finance-softGray" 
          />
        </div>
      )}
    </div>
  );
};

export default ResearchProgress;
