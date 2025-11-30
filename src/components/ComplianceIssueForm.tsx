import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ComplianceIssueFormProps {
  onAnalysisComplete: (result: any) => void;
}

const DEPARTMENTS = [
  "HVAC",
  "Boiler",
  "Chiller",
  "Electrical",
  "Structural",
  "Plumbing",
  "Safety",
  "EHS"
];

export const ComplianceIssueForm = ({ onAnalysisComplete }: ComplianceIssueFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    facility: "",
    location: "",
    department: "",
    issueDescription: "",
    observedConditions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.issueDescription) {
      toast.error("Please describe the compliance issue");
      return;
    }

    setIsLoading(true);
    toast.info("Analyzing compliance issue...");

    try {
      const { data, error } = await supabase.functions.invoke(
        "analyze-compliance-issue",
        {
          body: {
            facility: formData.facility,
            location: formData.location,
            department: formData.department,
            issueDescription: formData.issueDescription,
            observedConditions: formData.observedConditions,
          },
        }
      );

      if (error) throw error;

      toast.success("Analysis complete");
      onAnalysisComplete(data);
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="facility">Facility Name</Label>
          <Input
            id="facility"
            placeholder="Building/Facility ID"
            value={formData.facility}
            onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
            className="bg-background border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location/Room</Label>
          <Input
            id="location"
            placeholder="Room 203, Basement, etc."
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="bg-background border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select
          value={formData.department}
          onValueChange={(value) => setFormData({ ...formData, department: value })}
        >
          <SelectTrigger className="bg-background border-border">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="issueDescription">Issue Description *</Label>
        <Textarea
          id="issueDescription"
          placeholder="Describe the compliance issue in detail..."
          value={formData.issueDescription}
          onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
          className="bg-background border-border min-h-[120px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observedConditions">Observed Conditions</Label>
        <Textarea
          id="observedConditions"
          placeholder="Temperature readings, visual observations, gauge readings, etc."
          value={formData.observedConditions}
          onChange={(e) => setFormData({ ...formData, observedConditions: e.target.value })}
          className="bg-background border-border min-h-[80px]"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Analyze Issue
          </>
        )}
      </Button>
    </form>
  );
};
