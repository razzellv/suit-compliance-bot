import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  Send, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface ComplianceAnalysisResultProps {
  analysis: any;
}

export const ComplianceAnalysisResult = ({ analysis }: ComplianceAnalysisResultProps) => {
  const handleCreateWorkOrder = () => {
    toast.success("Work Order Created", {
      description: `Priority: ${analysis.workOrder?.priority || "Medium"}`,
    });
  };

  const handleDownloadPDF = () => {
    toast.info("PDF Generation", {
      description: "Preparing your compliance report...",
    });
  };

  const handleSendToSupervisor = () => {
    toast.success("Sent to Supervisor Review Board", {
      description: "Your report has been forwarded for review.",
    });
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return "text-destructive";
    if (severity >= 50) return "text-warning";
    return "text-success";
  };

  return (
    <div className="space-y-4">
      {/* Severity Score Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Severity Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("text-4xl font-bold mb-2", getSeverityColor(analysis.findings?.severityScore || 0))}>
            {analysis.findings?.severityScore || 0}
            <span className="text-lg text-muted-foreground">/100</span>
          </div>
          <Badge variant={
            analysis.findings?.operationalRiskLevel === "Emergency" ? "destructive" :
            analysis.findings?.operationalRiskLevel === "High" ? "default" :
            "secondary"
          }>
            {analysis.findings?.operationalRiskLevel || "Medium"} Risk
          </Badge>
        </CardContent>
      </Card>

      {/* Findings Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Issue Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Root Cause</p>
            <p className="text-sm">{analysis.findings?.rootCause || "Analyzing..."}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground mb-1">System Impact</p>
            <p className="text-sm">{analysis.findings?.systemImpact || "Under review"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Work Order Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Work Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Department</span>
            <Badge variant="outline">{analysis.workOrder?.department || "TBD"}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Priority</span>
            <Badge>{analysis.workOrder?.priority || "Medium"}</Badge>
          </div>
          <Separator />
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Est. Cost:</span>
            <span className="font-medium">{analysis.workOrder?.estimatedCost || "TBD"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            className="w-full justify-start" 
            variant="default"
            onClick={handleCreateWorkOrder}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Create Work Order
          </Button>
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleDownloadPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </Button>
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleSendToSupervisor}
          >
            <Send className="mr-2 h-4 w-4" />
            Send to Supervisor Board
          </Button>
        </CardContent>
      </Card>

      {/* Supervisor Summary */}
      {analysis.supervisorSummary && (
        <Card className="bg-muted/50 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Board Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.supervisorSummary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
