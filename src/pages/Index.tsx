import { useState } from "react";
import { ComplianceUploader } from "@/components/ComplianceUploader";
import { ComplianceReport } from "@/components/ComplianceReport";
import { Settings, Database } from "lucide-react";
import { toast } from "sonner";
import {
  validateLogs,
  calculateComplianceScore,
  determineStatus,
} from "@/utils/complianceValidator";

const Index = () => {
  const [reportData, setReportData] = useState<any>(null);

  const handleFileUpload = (file: File) => {
    toast.success("File uploaded successfully", {
      description: `Processing ${file.name}...`,
    });

    // Simulate processing and validation
    setTimeout(() => {
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
      toast.success("Analysis complete", {
        description: `Compliance score: ${score}%`,
      });
    }, 2000);
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
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
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
            <ComplianceReport data={reportData} />
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
