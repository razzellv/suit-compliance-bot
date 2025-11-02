import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { fetchViolationTypes } from "@/utils/apiClient";

interface Violation {
  type: string;
  percent: number;
  description: string;
}

interface ViolationFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export const ViolationForm = ({ onSubmit, isLoading }: ViolationFormProps) => {
  const [violationTypes, setViolationTypes] = useState<{ type: string; percent: number }[]>([]);
  const [violations, setViolations] = useState<Violation[]>([
    { type: "", percent: 0, description: "" }
  ]);
  const [employeeData, setEmployeeData] = useState({
    employeeId: "",
    name: "",
    department: "",
    salary: "",
    supervisor: "",
    facility: "",
    date: new Date().toISOString().split('T')[0],
    shift: ""
  });

  useEffect(() => {
    fetchViolationTypes().then(setViolationTypes);
  }, []);

  const addViolation = () => {
    setViolations([...violations, { type: "", percent: 0, description: "" }]);
  };

  const removeViolation = (index: number) => {
    setViolations(violations.filter((_, i) => i !== index));
  };

  const updateViolation = (index: number, field: keyof Violation, value: any) => {
    const updated = [...violations];
    (updated[index] as any)[field] = value;
    
    if (field === "type") {
      const selected = violationTypes.find(v => v.type === value);
      if (selected) {
        updated[index].percent = selected.percent;
      }
    }
    
    setViolations(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalViolationPercent = violations.reduce((sum, v) => sum + v.percent, 0);
    const severityScore = Math.min(totalViolationPercent * 5, 1);
    const salary = parseFloat(employeeData.salary) || 0;
    
    let riskCategory = "Good Standing";
    if (totalViolationPercent >= 1.05) riskCategory = "High Risk";
    else if (totalViolationPercent >= 0.69) riskCategory = "Medium Risk";
    else if (totalViolationPercent >= 0.35) riskCategory = "Warning";
    
    const data = {
      Employee_ID: employeeData.employeeId,
      Name: employeeData.name,
      Department: employeeData.department,
      Violations: violations.map(v => ({
        Type: v.type,
        Percent: v.percent,
        Description: v.description
      })),
      Total_Violations: violations.length,
      "Total_Violation_%": totalViolationPercent,
      Severity_Score: severityScore,
      Risk_Category: riskCategory,
      Salary: salary,
      Salary_vs_Risk_Index: totalViolationPercent * salary,
      Ethical_Integrity_Index: 100 - (severityScore * 100),
      Supervisor: employeeData.supervisor,
      Facility: employeeData.facility,
      Date: new Date(employeeData.date).toISOString(),
      Shift: employeeData.shift
    };
    
    onSubmit(data);
  };

  return (
    <Card className="p-6 border-primary/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={employeeData.employeeId}
              onChange={(e) => setEmployeeData({...employeeData, employeeId: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={employeeData.name}
              onChange={(e) => setEmployeeData({...employeeData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={employeeData.department}
              onChange={(e) => setEmployeeData({...employeeData, department: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              type="number"
              value={employeeData.salary}
              onChange={(e) => setEmployeeData({...employeeData, salary: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="supervisor">Supervisor</Label>
            <Input
              id="supervisor"
              value={employeeData.supervisor}
              onChange={(e) => setEmployeeData({...employeeData, supervisor: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="facility">Facility</Label>
            <Input
              id="facility"
              value={employeeData.facility}
              onChange={(e) => setEmployeeData({...employeeData, facility: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={employeeData.date}
              onChange={(e) => setEmployeeData({...employeeData, date: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="shift">Shift</Label>
            <Input
              id="shift"
              value={employeeData.shift}
              onChange={(e) => setEmployeeData({...employeeData, shift: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neon">Violations</h3>
            <Button type="button" onClick={addViolation} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Violation
            </Button>
          </div>

          <div className="space-y-4">
            {violations.map((violation, index) => (
              <Card key={index} className="p-4 bg-card/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>Violation Type</Label>
                    <Select
                      value={violation.type}
                      onValueChange={(value) => updateViolation(index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select violation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {violationTypes.map((vt) => (
                          <SelectItem key={vt.type} value={vt.type}>
                            {vt.type} ({(vt.percent * 100).toFixed(1)}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Percent</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={violation.percent}
                        onChange={(e) => updateViolation(index, "percent", parseFloat(e.target.value))}
                        required
                      />
                    </div>
                    {violations.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeViolation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <Label>Description</Label>
                    <Textarea
                      value={violation.description}
                      onChange={(e) => updateViolation(index, "description", e.target.value)}
                      placeholder="Describe the violation..."
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Risk Profile"
          )}
        </Button>
      </form>
    </Card>
  );
};
