import { useState } from "react";
import { ViolationForm } from "@/components/ViolationForm";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { postToUnifiedAPI, triggerMakeWebhook } from "@/utils/apiClient";
import { Link } from "react-router-dom";

const VirtuousAnalyzer = () => {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    toast.info("Analyzing risk profile...");

    try {
      // Post to unified API
      await postToUnifiedAPI(data);
      
      // Trigger Make.com webhook
      await triggerMakeWebhook("employee", data);
      
      setAnalysisData(data);
      toast.success("Risk analysis complete", {
        description: `${data.Risk_Category} - ${data.Total_Violations} violations detected`,
      });
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to analyze risk profile", {
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    toast.info(`Exporting as ${type}...`);
    
    try {
      if (type === "portal") {
        await triggerMakeWebhook("employee", {
          ...analysisData,
          export_type: "portal"
        });
      } else if (type === "email") {
        await triggerMakeWebhook("employee", {
          ...analysisData,
          export_type: "email"
        });
      } else if (type === "pdf") {
        // AWS Lambda PDF generation would go here
        toast.success("PDF generation initiated");
      }
      
      toast.success(`${type} export complete`);
    } catch (error) {
      toast.error(`Failed to export as ${type}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 neon-glow">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neon">Virtuous Analyzer</h1>
                <p className="text-sm text-muted-foreground">
                  Track ethical performance & accountability
                </p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Compliance Tool
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {!analysisData ? (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 text-neon">
                  Employee Violation & Risk Assessment
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Enter employee violation data to calculate risk scores, ethical standing,
                  and generate comprehensive accountability reports
                </p>
              </div>
              
              <ViolationForm onSubmit={handleSubmit} isLoading={isLoading} />
              
              <div className="mt-8 p-6 bg-card/50 rounded-lg border border-border">
                <h3 className="font-semibold mb-4 text-primary">Risk Categories:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <span><strong>&lt;0.35:</strong> Good Standing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <span><strong>0.35–0.68:</strong> Warning</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🟠</span>
                    <span><strong>0.69–1.04:</strong> Medium Risk (Write-Up)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔴</span>
                    <span><strong>≥1.05:</strong> High Risk (Suspend/Review)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Button onClick={() => setAnalysisData(null)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
              <RiskAnalysis data={analysisData} onExport={handleExport} />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Virtuous Analytics powered by Nexum Suum</p>
            <p className="mt-2">ISO 27001 / SOC 2 Secure</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VirtuousAnalyzer;
