import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign, Clock, Activity } from "lucide-react";

interface AIIssue {
  problemDetected: string;
  severity: "Low" | "Moderate" | "Severe" | "Critical";
  possibleCauses: string[];
  recommendedActions: string[];
  monitoringSuggestions: string[];
  estimatedRiskCost: number;
  notes?: string;
}

interface AISummary {
  complianceScore: number;
  numberOfIssues: number;
  criticalFlags: number;
  overallPriority: "Low" | "Medium" | "High";
}

interface AIComplianceAnalysisProps {
  issues: AIIssue[];
  summary: AISummary;
}

export const AIComplianceAnalysis = ({ issues, summary }: AIComplianceAnalysisProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "text-success border-success/50 bg-success/10";
      case "Moderate":
        return "text-warning border-warning/50 bg-warning/10";
      case "Severe":
      case "Critical":
        return "text-destructive border-destructive/50 bg-destructive/10";
      default:
        return "text-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-success text-success-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "High":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-primary/20 neon-glow">
        <h3 className="text-2xl font-bold mb-6 text-neon flex items-center gap-2">
          <Activity className="h-6 w-6" />
          AI-Powered Compliance Analysis
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card/50 p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-1">Compliance Score</div>
            <div className="text-2xl font-bold text-neon">{summary.complianceScore}%</div>
          </div>
          <div className="bg-card/50 p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-1">Total Issues</div>
            <div className="text-2xl font-bold">{summary.numberOfIssues}</div>
          </div>
          <div className="bg-card/50 p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-1">Critical Flags</div>
            <div className="text-2xl font-bold text-destructive">{summary.criticalFlags}</div>
          </div>
          <div className="bg-card/50 p-4 rounded-lg border border-border">
            <div className="text-sm text-muted-foreground mb-1">Priority Level</div>
            <Badge className={`mt-1 ${getPriorityColor(summary.overallPriority)}`}>
              {summary.overallPriority}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {issues.map((issue, index) => (
          <Card key={index} className={`p-6 border ${getSeverityColor(issue.severity)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${getSeverityColor(issue.severity)}`} />
                <div>
                  <h4 className="text-lg font-semibold">{issue.problemDetected}</h4>
                  <Badge variant="outline" className={`mt-1 ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm bg-card/50 px-3 py-1 rounded-lg">
                <DollarSign className="h-4 w-4 text-warning" />
                <span className="font-semibold">${issue.estimatedRiskCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-sm text-primary mb-2">Possible Causes:</h5>
                <ul className="space-y-1">
                  {issue.possibleCauses.map((cause, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-primary">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-sm text-primary mb-2">Recommended Actions:</h5>
                <ul className="space-y-1">
                  {issue.recommendedActions.map((action, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-primary">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-secondary/30 p-3 rounded-lg">
                <h5 className="font-semibold text-sm flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Monitoring Suggestions:
                </h5>
                <ul className="space-y-1">
                  {issue.monitoringSuggestions.map((suggestion, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-primary">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {issue.notes && (
                <div className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3">
                  {issue.notes}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
