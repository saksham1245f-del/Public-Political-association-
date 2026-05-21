import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded GenAI helper
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it via the Secrets panel in AI Studio.");
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIClient;
}

// Full list of high-quality sample evaluation metrics for fallback if API is unavailable
const defaultFallbacks: Record<string, any> = {
  effectiveness: 6,
  efficiency: 5,
  feasibility: 6,
  politicalRealism: 7,
  budgetImpactCr: -400,
  publicApprovalImpactPct: +1.2,
  coalitionTrustImpactPct: -2,
  mediaReactionHeadline: "\"Government's incremental strategy meets mixed reactions from trade unions and civic experts\"",
  mediaReactionTone: "NEUTRAL",
  detailedFeedback: "The proposed approach offers a moderate answer, though it relies heavily on standard bureaucracy. Implementation might bottleneck with local state departments, and limited upfront funding restricts immediate scale. However, it manages to avoid major controversies.",
  narrativeEvent: "Opposition parties organize a press briefing demanding full state-funded subsidies.",
  intelUpdate: "Bureaucratic sources whisper about execution delays in key sub-districts.",
  impactedRegionsOrSectors: "Metropolitan Civic Zones",
  regionalImpactNarrative: "Municipal agencies in heavy flood zones observed quick structural adjustments, deploying heavy de-watering pumps along main urban layouts. However, outer peri-urban informal settlements faced continued water logging due to clogged drains.",
  longTermOutlook: "Over the next five years, this initiative is projected to reduce local climate disruption risk, though sustained central funding is necessary to secure secondary tier-2 district corridors.",
  oppositionAction: {
    title: "Anti-Ordinance Protest Campaign",
    leader: "Devendra Shastri",
    quote: "\"This policy is nothing but paper-thin lipstick on a structural governance disaster. They are running dry on funds and ideas!\"",
    strategyType: "negative_media_blitz",
    strategyName: "The Empty Vaults Publicity Campaign",
    description: "Devendra Shastri holds an immediate live television broadcast showcasing the player's massive fiscal expenditures, claiming the budget is being drained for empty public relations optics.",
    approvalImpactPct: -1.0,
    mediaPressureImpactPct: 8,
    coalitionTrustImpactPct: -3
  }
};

