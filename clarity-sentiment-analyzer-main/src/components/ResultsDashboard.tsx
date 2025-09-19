import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Search, Filter, TrendingUp, Users, Target, Brain } from "lucide-react";
import { toast } from "sonner";
import { WordCloudComponent } from "./WordCloud";

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

interface ResultsDashboardProps {
  results: AnalysisResults;
  onNewAnalysis: () => void;
}

const SENTIMENT_COLORS = {
  positive: 'hsl(var(--sentiment-positive))',
  negative: 'hsl(var(--sentiment-negative))',
  neutral: 'hsl(var(--sentiment-neutral))'
};

export const ResultsDashboard = ({ results, onNewAnalysis }: ResultsDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("confidence");

  const filteredResults = results.results.filter(result => {
    const matchesSearch = result.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSentiment = sentimentFilter === "all" || result.sentiment === sentimentFilter;
    return matchesSearch && matchesSentiment;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "confidence":
        return b.confidence - a.confidence;
      case "sentiment":
        return a.sentiment.localeCompare(b.sentiment);
      case "length":
        return b.comment.length - a.comment.length;
      default:
        return 0;
    }
  });

  const pieData = [
    { name: 'Positive', value: results.sentimentCounts.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: results.sentimentCounts.neutral, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: results.sentimentCounts.negative, color: SENTIMENT_COLORS.negative }
  ].filter(item => item.value > 0);

  const barData = [
    { sentiment: 'Positive', count: results.sentimentCounts.positive, percentage: (results.sentimentCounts.positive / results.uniqueComments * 100).toFixed(1) },
    { sentiment: 'Neutral', count: results.sentimentCounts.neutral, percentage: (results.sentimentCounts.neutral / results.uniqueComments * 100).toFixed(1) },
    { sentiment: 'Negative', count: results.sentimentCounts.negative, percentage: (results.sentimentCounts.negative / results.uniqueComments * 100).toFixed(1) }
  ];

  const exportToCsv = () => {
    const csvContent = [
      ['Comment ID', 'Text', 'Sentiment', 'Confidence', 'Keywords'].join(','),
      ...results.results.map((result, index) => [
        index + 1,
        `"${result.comment.replace(/"/g, '""')}"`,
        result.sentiment,
        result.confidence.toFixed(3),
        `"${result.keywords.join(', ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sentiment_analysis_${results.jobId}.csv`;
    link.click();
    toast.success("Results exported to CSV");
  };

  const getSentimentBadge = (sentiment: string) => {
    const variants = {
      positive: "sentiment-positive",
      negative: "sentiment-negative",
      neutral: "sentiment-neutral"
    };
    return variants[sentiment as keyof typeof variants] || "default";
  };

  // Prepare word cloud data
  const wordFrequency: Record<string, number> = {};
  results.results.forEach(result => {
    result.keywords.forEach(keyword => {
      wordFrequency[keyword] = (wordFrequency[keyword] || 0) + 1;
    });
    
    // Also extract words from comments for more comprehensive word cloud
    const words = result.comment.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
  });

  const wordCloudData = Object.entries(wordFrequency)
    .map(([text, size]) => ({ text, size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 100); // Limit to top 100 words

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="analytics-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-heading">Analysis Results</CardTitle>
              <CardDescription>
                Job ID: {results.jobId} | Analyzed: {results.timestamp.toLocaleString()} | Model: {results.modelUsed}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCsv} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={onNewAnalysis} size="sm">
                New Analysis
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="analytics-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <div className="text-metric">{results.totalComments}</div>
                <div className="text-metric-label">Total Comments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="analytics-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-analytics-green" />
              <div>
                <div className="text-metric">{results.uniqueComments}</div>
                <div className="text-metric-label">Unique Comments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="analytics-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-analytics-blue" />
              <div>
                <div className="text-metric">{results.satisfactionScore}%</div>
                <div className="text-metric-label">Satisfaction Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="analytics-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-analytics-purple" />
              <div>
                <div className="text-metric">{(results.averageConfidence * 100).toFixed(1)}%</div>
                <div className="text-metric-label">Avg Confidence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Score Formula */}
      <Card className="analytics-card">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <strong>Satisfaction Score Formula:</strong> 
            {' '}((Positive + 0.5 × Neutral) / Total) × 100 = 
            {' '}(({results.sentimentCounts.positive} + 0.5 × {results.sentimentCounts.neutral}) / {results.uniqueComments}) × 100 = 
            {' '}<strong>{results.satisfactionScore}%</strong>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="analytics-card">
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Overall sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="analytics-card">
          <CardHeader>
            <CardTitle>Sentiment Counts</CardTitle>
            <CardDescription>Detailed breakdown with percentages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sentiment" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'count' ? 'Count' : 'Percentage']}
                    labelFormatter={(label) => `Sentiment: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))"
                    label={{ position: 'top' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Word Cloud */}
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle>Word Cloud</CardTitle>
          <CardDescription>Most frequent words and keywords from your data</CardDescription>
        </CardHeader>
        <CardContent>
          <WordCloudComponent words={wordCloudData} />
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>Per-comment analysis with sentiment, confidence, and keywords</CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search comments and keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confidence">By Confidence</SelectItem>
                  <SelectItem value="sentiment">By Sentiment</SelectItem>
                  <SelectItem value="length">By Length</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Keywords</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedResults.map((result, index) => (
                  <TableRow key={index} className="data-row">
                    <TableCell className="font-mono text-sm">
                      {results.results.indexOf(result) + 1}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={result.comment}>
                        {result.comment}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSentimentBadge(result.sentiment)}>
                        {result.sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-data">
                      {(result.confidence * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {result.keywords.slice(0, 3).map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {result.keywords.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{result.keywords.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {sortedResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No results match your current filters.
            </div>
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {sortedResults.length} of {results.results.length} comments
          </div>
        </CardContent>
      </Card>
    </div>
  );
};