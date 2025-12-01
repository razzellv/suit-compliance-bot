import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, DollarSign, TrendingUp, Shield, FileText, Send, Mail, Wrench, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface RiskAnalysisProps {
  data: any;
  onExport: (type: string) => void;
}

export const RiskAnalysis = ({ data, onExport }: RiskAnalysisProps) => {
  const getRiskColor = (category: string) => {
    switch (category) {
      case "Good Standing":
        return "text-success border-success/50 bg-success/10";
      case "Moderate Risk":
        return "text-warning border-warning/50 bg-warning/20";
      case "High Risk":
      case "Critical":
        return "text-destructive border-destructive/50 bg-destructive/10";
      default:
        return "text-foreground";
    }
  };

  const getRiskIcon = (category: string) => {
    if (category === "Good Standing") return "✅";
    if (category === "Moderate Risk") return "⚠️";
    if (category === "High Risk") return "🔴";
    return "⚠️";
  };

  return (
    <div className="space-y-6">
      <Card className={`p-6 border-2 ${getRiskColor(data.Risk_Category)}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getRiskIcon(data.Risk_Category)}</span>
              <div>
                <h3 className="text-2xl font-bold">{data.Name}</h3>
                <p className="text-sm text-muted-foreground">
                  {data.Employee_ID} • {data.Department}
                </p>
              </div>
            </div>
            <Badge className={`${getRiskColor(data.Risk_Category)}`}>
              {data.Risk_Category}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Risk Score</div>
            <div className="text-3xl font-bold text-neon">
              {(data.Severity_Score * 100).toFixed(1)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card/50 p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-1">Total Violations</div>
            <div className="text-2xl font-bold">{data.Total_Violations}</div>
          </div>
          <div className="bg-card/50 p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-1">Avg Severity</div>
            <div className="text-2xl font-bold text-warning">
              {(data.Average_Severity * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-card/50 p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-1">Ethical Index</div>
            <div className="text-2xl font-bold text-success">
              {data.Ethical_Integrity_Index.toFixed(1)}
            </div>
          </div>
          <div className="bg-card/50 p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-1">Risk Cost Impact</div>
            <div className="text-2xl font-bold text-destructive">
              ${data.Risk_Cost_Impact?.toLocaleString() || '0'}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Ethical Integrity</span>
              <span className="font-semibold">{data.Ethical_Integrity_Index.toFixed(1)}%</span>
            </div>
            <Progress value={data.Ethical_Integrity_Index} className="h-2" />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-primary/20">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Violation Details
        </h4>
        <div className="space-y-3">
          {data.Violations.map((violation: any, index: number) => (
            <div key={index} className="bg-card/50 p-4 rounded-lg border border-border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-semibold">{violation.Type}</h5>
                  {violation.Code && (
                    <p className="text-xs text-muted-foreground">{violation.Code} • {violation.Category}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-warning border-warning/50">
                  Severity: {(violation.Percent * 100).toFixed(0)}%
                </Badge>
              </div>
              {violation.Description && (
                <p className="text-sm text-muted-foreground">{violation.Description}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {data.Work_Order_Suggestions && data.Work_Order_Suggestions.length > 0 && (
        <Card className="p-6 border-primary/20">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Work Order Recommendations
          </h4>
          <div className="space-y-3">
            {data.Work_Order_Suggestions.map((wo: any, index: number) => (
              <div key={index} className="bg-card/50 p-4 rounded-lg border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-semibold">{wo.violation}</h5>
                    <p className="text-xs text-muted-foreground">{wo.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{wo.department}</Badge>
                    <Badge className={
                      wo.priority === "High" ? "bg-destructive" :
                      wo.priority === "Medium" ? "bg-warning" : "bg-success"
                    }>
                      {wo.priority}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{wo.action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.Equipment_Intelligence && data.Equipment_Intelligence.length > 0 && (
        <Card className="p-6 border-primary/20">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Equipment Intelligence & ATI Recommendations
          </h4>
          <div className="space-y-4">
            {data.Equipment_Intelligence.map((eq: any, index: number) => (
              <div key={index} className="bg-card/50 p-4 rounded-lg border border-border">
                <h5 className="font-semibold mb-3">{eq.violation}</h5>
                <ul className="space-y-2">
                  {eq.suggestions.map((suggestion: string, sIndex: number) => (
                    <li key={sIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">→</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 border-primary/20">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Metadata
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Supervisor:</span>
            <span className="ml-2 font-semibold">{data.Supervisor}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Facility:</span>
            <span className="ml-2 font-semibold">{data.Facility}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>
            <span className="ml-2 font-semibold">
              {new Date(data.Date).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Shift:</span>
            <span className="ml-2 font-semibold">{data.Shift}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-primary/20">
        <h4 className="font-semibold text-lg mb-4">Export & Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button onClick={() => onExport("pdf")} variant="outline" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
          <Button onClick={() => onExport("portal")} variant="outline" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send to Portal
          </Button>
          <Button onClick={() => onExport("email")} variant="outline" className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Notify Supervisor
          </Button>
        </div>
      </Card>
    </div>
  );
};
