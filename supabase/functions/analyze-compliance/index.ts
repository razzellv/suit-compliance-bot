import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { findings, systemType, dateRange, images } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isImageAnalysis = images && images.length > 0;
    console.log("Analyzing compliance data:", { 
      systemType, 
      findingsCount: findings?.length || 0,
      imageCount: images?.length || 0,
      analysisType: isImageAnalysis ? "image" : "text"
    });

    const systemPrompt = isImageAnalysis 
      ? `You are a Facility Compliance & Diagnostic AI Auditor for Nexum Suum.

Purpose:
Analyze each uploaded photo for visible or measurable compliance risks in mechanical and HVAC systems.
You specialize in interpreting images from boilers, chillers, compressors, pumps, and facility rooms.

📸 INPUT GUIDELINES:
- Detect equipment type, nameplate text, gauges, corrosion, soot, leaks, flame color, and visual conditions.
- Use OCR if text, labels, or readings are visible.
- Cross-reference detected visuals with standard safety and efficiency limits.

📏 EVALUATION LOGIC:
• If gauges, thermometers, or digital readouts are visible → extract reading and compare to normal range:
  - Boiler stack temperature normal: 350°F–550°F
  - Steam pressure: 60–120 psi (medium pressure)
  - Water hardness ppm: 0–50 ppm
  - Chiller discharge temp: 90–120°F typical

• If soot, rust, corrosion, or flame discoloration is detected:
  → flag = "Above Limit" or "Needs Attention"

• Severity Scale:
  - Low (cleaning or tune-up)
  - Moderate (inspection needed)
  - Severe (significant issue)
  - Critical (shutdown or unsafe)

• Compliance Score:
  - Start at 100%.
  - Deduct 5–15% per flagged issue.
  - Report as integer percentage.

For each image, identify:
1. Equipment Detected: What equipment type
2. Observed Condition: Visual assessment
3. Field Value: Any readings visible (gauges, displays, etc.)
4. Flag: Status assessment
5. Severity: Low, Moderate, Severe, or Critical
6. Possible Causes: List potential root causes
7. Recommended Actions: Specific actions needed
8. Monitoring Suggestions: How to track this issue
9. Estimated Risk Cost: Dollar amount
10. Confidence: Your confidence level (0.0-1.0)

Return a structured compliance report.
If image is unreadable or unclear, note that clearly in the analysis.

Tagline: Nexum Suum — Compliance through Clarity.`
      : `You are a senior facility compliance auditor from Nexum Suum. Analyze the log or user-submitted compliance data with precision and professionalism.

For each flagged item, provide:
1. Problem Detected: Short phrase (e.g., 'Steam Pressure Low')
2. Severity: Choose one (Low, Moderate, Severe, Critical)
3. Possible Causes: Bullet list (e.g., 'Improper NPSH', 'Air leak', 'Clogged strainer')
4. Recommended Actions: Bullet list (e.g., 'Check valve seating', 'Increase purge cycle')
5. Monitoring Suggestions: Bullet list (e.g., 'Recheck in 48h', 'Log data during peak runtime')
6. Estimated Risk Cost: Dollar amount (based on severity level and industry benchmarks)
7. Optional Notes: If missing data, say 'Additional log detail needed for full assessment.'

Create a final summary section:
- Facility Compliance Score (0–100%)
- Number of Issues
- Number of Critical Flags
- Overall Priority: Low / Medium / High

Tone: Precise, professional, helpful — like a top-tier facilities compliance firm. Explain why each flag matters and what improvement looks like.`;

    let userContent: any;
    
    if (isImageAnalysis) {
      // Build multimodal content with text + images
      const contentParts: any[] = [
        {
          type: "text",
          text: `Analyze these facility equipment images for compliance issues.

${systemType ? `System Type: ${systemType}` : ''}
${dateRange ? `Date Range: ${dateRange}` : ''}
${findings ? `Additional Context: ${JSON.stringify(findings, null, 2)}` : ''}

Provide detailed compliance analysis for each visible issue in the images.`
        }
      ];
      
      // Add all images
      images.forEach((img: string) => {
        contentParts.push({
          type: "image_url",
          image_url: {
            url: img
          }
        });
      });
      
      userContent = contentParts;
    } else {
      // Text-only analysis
      userContent = `Analyze this ${systemType} system compliance data from ${dateRange}:

Findings:
${findings.map((f: any) => `- ${f.field}: ${f.value} (${f.flag}) - Severity: ${f.severity}`).join('\n')}

Provide detailed analysis for each issue and an overall summary.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_compliance_issues",
              description: "Analyze compliance issues and provide detailed findings with root cause analysis and recommendations.",
              parameters: {
                type: "object",
                properties: {
                  issues: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        problemDetected: { type: "string", description: "Short phrase describing the problem" },
                        severity: { type: "string", enum: ["Low", "Moderate", "Severe", "Critical"] },
                        possibleCauses: { type: "array", items: { type: "string" } },
                        recommendedActions: { type: "array", items: { type: "string" } },
                        monitoringSuggestions: { type: "array", items: { type: "string" } },
                        estimatedRiskCost: { type: "number", description: "Estimated cost in dollars" },
                        notes: { type: "string" }
                      },
                      required: ["problemDetected", "severity", "possibleCauses", "recommendedActions", "monitoringSuggestions", "estimatedRiskCost"],
                      additionalProperties: false
                    }
                  },
                  summary: {
                    type: "object",
                    properties: {
                      complianceScore: { type: "number", minimum: 0, maximum: 100 },
                      numberOfIssues: { type: "number" },
                      criticalFlags: { type: "number" },
                      overallPriority: { type: "string", enum: ["Low", "Medium", "High"] }
                    },
                    required: ["complianceScore", "numberOfIssues", "criticalFlags", "overallPriority"],
                    additionalProperties: false
                  }
                },
                required: ["issues", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_compliance_issues" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received:", data);

    // Extract the tool call result
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    console.log("Analysis complete:", analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-compliance:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
