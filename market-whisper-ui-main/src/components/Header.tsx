
import { Orbit } from "lucide-react";

const Header = () => {
  return (
    <header className="space-panel space-glow mb-8 flex flex-wrap items-center justify-between">
      <div className="flex items-center">
        <div className="bg-gradient-to-r from-finance-primary to-finance-secondary p-2.5 rounded-lg mr-4 neo-glow">
          <Orbit className="text-black h-7 w-7" />
        </div>
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-finance-primary space-title">
            QuantumMarket AI
          </h1>
          <p className="text-sm md:text-base text-gray-400 space-subtitle">
            Deep Space Financial Intelligence System
          </p>
        </div>
      </div>
      <div className="flex items-center mt-3 md:mt-0">
        <div className="py-2 px-4 bg-finance-primary/20 text-finance-primary rounded-full border border-finance-primary/30 backdrop-blur-sm">
          <span className="text-sm md:text-base font-medium">Quantum Analysis v2.5</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
