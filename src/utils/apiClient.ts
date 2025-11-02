const UNIFIED_API_URL = "https://script.google.com/macros/s/AKfycbyYy6ZMsB1gNMEpAgTokVRv5vLJSr-uSRopkxX4968jjUrVdRfQtRLm6mc85R4apJMHww/exec";

const MAKE_WEBHOOKS = {
  compliance: "https://hook.us2.make.com/gpa1hpqkfpaobwykun7pc5sn91v1pbn5",
  facility: "https://hook.us2.make.com/wthgvhdb3wfyosa0tf2qnbvwto7dpkkr",
  employee: "https://hook.us2.make.com/1vy6fnpog325o1odim6fyr2whl0q9uva"
};

export const postToUnifiedAPI = async (data: any) => {
  try {
    const response = await fetch(UNIFIED_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("Error posting to unified API:", error);
    throw error;
  }
};

export const triggerMakeWebhook = async (webhookType: keyof typeof MAKE_WEBHOOKS, data: any) => {
  try {
    const response = await fetch(MAKE_WEBHOOKS[webhookType], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error(`Error triggering ${webhookType} webhook:`, error);
    throw error;
  }
};

export const fetchViolationTypes = async () => {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1BdBDqRVaV4D-8H6rzsTkSSYTVTIx1EDppOeuHsfofGM/edit?gid=0";
  // Convert to CSV export URL
  const csvUrl = sheetUrl.replace("/edit?gid=", "/export?format=csv&gid=");
  
  try {
    const response = await fetch(csvUrl);
    const text = await response.text();
    const rows = text.split("\n").slice(1); // Skip header
    
    return rows.map(row => {
      const [type, percent] = row.split(",");
      return {
        type: type?.trim(),
        percent: parseFloat(percent) || 0
      };
    }).filter(v => v.type);
  } catch (error) {
    console.error("Error fetching violation types:", error);
    // Fallback data
    return [
      { type: "Safety PPE Non-Compliance", percent: 0.05 },
      { type: "Late Inspection Log", percent: 0.03 },
      { type: "Unauthorized Equipment Use", percent: 0.06 },
      { type: "Missed Training", percent: 0.04 },
      { type: "Procedure Violation", percent: 0.05 },
    ];
  }
};
