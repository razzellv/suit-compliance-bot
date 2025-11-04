import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { fetchEmployeeRiskProfile } from "@/utils/apiClient";
import { useToast } from "@/hooks/use-toast";

interface EmployeeLookupProps {
  onProfileFound: (profile: any) => void;
}

export const EmployeeLookup = ({ onProfileFound }: EmployeeLookupProps) => {
  const [employeeId, setEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLookup = async () => {
    if (!employeeId.trim()) {
      toast({
        title: "Employee ID Required",
        description: "Please enter an employee ID to search.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const profile = await fetchEmployeeRiskProfile(employeeId);
      onProfileFound(profile);
      toast({
        title: "Profile Found",
        description: "Risk profile loaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employee risk profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Employee Risk Lookup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Input
            placeholder="Enter Employee ID (e.g., ENG-104)"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLookup()}
            className="flex-1"
          />
          <Button onClick={handleLookup} disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? "Searching..." : "Lookup"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
