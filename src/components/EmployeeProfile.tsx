import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EmployeeProfileProps {
  profile: {
    Employee_ID?: string;
    Role?: string;
    Department?: string;
    Salary?: number;
    Duty?: string;
    Importance?: string;
    Violation?: string;
    Severity?: number;
    RiskScore?: number;
    Category?: string;
  };
}

export const EmployeeProfile = ({ profile }: EmployeeProfileProps) => {
  const getRiskColor = (category?: string) => {
    if (!category) return "bg-secondary";
    const cat = category.toLowerCase();
    if (cat.includes("good") || cat.includes("standing")) return "bg-green-500";
    if (cat.includes("warning")) return "bg-yellow-500";
    if (cat.includes("medium")) return "bg-orange-500";
    if (cat.includes("high") || cat.includes("critical")) return "bg-red-500";
    return "bg-secondary";
  };

  const getRiskIcon = (category?: string) => {
    if (!category) return "📊";
    const cat = category.toLowerCase();
    if (cat.includes("good") || cat.includes("standing")) return "✅";
    if (cat.includes("warning")) return "⚠️";
    if (cat.includes("medium")) return "🟠";
    if (cat.includes("high") || cat.includes("critical")) return "🔴";
    return "📊";
  };

  const ethicalIntegrity = profile.RiskScore 
    ? Math.max(0, 100 - (profile.RiskScore * 100))
    : 0;

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Employee Risk Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="text-lg font-semibold">{profile.Employee_ID || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="text-lg font-semibold">{profile.Role || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="text-lg font-semibold">{profile.Department || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salary</p>
              <p className="text-lg font-semibold">
                {profile.Salary ? `$${profile.Salary.toLocaleString()}` : "N/A"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground">Risk Category</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{getRiskIcon(profile.Category)}</span>
                  <Badge className={getRiskColor(profile.Category)}>
                    {profile.Category || "Unknown"}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-3xl font-bold">
                  {profile.RiskScore?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Ethical Integrity</span>
              <span className="text-sm font-semibold">{ethicalIntegrity.toFixed(1)}%</span>
            </div>
            <Progress value={ethicalIntegrity} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Severity Level</p>
              <p className="text-lg font-semibold">{profile.Severity || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Importance</p>
              <p className="text-lg font-semibold">{profile.Importance || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Duty & Violations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Primary Duty</p>
            <p className="text-base">{profile.Duty || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Violation History</p>
            <p className="text-base">{profile.Violation || "None recorded"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
