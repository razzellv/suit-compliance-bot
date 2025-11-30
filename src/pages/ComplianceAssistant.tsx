import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, MessageSquare } from "lucide-react";
import { ComplianceIssueForm } from "@/components/ComplianceIssueForm";
import { ComplianceChat } from "@/components/ComplianceChat";
import { ComplianceAnalysisResult } from "@/components/ComplianceAnalysisResult";

const ComplianceAssistant = () => {
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-neon">
                  Compliance Intelligence Assistant
                </h1>
                <p className="text-sm text-muted-foreground">
                  Nexum Suum™ — Compliance through Clarity
                </p>
              </div>
            </div>
            <Link to="/virtuous">
              <Button variant="outline" size="sm">
                Virtuous Analyzer
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card border-border">
              <Tabs defaultValue="form" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="form" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Issue Form
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    AI Chat
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="form">
                  <ComplianceIssueForm onAnalysisComplete={setAnalysisResult} />
                </TabsContent>

                <TabsContent value="chat">
                  <ComplianceChat onAnalysisComplete={setAnalysisResult} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {analysisResult ? (
              <ComplianceAnalysisResult analysis={analysisResult} />
            ) : (
              <Card className="p-6 bg-card/50 border-border border-dashed">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    Submit an issue or chat with the AI to see analysis results
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComplianceAssistant;
