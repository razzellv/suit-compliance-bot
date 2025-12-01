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

interface ViolationData {
  type: string;
  code: string;
  description: string;
  severity: number;
  category: string;
  notes: string;
  percent: number;
}

interface Violation {
  type: string;
  code: string;
  percent: number;
  description: string;
  category: string;
}

interface ViolationFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export const ViolationForm = ({ onSubmit, isLoading }: ViolationFormProps) => {
  const [violationTypes, setViolationTypes] = useState<ViolationData[]>([]);
  const [violations, setViolations] = useState<Violation[]>([
    { type: "", code: "", percent: 0, description: "", category: "" }
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
    setViolations([...violations, { type: "", code: "", percent: 0, description: "", category: "" }]);
  };

  const removeViolation = (index: number) => {
    setViolations(violations.filter((_, i) => i !== index));
  };

  const updateViolation = (index: number, field: keyof Violation, value: any) => {
    const updated = [...violations];
    (updated[index] as any)[field] = value;
    
    // Auto-populate all fields when violation type is selected
    if (field === "type") {
      const selected = violationTypes.find(v => v.type === value);
      if (selected) {
        updated[index].code = selected.code;
        updated[index].percent = selected.severity;
        updated[index].category = selected.category;
        // Pre-fill description if not already entered
        if (!updated[index].description) {
          updated[index].description = selected.description;
        }
      }
    }
    
    setViolations(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total risk using severity scores from Google Sheet
    const totalSeverity = violations.reduce((sum, v) => sum + v.percent, 0);
    const avgSeverity = violations.length > 0 ? totalSeverity / violations.length : 0;
    const salary = parseFloat(employeeData.salary) || 0;
    
    // Risk classification based on user requirements
    let riskCategory = "Good Standing";
    if (avgSeverity > 0.65) riskCategory = "High Risk";
    else if (avgSeverity >= 0.35) riskCategory = "Moderate Risk";
    
    // Generate work order suggestions based on violations
    const workOrderSuggestions = violations.map(v => {
      const vType = violationTypes.find(vt => vt.type === v.type);
      let priority = "Medium";
      let department = "General";
      
      if (v.percent > 0.65) priority = "High";
      else if (v.percent < 0.35) priority = "Low";
      
      if (v.category.includes("Equipment")) department = "Maintenance";
      else if (v.category.includes("Safety")) department = "EHS";
      else if (v.category.includes("Compliance")) department = "Compliance";
      
      return {
        violation: v.type,
        code: v.code,
        priority,
        department,
        action: vType?.notes || "Review and correct",
        category: v.category
      };
    });
    
    // Equipment intelligence for equipment-related violations
    const equipmentSuggestions = violations
      .filter(v => v.category.includes("Equipment"))
      .map(v => ({
        violation: v.type,
        suggestions: [
          "Schedule equipment inspection",
          "Review maintenance logs",
          "Consider retrofit/replacement if pattern persists",
          "Implement ATI (Analyze → Tune → Improve) protocol"
        ]
      }));
    
    const data = {
      Employee_ID: employeeData.employeeId,
      Name: employeeData.name,
      Department: employeeData.department,
      Violations: violations.map(v => ({
        Type: v.type,
        Code: v.code,
        Percent: v.percent,
        Description: v.description,
        Category: v.category
      })),
      Total_Violations: violations.length,
      Average_Severity: avgSeverity,
      Severity_Score: avgSeverity,
      Risk_Category: riskCategory,
      Salary: salary,
      Risk_Cost_Impact: avgSeverity * salary,
      Ethical_Integrity_Index: (1 - avgSeverity) * 100,
      Supervisor: employeeData.supervisor,
      Facility: employeeData.facility,
      Date: new Date(employeeData.date).toISOString(),
      Shift: employeeData.shift,
      Work_Order_Suggestions: workOrderSuggestions,
      Equipment_Intelligence: equipmentSuggestions
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
                            {vt.type} ({vt.code}) - Severity: {(vt.severity * 100).toFixed(0)}%
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
