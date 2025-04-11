import React from "react";
import { AlertTriangle, Link } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReportDisplayProps {
  report: string;
  summary: string;
  followUpQuestions: string[];
  verificationIssues: string | null;
  traceUrl?: string;
}

const ReportDisplay = ({ report, summary, followUpQuestions, verificationIssues, traceUrl }: ReportDisplayProps) => {
  // Format the report with proper section headings and paragraphs
  const formatReport = (text: string) => {
    if (!text) return "";
    
    // Replace headers with styled headers
    let formattedText = text
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-7 mb-4 text-finance-primary space-title">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-5 mb-3 text-blue-100 space-subtitle">$1</h3>')
      .replace(/\n\n/g, '</p><p class="my-4 text-gray-300 leading-relaxed">');
    
    return `<p class="my-4 text-gray-300 leading-relaxed">${formattedText}</p>`;
  };
  
  // Split verification issues string into an array for display
  const issuesArray = verificationIssues?.split('\n').filter(line => line.trim().length > 0) || [];
  
  return (
    <div className="space-y-6">
      {/* Summary section */}
      <Card className="space-panel space-glow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Badge variant="default" className="finance-gradient text-black mr-3 py-1 px-3">Analysis</Badge>
            <span className="space-title">Executive Summary</span>
          </h2>
          {/* Display Trace URL if available */}
          {traceUrl && (
            <a href={traceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-finance-primary flex items-center gap-1">
               <Link size={14} /> View Trace
            </a>
          )}
        </div>
        <p className="text-gray-300 italic leading-relaxed">{summary}</p>
      </Card>
      
      {/* Full report section */}
      <Card className="space-panel space-glow p-6">
        <h2 className="space-title text-xl font-bold mb-5">Detailed Report</h2>
        <div 
          className="prose prose-invert max-w-none report-content"
          dangerouslySetInnerHTML={{ __html: formatReport(report) }}
        />
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Follow-up questions */}
        <Card className="space-panel space-glow p-6 h-full">
          <h2 className="space-title text-xl font-bold mb-5">Further Research Directives</h2>
          <ul className="space-y-3">
            {followUpQuestions.map((question, index) => (
              <li key={index} className="flex group cursor-pointer p-3 rounded-lg transition-all hover:bg-finance-primary/10">
                <span className="inline-flex items-center justify-center bg-finance-primary/20 text-finance-primary rounded-full w-7 h-7 mr-3 flex-shrink-0 group-hover:bg-finance-primary/30">
                  {index + 1}
                </span>
                <span className="text-gray-300 group-hover:text-blue-100">{question}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        {/* Verification Issues */}
        {issuesArray.length > 0 && (
          <Card className="space-panel border border-amber-700/40 p-6 h-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-amber-500 w-6 h-6 mr-3" />
              <h2 className="text-xl font-bold text-amber-400 space-title">Reliability Analysis</h2>
            </div>
            <ul className="space-y-4">
              {issuesArray.map((issue, index) => (
                <li key={index} className="flex">
                  <span className="inline-flex items-center justify-center bg-amber-900/50 text-amber-400 rounded-full w-7 h-7 mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-300 leading-relaxed">{issue.replace(/^\d+\.\s+\*\*(.*?)\*\*\s*-?\s*/, '$1:')}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportDisplay;
