import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, CheckCircle2, TrendingUp, Coins, Users, Flame, Globe, 
  ChevronRight, AlertTriangle, RotateCcw, Sparkles, Radio, 
  Newspaper, Calendar, Landmark, Vote, HelpCircle, ArrowUpRight, ArrowDownRight,
  ShieldAlert, UserX, Award, Zap, Smile, Frown, Sparkle, Bot, Cpu
} from "lucide-react";
import { 
  INDIA_PROBLEMS, EVENT_CARDS, INITIAL_REGIONS, 
  IndiaProblem, EventCard, RegionState, OppositionAction 
} from "./data";

export default function App() {
  // Game States
  const [gameState, setGameState] = useState<"INTRO" | "PLAYING" | "ELECTION">("INTRO");
  const [difficulty, setDifficulty] = useState<"moderate" | "centrist" | "coalition">("centrist");
  const [currentStep, setCurrentStep] = useState(1);
  const [daysToPolls, setDaysToPolls] = useState(90);
  
  // Stats
  const [approvalRating, setApprovalRating] = useState(45.0);
  const [campaignTreasury, setCampaignTreasury] = useState(12000); // INR Crores
  const [coalitionTrust, setCoalitionTrust] = useState(60); // %
  const [mediaPressure, setMediaPressure] = useState(50); // %
  
  // Lists
  const [problems, setProblems] = useState<IndiaProblem[]>(INDIA_PROBLEMS);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [regions, setRegions] = useState<RegionState[]>(INITIAL_REGIONS);
  const [history, setHistory] = useState<Array<{
    problemTitle: string;
    policyText: string;
    effectiveness: number;
    budgetImpact: number;
    approvalImpact: number;
    headline: string;
    impactedRegionsOrSectors?: string;
    regionalImpactNarrative?: string;
    longTermOutlook?: string;
  }>>([]);
  const [oppositionHistory, setOppositionHistory] = useState<OppositionAction[]>([]);
  
  // Active Policy Inputs
  const [policyText, setPolicyText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [stabilityPact, setStabilityPact] = useState(false);

  // AI Problem Generator State
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [genProblemCategory, setGenProblemCategory] = useState("");
  const [genProblemTheme, setGenProblemTheme] = useState("");
  const [generationLog, setGenerationLog] = useState("");
  const [showAiAdvisor, setShowAiAdvisor] = useState(true);
  const [aiIsTrending, setAiIsTrending] = useState(true);
  const [genSuccess, setGenSuccess] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genQuotaFallback, setGenQuotaFallback] = useState(false);
  const [genWarningText, setGenWarningText] = useState<string | null>(null);



  const handleGenerateProblem = async (isTrending: boolean) => {
    setIsGeneratingProblem(true);
    setGenSuccess(false);
    setGenError(null);
    setGenQuotaFallback(false);
    setGenWarningText(null);
    setGenerationLog(isTrending ? "Initializing dynamic news web-scrapers..." : "Formulating administrative crisis scenario...");
    
    const messages = isTrending 
      ? [
          "Searching recent Indian telemetry and news updates...",
          "Contacting regional district magistrates and panchayats...",
          "Validating social pressure indices & border alerts...",
          "Synthesizing crisis report cards..."
        ]
      : [
          "Allocating regional structural friction parameters...",
          "Formulating localized bureaucratic bottleneck details...",
          "Synthesizing draft simulation cabinet briefing notes...",
          "Finalizing risk variables on general elections track..."
        ];
    
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length) {
        setGenerationLog(messages[msgIdx]);
        msgIdx++;
      }
    }, 1200);

    try {
      const res = await fetch("/api/generate-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: genProblemCategory || undefined,
          theme: genProblemTheme || undefined,
          isTrending
        })
      });
      const data = await res.json();
      clearInterval(interval);
      
      if (data.success && data.problem) {
        const newProb = data.problem;
        setGenQuotaFallback(!!data.isQuotaFallback);
        setGenWarningText(data.apiKeyMessage || null);
        
        // Add new problem to our dynamic state list
        setProblems((prev) => {
          const updated = [...prev];
          // Prepend or insert at current index
          updated.splice(currentProblemIndex, 0, newProb);
          return updated;
        });

        // Focus on the newly inserted problem
        setPolicyText("");
        setEvaluationResult(null);
        setSelectedChoiceIdx(null);
        setEventResolved(false);
        setActiveEvent(null); // Clear active choice event to allow immediate user policy draft for their custom problem!
        
        setGenSuccess(true);
        setTimeout(() => setGenSuccess(false), 12000); // Keep open slightly longer for quota text to be read

        setNewsFlash(`"CABINET COMMUNIQUÉ: Urgent ${newProb.category} problem detected: '${newProb.title}' in ${newProb.location}. Core cabinet has been mobilized."`);
      } else {
        setGenError(data.error || "Failed to compile dynamic AI problem. Please check if your API keys are defined.");
      }
    } catch (e: any) {
      clearInterval(interval);
      console.error("AI Problem generator failed:", e);
      setGenError(e.message || "Network error. Failed to hit AI problem generator endpoint.");
    } finally {
      setIsGeneratingProblem(false);
      setGenerationLog("");
    }
  };

  // Active Choice Event State
  const [activeEvent, setActiveEvent] = useState<EventCard | null>(null);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [eventResolved, setEventResolved] = useState(false);

  // Live updates
  const [newsFlash, setNewsFlash] = useState("\"Cabinet schedules emergency discussion over infrastructure bottlenecks in metropolitan zones.\"");
  const [whisperCampaign, setWhisperCampaign] = useState("\"Regional leaders state they will closely monitor the next policy decision budget allocation.\"");
  const [pollRadar, setPollRadar] = useState("\"Agrarian belt signals high volatility. Farmers' voting block remains undecided.\"");
  const [economicIndex, setEconomicIndex] = useState("\"Reserve Bank hints at fiscal tighter controls if spending is not checked.\"");

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSavedCampaign, setHasSavedCampaign] = useState(false);

  // Load state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lokshakti_campaign_save_v1");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.gameState) {
          setGameState(data.gameState);
          if (data.gameState !== "INTRO") {
            setHasSavedCampaign(true);
          }
        }
        if (data.difficulty) setDifficulty(data.difficulty);
        if (data.currentStep) setCurrentStep(data.currentStep);
        if (data.daysToPolls) setDaysToPolls(data.daysToPolls);
        if (data.approvalRating) setApprovalRating(data.approvalRating);
        if (data.campaignTreasury) setCampaignTreasury(data.campaignTreasury);
        if (data.coalitionTrust) setCoalitionTrust(data.coalitionTrust);
        if (data.mediaPressure) setMediaPressure(data.mediaPressure);
        if (data.problems) setProblems(data.problems);
        if (data.currentProblemIndex !== undefined) setCurrentProblemIndex(data.currentProblemIndex);
        if (data.regions) setRegions(data.regions);
        if (data.history) setHistory(data.history);
        if (data.oppositionHistory) setOppositionHistory(data.oppositionHistory);
        if (data.activeEvent !== undefined) setActiveEvent(data.activeEvent);
        if (data.selectedChoiceIdx !== undefined) setSelectedChoiceIdx(data.selectedChoiceIdx);
        if (data.eventResolved !== undefined) setEventResolved(data.eventResolved);
        if (data.stabilityPact !== undefined) setStabilityPact(data.stabilityPact);
        if (data.newsFlash) setNewsFlash(data.newsFlash);
        if (data.whisperCampaign) setWhisperCampaign(data.whisperCampaign);
        if (data.pollRadar) setPollRadar(data.pollRadar);
        if (data.economicIndex) setEconomicIndex(data.economicIndex);
        if (data.policyText !== undefined) setPolicyText(data.policyText);
        if (data.evaluationResult !== undefined) setEvaluationResult(data.evaluationResult);
      }
    } catch (e) {
      console.error("Failed to load saved campaign progress:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save state on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (gameState !== "INTRO") {
        const saveState = {
          gameState,
          difficulty,
          currentStep,
          daysToPolls,
          approvalRating,
          campaignTreasury,
          coalitionTrust,
          mediaPressure,
          problems,
          currentProblemIndex,
          regions,
          history,
          oppositionHistory,
          activeEvent,
          selectedChoiceIdx,
          eventResolved,
          stabilityPact,
          newsFlash,
          whisperCampaign,
          pollRadar,
          economicIndex,
          policyText,
          evaluationResult
        };
        localStorage.setItem("lokshakti_campaign_save_v1", JSON.stringify(saveState));
        setHasSavedCampaign(true);
      }
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }, [
    isLoaded,
    gameState,
    difficulty,
    currentStep,
    daysToPolls,
    approvalRating,
    campaignTreasury,
    coalitionTrust,
    mediaPressure,
    problems,
    currentProblemIndex,
    regions,
    history,
    oppositionHistory,
    activeEvent,
    selectedChoiceIdx,
    eventResolved,
    stabilityPact,
    newsFlash,
    whisperCampaign,
    pollRadar,
    economicIndex,
    policyText,
    evaluationResult
  ]);

  const resumeCampaign = () => {
    try {
      const saved = localStorage.getItem("lokshakti_campaign_save_v1");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.gameState) setGameState(data.gameState);
        if (data.difficulty) setDifficulty(data.difficulty);
        if (data.currentStep) setCurrentStep(data.currentStep);
        if (data.daysToPolls) setDaysToPolls(data.daysToPolls);
        if (data.approvalRating) setApprovalRating(data.approvalRating);
        if (data.campaignTreasury) setCampaignTreasury(data.campaignTreasury);
        if (data.coalitionTrust) setCoalitionTrust(data.coalitionTrust);
        if (data.mediaPressure) setMediaPressure(data.mediaPressure);
        if (data.problems) setProblems(data.problems);
        if (data.currentProblemIndex !== undefined) setCurrentProblemIndex(data.currentProblemIndex);
        if (data.regions) setRegions(data.regions);
        if (data.history) setHistory(data.history);
        if (data.oppositionHistory) setOppositionHistory(data.oppositionHistory);
        if (data.activeEvent !== undefined) setActiveEvent(data.activeEvent);
        if (data.selectedChoiceIdx !== undefined) setSelectedChoiceIdx(data.selectedChoiceIdx);
        if (data.eventResolved !== undefined) setEventResolved(data.eventResolved);
        if (data.stabilityPact !== undefined) setStabilityPact(data.stabilityPact);
        if (data.newsFlash) setNewsFlash(data.newsFlash);
        if (data.whisperCampaign) setWhisperCampaign(data.whisperCampaign);
        if (data.pollRadar) setPollRadar(data.pollRadar);
        if (data.economicIndex) setEconomicIndex(data.economicIndex);
        if (data.policyText !== undefined) setPolicyText(data.policyText);
        if (data.evaluationResult !== undefined) setEvaluationResult(data.evaluationResult);
        
        setNewsFlash(`"CABINET RE-ALIGNED: Continuing preceding Lok Sabha campaign with days remaining: ${data.daysToPolls}."`);
      }
    } catch (e) {
      console.error("Failed to resume campaign:", e);
    }
  };

  const clearSavedCampaign = () => {
    try {
      localStorage.removeItem("lokshakti_campaign_save_v1");
      setHasSavedCampaign(false);
      // Reset current app states to standard campaign launch defaults
      setProblems(INDIA_PROBLEMS);
      setCurrentProblemIndex(0);
      setRegions(JSON.parse(JSON.stringify(INITIAL_REGIONS)));
      setHistory([]);
      setOppositionHistory([]);
      setPolicyText("");
      setEvaluationResult(null);
      setSelectedChoiceIdx(null);
      setEventResolved(false);
      setStabilityPact(false);
    } catch (e) {
      console.error("Failed to clear saved campaign:", e);
    }
  };

  // Load first event after setup
  const initGame = (selectedDiff: typeof difficulty) => {
    setDifficulty(selectedDiff);
    let startBudget = 12000;
    let startTrust = 60;
    let startApproval = 45.0;

    if (selectedDiff === "moderate") {
      // Challenger (Easier)
      startBudget = 15000;
      startTrust = 75;
      startApproval = 48.0;
    } else if (selectedDiff === "coalition") {
      // Coalition Architect (Harder)
      startBudget = 9000;
      startTrust = 45;
      startApproval = 40.0;
    }

    setCampaignTreasury(startBudget);
    setCoalitionTrust(startTrust);
    setApprovalRating(startApproval);
    setDaysToPolls(90);
    setCurrentStep(1);
    setCurrentProblemIndex(0);
    setRegions(JSON.parse(JSON.stringify(INITIAL_REGIONS)));
    setHistory([]);
    setOppositionHistory([]);
    setPolicyText("");
    setEvaluationResult(null);
    setSelectedChoiceIdx(null);
    setEventResolved(false);
    setStabilityPact(false);

    // Initial random event at campaign start
    const firstEvent = EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
    setActiveEvent(firstEvent);

    setGameState("PLAYING");

    // Seed initial ticker
    setNewsFlash("\"Lok Shakti Party starts nationwide rally campaigns to connect with Tier-2 demographic corridors.\"");
    setWhisperCampaign("\"UPF challenger Devendra Shastri pledges a relentless audit of key government projects.\"");
    setPollRadar("\"Voters in Maharashtra demand better municipal water management and faster tech jobs scale.\"");
    setEconomicIndex("\"Inflation is stable at 4.2% but fuel import adjustments loom on the horizon.\"");
  };

  const getWordCount = (text: string) => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  };

  // Helper suggestions to build policy easily
  const currentProblem = problems[currentProblemIndex];
  const getPolicySuggestions = (category: string) => {
    if (currentProblem && currentProblem.idealSolutions && currentProblem.idealSolutions.length > 0) {
      return currentProblem.idealSolutions;
    }
    switch (category) {
      case "Infrastructure":
        return [
          "Deploy State Disaster Response Force (SDRF) with municipal water pumps immediately.",
          "Redirect ₹1500 Cr for constructing permanent storm-water deep drains along outer roads.",
          "Initiate an emergency audit of civic contractors and suspend licenses for delayed works.",
          "Co-fund telecom early warn telemetry nodes across local municipal wards."
        ];
      case "Agriculture":
        return [
          "Sanction direct distress agrarian cash transfers of ₹8,000 per acre to local farms.",
          "Draft an official executive ordinance guaranteeing statutory MSP on Rabi procurement.",
          "Authorize temporary restructuring of farm loans with cooperative financial lenders.",
          "Earmark ₹500 Cr to subsidize crop insurance premiums using state relief reserves."
        ];
      case "Environment":
        return [
          "Impose strict localized fines on crop residue burning via satellite tracking systems.",
          "Subsidize happy-seeder zero-till machineries by 80% to encourage eco-friendly weeding.",
          "Enforce transit restrictions and stop dirty heavy diesel generator operations.",
          "Direct ₹1000 Cr to expand high-density electric bus transit networks in urban centers."
        ];
      case "Economy":
        return [
          "Launch 'Yuva Kaushal' graduate micro-job grants of ₹10,000 per technical student.",
          "Authorize special tax exemptions for micro-manufacturers that expand payroll rolls.",
          "Fast-track central recruitment commissions to fill vacancies in schools and railways.",
          "Provide state-backed interest-free collateral loans to rural self-help collectives."
        ];
      case "Social Safety":
        return [
          "Direct ₹400 Cr to install high-intensity surveillance grids in unlit suburban hubs.",
          "Mandate panic buttons, active GPS trackers, and women safety teams in public transport.",
          "Deploy pink police emergency squads on overnight routes across metropolitan corridors.",
          "Create a localized central help crisis response bureau with fast-track hearings."
        ];
      case "Governance":
        return [
          "Direct an independent judicial commission headed by retired judges to inspect sub-tenders.",
          "Deploy blockchain-based digital procurements to track subcontractor invoice settlements.",
          "Blacklist developers accused of lobbying and demote the regional engineer supervisors.",
          "Provide equal minority audits and opposition seating inside vigilance review benches."
        ];
      case "Water Crisis":
        return [
          "Initiate crackdown on private tanker cartels and enforce government regulated rates.",
          "Allocate ₹2000 Cr for emergency grey-water purification plants and lake desilting.",
          "Enforce mandatory rainwater harvesting structures in all upcoming housing layouts.",
          "Deliver subsidized direct water voucher cards to low-income municipal clusters."
        ];
      case "Health":
        return [
          "Earmark ₹600 Cr emergency medicines and deployment of doctor teams to tribal sectors.",
          "Create dynamic satellite diagnostic centers on trailers to scale healthcare access.",
          "Upgrade drinking purification filters across primary health centers and rural schools.",
          "Authorize community health worker allowances to handle point-of-care diagnostics."
        ];
      default:
        return [
          "Form an expert advisory board composed of IAS officers and economists to oversee execution.",
          "Allocate emergency regional infrastructure grants of ₹800 Cr immediately.",
          "Enforce structural compliance parameters and fine repeat regulatory failures."
        ];
    }
  };

  const addSuggestion = (text: string) => {
    setPolicyText((prev) => {
      const clean = prev.trim();
      if (!clean) return text;
      return clean + " Moreover, we will " + text.charAt(0).toLowerCase() + text.slice(1);
    });
  };

  // Submit Policy Ordinance Draft
  const authorizePolicy = async () => {
    if (getWordCount(policyText) < 5) {
      setEvaluationError("Write a serious policy solution of at least 5 words.");
      return;
    }

    setEvaluationError(null);
    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle: currentProblem.title,
          problemDescription: currentProblem.description,
          policyText,
          currentApproval: approvalRating,
          currentBudget: campaignTreasury,
          currentCoalitionTrust: coalitionTrust
        })
      });

      const data = await response.json();
      if (data.success && data.evaluation) {
        setEvaluationResult(data.evaluation);
      } else {
        throw new Error(data.error || "Failed static parsed analysis");
      }
    } catch (e: any) {
      setEvaluationError(e.message || "Connection failure with evaluation node.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Choice Event handlers
  const handleSelectChoice = (idx: number) => {
    if (eventResolved) return;
    setSelectedChoiceIdx(idx);
  };

  const confirmEventChoice = () => {
    if (selectedChoiceIdx === null || !activeEvent) return;
    
    const choice = activeEvent.choices[selectedChoiceIdx];
    
    // Apply stats immediately
    setApprovalRating((prev) => Math.max(10, Math.min(100, Number((prev + choice.approvalEffect).toFixed(1)))));
    setCampaignTreasury((prev) => Math.max(0, prev + choice.budgetEffect));
    
    // Damp drops if stability pact is active
    const calculatedTrustEffect = choice.trustEffect < 0 && stabilityPact 
      ? Math.round(choice.trustEffect * 0.5) 
      : choice.trustEffect;
    setCoalitionTrust((prev) => Math.max(5, Math.min(100, prev + calculatedTrustEffect)));
    setMediaPressure((prev) => Math.max(10, Math.min(100, prev + choice.mediaEffect)));

    setEventResolved(true);

    // Update real-time feed with event fallout
    setNewsFlash(`"EVENT STABILITY: ${activeEvent.title} resolved. ${choice.outcomeText.substring(0, 100)}..."`);
    const econMsg = choice.budgetEffect < 0 
      ? `"Reserve Review: Event choice caused high outflow of ₹${Math.abs(choice.budgetEffect)} Cr."`
      : `"Reserve Review: Fiscal impact from recent event resolves neutral."`;
    setEconomicIndex(econMsg);
  };

  const closeResolvedEvent = () => {
    setActiveEvent(null);
    setSelectedChoiceIdx(null);
    setEventResolved(false);
  };

  // Turn Acceptance Logic
  const adoptPolicyReforms = () => {
    if (!evaluationResult) return;

    const {
      effectiveness,
      budgetImpactCr,
      publicApprovalImpactPct,
      coalitionTrustImpactPct,
      mediaReactionHeadline,
      mediaReactionTone,
      detailedFeedback,
      narrativeEvent,
      intelUpdate,
      oppositionAction
    } = evaluationResult;

    // Apply policy results + opposition strike results
    const oppApproval = oppositionAction ? oppositionAction.approvalImpactPct : 0;
    const oppMedia = oppositionAction ? oppositionAction.mediaPressureImpactPct : 0;
    const oppTrust = oppositionAction ? oppositionAction.coalitionTrustImpactPct : 0;

    const combinedApprovalShift = publicApprovalImpactPct + oppApproval;
    
    // Damp drops if stability pact is active
    const finalPolicyTrustEffect = coalitionTrustImpactPct < 0 && stabilityPact
      ? Math.round(coalitionTrustImpactPct * 0.5)
      : coalitionTrustImpactPct;
    const finalOppTrust = oppTrust < 0 && stabilityPact
      ? Math.round(oppTrust * 0.5)
      : oppTrust;
    const combinedTrustShift = finalPolicyTrustEffect + finalOppTrust;

    const newApproval = Math.max(10, Math.min(100, Number((approvalRating + combinedApprovalShift).toFixed(1))));
    const newBudget = Math.max(0, campaignTreasury + budgetImpactCr);
    const newCoalitionTrust = Math.max(5, Math.min(100, coalitionTrust + combinedTrustShift));
    
    // Media tone shift + opposition force impact
    let mediaShift = oppMedia;
    if (mediaReactionTone === "CRITICAL") mediaShift += 8;
    else if (mediaReactionTone === "SUPPORTIVE") mediaShift -= 6;
    else mediaShift += 2;

    const newMediaPressure = Math.max(10, Math.min(100, mediaPressure + mediaShift));

    // Update main stats
    setApprovalRating(newApproval);
    setCampaignTreasury(newBudget);
    setCoalitionTrust(newCoalitionTrust);
    setMediaPressure(newMediaPressure);

    // Save history
    setHistory((prev) => [
      ...prev,
      {
        problemTitle: currentProblem.title,
        policyText,
        effectiveness,
        budgetImpact: budgetImpactCr,
        approvalImpact: publicApprovalImpactPct,
        headline: mediaReactionHeadline,
        impactedRegionsOrSectors: evaluationResult?.impactedRegionsOrSectors,
        regionalImpactNarrative: evaluationResult?.regionalImpactNarrative,
        longTermOutlook: evaluationResult?.longTermOutlook
      }
    ]);

    // Save opposition history
    if (oppositionAction) {
      setOppositionHistory((prev) => [...prev, oppositionAction]);
    }

    // Update specific state approvals
    const matchedState = regions.find(r => currentProblem.location.toLowerCase().includes(r.name.toLowerCase()));
    if (matchedState) {
      setRegions((prev) =>
        prev.map((r) => {
          if (r.name === matchedState.name) {
            const localShift = combinedApprovalShift * 1.5 + (effectiveness - 5) * 1.0;
            return {
              ...r,
              approval: Math.max(10, Math.min(100, Number((r.approval + localShift).toFixed(1))))
            };
          }
          return {
            ...r,
            approval: Math.max(10, Math.min(100, Number((r.approval + combinedApprovalShift * 0.8).toFixed(1))))
          };
        })
      );
    } else {
      setRegions((prev) =>
        prev.map((r) => ({
          ...r,
          approval: Math.max(10, Math.min(100, Number((r.approval + combinedApprovalShift).toFixed(1))))
        }))
      );
    }

    // Trigger Random Event Card for the next crisis round
    const nextEvent = EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
    setActiveEvent(nextEvent);

    // Seed new operational ticker updates
    setNewsFlash(`"POLITICAL BULLETINS: ${mediaReactionHeadline}"`);
    if (oppositionAction) {
      setWhisperCampaign(`"${oppositionAction.leader} announces campaign: '${oppositionAction.title}' attacking policy limits."`);
    } else {
      setWhisperCampaign(`"Dossier source: ${intelUpdate}"`);
    }
    setPollRadar(`"Public reaction on local grid: ${narrativeEvent}"`);
    
    const econStatus = budgetImpactCr < -1000 
      ? `"Reserves Audit: Heavy cash outlays of ₹${Math.abs(budgetImpactCr)} Cr approved for regional cabinet ordinance."`
      : `"Reserves Audit: Sustainable ordinance execution costs of ₹${Math.abs(budgetImpactCr)} Cr."`;
    setEconomicIndex(econStatus);

    // Advance Campaign Timeline
    const daysLeft = daysToPolls - 15;
    setDaysToPolls(daysLeft);

    if (daysLeft <= 0) {
      setGameState("ELECTION");
    } else {
      // Setup next issue
      setCurrentStep((prev) => prev + 1);
      setCurrentProblemIndex((prev) => (prev + 1) % problems.length);
      // Clean interface
      setPolicyText("");
      setEvaluationResult(null);
      setSelectedChoiceIdx(null);
      setEventResolved(false);
    }
  };

  // Compile Election outcomes
  const getElectionResults = () => {
    let baseWinRatio = approvalRating / 100;
    
    // Treasury spendings boost
    const campaignAdvertisingBoost = campaignTreasury > 5000 ? 0.05 : (campaignTreasury / 100000);
    baseWinRatio += campaignAdvertisingBoost;

    let alliancePullout = coalitionTrust < 38;

    let totalSeatsWon = 0;
    // Calculate final results state by state
    const stateOutcomes = regions.map((r) => {
      let rawRatio = r.approval / 100;
      // standard swing variance
      let randomSwing = 0.88 + Math.random() * 0.22; 
      let seatsWon = Math.round(r.seats * rawRatio * randomSwing);
      seatsWon = Math.max(0, Math.min(r.seats, seatsWon));
      totalSeatsWon += seatsWon;
      return {
        ...r,
        seatsWon
      };
    });

    // Scale states to Lok Sabha totals
    const ratioMultiplier = 543 / 238;
    const projectedLokSabhaSeats = Math.max(110, Math.min(520, Math.round(totalSeatsWon * ratioMultiplier)));

    let outcomeType: "LANDSLIDE" | "COALITION" | "HUNG" | "DEFEAT" = "DEFEAT";
    let explanation = "";

    if (projectedLokSabhaSeats >= 272 && coalitionTrust >= 35) {
      outcomeType = "LANDSLIDE";
      explanation = "You emerged with a glorious national absolute majority! The Lok Shakti Party secured a direct mandate across Uttar Pradesh and Karnataka. You are sworn in as Prime Minister with supreme federal autonomy.";
    } else if (projectedLokSabhaSeats >= 235 && coalitionTrust >= 48 && !alliancePullout) {
      outcomeType = "COALITION";
      explanation = "By striking delicate alliance pacts, you crossed the 272 majority threshold to establish a coalition cabinet. Your prime ministership is retained, though you must distribute powerful ministerial portfolios to regional partners.";
    } else if (projectedLokSabhaSeats >= 235 && alliancePullout) {
      outcomeType = "HUNG";
      explanation = "A hung parliament! Although your party emerged single-largest, poor alliance management caused key coalition blocks to defect to Shastri's UPF opposition on live TV. Power slips away.";
    } else if (projectedLokSabhaSeats < 235) {
      outcomeType = "DEFEAT";
      explanation = "A bitter democratic defeat. Shastri's United People's Front successfully tapped into local grievances, sweeping West Bengal and Bihar. You gracefully transition to the opposition benches.";
    }

    // opposition audit details
    const totalOppApproval = oppositionHistory.reduce((sum, item) => sum + (item.approvalImpactPct || 0), 0);
    const totalOppTrust = oppositionHistory.reduce((sum, item) => sum + (item.coalitionTrustImpactPct || 0), 0);
    const totalOppMedia = oppositionHistory.reduce((sum, item) => sum + (item.mediaPressureImpactPct || 0), 0);

    return {
      projectedLokSabhaSeats,
      stateOutcomes,
      outcomeType,
      explanation,
      campaignAdvertisingBoost: Math.round(campaignAdvertisingBoost * 100),
      totalOppApproval: Number(totalOppApproval.toFixed(1)),
      totalOppTrust,
      totalOppMedia
    };
  };

  const electionResult = gameState === "ELECTION" ? getElectionResults() : null;

  return (
    <div className="min-h-screen bg-[#121210] text-[#e6e2d6] font-sans flex flex-col antialiased selection:bg-[#d97706]/35 selection:text-white">
      
      {/* 1. INTROSCREEN */}
      {gameState === "INTRO" && (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-[#1c1c1a] border-2 border-[#383731] rounded-2xl p-6 md:p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#d97706]"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#d97706] rounded-xl flex items-center justify-center font-display font-medium text-xl text-[#121210] shadow-lg shadow-[#d97706]/10">
                  LS
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-serif tracking-wider uppercase text-[#d97706]">LOK SHAKTI CAMPAIGN</h1>
                  <p className="text-[10px] opacity-60 font-mono">INDIA FISCAL & GOVERNANCE SIMULATOR • v2.0</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 bg-[#2a2924] border border-[#383731] font-mono text-[#d97706] rounded-full uppercase tracking-wider">
                V2.0 AI Upgrade
              </span>
            </div>

            <div className="text-xs leading-relaxed text-[#a8a29e] mb-6 space-y-3">
              <p>
                Minister, the general election approaches in <span className="font-semibold text-[#e6e2d6]">90 days</span>. 
                This campaign introduces highly coordinated and relentless hostilities from the <span className="text-[#e6e2d6] font-semibold">AI-driven Opposition Front</span>, led by the charismatic candidate <span className="text-orange-400 font-semibold">Devendra Shastri</span>.
              </p>
              <p>
                The opposition will actively monitor your legislative policy ordinances, launching tailored campaigns, exploiting scandals, and attempting to poach your fragile coalition partners on every turn!
              </p>
            </div>

            <div className="bg-[#2a2924]/60 border border-[#383731] rounded-xl p-4 mb-6">
              <h3 className="text-[10px] font-mono uppercase text-[#d97706] mb-2 flex items-center gap-2 font-bold tracking-wider">
                <Sparkles className="w-4 h-4 text-orange-500" /> NEW DUAL-STAGE GAMEPLAY CORE
              </h3>
              <ul className="text-xs space-y-2.5 leading-relaxed text-[#a8a29e]">
                <li className="flex items-start gap-2">
                  <span className="text-[#d97706] mt-0.5">•</span>
                  <span><strong>Phase 1: Dynamic Choice Crisis:</strong> Start each round resolving an unexpected sector event, taking strategic decisions that immediately shift your cash, approval, and media pressure.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d97706] mt-0.5">•</span>
                  <span><strong>Phase 2: Text Ordinance Evaluation:</strong> Type custom bills in your own words. Gemini evaluates efficiency, effectiveness, and triggers custom <strong>Opposition Strikes</strong> to counter you.</span>
                </li>
              </ul>
            </div>

            <h3 className="text-[10px] uppercase font-mono tracking-widest opacity-60 mb-3">Select Cabinet Strategy:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <button 
                onClick={() => setDifficulty("moderate")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  difficulty === "moderate" 
                    ? "bg-[#d97706]/10 border-[#d97706] text-white" 
                    : "bg-[#2a2924]/50 border-[#383731] hover:bg-[#2a2924]"
                }`}
              >
                <div className="font-bold text-xs uppercase tracking-wide">Challenger Bloc</div>
                <div className="text-[10px] opacity-60 mt-1 leading-snug">₹15,000 Cr reserves. Supportive coalition block. Ideal for high spending infrastructure.</div>
              </button>

              <button 
                onClick={() => setDifficulty("centrist")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  difficulty === "centrist" 
                    ? "bg-[#d97706]/10 border-[#d97706] text-white" 
                    : "bg-[#2a2924]/50 border-[#383731] hover:bg-[#2a2924]"
                }`}
              >
                <div className="font-bold text-xs uppercase tracking-wide">Incumbent Centrist</div>
                <div className="text-[10px] opacity-60 mt-1 leading-snug">₹12,000 Cr baseline. Standard public approval and moderate media pressure.</div>
              </button>

              <button 
                onClick={() => setDifficulty("coalition")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  difficulty === "coalition" 
                    ? "bg-[#d97706]/10 border-[#d97706] text-white" 
                    : "bg-[#2a2924]/50 border-[#383731] hover:bg-[#2a2924]"
                }`}
              >
                <div className="font-bold text-xs uppercase tracking-wide">Alliance Architect</div>
                <div className="text-[10px] opacity-60 mt-1 leading-snug">₹9,000 Cr tight treasury. Delicate regional allies. Requires careful compromises.</div>
              </button>
            </div>

            <div className="space-y-4">
              {hasSavedCampaign && (
                <div className="flex gap-2">
                  <button 
                    onClick={resumeCampaign}
                    className="flex-1 py-3.5 px-6 bg-[#082f49]/60 hover:bg-[#0c4a6e]/80 border border-cyan-500/35 text-cyan-400 font-sans rounded-xl text-center transition-all cursor-pointer text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 select-none animate-pulse hover:animate-none"
                  >
                    <Landmark className="w-4 h-4 text-cyan-400" /> RESUME ACTIVE CAMPAIGN
                  </button>
                  <button 
                    onClick={clearSavedCampaign}
                    className="px-4 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-500/50 text-red-500 rounded-xl transition-all cursor-pointer text-xs font-mono uppercase font-bold text-center"
                    title="Erase active campaign progress and start fresh"
                  >
                    ERASE SAVE
                  </button>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => initGame(difficulty)}
                  className="flex-1 py-3 px-6 bg-[#d97706] text-[#121210] font-sans rounded-xl text-center hover:bg-orange-500 transition-colors cursor-pointer text-xs font-bold tracking-widest uppercase"
                >
                  LAUNCH NEW PROTOCOL
                </button>
                <button 
                  onClick={() => setShowTutorial(!showTutorial)}
                  className="px-5 py-3 border border-[#383731] rounded-xl hover:bg-[#2a2924] transition-all text-[11px] flex items-center gap-2 font-mono uppercase tracking-wider"
                >
                  <HelpCircle className="w-4 h-4 text-orange-400" /> Manual
                </button>
              </div>

              {hasSavedCampaign && (
                <p className="text-[9px] text-[#a8a29e] text-center font-mono opacity-80 uppercase tracking-widest">
                  * Launching a new protocol will overwrite your active cabinet save file.
                </p>
              )}
            </div>

            {showTutorial && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 bg-[#121210] border border-[#383731] rounded-xl text-[11px] space-y-2 text-[#a8a29e] leading-relaxed"
              >
                <p><strong>Gemini AI Intelligence:</strong> Typing detailed, professional plans (e.g. referencing specific central/state schemes, balancing expenditure with local private co-funding, targeting structural roots instead of easy populist handouts) improves evaluation scores.</p>
                <p><strong>Opposition Countering:</strong> Short, poorly drafted, high-spending bills will trigger punishing campaigns from Devendra Shastri, immediately shown on your dashboard. Defend your states carefully.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* 2. PLAYING BOARD */}
      {gameState === "PLAYING" && (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* TOP BAR / METRICS PLATFORM */}
          <header className="h-16 bg-[#1c1c1a] border-b border-[#383731] flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
            <div className="flex items-center gap-4">
              <div 
                onClick={() => setGameState("INTRO")}
                className="w-10 h-10 bg-[#d97706] rounded flex items-center justify-center font-bold text-[#121210] shadow-md cursor-pointer hover:bg-orange-500 transition-all font-display"
              >
                LP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold tracking-wider text-[#d97706]">LOK SHAKTI CAMPAIGN</h1>
                  <span className="text-[7.5px] bg-green-500/10 border border-green-500/30 text-green-400 font-mono py-0.5 px-1.5 rounded uppercase tracking-wider font-extrabold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                    SAVED
                  </span>
                </div>
                <p className="text-[10px] opacity-50 uppercase tracking-wider">Turn {currentStep} of 6 • Opposition Alert Status: High</p>
              </div>
            </div>

            {/* Core Stats indicators */}
            <div className="flex items-center gap-6 md:gap-8">
              <div className="text-center">
                <p className="text-[9px] uppercase opacity-50 flex items-center gap-1 justify-center">
                  <TrendingUp className="w-3 h-3 text-green-500" /> National Approval
                </p>
                <p className="text-xs md:text-sm font-mono font-bold text-green-500">{approvalRating}%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase opacity-50 flex items-center gap-1 justify-center">
                  <Coins className="w-3 h-3 text-[#d97706]" /> Campaign Treasury
                </p>
                <p className="text-xs md:text-sm font-mono font-bold">₹{campaignTreasury.toLocaleString()} Cr</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase opacity-50 flex items-center gap-1 justify-center text-yellow-500">
                  <Users className="w-3 h-3 text-yellow-500" /> Coalition Trust
                </p>
                <p className={`text-xs md:text-sm font-mono font-bold ${coalitionTrust < 38 ? "text-red-500 animate-pulse font-extrabold" : "text-yellow-500"}`}>{coalitionTrust}%</p>
              </div>
            </div>

            {/* Poll progress bubble */}
            <div className="h-10 px-4 bg-[#2a2924]/60 border border-[#383731] rounded flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] md:text-xs font-mono font-semibold tracking-wider uppercase">{daysToPolls} Days to Polls</p>
            </div>
          </header>

          {/* MAIN SIMULATOR SCREEN CONTAINER */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT COLUMN: REGIONAL STATE HOLD & MEDIA PRESSURE */}
            <aside className="w-64 md:w-72 bg-[#171715] border-r border-[#383731] flex flex-col p-4 gap-4 overflow-y-auto shrink-0 select-none">
              
              <div className="space-y-4">
                {/* Cabinet Liaison Office Panel */}
                <div className="p-3 bg-[#1c1c1a] border-2 border-yellow-700/40 rounded-lg space-y-3 shadow-md">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] uppercase font-bold tracking-wider text-yellow-500 flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5" /> Cabinet Liaison Office
                    </h3>
                    {stabilityPact && (
                      <span className="text-[8px] uppercase tracking-widest bg-green-950/40 border border-green-500/30 text-green-400 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                        Pact On
                      </span>
                    )}
                  </div>

                  {/* Toggle Stability Pact */}
                  <div className="flex items-center justify-between p-2 bg-[#121210] rounded border border-[#383731]/60">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-[#e6e2d6]">Stability Pact</span>
                      <span className="text-[8px] text-[#a8a29e] opacity-85">-50% Trust drops</span>
                    </div>
                    <button
                      onClick={() => setStabilityPact(!stabilityPact)}
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border transition-all cursor-pointer ${
                        stabilityPact 
                          ? "bg-green-600/20 border-green-500 text-green-400" 
                          : "bg-transparent border-[#383731] text-[#a8a29e] hover:bg-[#2a2924]"
                      }`}
                    >
                      {stabilityPact ? "Active" : "Enable"}
                    </button>
                  </div>

                  {/* Active Lobbying Buttons */}
                  <div className="space-y-1.5 pt-0.5">
                    <button
                      onClick={() => {
                        if (campaignTreasury >= 400) {
                          setCampaignTreasury(prev => prev - 400);
                          setCoalitionTrust(prev => Math.min(100, prev + 12));
                          setMediaPressure(prev => Math.max(10, prev - 5));
                          setNewsFlash(`"CABINET DISPATCH: Hosted high-table Alliance Coordination Banquet. Coalition trust climbs."`);
                        }
                      }}
                      disabled={campaignTreasury < 400 || coalitionTrust >= 100}
                      className="w-full py-1.5 px-2 bg-[#2a2924] hover:bg-[#383731]/80 disabled:opacity-40 disabled:hover:bg-[#2a2924] border border-[#383731] rounded text-[10px] text-left flex justify-between items-center transition-all cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#e6e2d6]">🍲 Alliance Banquet</span>
                        <span className="text-[8px] text-green-500 font-medium">+12 Trust • -5 Friction</span>
                      </div>
                      <span className="font-mono text-[9px] text-[#d97706] font-bold shrink-0">₹400 Cr</span>
                    </button>

                    <button
                      onClick={() => {
                        if (campaignTreasury >= 1000) {
                          setCampaignTreasury(prev => prev - 1000);
                          setCoalitionTrust(prev => Math.min(100, prev + 25));
                          setNewsFlash(`"CABINET DISPATCH: Authorized Regional State-Aid Package. Alliance partners report full satisfaction."`);
                        }
                      }}
                      disabled={campaignTreasury < 1000 || coalitionTrust >= 100}
                      className="w-full py-1.5 px-2 bg-[#2a2924] hover:bg-[#383731]/80 disabled:opacity-40 disabled:hover:bg-[#2a2924] border border-[#383731] rounded text-[10px] text-left flex justify-between items-center transition-all cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#e6e2d6]">💰 State-Aid Package</span>
                        <span className="text-[8px] text-green-500 font-medium">+25 Trust</span>
                      </div>
                      <span className="font-mono text-[9px] text-[#d97706] font-bold shrink-0">₹1000 Cr</span>
                    </button>
                  </div>
                </div>

                {/* Media Pressure component */}
                <div className="p-3 bg-[#1c1c1a] border border-[#383731] rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#a8a29e] flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500 animate-pulse" /> Newsroom Friction
                    </h3>
                    <p className="text-[10px] font-mono opacity-50">{mediaPressure}%</p>
                  </div>
                  <div className="h-2 bg-[#2a2924] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        mediaPressure > 70 ? "bg-red-600" : mediaPressure > 45 ? "bg-orange-500" : "bg-green-500"
                      }`}
                      style={{ width: `${mediaPressure}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] mt-1 text-[#a8a29e] opacity-70 leading-relaxed">
                    {mediaPressure > 70 
                      ? "High opposition feed! Shastri has dominant airspace to run negative ads." 
                      : "Press and civic boards are stable and neutral."}
                  </p>
                </div>

                {/* Regional list with seats */}
                <div className="p-3 bg-[#1c1c1a] border border-[#383731] rounded-lg">
                  <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#a8a29e] mb-2 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-cyan-400" /> State Approval & Tally Hold
                  </h3>
                  <div className="space-y-2.5">
                    {regions.map((region) => (
                      <div key={region.name} className="flex flex-col text-[11px] border-b border-[#2a2924] last:border-0 pb-1.5 last:pb-0">
                        <div className="flex justify-between font-medium">
                          <span className="text-[#e6e2d6] font-semibold">{region.name}</span>
                          <span className={`${
                            region.approval > 50 ? "text-green-500" : region.approval > 40 ? "text-yellow-500" : "text-red-500"
                          }`}>{region.approval}% Approval</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] opacity-50 mt-0.5 font-mono">
                          <span>{region.seats} Lok Sabha Seats</span>
                          <span>Multiplier x{region.weight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* OP TRIAL COUNTER - INTERNET FORUM TICKER */}
              <div className="mt-auto border-t border-[#383731] pt-4">
                <h3 className="text-[10px] uppercase tracking-widest text-[#d97706] mb-3 font-mono flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" /> ACTIVE OPPOSITION TRACK
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {oppositionHistory.length === 0 ? (
                    <div className="text-[10px] leading-relaxed p-2.5 bg-[#2a2924]/50 border border-[#383731]/70 rounded text-[#a8a29e] italic text-center">
                      "Devendra Shastri is auditing reserves. Write your first ordinance to trigger opposition campaigns."
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2 bg-red-950/20 border border-red-500/20 rounded text-[10px]">
                        <p className="font-mono text-red-400 uppercase font-semibold">Opposition Aggression Index</p>
                        <p className="text-xs font-mono font-bold text-red-500 mt-1">LEVEL {oppositionHistory.length} / 6</p>
                      </div>
                      {oppositionHistory.slice(-2).map((opp, idx) => (
                        <div key={idx} className="text-[10px] leading-normal p-2 bg-[#1c1c1a] rounded border-l-2 border-red-500">
                          <p className="font-semibold text-[#e6e2d6] uppercase tracking-wide">{opp.title}</p>
                          <p className="text-red-400 font-mono text-[9px] mt-0.5">{opp.strategyName}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* CENTER PANEL: STAGE 1 CHOICE EVENT OR STAGE 2 POLICY WRITING */}
            <main className="flex-1 bg-[#121210] flex flex-col overflow-y-auto p-4 md:p-6 pb-20 relative">

              {/* 🤖 CABINET CRISIS INTELLIGENCE CENTER (AI BOT) */}
              <div className="mb-6 bg-[#171715] border border-[#383731] rounded-xl p-4 shadow-xl select-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d97706]/5 rounded-bl-full pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-[#2a2924] pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                      <Bot className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#e6e2d6] flex items-center gap-1.5">
                        AI Crisis Bot & Intel Briefing Room <span className="text-[8px] bg-amber-500/10 border border-amber-500/30 text-amber-500 px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">LIAISON SYSTEM</span>
                      </h3>
                      <p className="text-[10px] text-[#a8a29e]">Generate dynamic, real-time national challenges on any governance sector</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAiAdvisor(!showAiAdvisor)}
                    className="px-2.5 py-1 text-[9px] font-mono text-[#a8a29e] hover:text-[#e6e2d6] bg-[#1e1d1a] border border-[#383731] rounded transition-all cursor-pointer"
                  >
                    {showAiAdvisor ? "CLOSE CONSOLE ▲" : "EXPAND INTELLIGENCE ▼"}
                  </button>
                </div>

                {showAiAdvisor && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Grid Item 1: Sector selection (5 columns) */}
                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-amber-500 block">Core Problem Area</label>
                        <select
                          value={genProblemCategory}
                          onChange={(e) => setGenProblemCategory(e.target.value)}
                          className="w-full bg-[#121210] border border-[#383731] rounded p-2 text-xs text-[#e6e2d6] font-medium outline-none focus:border-amber-500/50 cursor-pointer"
                        >
                          <option value="">-- Choose Any Theme Area --</option>
                          <option value="Infrastructure">Infrastructure (IT Corridors, Ports, Exams)</option>
                          <option value="Agriculture">Agriculture & Rabi Crop MSP</option>
                          <option value="Environment">Environment, AQI & Air Quality</option>
                          <option value="Economy">Economy & Graduate Outlays</option>
                          <option value="Social Safety">Social Safety & Transit Security</option>
                          <option value="Governance">Governance, Tenders & Coalition</option>
                          <option value="Water Crisis">Water Crisis & Groundwater Reserve</option>
                          <option value="Health">Health & Epidemic Emergencies</option>
                        </select>
                      </div>

                      {/* Grid Item 2: Trending theme & custom prompt (5 columns) */}
                      <div className="md:col-span-5 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-amber-500 block">Current Issue / Trending Theme</label>
                          <button 
                            onClick={() => setAiIsTrending(!aiIsTrending)}
                            className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase transition-colors shrink-0 ${
                              aiIsTrending 
                                ? "bg-cyan-950/40 border-cyan-500 text-cyan-400" 
                                : "bg-[#121210] border-[#383731] text-[#a8a29e]"
                            }`}
                            title="When enabled, Gemini queries Google Search in real-time to locate current news."
                          >
                            🌐 Grounding {aiIsTrending ? "ON" : "OFF"}
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            value={genProblemTheme}
                            onChange={(e) => setGenProblemTheme(e.target.value)}
                            placeholder="e.g. AI election deepfakes, extreme summer temperature, semiconductor water..."
                            className="w-full bg-[#121210] border border-[#383731] rounded p-2 text-xs text-[#e6e2d6] font-medium outline-none focus:border-amber-500/50"
                          />
                        </div>
                      </div>

                      {/* Grid Item 3: Deploy button (3 columns) */}
                      <div className="md:col-span-3 flex flex-col justify-end">
                        <button
                          onClick={() => handleGenerateProblem(aiIsTrending)}
                          disabled={isGeneratingProblem}
                          className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-[#2a2924] disabled:text-[#e6e2d6]/30 text-[#121210] font-mono font-black text-[10px] uppercase tracking-widest rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          {isGeneratingProblem ? (
                            <>
                              <span className="w-3 border border-[#121210] border-t-transparent rounded-full animate-spin h-3"></span>
                              SCANNING INBOX...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 shrink-0 text-[#121210]" />
                              TRIGGER AI CRISIS
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Pre-set fast tags for current / trending Indian issues */}
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono font-bold tracking-wider text-[#a8a29e]/80 uppercase block">1-Click Current Trending Crises Presets:</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {[
                          { label: "Election Deepfake Panic", query: "High-level AI voice clone leak destabilizing regional coalitions", cat: "Governance" },
                          { label: "Summer Temperature Crisis", query: "Extreme pre-monsoon heat wave impacting manual voting counts", cat: "Health" },
                          { label: "Water Competitions", query: "High-tech chip sector competing for metropolitan irrigation reserve assets", cat: "Water Crisis" },
                          { label: "Web3 Investor Flight", query: "Unregulated offshore cryptocurrency exchanges brain drain tax friction", cat: "Economy" },
                          { label: "Smart-Meter Routs", query: "State-wide smart electricity meter consumer pricing protest blockades", cat: "Infrastructure" }
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setGenProblemTheme(preset.query);
                              if (preset.cat) setGenProblemCategory(preset.cat);
                              setAiIsTrending(true);
                            }}
                            className="text-[9px] bg-[#121210] border border-[#383731]/75 hover:border-amber-500/20 text-[#a8a29e] hover:text-[#e6e2d6] px-2 py-0.5 rounded transition-all font-mono cursor-pointer"
                          >
                            🔥 {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Loader status log */}
                    <AnimatePresence>
                      {isGeneratingProblem && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-2.5 bg-black/40 border-l border-amber-500/40 rounded flex items-center gap-2"
                        >
                          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{generationLog || "Connecting to Intelligence Satellite..."}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {genSuccess && (
                      <div className="space-y-2">
                        {genQuotaFallback ? (
                          <div className="p-3 bg-yellow-950/15 border border-yellow-650/30 rounded-lg text-yellow-400 text-[10px] font-mono space-y-1.5 flex flex-col">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-yellow-500 animate-pulse" />
                              <span className="font-bold uppercase tracking-wider text-yellow-500">DEMO CABINET CORE SEAMLESS FALLBACK</span>
                            </div>
                            <p className="text-[9.5px] text-[#a8a29e] leading-relaxed uppercase">
                              The temporary Gemini API quota has been reached. 
                              However, our system has synthesized a realistic local scenario incorporating your focusing theme parameters: <span className="text-yellow-400 font-semibold">"{genProblemTheme || "Custom Setup"}"</span>. Your cabinet gameplay simulation is 100% active!
                            </p>
                          </div>
                        ) : genWarningText ? (
                          <div className="p-2.5 bg-yellow-950/25 border border-yellow-500/30 rounded text-yellow-500 text-[10px] font-mono flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-yellow-500" />
                            <span>LOCAL BACKUP ACTIVE: {genWarningText}</span>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-green-950/25 border border-green-500/30 rounded text-green-400 text-[10px] font-mono flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>INTELLIGENCE INJECTED: A new dynamic Indian governance crisis has been deployed! Review and authorize custom ordinances in the section below.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {genError && (
                      <div className="p-2.5 bg-red-950/25 border border-red-500/35 rounded text-red-400 text-[10px] font-mono flex items-center justify-between">
                        <span>CRITICAL ERROR: {genError}</span>
                        <button onClick={() => setGenError(null)} className="font-extrabold hover:text-white px-1">✕</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* STAGE 1: DYNAMIC CHOICES CRISIS EVENT CARD */}
              <AnimatePresence mode="wait">
                {activeEvent && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-6 bg-[#1c1c1a] border-2 border-orange-500/40 rounded-xl p-5 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-550/10 rounded-bl-full z-0 pointer-events-none"></div>
                    
                    <div className="flex items-center gap-2 mb-3 z-10 relative">
                      <span className="px-2 py-0.5 bg-red-950/40 text-red-400 text-[10px] font-bold uppercase rounded border border-red-500/30 tracking-wider">
                        STAGE 1: INTERACTIVE INCIDENT
                      </span>
                      <span className="text-[9px] text-[#a8a29e] font-mono uppercase bg-[#2a2924] px-2 py-0.5 rounded tracking-widest">
                        {activeEvent.type}
                      </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-serif text-white italic tracking-wide mb-2 z-10 relative">
                      {activeEvent.title}
                    </h2>
                    <p className="text-xs text-[#a8a29e] leading-relaxed mb-4 max-w-xl z-10 relative">
                      {activeEvent.description}
                    </p>

                    {/* Choice Pathways List */}
                    <div className="space-y-3 mb-4 z-10 relative">
                      {activeEvent.choices.map((choice, idx) => {
                        const isSelected = selectedChoiceIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectChoice(idx)}
                            disabled={eventResolved}
                            className={`w-full p-3 rounded-lg border text-left text-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-2 cursor-pointer ${
                              isSelected 
                                ? "bg-orange-950/35 border-[#d97706] text-white shadow-lg"
                                : eventResolved
                                  ? "bg-[#2a2924]/20 border-[#383731]/70 opacity-40"
                                  : "bg-[#262520] border-[#383731] text-[#a8a29e] hover:bg-[#2a2924]"
                            }`}
                          >
                            <div className="flex-1 pr-4">
                              <span className="font-bold text-[#e6e2d6] mr-1">Option {String.fromCharCode(65 + idx)}:</span>
                              {choice.text}
                            </div>
                            <div className="text-[9px] font-mono text-orange-400 bg-black/40 px-2 py-1 rounded border border-orange-500/25 shrink-0 uppercase tracking-widest mt-1 md:mt-0">
                              {choice.effectDescription}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected choice feedback screen */}
                    <AnimatePresence>
                      {selectedChoiceIdx !== null && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-3 bg-[#121210] border border-[#383731] rounded-lg text-xs leading-relaxed mb-4 text-[#a8a29e]"
                        >
                          <span className="font-mono text-[9px] text-[#d97706] font-bold uppercase tracking-widest block mb-1">
                            ESTIMATED IMPACT OUTCOME
                          </span>
                          {activeEvent.choices[selectedChoiceIdx].outcomeText}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 z-10 relative">
                      {!eventResolved ? (
                        <button
                          onClick={confirmEventChoice}
                          disabled={selectedChoiceIdx === null}
                          className="px-6 py-2.5 bg-[#d97706] disabled:bg-[#383731] disabled:text-[#e6e2d6]/30 text-[#121210] font-bold text-xs uppercase tracking-widest rounded-lg transition-colors hover:bg-orange-500 cursor-pointer"
                        >
                          CONFIRM RESOLUTION PATHWAY
                        </button>
                      ) : (
                        <button
                          onClick={closeResolvedEvent}
                          className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                        >
                          PROCEED TO POLICY DRAFTING SESSION
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI POLITICAL INTELLIGENCE ROOM (PROBLEM BROADCASTER BOT) */}
              <div className="mb-6 bg-[#171715] border-2 border-[#d97706]/35 rounded-xl p-4 shadow-xl select-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#d97706]/5 rounded-bl-full pointer-events-none"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 pb-3 border-b border-[#383731]/60">
                  <div>
                    <h3 className="text-xs uppercase font-extrabold tracking-wider text-orange-400 font-mono flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-orange-400 animate-bounce" /> AI Cabinet Intelligence Hub & Issue Broadcaster
                    </h3>
                    <p className="text-[10px] text-[#a8a29e] mt-0.5">
                      Broadcast dynamic governing challenges across Indian sectors. Pick a focus or type any custom theme.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] uppercase tracking-widest font-mono font-bold bg-[#2a2924] text-[#a8a29e] border border-[#383731] px-2 py-1 rounded">
                      Model: Gemini 3.5 Flash
                    </span>
                  </div>
                </div>

                {isGeneratingProblem ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-3 bg-black/40 rounded-lg border border-[#383731]/40">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin"></div>
                      <Cpu className="w-4 h-4 text-[#d97706] animate-pulse" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-mono font-semibold text-white animate-pulse">GENERATING FRESH CHALLENGE</p>
                      <p className="text-[10px] text-[#a8a29e] font-mono italic">{generationLog}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Controls Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Sector/Category selector */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-[#a8a29e] font-bold block">Target Socio-Economic Sector</label>
                        <select
                          value={genProblemCategory}
                          onChange={(e) => setGenProblemCategory(e.target.value)}
                          className="w-full bg-[#121210] border border-[#383731] text-[#e6e2d6] text-xs px-2.5 py-2 rounded focus:border-[#d97706] outline-none font-mono"
                        >
                          <option value="">⚡ Random Sector (General Challenge)</option>
                          <option value="Governance">🏛️ Governance & Server Integrity</option>
                          <option value="Economy">📊 Economy & Capital Taxes</option>
                          <option value="Infrastructure">🏗️ Infrastructure & Urban Flood Transports</option>
                          <option value="Agriculture">🌾 Agriculture & MSP Cooperatives</option>
                          <option value="Environment">🌍 Environment & Climate Hazards</option>
                          <option value="Water Crisis">💧 Water Crisis & Basin Disputes</option>
                          <option value="Health">⚕️ Health & Epidemic Controls</option>
                          <option value="Social Safety">🛡️ Social Safety & Labor Protections</option>
                        </select>
                      </div>

                      {/* Custom input theme */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-[#a8a29e] font-bold block">Optional Custom Theme / Focus Topic</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={genProblemTheme}
                            onChange={(e) => setGenProblemTheme(e.target.value)}
                            placeholder="e.g. UPSC Paper Leak, deepfake scams, tech regulations..."
                            className="w-full bg-[#121210] border border-[#383731] text-[#e6e2d6] text-xs pl-2.5 pr-8 py-2 rounded focus:border-[#d97706] outline-none placeholder:text-stone-600"
                          />
                          {genProblemTheme && (
                            <button
                              onClick={() => setGenProblemTheme("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-500 hover:text-[#e6e2d6] font-mono cursor-pointer bg-transparent border-0"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick suggestion tags */}
                    <div className="space-y-1.5">
                      <span className="text-[8px] uppercase tracking-wider font-mono font-bold text-stone-500 block font-semibold">Suggested Trending Topics:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { text: "UPSC Paper Leak", cat: "Governance" },
                          { text: "AI Deepfakes", cat: "Governance" },
                          { text: "Fintech Collapse", cat: "Economy" },
                          { text: "Drought Migrations", cat: "Water Crisis" },
                          { text: "Heatwave Grid Shut", cat: "Environment" },
                          { text: "Semiconductor Chips", cat: "Economy" }
                        ].map((tag) => (
                          <button
                            key={tag.text}
                            onClick={() => {
                              setGenProblemTheme(tag.text);
                              setGenProblemCategory(tag.cat);
                            }}
                            className={`px-2 py-1 text-[9px] font-mono rounded border transition-all cursor-pointer ${
                              genProblemTheme === tag.text
                                ? "bg-orange-500/15 border-orange-500 text-orange-400"
                                : "bg-[#121210] border-[#383731]/80 text-[#a8a29e] hover:border-[#a8a29e]/50 hover:text-white"
                            }`}
                          >
                            #{tag.text}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1.5 border-t border-[#383731]/40">
                      <button
                        onClick={() => handleGenerateProblem(false)}
                        className="flex-1 py-2 px-3.5 bg-[#2a2924] hover:bg-[#383731] text-[#e6e2d6] border border-[#383731] font-mono font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Cpu className="w-3.5 h-3.5 text-[#d97706]" /> Generate Custom Problem
                      </button>
                      <button
                        onClick={() => handleGenerateProblem(true)}
                        className="flex-1 py-2 px-3.5 bg-[#d97706]/10 hover:bg-[#d97706]/20 text-orange-400 border border-[#d97706]/40 font-mono font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse hover:animate-none"
                      >
                        <Globe className="w-3.5 h-3.5 text-orange-400" /> 🔥 Search-Grounded Trending Issue
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CORE PROBLEM HEADER BRACE - ACTIVE IF EVENT LOCKED/RESOLVED */}
              <div className="opacity-95">
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4 p-4 bg-[#1c1c1a]/60 border border-[#383731] rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#d97706]/5 rounded-bl-full z-0"></div>
                  
                  <div className="max-w-xl z-10">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#d97706]/20 text-[#d97706] text-[10px] font-bold uppercase rounded border border-[#d97706]/35 tracking-wider">
                        STAGE 2: PUBLIC LEGISLATION DRAFT
                      </span>
                      <span className="text-[10px] text-[#a8a29e] font-mono uppercase bg-[#2a2924] px-1.5 py-0.5 rounded">
                        {currentProblem.category}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-serif mt-2 mb-3 leading-tight italic text-white text-orange-250">
                      {currentProblem.title}
                    </h2>
                    <p className="text-xs text-[#a8a29e] font-mono flex items-center gap-1 text-[#d97706] uppercase tracking-wider mb-2">
                      <Globe className="w-3.5 h-3.5" /> Zone Jurisdiction: {currentProblem.location}
                    </p>
                    <p className="text-xs md:text-sm text-[#a8a29e] leading-relaxed">
                      {currentProblem.description}
                    </p>
                  </div>

                  <div className="w-full md:w-32 h-24 flex md:flex-col items-center justify-between md:justify-center border border-dashed border-[#383731] rounded-lg p-3 shrink-0 bg-[#171715]/40 select-none">
                    <div className="text-[9px] uppercase opacity-50 text-center mb-1 font-mono tracking-widest text-[#a8a29e]">Risk Factor</div>
                    <div className="text-4xl font-display font-medium text-red-500 font-extrabold">{currentProblem.riskLevel}</div>
                    <div className="text-[9px] uppercase opacity-50 font-mono text-center tracking-widest text-[#a8a29e]">{currentProblem.riskLabel}</div>
                  </div>
                </div>

                {/* POLICY DRAFTING STATION */}
                <div className="flex-1 flex flex-col gap-4">
                  
                  <div className="flex-1 bg-[#1c1c1a] border border-[#383731] rounded-xl flex flex-col p-1 shadow-inner relative">
                    <div className="bg-[#2a2924] px-4 py-2.5 flex justify-between items-center rounded-t-xl border-b border-[#383731] text-[10px] font-mono select-none">
                      <span className="text-[#a8a29e] flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#d97706]" /> CABINET_DRAFT_ORDINANCE_SEC{currentStep}.doc
                      </span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                      </div>
                    </div>

                    <div className="flex-1 p-4 relative min-h-48">
                      <textarea 
                        value={policyText}
                        onChange={(e) => setPolicyText(e.target.value)}
                        disabled={isEvaluating || !!evaluationResult || !!activeEvent}
                        placeholder={
                          activeEvent 
                            ? "⚠️ Please resolve the active Stage 1 Incident above before drafting your primary policy bill."
                            : "Type your policy response in your own words... Specify structural solutions. Direct budgetary distribution, deploy municipal teams, co-fund technology programs or coordinate audits to solve the local crisis."
                        }
                        className="w-full h-full min-h-48 bg-transparent text-[#e6e2d6] border-0 outline-none resize-none placeholder:text-[#5f5d53] text-sm md:text-base leading-relaxed"
                      ></textarea>

                      <div className="absolute bottom-4 right-4 flex items-center gap-4 bg-[#121210]/95 px-3 py-1.5 border border-[#383731] rounded-lg shadow-md z-10">
                        <p className="text-[10px] font-mono opacity-60 uppercase tracking-widest select-none">
                          Words: <span className="font-bold text-[#e6e2d6]">{getWordCount(policyText)}</span>
                        </p>
                        
                        {!evaluationResult ? (
                          <button 
                            onClick={authorizePolicy}
                            disabled={isEvaluating || !!activeEvent}
                            className="px-6 py-2 bg-[#d97706] disabled:bg-[#383731] disabled:text-[#e6e2d6]/30 text-[#121210] font-bold uppercase text-[11px] font-sans tracking-widest rounded-md hover:bg-orange-500 transition-colors shadow-lg cursor-pointer"
                          >
                            {isEvaluating ? "Analyzing Bill..." : "Authorize Bill"}
                          </button>
                        ) : (
                          <span className="text-[10px] text-green-500 font-mono font-bold flex items-center gap-1 select-none">
                            <CheckCircle2 className="w-3.5 h-3.5" /> AUTHORIZED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ERROR PANEL IF ANY */}
                  {evaluationError && (
                    <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-400 font-mono flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" /> {evaluationError}
                    </div>
                  )}

                  {/* EXPECTED POLICY DISCIPLINE & DYNAMIC SOLUTIONS GUIDE */}
                  {!evaluationResult && !isEvaluating && !activeEvent && (
                    <div className="space-y-4">
                      <div className="p-4 bg-[#1e1a12]/50 border border-[#d97706]/20 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1 px-2 text-[7.5px] bg-[#d97706]/15 border-b border-l border-[#d97706]/20 text-[#d97706] font-mono uppercase tracking-widest select-none">
                          Civil Service Protocol
                        </div>
                        <h4 className="text-xs font-semibold text-orange-400 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5" /> Cabinet Secretary drafting guide
                        </h4>
                        <p className="text-[11px] text-[#a8a29e] leading-relaxed mb-3">
                          The Gemini Core and localized simulation engine grade your drafted policy on 
                          <span className="text-[#e6e2d6] font-semibold"> Specificity, Socio-Economic Feasibility, and Strategic Integrity</span>. 
                          To secure high public approval and coalition confidence, your bill is expected to address:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] font-mono uppercase">
                          <div className="p-2 bg-[#121210]/60 border border-[#383731]/50 rounded text-amber-500">
                            <span className="block text-[#a8a29e] text-[8.5px] mb-1">1. IMMEDIATE RELIEF</span>
                            Deploy emergency teams, municipal pumps, diagnostic clinics or food subsidies.
                          </div>
                          <div className="p-2 bg-[#121210]/60 border border-[#383731]/50 rounded text-cyan-400">
                            <span className="block text-[#a8a29e] text-[8.5px] mb-1">2. FISCAL EXPENDITURE</span>
                            Specify dynamic budgetary allocations (e.g. ₹500 Cr to ₹2000 Cr) for core targets.
                          </div>
                          <div className="p-2 bg-[#121210]/60 border border-[#383731]/50 rounded text-emerald-400">
                            <span className="block text-[#a8a29e] text-[8.5px] mb-1">3. REGULATORY COMPLIANCE</span>
                            Mandate public audits, independent CBI/commission reviews, or builder blacklisting.
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#171715] border border-[#383731] rounded-xl space-y-2.5 shadow-md">
                        <p className="text-[10px] uppercase font-mono tracking-widest text-[#a8a29e] flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-[#d97706] animate-pulse" /> 🚀 Pre-Approved Ideal Draft Directives (Click to inject):
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {getPolicySuggestions(currentProblem.category).map((s, idx) => (
                            <button 
                              key={idx}
                              onClick={() => addSuggestion(s)}
                              className="bg-[#2a2924] hover:bg-[#383731] hover:border-orange-500/40 text-[#e6e2d6] text-[10px] p-2.5 rounded-lg border border-[#383731] text-left transition-all leading-normal cursor-pointer flex flex-col justify-between hover:scale-[1.01] duration-150"
                            >
                              <span className="text-[#a8a29e] text-[8px] font-mono uppercase mb-1">Pillar #{idx+1}</span>
                              <span className="text-[#e6e2d6]">{s}</span>
                            </button>
                          ))}
                        </div>
                        <p className="text-[8px] text-[#5f5d53] uppercase font-mono tracking-widest text-right">
                          * You can combine multiple pillars or append your custom conditions directly in the document editor above.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LOADER ATMOSPHERIC OVERLAY */}
                  {isEvaluating && (
                    <div className="p-8 bg-[#1c1c1a] border border-[#383731] rounded-xl flex flex-col items-center justify-center space-y-4">
                      <div className="relative w-12 h-12">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#383731] rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-[#d97706] rounded-full animate-spin"></div>
                      </div>
                      <div className="text-center font-mono space-y-1">
                        <p className="text-xs text-[#d97706] tracking-wider uppercase animate-pulse">Engaging Cabinet Evaluator...</p>
                        <p className="text-[10px] opacity-50 animate-pulse">Scanning financial models • Measuring alliance response waves</p>
                      </div>
                    </div>
                  )}

                  {/* TURN EVALUATION DISPATCH CARD - MULTI-PANE VIEW */}
                  {evaluationResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-[#1c1c1a] border-2 border-[#d97706]/40 rounded-xl space-y-4 shadow-xl"
                    >
                      {/* Left Block Header */}
                      <div className="flex justify-between items-start border-b border-[#383731] pb-3">
                        <div>
                          <span className="px-1.5 py-0.5 bg-[#d97706]/20 border border-[#d97706]/30 rounded text-[9px] font-mono text-[#d97706] uppercase tracking-widest font-bold">
                            Intelligence Output Analysis
                          </span>
                          <h3 className="text-lg font-serif italic text-white mt-1">"{evaluationResult.mediaReactionHeadline}"</h3>
                          <p className="text-[10px] font-mono text-[#a8a29e] mt-1">
                            Media Stasis Tone: <span className={`font-bold ${
                              evaluationResult.mediaReactionTone === "SUPPORTIVE" ? "text-green-500" :
                              evaluationResult.mediaReactionTone === "CRITICAL" ? "text-red-500" : "text-yellow-500"
                            }`}>{evaluationResult.mediaReactionTone}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1 select-none">
                          {evaluationResult.apiStatus === "demo_fallback" ? (
                            <span className="text-[9px] px-2 py-0.5 bg-yellow-950/20 text-yellow-500 border border-yellow-500/30 font-mono rounded">
                              Local Engine Fallback
                            </span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 bg-green-950/20 text-green-500 border border-green-500/30 font-mono rounded">
                              Gemini 3.5 Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* DUAL PANE METRIC GRID AND OPPOSITION ATTACK ACTION CARD */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        
                        {/* Policy Metrics - Local Column (7 Grid Columns) */}
                        <div className="lg:col-span-7 space-y-3">
                          <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#d97706] font-bold">Ordinance Scorecard</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-2 text-xs">
                            <div className="bg-[#121210] p-2.5 rounded border border-[#383731] flex flex-col justify-between h-14">
                              <p className="text-[9px] uppercase opacity-50 font-mono">Effectiveness</p>
                              <p className={`text-sm font-bold font-mono ${evaluationResult.effectiveness >= 7 ? "text-green-500" : "text-yellow-500"}`}>
                                {evaluationResult.effectiveness} / 10
                              </p>
                            </div>

                            <div className="bg-[#121210] p-2.5 rounded border border-[#383731] flex flex-col justify-between h-14">
                              <p className="text-[9px] uppercase opacity-50 font-mono">Efficiency</p>
                              <p className="text-sm font-bold font-mono text-[#e6e2d6]">{evaluationResult.efficiency} / 10</p>
                            </div>

                            <div className="bg-[#121210] p-2.5 rounded border border-[#383731] flex flex-col justify-between h-14">
                              <p className="text-[9px] uppercase opacity-50 font-mono">Feasibility</p>
                              <p className="text-sm font-bold font-mono text-[#e6e2d6]">{evaluationResult.feasibility} / 10</p>
                            </div>

                            <div className="bg-[#d97706]/5 p-2.5 rounded border border-[#d97706]/35 flex flex-col justify-between h-14">
                              <p className="text-[9px] uppercase text-[#d97706] font-mono">Ordinance Cost</p>
                              <p className={`text-sm font-bold font-mono ${evaluationResult.budgetImpactCr < 0 ? "text-orange-400" : "text-green-400"}`}>
                                {evaluationResult.budgetImpactCr < 0 ? "-" : ""}₹{Math.abs(evaluationResult.budgetImpactCr)} Cr
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-[#121210] border border-[#383731] rounded-lg">
                            <h4 className="text-[9px] uppercase font-mono tracking-wider opacity-60 mb-2">Legislative Impact Breakdown</h4>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="border-r border-[#2a2924]">
                                <p className="text-[8px] opacity-50 uppercase font-mono">Approval Shift</p>
                                <p className={`text-xs font-bold font-mono flex items-center justify-center gap-1 mt-0.5 ${
                                  evaluationResult.publicApprovalImpactPct >= 0 ? "text-green-500" : "text-red-400"
                                }`}>
                                  {evaluationResult.publicApprovalImpactPct >= 0 ? <ArrowUpRight className="w-3" /> : <ArrowDownRight className="w-3" />}
                                  {evaluationResult.publicApprovalImpactPct >= 0 ? "+" : ""}{evaluationResult.publicApprovalImpactPct}%
                                </p>
                              </div>
                              <div className="border-r border-[#2a2924]">
                                <p className="text-[8px] opacity-50 uppercase font-mono">Coalition Trust</p>
                                <p className={`text-xs font-bold font-mono flex items-center justify-center gap-1 mt-0.5 ${
                                  evaluationResult.coalitionTrustImpactPct >= 0 ? "text-green-500" : "text-red-400"
                                }`}>
                                  {evaluationResult.coalitionTrustImpactPct >= 0 ? <ArrowUpRight className="w-3" /> : <ArrowDownRight className="w-3" />}
                                  {evaluationResult.coalitionTrustImpactPct >= 0 ? "+" : ""}{evaluationResult.coalitionTrustImpactPct}%
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] opacity-50 uppercase font-mono">Policy Realism</p>
                                <p className="text-xs font-bold text-cyan-400 mt-0.5 font-mono">
                                  {evaluationResult.politicalRealism} / 10
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 bg-[#2a2924]/60 border border-[#383731] rounded-lg text-xs leading-relaxed text-[#a8a29e]">
                            <span className="font-mono text-[9px] text-[#d97706] font-bold block uppercase tracking-wider mb-0.5 select-none">
                              Bureaucratic Execution Briefing
                            </span>
                            {evaluationResult.detailedFeedback}
                          </div>

                          {/* Ground-Reality & Long-Term Impacts Block */}
                          <div className="p-2.5 bg-[#171715] border border-amber-900/30 rounded-lg space-y-2 select-none">
                            <div className="flex items-center gap-1.5 text-amber-500">
                              <Globe className="w-3.5 h-3.5 shrink-0" />
                              <h4 className="text-[9px] uppercase font-mono tracking-wider font-extrabold">Ground-Reality & Outlook Brief</h4>
                            </div>

                            {evaluationResult.impactedRegionsOrSectors && (
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] font-mono font-bold text-amber-500 uppercase">Focus Area:</span>
                                  <span className="font-sans font-bold text-[#e6e2d6]">{evaluationResult.impactedRegionsOrSectors}</span>
                                </div>
                                <p className="text-[#a8a29e] leading-relaxed italic border-l-2 border-[#d97706]/40 pl-2 text-[11px] bg-black/20 p-2 rounded">
                                  {evaluationResult.regionalImpactNarrative}
                                </p>
                              </div>
                            )}

                            {evaluationResult.longTermOutlook && (
                              <div className="text-xs space-y-1 border-t border-[#2a2924] pt-2">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-cyan-400 shrink-0" />
                                  <span className="text-[8px] font-mono font-bold text-cyan-400 uppercase">10-Year Long-Term Outlook</span>
                                </div>
                                <p className="text-[#a8a29e] leading-relaxed text-[11px]">
                                  {evaluationResult.longTermOutlook}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI-DRIVEN OPPOSITION BLOCK STRIKEBACK (5 Grid Columns) */}
                        <div className="lg:col-span-5 border border-red-500/30 bg-red-950/10 rounded-xl p-3.5 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-red-500 mb-1">
                              <ShieldAlert className="w-4 h-4 shrink-0" />
                              <h4 className="text-[10px] uppercase font-mono tracking-wider font-extrabold">UPF Opposition Response</h4>
                            </div>

                            {evaluationResult.oppositionAction ? (
                              <div className="space-y-2">
                                <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 font-mono rounded border border-red-500/20 uppercase tracking-widest block w-max select-none">
                                  TACTIC: {evaluationResult.oppositionAction.strategyName}
                                </span>

                                <div className="space-y-1">
                                  <p className="text-xs text-white font-bold leading-snug">
                                    "{evaluationResult.oppositionAction.title}"
                                  </p>
                                  {/* Leader Direct Quote Layout */}
                                  <blockquote className="text-[11px] italic font-serif text-[#a8a29e] border-l border-red-500 pl-2 leading-relaxed my-1 bg-black/20 p-1.5 rounded">
                                    {evaluationResult.oppositionAction.quote}
                                  </blockquote>
                                  <p className="text-[10px] leading-relaxed text-[#a8a29e]">
                                    {evaluationResult.oppositionAction.description}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-[#a8a29e] italic">Opposition forces are assessing the bill under standard news protocols.</p>
                            )}
                          </div>

                          {/* Shastri's Drained Penalty Stats */}
                          {evaluationResult.oppositionAction && (
                            <div className="bg-black/40 border border-red-500/20 rounded p-2 text-[10px] font-mono space-y-1 select-none">
                              <p className="text-[8px] uppercase text-red-400 font-bold tracking-widest mb-1">OPPOSITION INFLICTED LOSSES</p>
                              <div className="flex justify-between">
                                <span className="opacity-70">Approval Drained:</span>
                                <span className="text-red-400 font-bold">{evaluationResult.oppositionAction.approvalImpactPct}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-70">Alliance Poisoned:</span>
                                <span className="text-red-400 font-bold">{evaluationResult.oppositionAction.coalitionTrustImpactPct}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="opacity-70">Media Aggression:</span>
                                <span className="text-red-500 font-bold">+{evaluationResult.oppositionAction.mediaPressureImpactPct}%</span>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Transition button triggers both impact groups */}
                      <button 
                        onClick={adoptPolicyReforms}
                        className="w-full py-3 bg-[#d97706] text-[#121210] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-orange-500 transition-colors cursor-pointer text-center select-none"
                      >
                        Enact Ordinance & Face Opposition Campaign ({daysToPolls - 15} Days Left)
                      </button>
                    </motion.div>
                  )}

                </div>
              </div>
            </main>

            {/* RIGHT COLUMN: RECAP & LIVE OPERATIONAL FEED */}
            <aside className="w-64 bg-[#171715] border-l border-[#383731] p-4 flex flex-col shrink-0 select-none overflow-y-auto hidden lg:flex">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span> Live Intelligence Feed
              </h3>

              <div className="flex-1 space-y-5 overflow-hidden">
                <div className="space-y-1">
                  <p className="text-[9px] font-mono font-bold text-orange-500 tracking-wider uppercase">NEWS FLASH</p>
                  <p className="text-xs font-serif leading-snug text-[#e6e2d6] italic">
                    {newsFlash}
                  </p>
                </div>

                <div className="space-y-1 opacity-80 border-t border-[#2a2924] pt-3">
                  <p className="text-[9px] font-mono font-bold tracking-wider text-red-400 uppercase">COALITION INTEL DOSSIER</p>
                  <p className="text-xs font-serif leading-snug text-[#a8a29e]">
                    {whisperCampaign}
                  </p>
                </div>

                <div className="space-y-1 border-t border-[#2a2924] pt-3">
                  <p className="text-[9px] font-mono font-bold text-green-500 tracking-wider uppercase">VOTER SENTIMENT RADAR</p>
                  <p className="text-xs font-serif leading-snug text-[#e6e2d6]">
                    {pollRadar}
                  </p>
                </div>

                <div className="space-y-1 opacity-80 border-t border-[#2a2924] pt-3">
                  <p className="text-[9px] font-mono font-bold tracking-wider text-cyan-400 uppercase">RESERVE AUDIT INDEX</p>
                  <p className="text-xs leading-snug text-[#a8a29e] font-mono">
                    {economicIndex}
                  </p>
                </div>
              </div>

              {/* TIMELINE PROGRESS METER */}
              <div className="mt-6 p-3 bg-[#1c1c1a] border border-[#383731] rounded">
                <h4 className="text-[10px] font-mono font-bold mb-2 uppercase text-[#a8a29e]">Election Campaign Progress</h4>
                <div className="relative h-1 bg-[#2a2924] mb-3 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-[#d97706] transition-all duration-700"
                    style={{ width: `${((90 - daysToPolls) / 90) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[8px] opacity-50 font-mono font-bold uppercase tracking-widest">
                  <span>90 Days</span>
                  <span>Turn {currentStep} / 6</span>
                  <span>0 Days</span>
                </div>
              </div>
            </aside>

          </div>
        </div>
      )}

      {/* 3. ELECTION RESULTS SCREEN */}
      {gameState === "ELECTION" && electionResult && (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl bg-[#1c1c1a] border-4 border-[#d97706]/40 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col gap-6"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-[#d97706]"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#383731] pb-4 gap-4 z-10 select-none">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#d97706] rounded-xl flex items-center justify-center text-[#121210]">
                  <Vote className="w-6 h-6 shrink-0" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-serif text-white tracking-wide uppercase">FEDERAL DEMOCRATIC AUDIT</h1>
                  <p className="text-[9px] font-mono text-[#a8a29e] tracking-wider">ELECTION COMMISSION DECLARES FINAL LOK SABHA ALLOCATIONS</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center bg-[#121210] px-4 py-2 border border-[#383731] rounded">
                  <p className="text-[8px] font-mono text-[#a8a29e] uppercase">Final National Approval</p>
                  <p className="text-lg font-mono font-bold text-green-500">{approvalRating}%</p>
                </div>
                <div className="text-center bg-[#121210] px-4 py-2 border border-[#383731] rounded">
                  <p className="text-[8px] font-mono text-[#a8a29e] uppercase">Federal Seats Won</p>
                  <p className="text-lg font-mono font-bold text-[#d97706]">{electionResult.projectedLokSabhaSeats} / 543</p>
                </div>
              </div>
            </div>

            {/* ELECTION ANALYSIS MATRIX */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              <div className="space-y-4">
                {/* Result badge indicator */}
                <div className={`p-4 rounded-xl border flex gap-4 items-start ${
                  electionResult.outcomeType === "LANDSLIDE" ? "bg-green-950/20 border-green-500/40 text-green-400" :
                  electionResult.outcomeType === "COALITION" ? "bg-cyan-950/20 border-cyan-500/40 text-cyan-400" :
                  electionResult.outcomeType === "HUNG" ? "bg-yellow-950/20 border-yellow-500/40 text-yellow-500" :
                  "bg-red-950/20 border-red-500/40 text-red-500"
                }`}>
                  <div className="mt-1">
                    <Landmark className="w-8 h-8 shrink-0" />
                  </div>
                  <div>
                    <h2 className="text-md font-bold uppercase tracking-widest">
                      {electionResult.outcomeType === "LANDSLIDE" && "Absolute Lok Sabha Landslide"}
                      {electionResult.outcomeType === "COALITION" && "Delicate Alliance Cabinet Formed"}
                      {electionResult.outcomeType === "HUNG" && "Hung Parliament - Coalition Collapsed"}
                      {electionResult.outcomeType === "DEFEAT" && "Opposition Sweeps Governance Bench"}
                    </h2>
                    <p className="text-xs text-[#a8a29e] leading-relaxed mt-2">
                      {electionResult.explanation}
                    </p>
                  </div>
                </div>

                {/* State Tally breakdown table */}
                <div className="bg-[#121210] p-4 border border-[#383731] rounded-xl select-none">
                  <h3 className="text-[10px] tracking-wider font-mono text-[#d97706] mb-3 uppercase font-bold">State Tally Breakdown</h3>
                  <div className="space-y-3">
                    {electionResult.stateOutcomes.map((r) => (
                      <div key={r.name} className="flex items-center justify-between text-xs pb-2 border-b border-[#2a2924] last:border-0 last:pb-0">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{r.name}</p>
                          <p className="text-[9px] opacity-50 font-mono">End State Approval: {r.approval}%</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-white">Projected {r.seatsWon} / {r.seats} seats</p>
                          <div className="w-24 h-1.5 bg-[#2a2924] rounded-full overflow-hidden mt-1 inline-block">
                            <div className="h-full bg-[#d97706]" style={{ width: `${(r.seatsWon / r.seats) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* DYNAMIC SHASTRI CAMPAIGN POST-MORTEM AUDIT CARD */}
              <div className="space-y-4">
                
                <div className="border border-red-500/30 bg-red-950/10 p-4 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                    <ShieldAlert className="w-5 h-5" />
                    <h3 className="text-xs uppercase font-extrabold font-mono tracking-widest text-red-400">THE SHASTRI CAMPAIGN AUDIT REPORT</h3>
                  </div>

                  <p className="text-[11px] text-[#a8a29e] leading-relaxed mb-3">
                    Throughout the course of the general election cycle, Opposition Leader <span className="text-white font-semibold">Devendra Shastri</span> coordinated a total of <span className="text-white font-semibold">{oppositionHistory.length} dedicated campaigns</span> to weaken your ordinance achievements.
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono bg-black/40 p-2.5 rounded border border-red-500/25 mb-4 font-bold select-none">
                    <div>
                      <p className="text-[8px] text-red-400 uppercase tracking-widest mb-1">APPROVAL ERODED</p>
                      <p className="text-xs text-red-500">{electionResult.totalOppApproval}%</p>
                    </div>
                    <div className="border-x border-red-500/10">
                      <p className="text-[8px] text-red-400 uppercase tracking-widest mb-1">ALLIANCE TOLL</p>
                      <p className="text-xs text-red-500">{electionResult.totalOppTrust}%</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-red-400 uppercase tracking-widest mb-1">MEDIA BURNS</p>
                      <p className="text-xs text-red-400">+{electionResult.totalOppMedia}%</p>
                    </div>
                  </div>

                  {/* High quality explanation of why they won/lost from an opposition angle */}
                  <div className="text-[11px] leading-relaxed p-3 bg-black/50 rounded-lg border border-red-500/15 text-[#a8a29e]">
                    <span className="font-mono text-[9px] text-[#d97706] font-bold block uppercase tracking-wider mb-1">
                      OPPOSITION POST-MORTEM DOSSIER
                    </span>
                    {electionResult.outcomeType === "LANDSLIDE" && (
                      <p>
                        "Shastri's aggressive negative blitz (inflicting {electionResult.totalOppApproval}% total approval drain) failed to break through your solid ordinance execution metrics. By addressing the root causes of major infrastructure and agrarian distress, you decoupled the voter base from Shastri's populist counters, rendering his campaigns ineffective."
                      </p>
                    )}
                    {electionResult.outcomeType === "COALITION" && (
                      <p>
                        "Shastri's coalition poaching campaign proved highly dangerous, squeezing Coalition Trust by {electionResult.totalOppTrust}%. While strategic cabinet concessions allowed you to scrape through with an alliance majority, you enter office with significant democratic vulnerability that Shastri is already planning to exploit."
                      </p>
                    )}
                    {electionResult.outcomeType === "HUNG" && (
                      <p>
                        "The audit demonstrates that Shastri's relentless backroom poaching (driving coalition trust to a collapse point of {coalitionTrust}%) directly caused your regional allies to walk out before seat declaration, turning what would have been an alliance victory into a historic hung lockout."
                      </p>
                    )}
                    {electionResult.outcomeType === "DEFEAT" && (
                      <p>
                        "A masterclass in opposition coordination. Shastri successfully capitalized on national crises. His media campaigns and populist counter-pledges managed to drain a total of {electionResult.totalOppApproval}% approval rating, pushing Uttar Pradesh and Bengal fully into the UPF column."
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-[#121210] p-4 border border-[#383731] rounded-xl font-mono text-xs text-[#a8a29e] space-y-2 select-none">
                  <h3 className="text-[10px] uppercase text-[#d97706] font-bold tracking-widest mb-1">Tactical Outcome Log</h3>
                  <div className="flex justify-between py-1 border-b border-[#2a2924]">
                    <span>Available Treasury Reserves</span>
                    <span className="text-[#e6e2d6] font-bold">₹{campaignTreasury.toLocaleString()} Cr</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#2a2924]">
                    <span>Remaining Alliance Trust</span>
                    <span className={`${coalitionTrust >= 40 ? "text-cyan-400" : "text-red-400"} font-bold`}>{coalitionTrust}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Ordinances Implemented</span>
                    <span className="text-[#e6e2d6] font-bold">{history.length}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Passed Bills Record */}
            <div className="bg-[#121210] p-4 border border-[#383731] rounded-xl">
              <h3 className="text-xs font-mono text-[#d97706] uppercase tracking-wider mb-3 font-bold">Cabinet Legislation Registers</h3>
              {history.length === 0 ? (
                <p className="text-xs opacity-50 italic text-[#a8a29e]">No legislative cards were authorized during the cycle.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((record, index) => (
                    <div key={index} className="text-xs p-3.5 bg-[#171715] border border-[#2a2924] rounded-xl flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start gap-2 border-b border-[#2a2924] pb-1.5 mb-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-white tracking-wide text-xs truncate">{record.problemTitle}</p>
                            <p className="text-[10px] italic text-[#a8a29e] mt-0.5 pb-0.5">"{record.headline}"</p>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-extrabold uppercase shrink-0">
                            Eff: {record.effectiveness}/10
                          </span>
                        </div>

                        {/* Region & ground reality narrative */}
                        {record.impactedRegionsOrSectors && (
                          <div className="space-y-1 mb-2.5">
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="text-[8px] font-mono font-bold text-amber-500 uppercase">Impacted: {record.impactedRegionsOrSectors}</span>
                            </div>
                            <p className="text-[#a8a29e] text-[11px] leading-relaxed italic bg-black/15 p-1.5 rounded pl-2 border-l border-[#d97706]/40">
                              {record.regionalImpactNarrative}
                            </p>
                          </div>
                        )}

                        {/* Long-term outcome projection */}
                        {record.longTermOutlook && (
                          <div className="space-y-1 border-t border-[#2a2924] pt-2">
                            <div className="flex items-center gap-1 text-cyan-400">
                              <TrendingUp className="w-3 h-3 shrink-0" />
                              <span className="text-[8px] font-mono font-bold uppercase">Long-Term Legacy Outlook</span>
                            </div>
                            <p className="text-[#a8a29e] text-[11px] leading-relaxed">
                              {record.longTermOutlook}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between text-[9px] font-mono text-stone-500 border-t border-[#2a2924] pt-2 pt-1.5">
                        <span>Ordinance Cost: ₹{Math.abs(record.budgetImpact)} Cr</span>
                        <span className={record.approvalImpact >= 0 ? "text-green-500 font-bold" : "text-red-400 font-bold"}>
                          Approval: {record.approvalImpact >= 0 ? "+" : ""}{record.approvalImpact}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Restart block */}
            <div className="border-t border-[#383731] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
              <p className="text-[11px] leading-relaxed text-[#a8a29e] text-center md:text-left max-w-lg">
                Your policies are recorded in the democratic cabinet registers. Try different platform strategies to optimize your Lok Sabha seat multiplier holds!
              </p>
              <button 
                onClick={() => setGameState("INTRO")}
                className="px-8 py-3 bg-[#d97706] hover:bg-orange-500 text-[#121210] font-bold text-xs tracking-widest uppercase rounded-lg cursor-pointer transform hover:scale-105 transition-all shadow-lg flex items-center gap-2 select-none"
              >
                <RotateCcw className="w-4 h-4 shrink-0" /> RE-STAGE CAMPAIGN CORRIDOR
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
