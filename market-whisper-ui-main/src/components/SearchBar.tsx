
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

const SearchBar = ({ onSearch, isSearching }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mb-8">
      <div className="space-panel relative w-full flex items-center space-glow">
        <Input
          type="text"
          placeholder="Enter a financial research query..."
          className="w-full pl-4 pr-32 py-7 text-lg rounded-xl bg-finance-dark/60 border-0 text-blue-100 focus:ring-finance-primary focus:border-finance-primary"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching}
        />
        <Button
          type="submit"
          className="absolute right-3 finance-gradient hover:opacity-90 text-black font-medium px-5 py-2.5 h-12"
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? (
            <div className="flex items-center">
              <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              <span className="font-medium">Analyze</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
