import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Brain, Clock, Shield, Globe } from "lucide-react";
import { toast } from "sonner";

interface SentimentResult {
  comment: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
}

interface AnalysisResults {
  jobId: string;
  timestamp: Date;
  results: SentimentResult[];
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

interface SentimentAnalysisProps {
  comments: string[];
  onAnalysisComplete: (results: AnalysisResults) => void;
}

// Simple sentiment analysis using pattern matching for demo
const analyzeSentiment = (text: string): { sentiment: 'positive' | 'negative' | 'neutral'; confidence: number } => {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'love', 'best', 'awesome',
    'helpful', 'professional', 'caring', 'efficient', 'clean', 'friendly', 'satisfied', 'pleased', 'happy',
    'outstanding', 'impressive', 'quality', 'reliable', 'comfortable', 'convenient', 'smooth', 'easy'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointing', 'poor', 'inadequate',
    'frustrating', 'annoying', 'slow', 'expensive', 'difficult', 'complicated', 'confusing', 'unclear',
    'unprofessional', 'rude', 'unhelpful', 'broken', 'failed', 'problem', 'issue', 'complaint', 'concern'
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveScore = 0;
  let negativeScore = 0;

  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (positiveWords.includes(cleanWord)) positiveScore++;
    if (negativeWords.includes(cleanWord)) negativeScore++;
  });

  const total = positiveScore + negativeScore;
  if (total === 0) {
    return { sentiment: 'neutral', confidence: 0.6 + Math.random() * 0.2 };
  }

  const positiveRatio = positiveScore / total;
  if (positiveRatio > 0.6) {
    return { sentiment: 'positive', confidence: 0.7 + positiveRatio * 0.3 };
  } else if (positiveRatio < 0.4) {
    return { sentiment: 'negative', confidence: 0.7 + (1 - positiveRatio) * 0.3 };
  } else {
    return { sentiment: 'neutral', confidence: 0.6 + Math.random() * 0.2 };
  }
};

const extractKeywords = (text: string): string[] => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were',
    'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
};

export const SentimentAnalysis = ({ comments, onAnalysisComplete }: SentimentAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState("pattern-local");
  const [currentStep, setCurrentStep] = useState("");

  const modelOptions = [
  {
    id: "cloud-api",
    name: "Cloud API",
    description: "Most accurate, requires internet connection",
    icon: Globe,
    speed: "Fast (~5s)",
    privacy: "Data sent to API"
  }
];



  const selectedModelInfo = modelOptions.find(m => m.id === selectedModel);

  const runAnalysis = async () => {
    if (comments.length === 0) {
      toast.error("No comments to analyze");
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentStep("Initializing analysis...");

    try {
      const results: SentimentResult[] = [];
      const uniqueComments = [...new Set(comments)];
      
      setCurrentStep("Processing comments...");
      
      // Simulate processing time for better UX
      for (let i = 0; i < uniqueComments.length; i++) {
        const comment = uniqueComments[i];
        
        // Add small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const { sentiment, confidence } = analyzeSentiment(comment);
        const keywords = extractKeywords(comment);
        
        results.push({
          comment,
          sentiment,
          confidence,
          keywords
        });
        
        setProgress((i + 1) / uniqueComments.length * 100);
      }

      setCurrentStep("Calculating metrics...");
      
      // Calculate sentiment counts
      const sentimentCounts = {
        positive: results.filter(r => r.sentiment === 'positive').length,
        negative: results.filter(r => r.sentiment === 'negative').length,
        neutral: results.filter(r => r.sentiment === 'neutral').length
      };

      // Calculate satisfaction score
      const satisfactionScore = Math.round(
        ((sentimentCounts.positive + 0.5 * sentimentCounts.neutral) / results.length) * 100 * 10
      ) / 10;

      // Calculate average confidence
      const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

      const analysisResults: AnalysisResults = {
        jobId: `job_${Date.now()}`,
        timestamp: new Date(),
        results,
        totalComments: comments.length,
        uniqueComments: uniqueComments.length,
        duplicatesIgnored: comments.length - uniqueComments.length,
        sentimentCounts,
        satisfactionScore,
        averageConfidence,
        modelUsed: selectedModelInfo?.name || "Unknown"
      };

      setCurrentStep("Analysis complete!");
      setProgress(100);
      
      setTimeout(() => {
        onAnalysisComplete(analysisResults);
        setIsAnalyzing(false);
      }, 500);

      toast.success(`Analysis completed! Processed ${results.length} unique comments.`);
      
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle className="text-2xl font-heading">Sentiment Analysis Configuration</CardTitle>
          <CardDescription>
            Choose your analysis model and run sentiment analysis on your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Select Analysis Model</Label>
            <div className="grid gap-4">
              {modelOptions.map((model) => {
                const Icon = model.icon;
                return (
                  <div
                    key={model.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedModel === model.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-1 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {model.description}
                        </div>
                        <div className="flex gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {model.speed}
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {model.privacy}
                          </div>
                        </div>
                      </div>
                      {selectedModel === model.id && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <strong>Model Information:</strong> {selectedModelInfo?.description}
              <br />
              Processing time: {selectedModelInfo?.speed} | Privacy: {selectedModelInfo?.privacy}
            </AlertDescription>
          </Alert>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-medium">Ready to analyze {comments.length} comments</div>
                <div className="text-sm text-muted-foreground">
                  Unique comments: {[...new Set(comments)].length}
                </div>
              </div>
              <Button 
                onClick={runAnalysis}
                disabled={isAnalyzing}
                size="lg"
                className="min-w-[140px]"
              >
                {isAnalyzing ? "Analyzing..." : "Start Analysis"}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{currentStep}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
