interface ValidationRule {
  field: string;
  min?: number;
  max?: number;
  required?: boolean;
  expectedValue?: string;
}

interface LogEntry {
  [key: string]: string | number;
}

interface Finding {
  field: string;
  value: string;
  flag: string;
  severity: "Minor" | "Moderate" | "Severe";
}

const boilerRules: ValidationRule[] = [
  { field: "steamPressure", max: 150, required: true },
  { field: "stackTemp", max: 550, required: true },
  { field: "waterLevel", expectedValue: "Normal", required: true },
];

const chillerRules: ValidationRule[] = [
  { field: "suctionPressure", min: 40, max: 220, required: true },
  { field: "condenserTemp", min: 70, max: 105, required: true },
  { field: "oilTemp", max: 190, required: true },
];

const compressorRules: ValidationRule[] = [
  { field: "oilLevel", expectedValue: "Normal", required: true },
];

export const validateLogs = (logs: LogEntry[], systemType: string): Finding[] => {
  const findings: Finding[] = [];
  let rules: ValidationRule[] = [];

  switch (systemType.toLowerCase()) {
    case "boiler":
      rules = boilerRules;
      break;
    case "chiller":
      rules = chillerRules;
      break;
    case "compressor":
      rules = compressorRules;
      break;
  }

  logs.forEach((log) => {
    rules.forEach((rule) => {
      const value = log[rule.field];

      if (rule.required && (value === undefined || value === null || value === "")) {
        findings.push({
          field: rule.field,
          value: "Missing",
          flag: "Non-Compliant",
          severity: "Moderate",
        });
        return;
      }

      if (typeof value === "number") {
        if (rule.max !== undefined && value > rule.max) {
          findings.push({
            field: rule.field,
            value: String(value),
            flag: "Above Limit",
            severity: value > rule.max * 1.2 ? "Severe" : "Moderate",
          });
        }
        if (rule.min !== undefined && value < rule.min) {
          findings.push({
            field: rule.field,
            value: String(value),
            flag: "Below Limit",
            severity: value < rule.min * 0.8 ? "Severe" : "Moderate",
          });
        }
      }

      if (rule.expectedValue && value !== rule.expectedValue) {
        findings.push({
          field: rule.field,
          value: String(value),
          flag: `Expected: ${rule.expectedValue}`,
          severity: "Minor",
        });
      }
    });
  });

  return findings;
};

export const calculateComplianceScore = (
  totalChecks: number,
  findings: Finding[]
): number => {
  if (totalChecks === 0) return 100;

  const riskPoints = findings.reduce((sum, finding) => {
    const severityWeight = {
      Minor: 1,
      Moderate: 3,
      Severe: 5,
    };
    return sum + severityWeight[finding.severity];
  }, 0);

  const maxPossibleRisk = totalChecks * 5;
  const compliancePercent = Math.max(0, (1 - riskPoints / maxPossibleRisk) * 100);
  
  return Math.round(compliancePercent);
};

export const determineStatus = (
  score: number
): "compliant" | "review" | "critical" => {
  if (score >= 90) return "compliant";
  if (score >= 70) return "review";
  return "critical";
};
