import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      facility = "", 
      location = "", 
      department = "", 
      issueDescription, 
      observedConditions = "",
      conversationHistory = []
    } = await req.json();

    console.log("Analyzing compliance issue:", { facility, location, department });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are the Nexum Suum™ Compliance Intelligence Assistant.

Your job is to:
1. Analyze the user's reported compliance issue.
2. Classify the issue by severity (0–100), category, and operational impact.
3. Suggest the correct Work Order automatically.
4. Suggest the correct department (HVAC, Boiler, Chiller, Electrical, Structural, Plumbing, Safety, EHS).
5. Provide a cost-risk impact estimate.
6. Identify whether the issue requires immediate action, 24-hour action, or routine follow-up.
7. Provide a recommended optimization or ATI (Analysis To Improve) suggestion.
8. Recommend retrofits if relevant.
9. Provide a "Supervisor Review Board Summary."

AFTER ANALYSIS — always structure your response to include these sections:

**COMPLIANCE FINDINGS**
- Issue Summary:
- Root Cause:
- Severity Score: (0-100)
- System Impact:
- Operational Risk Level: (Emergency / High / Medium / Low)
- OSHA/EPA/Code References (if relevant):

**WORK ORDER RECOMMENDATION**
- Department:
- Description:
- Priority (Emergency / High / Medium / Low):
- Estimated Cost Impact:
- Optimization / Preventive Step:

**SUPERVISOR BOARD SUMMARY**
- 2–3 sentence executive insight.

Never break structure. Never refuse to analyze. Always output these sections.
Integrate seamlessly with the existing Nexum Suum dashboards and logs.`;

    const userMessage = conversationHistory.length > 0
      ? conversationHistory.map((m: any) => m.content).join("\n") + "\n\n" + issueDescription
      : `Facility: ${facility}
Location: ${location}
Department: ${department}

Issue Description:
${issueDescription}

Observed Conditions:
${observedConditions}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        tools: [{
          type: "function",
          function: {
            name: "compliance_analysis",
            description: "Return structured compliance analysis",
            parameters: {
              type: "object",
              properties: {
                findings: {
                  type: "object",
                  properties: {
                    issueSummary: { type: "string" },
                    rootCause: { type: "string" },
                    severityScore: { type: "number" },
                    systemImpact: { type: "string" },
                    operationalRiskLevel: { 
                      type: "string",
                      enum: ["Emergency", "High", "Medium", "Low"]
                    },
                    codeReferences: { type: "string" }
                  },
                  required: ["issueSummary", "rootCause", "severityScore", "systemImpact", "operationalRiskLevel"]
                },
                workOrder: {
                  type: "object",
                  properties: {
                    department: { type: "string" },
                    description: { type: "string" },
                    priority: { 
                      type: "string",
                      enum: ["Emergency", "High", "Medium", "Low"]
                    },
                    estimatedCost: { type: "string" },
                    optimization: { type: "string" }
                  },
                  required: ["department", "description", "priority", "estimatedCost"]
                },
                supervisorSummary: { type: "string" }
              },
              required: ["findings", "workOrder", "supervisorSummary"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "compliance_analysis" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
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

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response received");

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    const analysisData = toolCall?.function?.arguments 
      ? JSON.parse(toolCall.function.arguments)
      : {};

    // Generate formatted response for chat
    const formattedResponse = `**COMPLIANCE FINDINGS**
Issue: ${analysisData.findings?.issueSummary || "N/A"}
Root Cause: ${analysisData.findings?.rootCause || "N/A"}
Severity: ${analysisData.findings?.severityScore || 0}/100
Risk Level: ${analysisData.findings?.operationalRiskLevel || "Medium"}

**WORK ORDER**
Department: ${analysisData.workOrder?.department || "TBD"}
Priority: ${analysisData.workOrder?.priority || "Medium"}
Cost: ${analysisData.workOrder?.estimatedCost || "TBD"}

**SUPERVISOR SUMMARY**
${analysisData.supervisorSummary || "Analysis complete."}`;

    return new Response(
      JSON.stringify({
        ...analysisData,
        formattedResponse
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in analyze-compliance-issue:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
