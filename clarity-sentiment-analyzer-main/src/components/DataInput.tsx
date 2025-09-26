import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertTriangle, Check } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

interface ParsedData {
  comments: string[];
  rawCount: number;
  uniqueCount: number;
  duplicateCount: number;
  singleTokenWarning: boolean;
  singleTokenPercentage: number;
}

interface DataInputProps {
  onDataParsed: (data: ParsedData) => void;
  onConfirmAnalysis: (data: ParsedData) => void;
}

export const DataInput = ({ onDataParsed, onConfirmAnalysis }: DataInputProps) => {
  const [activeTab, setActiveTab] = useState("paste");
  const [textInput, setTextInput] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [useDemo, setUseDemo] = useState(false);
  const [treatAsSingleTokens, setTreatAsSingleTokens] = useState(false);

  const demoData = [
    “The new policy on CSR compliance is very clear and easy to follow.”
    “I appreciate the transparency MCA provides in publishing updated policies.”
    “This policy simplifies the process for start-ups to raise capital.”
    “Good initiative! The amendments to LLP regulations make compliance easier.”
    “The detailed guidelines for e-filing help reduce errors significantly.”
    “I like that the portal explains the rationale behind each policy update.”
    “The policy changes are well-structured and actionable.”  
    “MCA is making efforts to align corporate policies with global best practices.”
    “The new policy on company audits is too complicated to understand.”
    “I think these changes will create more paperwork than needed.”
    “Some policy guidelines are vague and open to misinterpretation.”
“The portal doesn’t provide enough examples for policy implementation.”
“It’s frustrating that policy updates are not communicated clearly.”
“Certain compliance deadlines seem unrealistic for small businesses.”
“The latest amendments make filing forms unnecessarily complex.”
“It’s difficult to understand the technical terms used in the policy document.”
“Policies are frequently updated, causing confusion among companies.”
“I expected more clarity on penalties for non-compliance.”
“The explanation for new financial regulations is too brief.”
“Some policies feel biased towards larger corporations.”
“I had to consult multiple sources to understand the policy fully.”
“Downloading policy documents sometimes fails on the portal.”
“Notifications for policy updates are often delayed.”
“The formatting of policy PDFs is inconsistent and hard to read.”
“The policy seems reasonable, but I need more time to assess its impact.”
“I understand the purpose of the policy, though some areas are unclear.”
“The portal provides the document, but a summary would be helpful.”
“I’m neutral on this amendment; it may benefit some companies, not others.”
“The policy is fine, but examples or case studies would make it better.”
“I need to see how enforcement works before forming an opinion.”
“Overall, the policy is informative, though it could be more user-friendly.”
  ];

  const processTextInput = useCallback((text: string) => {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      throw new Error("No valid comments found in input");
    }

    // Check for single-token lines
    const singleTokenLines = lines.filter(line => 
      line.length <= 3 || line.split(/\s+/).length === 1
    );
    const singleTokenPercentage = (singleTokenLines.length / lines.length) * 100;
    const singleTokenWarning = singleTokenPercentage > 40;

    const uniqueComments = [...new Set(lines)];
    
    return {
      comments: lines,
      rawCount: lines.length,
      uniqueCount: uniqueComments.length,
      duplicateCount: lines.length - uniqueComments.length,
      singleTokenWarning,
      singleTokenPercentage
    };
  }, []);

  const handleTextParse = () => {
    try {
      let inputText = textInput;
      
      if (useDemo) {
        inputText = demoData.join('\n');
        setTextInput(inputText);
      }

      if (!inputText.trim()) {
        toast.error("Please enter some text to analyze");
        return;
      }

      const parsed = processTextInput(inputText);
      setParsedData(parsed);
      onDataParsed(parsed);
      toast.success(`Parsed ${parsed.rawCount} comments successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to parse text input");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setCsvFile(file);
    
    Papa.parse(file, {
      header: true,
      preview: 5,
      complete: (results) => {
        const headers = Object.keys(results.data[0] as any);
        setCsvHeaders(headers);
        
        // Auto-detect comment columns
        const commentColumns = headers.filter(header => 
          /comment|feedback|text|message|review|opinion/i.test(header)
        );
        
        if (commentColumns.length > 0) {
          setSelectedColumn(commentColumns[0]);
        }
        
        toast.success(`CSV uploaded with ${headers.length} columns detected`);
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const handleCsvParse = () => {
    if (!csvFile || !selectedColumn) {
      toast.error("Please select a CSV file and column");
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      complete: (results) => {
        try {
          const comments = results.data
            .map((row: any) => row[selectedColumn])
            .filter((comment: string) => comment && comment.trim().length > 0)
            .map((comment: string) => comment.trim());

          if (comments.length === 0) {
            throw new Error("No valid comments found in selected column");
          }

          const parsed = processTextInput(comments.join('\n'));
          setParsedData(parsed);
          onDataParsed(parsed);
          toast.success(`Parsed ${parsed.rawCount} comments from CSV`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed to parse CSV data");
        }
      },
      error: (error) => {
        toast.error(`Failed to process CSV: ${error.message}`);
      }
    });
  };

  const handleConfirm = () => {
    if (!parsedData) return;
    
    let finalData = { ...parsedData };
    
    if (parsedData.singleTokenWarning && !treatAsSingleTokens) {
      // User confirmed to treat as comments despite warning
      finalData.singleTokenWarning = false;
    }
    
    onConfirmAnalysis(finalData);
    toast.success("Analysis started!");
  };

  return (
    <div className="space-y-6">
      <Card className="analytics-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-heading">Data Input</CardTitle>
              <CardDescription>
                Upload your data for sentiment analysis. Choose between pasting text or uploading a CSV file.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="demo-mode"
                checked={useDemo}
                onCheckedChange={setUseDemo}
              />
              <Label htmlFor="demo-mode" className="text-sm">Use demo data (for testing)</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Paste Text
              </TabsTrigger>
              <TabsTrigger value="csv" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload CSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">Paste your comments (one per line)</Label>
                <Textarea
                  id="text-input"
                  placeholder="Enter your comments here, one comment per line..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <Button onClick={handleTextParse} className="w-full">
                Parse Text Input
              </Button>
            </TabsContent>

            <TabsContent value="csv" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-upload">Upload CSV file</Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
              </div>
              
              {csvHeaders.length > 0 && (
                <div className="space-y-2">
                  <Label>Select column containing comments</Label>
                  <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a column..." />
                    </SelectTrigger>
                    <SelectContent>
                      {csvHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button 
                onClick={handleCsvParse} 
                disabled={!csvFile || !selectedColumn}
                className="w-full"
              >
                Parse CSV Data
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {parsedData && (
        <Card className="analytics-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-sentiment-positive" />
              Data Preview
            </CardTitle>
            <CardDescription>
              Review your parsed data before analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-metric text-primary">{parsedData.rawCount}</div>
                <div className="text-metric-label">Total Comments</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-metric text-analytics-green">{parsedData.uniqueCount}</div>
                <div className="text-metric-label">Unique Comments</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-metric text-analytics-orange">{parsedData.duplicateCount}</div>
                <div className="text-metric-label">Duplicates</div>
              </div>
            </div>

            {parsedData.singleTokenWarning && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      ⚠️ Detected {parsedData.singleTokenPercentage.toFixed(1)}% single-word lines — 
                      did you paste keywords instead of full comments?
                    </p>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="treat-as-tokens"
                        checked={treatAsSingleTokens}
                        onCheckedChange={setTreatAsSingleTokens}
                      />
                      <Label htmlFor="treat-as-tokens">
                        Treat as keywords (word cloud only, no sentiment analysis)
                      </Label>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Sample Data (first 8 items)</Label>
              <div className="bg-muted rounded-lg p-4 max-h-60 overflow-y-auto">
                {parsedData.comments.slice(0, 8).map((comment, index) => (
                  <div key={index} className="flex gap-2 py-1">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-sm font-mono">{comment}</span>
                  </div>
                ))}
                {parsedData.comments.length > 8 && (
                  <div className="text-sm text-muted-foreground mt-2">
                    ... and {parsedData.comments.length - 8} more comments
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleConfirm} size="lg" className="w-full">
              Confirm & Analyze Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