// API: Evaluate User Policy Solution
app.post("/api/evaluate", async (req, res) => {
  try {
    const { problemTitle, problemDescription, policyText, currentApproval, currentBudget, currentCoalitionTrust } = req.body;

    if (!policyText || policyText.trim().length === 0) {
      return res.status(400).json({ error: "Policy draft content is empty." });
    }

    try {
      const ai = getGenAI();
      const prompt = `
      You are the Simulation Engine for 'Lok Shakti Campaign', a highly detailed, serious political campaign and governance simulator set in India.
      The player acts as a campaign manager and politician who must solve critical national issues while preparing for general elections.

      Evaluate the player's draft policy response based on India's real socio-economic, political, financial, and bureaucratic constraints.

      CONTEXT:
      - PROBLEM TITLE: "${problemTitle}"
      - PROBLEM BRIEF: "${problemDescription}"
      - CURRENT NATIONAL APPROVAL: ${currentApproval}%
      - CURRENT CAMPAIGN TREASURY: ₹${currentBudget} Cr
      - CURRENT COALITION TRUST: ${currentCoalitionTrust}%
      
      PLAYER'S DRAFTED POLICY:
      "${policyText}"

      Evaluate this drafted policy and generate the metrics and narrative expansion using the requested schema. Ensure that your scores, financial costs (budgetImpactCr), and public approval feedback reflect the quality, feasibility, and realism of the player's specific policy.
      - If the policy is extremely simplistic, vague, or mentions things unrelated to the problem, penalize the scores and approval.
      - If the policy is thoughtful, balances stakeholders, handles funding source, and shows awareness of Indian state-center machinery (e.g. IAS, local panchayats, MNREGA, public-private partnerships), reward it!
      - Budget Impact must be realistic. Major projects (like dams, infrastructure, statewide cash transfers) should cost between ₹1,000 Cr to ₹5,000 Cr or more. Small regulatory changes might cost ₹50 Cr to ₹200 Cr. Setting up a new committee is cheaper but less effective.

      REGIONAL NARRATIVE & OUTLOOK GUIDELINES:
      - Specify the region or socio-economic sector most heavily reshaped by this policy in 'impactedRegionsOrSectors' (e.g. 'Western Maharashtra Agrarian Basin', 'Delhi-NCR Public Transport System').
      - Provide a descriptive short narrative in 'regionalImpactNarrative' (3-4 sentences) illustrating local micro-economic changes, citizen responses on the ground, and how everyday life or local businesses responded to the solution.
      - Predict the long-term developmental, political, or fiscal legacy (2-3 sentences) in 'longTermOutlook' representing what will happen structurally over the decade if this ordinance remains in force.

      AI OPPOSITION CONTROLLER:
      You must also generate a dynamic counter-offensive from the political opposition led by the charismatic leader Devendra Shastri of the United People's Front (UPF).
      - React specifically to logical weaknesses or overreaches in the player's drafted policy.
      - Formulate Shastri's counter-strategy and select one of the following strategy types:
        1. 'negative_media_blitz': Attacks the administrative viability or tax burderns, driving up media pressure and draining public approval.
        2. 'expose_scandal': Alleges backroom contractor kickbacks or corporate favor-seeking, draining coalition support and spiking media agitation.
        3. 'coalition_poaching': Exploits centralist policy directions to host secret alliance dinners with the player's state-level coalition partners, offering concessions to trigger defections.
        4. 'populist_counterproposal': Presents an incredibly glossy, populist, unrealistic alternative to the public (e.g., matching the player's tech solution with free cash/subsidy handouts), criticizing the player as elite and heartless.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the serious analytical simulation core for Lok Shakti Campaign. Your responses must be structured in strict accordance with the requested JSON schema. Do not output anything other than standard parseable JSON data.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              effectiveness: {
                type: Type.INTEGER,
                description: "Score out of 10 for how well this policy targets the root cause of the crisis (0-10)."
              },
              efficiency: {
                type: Type.INTEGER,
                description: "Score out of 10 for implementation speed, resource utilization, and delivery speed (0-10)."
              },
              feasibility: {
                type: Type.INTEGER,
                description: "Score out of 10 for legal, constitutional, administrative, and logistical viability in India (0-10)."
              },
              politicalRealism: {
                type: Type.INTEGER,
                description: "Score out of 10 for alignment with coalition politics, religious/caste diversity, and regional concerns (0-10)."
              },
              budgetImpactCr: {
                type: Type.INTEGER,
                description: "The fiscal cost or relief to the budget in Crores. Must be a negative integer for costs, or positive for saved/earned funds."
              },
              publicApprovalImpactPct: {
                type: Type.NUMBER,
                description: "The percentage change in national voter approval rating. Usually between -6.0 and +6.0."
              },
              coalitionTrustImpactPct: {
                type: Type.INTEGER,
                description: "The change in coalition partner satisfaction percentage. Usually between -15 and +15."
              },
              mediaReactionHeadline: {
                type: Type.STRING,
                description: "A realistic headline representing the policy response from Indian media (e.g., NDTV, Times of India, Indian Express)."
              },
              mediaReactionTone: {
                type: Type.STRING,
                description: "Must be exactly 'SUPPORTIVE', 'NEUTRAL', or 'CRITICAL'."
              },
              detailedFeedback: {
                type: Type.STRING,
                description: "A comprehensive, realistic, and country-specific executive review (3-4 sentences) explaining the rating and the bureaucratic realities of the policy's execution."
              },
              narrativeEvent: {
                type: Type.STRING,
                description: "A dynamic regional fallout or news flash spurred by this action. Max 20 words."
              },
              intelUpdate: {
                type: Type.STRING,
                description: "A confidential intelligence advisory report or poll finding. Max 15 words."
              },
              impactedRegionsOrSectors: {
                type: Type.STRING,
                description: "The specific Indian regions, states, or economic/social sectors most directly reshaped by this policy. 2-5 words."
              },
              regionalImpactNarrative: {
                type: Type.STRING,
                description: "A highly descriptive, ground-reality narrative (3-4 sentences) outlining the local successes, citizen experiences, or enterprise reactions in that focus region or sector."
              },
              longTermOutlook: {
                type: Type.STRING,
                description: "A forward-looking estimate (2-3 sentences) projecting the structural, institutional, developmental, or financial legacy of this policy over the next decade."
              },
              oppositionAction: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Punchy name of Shastri's dynamic counter-campaign."
                  },
                  leader: {
                    type: Type.STRING,
                    description: "Name of the opposition leader (default 'Devendra Shastri')."
                  },
                  quote: {
                    type: Type.STRING,
                    description: "A direct, sharp, critical media quote from the leader attacking the player's draft."
                  },
                  strategyType: {
                    type: Type.STRING,
                    description: "Must be exactly 'negative_media_blitz', 'expose_scandal', 'coalition_poaching', or 'populist_counterproposal'."
                  },
                  strategyName: {
                    type: Type.STRING,
                    description: "The tactical sub-name of Shastri's movement."
                  },
                  description: {
                    type: Type.STRING,
                    description: "A detailed 2-3 sentence description of how the opposition executed this move based on the player's specific policy weaknesses."
                  },
                  approvalImpactPct: {
                    type: Type.NUMBER,
                    description: "The negative impact on player's approval rating. Must be negative or zero (usually between 0 and -4.0)."
                  },
                  mediaPressureImpactPct: {
                    type: Type.INTEGER,
                    description: "The increase in public media pressure. Must be positive (usually between 0 and +12)."
                  },
                  coalitionTrustImpactPct: {
                    type: Type.INTEGER,
                    description: "The damage to your coalition alliances. Must be negative or zero (usually between 0 and -12)."
                  }
                },
                required: [
                  "title",
                  "leader",
                  "quote",
                  "strategyType",
                  "strategyName",
                  "description",
                  "approvalImpactPct",
                  "mediaPressureImpactPct",
                  "coalitionTrustImpactPct"
                ]
              }
            },
            required: [
              "effectiveness",
              "efficiency",
              "feasibility",
              "politicalRealism",
              "budgetImpactCr",
              "publicApprovalImpactPct",
              "coalitionTrustImpactPct",
              "mediaReactionHeadline",
              "mediaReactionTone",
              "detailedFeedback",
              "narrativeEvent",
              "intelUpdate",
              "impactedRegionsOrSectors",
              "regionalImpactNarrative",
              "longTermOutlook",
              "oppositionAction"
            ]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini.");
      }

      const evaluation = JSON.parse(responseText.trim());
      return res.json({ success: true, evaluation });
    } catch (apiError: any) {
      let isQuotaExceeded = false;
      let cleanErrorMessage = "Gemini API unavailable.";
      const rawMsg = apiError?.message || String(apiError || "");
      
      if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("quota")) {
        isQuotaExceeded = true;
        cleanErrorMessage = "Gemini API quota exceeded (Rate Limit 429). Evaluating policy using local heuristic engine.";
      } else {
        try {
          if (rawMsg.startsWith("{") || rawMsg.includes('{"error"')) {
            const parsed = JSON.parse(rawMsg.substring(rawMsg.indexOf("{")));
            cleanErrorMessage = parsed?.error?.message || rawMsg;
          } else {
            cleanErrorMessage = rawMsg;
          }
        } catch (jerr) {
          cleanErrorMessage = rawMsg;
        }
      }
      
      console.warn(`[Gemini API Status] Evaluate fallback engaged. Reason: ${cleanErrorMessage.slice(0, 160)}`);
      
      const policyLen = policyText.trim().length;
      let heuristicEval = { ...defaultFallbacks };

      if (policyLen < 40) {
        heuristicEval.effectiveness = 3;
        heuristicEval.efficiency = 4;
        heuristicEval.feasibility = 8;
        heuristicEval.politicalRealism = 4;
        heuristicEval.budgetImpactCr = -50;
        heuristicEval.publicApprovalImpactPct = -1.5;
        heuristicEval.coalitionTrustImpactPct = -4;
        heuristicEval.mediaReactionHeadline = "\"Opposition terms government's brief flood policy 'an absolute joke devoid of detail'\"";
        heuristicEval.mediaReactionTone = "CRITICAL";
        heuristicEval.detailedFeedback = "The draft policy is short and severely lacking in actionable details. Voters feel let down by the lack of clear directives, and coalition members worry about a public relations disaster.";
        heuristicEval.narrativeEvent = "Citizens launch online campaign demanding concrete timelines.";
        heuristicEval.intelUpdate = "State intelligence reports voter exhaustion with empty promises.";
        heuristicEval.impactedRegionsOrSectors = "Informal Sector & Local Municipalities";
        heuristicEval.regionalImpactNarrative = "Due to the extreme lack of clarity in your ordinance, state bureaucrats executed standard delay-tactics, ignoring municipal water clogged corridors. Small street vendors and local transport networks suffered major earnings disruptions, leading to sporadic demonstrations.";
        heuristicEval.longTermOutlook = "The long-term outlook is highly critical. Without deep structural directives or robust funding lines, local systems remain exposed to seasonal disruptions, prompting public decay and increasing fiscal recovery costs.";
        
        heuristicEval.oppositionAction = {
          title: "Neglect Protest Rallies",
          leader: "Devendra Shastri",
          quote: "\"A tiny 5-word draft won't clear the water logged roads of Bengaluru or feed farmers. This is sheer laziness on paper!\"",
          strategyType: "populist_counterproposal",
          strategyName: "The Farmer Free Power Pledge",
          description: "Devendra Shastri holds massive rallies in the agrarian belt, offering totally free tractor fuel and power to dwarf the player's simplistic policy notes.",
          approvalImpactPct: -2.0,
          mediaPressureImpactPct: 10,
          coalitionTrustImpactPct: -5
        };
      } else if (policyLen > 150) {
        heuristicEval.effectiveness = 8;
        heuristicEval.efficiency = 6;
        heuristicEval.feasibility = 7;
        heuristicEval.politicalRealism = 8;
        heuristicEval.budgetImpactCr = -850;
        heuristicEval.publicApprovalImpactPct = +2.4;
        heuristicEval.coalitionTrustImpactPct = +5;
        heuristicEval.mediaReactionHeadline = "\"Experts hail comprehensive multi-sector blueprint targeting foundational system reforms\"";
        heuristicEval.mediaReactionTone = "SUPPORTIVE";
        heuristicEval.detailedFeedback = "Your comprehensive draft outlines deep structural solutions. By addressing public-private funding and administrative checkpoints, the policy earns strong confidence among development economists and localized voters.";
        heuristicEval.narrativeEvent = "Local businesses release a statement praising the long-term clarity.";
        heuristicEval.intelUpdate = "Polls capture sudden support jump in crucial urban sub-segments.";
        heuristicEval.impactedRegionsOrSectors = "Agrarian Cooperatives and Local Districts";
        heuristicEval.regionalImpactNarrative = "Your highly detailed ordinance enabled swift, structural implementation. District magistrates coordinated with local Panchayats to target relief funds directly, boosting local cooperative purchasing power. Farm holders noted increased yield security following direct cooperative training programs.";
        heuristicEval.longTermOutlook = "Over the next decade, this comprehensive blueprint establishes a strong framework for cooperative farming. It lowers dependency on middle-men, though localized regulatory follow-ups will be needed to curb local administrative leakage.";
        
        heuristicEval.oppositionAction = {
          title: "Over-Centralization Defense Campaign",
          leader: "Devendra Shastri",
          quote: "\"While the Prime Minister drafts lengthy regulatory spreadsheets, local state municipalities are being stripped of their constitutional budgetary freedom!\"",
          strategyType: "negative_media_blitz",
          strategyName: "Federalism Autonomy Alarm",
          description: "Shastri hosts television appearances asserting that the policy increases central red-tape and devalues state cabinets, causing minor friction but proving mostly ineffective against the strong ordinance details.",
          approvalImpactPct: -0.5,
          mediaPressureImpactPct: 4,
          coalitionTrustImpactPct: -2
        };
      } else {
        // Standard length fallback
        heuristicEval.oppositionAction = {
          title: "Incrementalism Backlash Campaign",
          leader: "Devendra Shastri",
          quote: "\"There is no real vision here. Just recycled policies and minor treasury handouts to please the state lobby!\"",
          strategyType: "negative_media_blitz",
          strategyName: "The Recycled Reform Outcry",
          description: "The opposition feeds infographics to media sites criticising the policy as too small-scale, slightly dampening national approval gains.",
          approvalImpactPct: -1.0,
          mediaPressureImpactPct: 6,
          coalitionTrustImpactPct: -2
        };
      }

      return res.json({
        success: true,
        evaluation: heuristicEval,
        apiStatus: "demo_fallback",
        apiKeyMessage: isQuotaExceeded 
          ? "Gemini API Quota reached (429 Rate Limit). Evaluating with locally-compiled simulation model." 
          : (process.env.GEMINI_API_KEY ? null : "GEMINI_API_KEY is not defined. Using local policy evaluator.")
      });
    }
  } catch (error: any) {
    console.error("Evaluation server error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// API: Dynamic AI Problem/Crisis Engine (Search-grounded + Context-aware)
app.post("/api/generate-problem", async (req, res) => {
  try {
    const { category, theme, isTrending } = req.body;

    const fallbackProblems = [
      {
        id: "AiDeepfakeLeak",
        title: "AI Deepfakes Trigger State Election Panic",
        category: "Governance",
        riskLevel: "IV",
        riskLabel: "Major",
        location: "Lucknow, Uttar Pradesh",
        description: "An advanced hyper-realistic deepfake voice note of senior state alliance ministers arguing over critical agrarian subsidies goes viral 5 days before state voting. The sudden leak triggers coalition outrage. Electoral observers demand strong regulation on generative audio templates, threatening to audit national platforms.",
        idealSolutions: [
          "Deploy certified cyber-forensic agencies under the National Cyber Bureau to officially stamp the audio file as a synthetic deepfake threat.",
          "Issue a fast-track temporary ordinance mandating social media hosts to mark synthetic voice clips with visible 'AI Modified' watermarkers.",
          "Release ₹50 Cr from strategic communication reserves to sponsor state-wide awareness broadcasts clarifying authentic subsidy formulas."
        ]
      },
      {
        id: "CryptoTaxflight",
        title: "Cryptocurrency Capital Flight Challenge",
        category: "Economy",
        riskLevel: "III",
        riskLabel: "Significant",
        location: "Mumbai FinTech Hub",
        description: "Sudden tax adjustments trigger high-net-worth investors to move digital capital to foreign tax havens. Fintech forums state that restrictive domestic regulations are causing brain drain in major Web3 operations. State regulators are demanding a central policy clarifying tax status.",
        idealSolutions: [
          "Introduce a balanced 3-year FinTech Regulatory Sandbox reducing transactional tax thresholds from 30% to a standardized 12% to secure local capitals.",
          "Establish high-profile central digital hubs in Mumbai under a special economic zone (SEZ) structure featuring direct compliance fast-tracks.",
          "Constitute an advisory council composed of NITI Aayog economists and industry engineers to draft a comprehensive Digital Asset Regulation Bill."
        ]
      },
      {
        id: "UpscIntegrity",
        title: "National Examination Integrity Crisis",
        category: "Governance",
        riskLevel: "V",
        riskLabel: "Critical",
        location: "New Delhi, NCR",
        description: "Widespread protests erupt in major educational hubs after rumors of high-level digital infiltration in central recruitment board servers. Over 2 million students demand completely transparent cyber-audits. Internal home ministry sources voice major concern over civil service integrity confidence.",
        idealSolutions: [
          "Order an immediate third-party cybersecurity audit led by India's Computer Emergency Response Team (CERT-In) on all central testing servers.",
          "Re-convene the national recruitment exams with sanitized physical question distributions, backing student transportation under central travel stipends.",
          "Mandate direct prison terms and substantial anti-lobbying penalties for personnel leaking secure examination papers under an urgent executive ordinance."
        ]
      },
      {
        id: "SemiconductorWaterDispute",
        title: "Semiconductor Mega-Plant Water Allocations",
        category: "Water Crisis",
        riskLevel: "IV",
        riskLabel: "Major",
        location: "Dholera, Gujarat",
        description: "A newly commissioned ₹22,000 Cr chip fabrication plant competes directly with surrounding agricultural cooperative canals for pure industrial-grade water. Local farmer associations blockade state highway linkages, threatening localized crop failure. The cabinet is under fire to balance high-tech exports with farmer livelihoods.",
        idealSolutions: [
          "Fund a ₹400 Cr rapid wastewater recycling corridor from closest urban centers to feed the semiconductor plant with industrial grey-water exclusively.",
          "Sanction direct, upfront crop water compensation grants of ₹12,000 per local hectare to stabilize cooperative farming associations.",
          "Appoint a dynamic regulatory committee involving regional agrarian leaders and tech directors to coordinate weekly water discharges equitably."
        ]
      }
    ];

    try {
      const ai = getGenAI();
      
      const prompt = `
      You are the dynamic AI Political Correspondent and Intelligence Core for 'Lok Shakti Campaign'.
      Generate a brand new, highly realistic, and captivating political or administrative crisis for India in 2026. This crisis will be presented to the player as a core governing problem.

      PLAYER REQUEST SPECIFICATIONS:
      - Requested Focus Category: "${category || "Any Area"}"
      - Optional Focus Theme / User Idea: "${theme || "Any trending Indian challenge"}"
      - Is Trending / Real-time Current Event Requested: ${isTrending ? "YES. Search online and identify a real, pressing, or trending administrative/news issue in India (e.g. climate/monsoon grids, AI/tech governance, cybersecurity breaches, transportation safety, financial technology bubbles, specific state conflicts, or public health emergencies)." : "NO"}

      STRUCTURAL REQUISITES:
      1. Choose CATEGORY strictly from: "Infrastructure", "Agriculture", "Environment", "Economy", "Social Safety", "Governance", "Water Crisis", "Health". If a category was requested and is valid, use it; otherwise assign randomly.
      2. Set RISK LEVEL strictly to: "I", "II", "III", "IV", or "V".
      3. Set RISK LABEL strictly to: "Low", "Moderate", "Significant", "Major", or "Critical" representing the structural severity.
      4. Set LOCATION: Specific Indian city/state or industrial region (e.g., "Kochi Port Corridor, Kerala", "NCR Urban Hub", "Ganga Basin Districts").
      5. Set TITLE: A punchy, news-style title summarizing the immediate administrative headache. Max 7-8 words.
      6. Set DESCRIPTION: A deeply informative, atmospheric, and realistic briefing of 3-4 sentences (approx 80-100 words). Explain the ground-reality tension, the financial or civic bottlenecks, key stakeholder reactions (e.g., state officials, pressure groups, trade guilds), and why immediate central ordnance action is demanded.
      7. Set IDEAL SOLUTIONS: Generate an array of exactly 3 highly realistic, extremely constructive, model policy actions that represent the absolute ideal/correct solution pathways to solve this specific crisis. Ensure each recommendation details an exact budget or regulatory step, using terms like IAS, municipal teams, or specialized auditing bodies.

      Return ONLY a JSON response matching the required schema. Ensure the description mentions real agencies or terms (IAS, local authorities, specific ministries, MNREGA, NITI Aayog) where appropriate.
      `;

      const searchTools: any[] = [];
      if (isTrending) {
        searchTools.push({ googleSearch: {} });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Lok Shakti Campaign's Crisis Engine. Generate a highly detailed, parseable JSON crisis matching the required schema exactly. Avoid generic text. Use authentic Indian bureaucracy context.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { 
                type: Type.STRING, 
                description: "Unique camelCase ID for the problem" 
              },
              title: { 
                type: Type.STRING, 
                description: "The core challenge title" 
              },
              category: { 
                type: Type.STRING, 
                description: "Must be exactly one of: Infrastructure, Agriculture, Environment, Economy, Social Safety, Governance, Water Crisis, Health" 
              },
              riskLevel: { 
                type: Type.STRING, 
                description: "Must be exactly: I, II, III, IV, or V" 
              },
              riskLabel: { 
                type: Type.STRING, 
                description: "Must be exactly: Low, Moderate, Significant, Major, or Critical" 
              },
              location: { 
                type: Type.STRING, 
                description: "Specific city, district and state in India" 
              },
              description: { 
                type: Type.STRING, 
                description: "Detailed description of the issue, actors, and consequences (80-100 words)" 
              },
              idealSolutions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 3 distinct, highly professional, realistic recommended policy action solutions"
              }
            },
            required: ["id", "title", "category", "riskLevel", "riskLabel", "location", "description", "idealSolutions"]
          },
          tools: searchTools.length > 0 ? searchTools : undefined
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from GenAI");
      }

      const generatedProblem = JSON.parse(responseText.trim());
      
      // Ensure generated fields are strictly validated/normalized to fit frontend expectation
      const validCategories = ["Infrastructure", "Agriculture", "Environment", "Economy", "Social Safety", "Governance", "Water Crisis", "Health"];
      if (!validCategories.includes(generatedProblem.category)) {
        generatedProblem.category = validCategories[Math.floor(Math.random() * validCategories.length)];
      }

      const validRiskLevels = ["I", "II", "III", "IV", "V"];
      if (!validRiskLevels.includes(generatedProblem.riskLevel)) {
        generatedProblem.riskLevel = "III";
      }

      const validRiskLabels = ["Low", "Moderate", "Significant", "Major", "Critical"];
      if (!validRiskLabels.includes(generatedProblem.riskLabel)) {
        generatedProblem.riskLabel = "Significant";
      }

      return res.json({ success: true, problem: generatedProblem, isAiGenerated: true });
    } catch (apiError: any) {
      let isQuotaExceeded = false;
      let cleanErrorMessage = "Gemini API unavailable.";
      const rawMsg = apiError?.message || String(apiError || "");
      
      if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED") || rawMsg.includes("quota")) {
        isQuotaExceeded = true;
        cleanErrorMessage = "Gemini API quota exceeded (Rate Limit 429). Designing a local crisis around the requested inputs.";
      } else {
        try {
          if (rawMsg.startsWith("{") || rawMsg.includes('{"error"')) {
            const parsed = JSON.parse(rawMsg.substring(rawMsg.indexOf("{")));
            cleanErrorMessage = parsed?.error?.message || rawMsg;
          } else {
            cleanErrorMessage = rawMsg;
          }
        } catch (jerr) {
          cleanErrorMessage = rawMsg;
        }
      }
      
      console.warn(`[Gemini API Status] Problem generator fallback. Reason: ${cleanErrorMessage.slice(0, 160)}`);
      
      // Select a random fallback problem corresponding to requested category if possible
      let matchedFallback: any = null;
      if (category) {
        matchedFallback = fallbackProblems.find(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (!matchedFallback) {
        const randomIndex = Math.floor(Math.random() * fallbackProblems.length);
        matchedFallback = { ...fallbackProblems[randomIndex] };
      } else {
        matchedFallback = { ...matchedFallback }; // copy
      }
      
      // If a custom theme was specified, dynamically construct a fully tailored local problem so the game adapts 100% to their input!
      if (theme) {
        matchedFallback.title = `Urgent: ${theme.slice(0, 45)} Intervention`;
        matchedFallback.description = `[Local Backup Protocol] Reports have emerged regarding a sudden administrative challenge relating to: "${theme}". Cabinet members have raised concerns about infrastructure bottlenecks, necessitating a decisive central ordinance to balance localized community interests under the ${category || "Governance"} division.`;
      }

      return res.json({ 
        success: true, 
        problem: matchedFallback, 
        isAiGenerated: false,
        isQuotaFallback: isQuotaExceeded,
        apiKeyMessage: isQuotaExceeded 
          ? "Gemini API Quota reached (429 Rate Limit). Scaled down to localized crisis compiler." 
          : (process.env.GEMINI_API_KEY ? `Local backup mode (${cleanErrorMessage.slice(0, 100)})` : "Gemini is unavailable. Using cached campaign crisis catalog.")
      });
    }
  } catch (error: any) {
    console.error("Problem generator endpoint error:", error);
    res.status(500).json({ error: error.message || "Failed to generate campaign problem" });
  }
});

// Vite & Static file handler
async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lok Shakti Campaign Server active on http://0.0.0.0:${PORT}`);
  });
}

serveApp();
