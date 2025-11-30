import { useState } from "react";
import { ComplianceUploader } from "@/components/ComplianceUploader";
import { ComplianceReport } from "@/components/ComplianceReport";
import { AIComplianceAnalysis } from "@/components/AIComplianceAnalysis";
import { Settings, Database, Loader2, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { postToUnifiedAPI, triggerMakeWebhook } from "@/utils/apiClient";
import { Link } from "react-router-dom";
import {
  validateLogs,
  calculateComplianceScore,
  determineStatus,
} from "@/utils/complianceValidator";

const Index = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    toast.success("File uploaded successfully", {
      description: `Processing ${file.name}...`,
    });

    setIsAnalyzing(true);

    try {
      let analysisPayload: any = {
        systemType: "Multi-System Facility",
        dateRange: new Date().toISOString()
      };

      // Check if file is an image
      if (file.type.startsWith('image/')) {
        toast.info("Analyzing equipment image with AI...");
        
        // Convert image to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        const base64Image = await base64Promise;
        analysisPayload.images = [base64Image];
        analysisPayload.findings = null;
        
        // Call AI analysis directly for images
        const { data: analysisData, error } = await supabase.functions.invoke(
          "analyze-compliance",
          { body: analysisPayload }
        );

        if (error) {
          console.error("AI analysis error:", error);
          toast.error("Image analysis failed", {
            description: error.message || "Please try again",
          });
          setIsAnalyzing(false);
          return;
        }
        
        // Display results
        setAiAnalysis(analysisData);
        
        // Create report data from image analysis
        const imageReport = {
          system: analysisData.summary?.equipmentType || "Equipment",
          dateRange: new Date().toLocaleDateString(),
          complianceScore: analysisData.summary?.complianceScore || 0,
          findings: analysisData.issues?.map((issue: any) => ({
            field: issue.problemDetected,
            value: issue.notes || "See image",
            flag: issue.severity === "Critical" ? "Critical" : issue.severity === "Severe" ? "Above Limit" : "Needs Attention",
            severity: issue.severity,
          })) || [],
          recommendedActions: analysisData.issues?.flatMap((issue: any) => issue.recommendedActions) || [],
          status: analysisData.summary?.overallPriority === "High" ? "critical" : analysisData.summary?.overallPriority === "Medium" ? "review" : "compliant",
        };
        
        setReportData(imageReport);
        
        // Post to unified API
        const apiPayload = {
          Report_ID: `NS-COMP-${Date.now()}`,
          Facility: imageReport.system,
          Auditor: "AI-Image-Analysis-Bot",
          Date: new Date().toISOString(),
          Compliance_Issues: imageReport.findings,
          AI_Analysis: analysisData,
          Export: {
            Send_to_Portal: true,
            Generate_PDF: true,
            Send_Email: true
          }
        };
        
        await postToUnifiedAPI(apiPayload);
        await triggerMakeWebhook("compliance", apiPayload);
        
        toast.success("Image analysis complete", {
          description: `Compliance report generated`,
        });
        
        setIsAnalyzing(false);
        return;
      }

      // For non-image files, use existing flow
      // Mock data for demonstration
      const mockLogs = [
        { steamPressure: 145, stackTemp: 612, waterLevel: "Normal" },
        { steamPressure: 148, stackTemp: 540, waterLevel: "Normal" },
      ];

      const findings = validateLogs(mockLogs, "boiler");
      const score = calculateComplianceScore(mockLogs.length * 3, findings);
      const status = determineStatus(score);

      const mockReport = {
        system: "Boiler #2",
        dateRange: "2025-10-01 → 2025-10-23",
        complianceScore: score,
        findings: findings.length > 0 ? findings : [
          {
            field: "Stack Temp",
            value: "612 °F",
            flag: "Above Limit",
            severity: "Moderate" as const,
          },
          {
            field: "Blowdown Record",
            value: "Missing",
            flag: "Non-Compliant",
            severity: "Moderate" as const,
          },
        ],
        recommendedActions: [
          "Inspect heat-transfer surface for soot buildup",
          "Add daily blowdown verification to operator checklist",
          "Schedule maintenance review within 48 hours",
          "Update operator training on stack temperature monitoring",
        ],
        status,
      };

      setReportData(mockReport);

      // Call AI analysis
      toast.info("Running AI analysis...");
      
      const { data: analysisData, error } = await supabase.functions.invoke(
        "analyze-compliance",
        {
          body: {
            findings: mockReport.findings,
            systemType: "Boiler",
            dateRange: mockReport.dateRange,
          },
        }
      );

        if (error) {
          console.error("AI analysis error:", error);
        toast.error("AI analysis failed", {
          description: error.message || "Please try again",
        });
        setIsAnalyzing(false);
        return;
      } else {
          setAiAnalysis(analysisData);
          
          // Post to unified API
          const apiPayload = {
            Report_ID: `NS-COMP-${Date.now()}`,
            Facility: mockReport.system,
            Auditor: "AI-Compliance-Bot",
            Date: new Date().toISOString(),
            Compliance_Issues: mockReport.findings,
            Facility_Metrics: {
              Energy_kWh: 3420,
              Water_Gal: 212,
              Runtime_Hours: 10,
              Waste_lb: 14,
              Efficiency_Score: 91
            },
            SummaryMetrics: {
              Total_Issues: mockReport.findings.length,
              Critical_Count: mockReport.findings.filter((f: any) => f.severity === "Critical").length,
              Compliance_Score: mockReport.complianceScore,
              Facility_Score: 92,
              Overall_Priority: mockReport.status === "critical" ? "High" : mockReport.status === "review" ? "Medium" : "Low"
            },
            AI_Analysis: analysisData,
            Export: {
              Send_to_Portal: true,
              Generate_PDF: true,
              Send_Email: true
            }
          };
          
          await postToUnifiedAPI(apiPayload);
          await triggerMakeWebhook("compliance", apiPayload);
          
        toast.success("AI analysis complete", {
          description: `Report synced to dashboard`,
        });
      }
      
      setIsAnalyzing(false);
    } catch (err) {
      console.error("Error in file upload:", err);
      toast.error("Failed to process file");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 neon-glow">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neon">Nexum Suum</h1>
                <p className="text-sm text-muted-foreground">Compliance AI Checker</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/compliance">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Compliance Assistant
                </Button>
              </Link>
              <Link to="/virtuous">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Virtuous Analyzer
                </Button>
              </Link>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-neon">
              Facility Operations Compliance Auditor
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload facility logs to analyze compliance with regulatory standards for
              boilers, chillers, compressors, HVAC systems, and EHS operations
            </p>
          </div>

          {!reportData ? (
            <div className="max-w-2xl mx-auto">
              <ComplianceUploader onFileUpload={handleFileUpload} />
              
              <div className="mt-8 p-6 bg-card/50 rounded-lg border border-border">
                <h3 className="font-semibold mb-4 text-primary">Validated Systems:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary neon-glow" />
                    <span>Boilers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary neon-glow" />
                    <span>Chillers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary neon-glow" />
                    <span>Compressors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary neon-glow" />
                    <span>HVAC Systems</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <ComplianceReport data={reportData} />
              
              {isAnalyzing && (
                <div className="flex items-center justify-center gap-3 p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-lg">Running AI compliance analysis...</span>
                </div>
              )}
              
              {aiAnalysis && !isAnalyzing && (
                <AIComplianceAnalysis 
                  issues={aiAnalysis.issues} 
                  summary={aiAnalysis.summary} 
                />
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Nexum Suum Compliance AI Checker</p>
            <p className="mt-2">Industrial facility compliance auditing powered by AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
