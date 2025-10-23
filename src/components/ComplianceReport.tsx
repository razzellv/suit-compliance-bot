import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Finding {
  field: string;
  value: string;
  flag: string;
  severity: "Minor" | "Moderate" | "Severe";
}

interface ComplianceData {
  system: string;
  dateRange: string;
  complianceScore: number;
  findings: Finding[];
  recommendedActions: string[];
  status: "compliant" | "review" | "critical";
}

interface ComplianceReportProps {
  data: ComplianceData;
}

export const ComplianceReport = ({ data }: ComplianceReportProps) => {
  const getStatusBadge = () => {
    switch (data.status) {
      case "compliant":
        return (
          <Badge className="bg-success text-success-foreground gap-2">
            <CheckCircle className="h-4 w-4" /> Compliant
          </Badge>
        );
      case "review":
        return (
          <Badge className="bg-warning text-warning-foreground gap-2">
            <AlertTriangle className="h-4 w-4" /> Needs Review
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-destructive text-destructive-foreground gap-2">
            <AlertCircle className="h-4 w-4" /> Critical
          </Badge>
        );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Minor":
        return "text-success";
      case "Moderate":
        return "text-warning";
      case "Severe":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{data.system}</h2>
            <p className="text-muted-foreground">{data.dateRange}</p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Compliance Score</span>
              <span className="text-2xl font-bold text-neon">{data.complianceScore}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-primary neon-glow transition-all duration-500"
                style={{ width: `${data.complianceScore}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {data.findings.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Compliance Findings
          </h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Flag</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.findings.map((finding, index) => (
                  <TableRow key={index} className="hover:bg-secondary/30">
                    <TableCell className="font-medium">{finding.field}</TableCell>
                    <TableCell>{finding.value}</TableCell>
                    <TableCell>{finding.flag}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${getSeverityColor(finding.severity)}`}>
                        {finding.severity}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recommended Actions</h3>
        <ul className="space-y-3">
          {data.recommendedActions.map((action, index) => (
            <li key={index} className="flex gap-3">
              <span className="text-primary font-bold mt-1">•</span>
              <span className="text-foreground">{action}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex gap-4">
        <Button className="neon-glow gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
        <Button variant="secondary">Send to Portal</Button>
        <Button variant="secondary">Flag Technician</Button>
      </div>
    </div>
  );
};
