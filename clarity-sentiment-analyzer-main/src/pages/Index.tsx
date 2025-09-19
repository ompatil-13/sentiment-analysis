import { useState } from "react";
import { DataInput } from "@/components/DataInput";
import { SentimentAnalysis } from "@/components/SentimentAnalysis";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, BarChart3, MessageSquare, TrendingUp } from "lucide-react";

interface ParsedData {
  comments: string[];
  rawCount: number;
  uniqueCount: number;
  duplicateCount: number;
  singleTokenWarning: boolean;
  singleTokenPercentage: number;
}

interface AnalysisResults {
  jobId: string;
  timestamp: Date;
  results: Array<{
    comment: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    keywords: string[];
  }>;
  totalComments: number;
  uniqueComments: number;
  duplicatesIgnored: number;
  sentimentCounts: {
    positive: number;
    negative: number;
    neutral: number;
  };
  satisfactionScore: number;
  averageConfidence: number;
  modelUsed: string;
}

type AppState = 'input' | 'analysis' | 'results';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('input');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);

  const handleDataParsed = (data: ParsedData) => {
    setParsedData(data);
  };

  const handleConfirmAnalysis = (data: ParsedData) => {
    setParsedData(data);
    setAppState('analysis');
  };

  const handleAnalysisComplete = (results: AnalysisResults) => {
    setAnalysisResults(results);
    setAppState('results');
  };

  const handleNewAnalysis = () => {
    setAppState('input');
    setParsedData(null);
    setAnalysisResults(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-primary">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-primary-foreground">
            <h1 className="text-5xl font-heading font-bold mb-4">
              Sentiment Analysis Platform
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-6">
              Analyze text sentiment with precision. Upload your data, get insights, and make data-driven decisions 
              with our advanced NLP-powered analytics.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <MessageSquare className="w-4 h-4 mr-1" />
                Text & CSV Support
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <Brain className="w-4 h-4 mr-1" />
                Advanced NLP
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <BarChart3 className="w-4 h-4 mr-1" />
                Visual Analytics
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Exportable Results
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              appState === 'input' ? 'bg-primary text-primary-foreground' : 
              parsedData ? 'bg-muted text-muted-foreground' : 'bg-muted/50 text-muted-foreground/50'
            }`}>
              <div className="w-6 h-6 rounded-full bg-current opacity-20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-current" />
              </div>
              <span className="font-medium">1. Data Input</span>
            </div>
            
            <div className={`w-8 h-0.5 ${parsedData ? 'bg-primary' : 'bg-muted'} transition-all`} />
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              appState === 'analysis' ? 'bg-primary text-primary-foreground' : 
              analysisResults ? 'bg-muted text-muted-foreground' : 'bg-muted/50 text-muted-foreground/50'
            }`}>
              <div className="w-6 h-6 rounded-full bg-current opacity-20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-current" />
              </div>
              <span className="font-medium">2. Analysis</span>
            </div>
            
            <div className={`w-8 h-0.5 ${analysisResults ? 'bg-primary' : 'bg-muted'} transition-all`} />
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              appState === 'results' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground/50'
            }`}>
              <div className="w-6 h-6 rounded-full bg-current opacity-20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-current" />
              </div>
              <span className="font-medium">3. Results</span>
            </div>
          </div>
        </div>

        {/* State-based Content */}
        {appState === 'input' && (
          <DataInput 
            onDataParsed={handleDataParsed}
            onConfirmAnalysis={handleConfirmAnalysis}
          />
        )}

        {appState === 'analysis' && parsedData && (
          <SentimentAnalysis 
            comments={parsedData.comments}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {appState === 'results' && analysisResults && (
          <ResultsDashboard 
            results={analysisResults}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Privacy Notice:</strong> No demo data used unless explicitly enabled. 
              All analysis runs locally in your browser for maximum privacy.
            </p>
            <p>
              Built with advanced NLP • Local processing • Export ready results
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
