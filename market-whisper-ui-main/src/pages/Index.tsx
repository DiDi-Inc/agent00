import React, { useState } from 'react';
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import SearchBar from '@/components/SearchBar';
import ReportDisplay from '@/components/ReportDisplay';
import Header from '@/components/Header';
import { ChartLine } from "lucide-react";

// Define the expected API response structure
interface ResearchResult {
  summary: string;
  report: string; // Changed from reportText to match backend
  follow_up_questions: string[]; // Changed from followUpQuestions
  verification_issues: string | null; // Changed from verificationIssues (array) to string | null
  trace_url?: string; // Add trace_url (optional)
}

const Index = () => {
  const { toast: uiToast } = useToast();
  const [isResearching, setIsResearching] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<ResearchResult | null>(null);

  // Function to fetch research results from the backend
  const fetchResearch = async (query: string): Promise<ResearchResult> => {
    const backendUrl = "http://localhost:8000/research"; // Ensure this matches your backend URL

    const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query }),
    });

    if (!response.ok) {
        let errorMessage = `API Error ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage += `\nDetails: ${errorData.detail || JSON.stringify(errorData)}`;
        } catch (e) { /* Ignore parsing errors */ }
        throw new Error(errorMessage);
    }

    return await response.json() as ResearchResult;
  };

  // Handle search submission
  const handleSearch = async (query: string) => {
    if (!query) return;
    
    setIsResearching(true);
    setShowReport(false);
    setReportData(null); // Clear previous report data

    try {
      const result = await fetchResearch(query);
      setReportData(result);
      setShowReport(true);
      toast("Research complete", {
        description: "Your financial analysis is ready to view",
      });

    } catch (error: any) {
      console.error("Research error:", error);
      uiToast({
        title: "Research Failed",
        description: error.message || "An unknown error occurred while fetching research.",
        variant: "destructive",
      });
      setShowReport(false); // Ensure report isn't shown on error
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-finance-softGray dark:bg-finance-dark">
      <div className="container mx-auto py-10 px-4">
        <Header />

        <div className="max-w-5xl mx-auto">
          <SearchBar onSearch={handleSearch} isSearching={isResearching} />

          {/* Simplified Loading State */}
          {isResearching && (
             <div className="space-panel space-glow h-64 flex items-center justify-center mt-16">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-finance-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-gray-400">Generating financial insights...</p>
                </div>
             </div>
          )}

          {/* Report Display Area */}
          {showReport && reportData && (
             <div className="mt-8">
                 <ReportDisplay
                     report={reportData.report}
                     summary={reportData.summary}
                     followUpQuestions={reportData.follow_up_questions}
                     verificationIssues={reportData.verification_issues}
                     traceUrl={reportData.trace_url}
                 />
             </div>
          )}

          {/* Initial State Message */}
          {!isResearching && !showReport && (
            <div className="space-panel space-glow p-10 text-center mt-16">
              <div className="w-20 h-20 bg-finance-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChartLine className="w-10 h-10 text-finance-primary" />
              </div>
              <h2 className="space-title text-2xl md:text-3xl font-bold mb-4">AI Financial Research</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">
                Enter a financial query to receive comprehensive market analysis and insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
