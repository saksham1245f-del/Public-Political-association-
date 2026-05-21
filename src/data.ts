export interface IndiaProblem {
  id: string;
  title: string;
  category: "Infrastructure" | "Agriculture" | "Environment" | "Economy" | "Social Safety" | "Governance" | "Water Crisis" | "Health";
  riskLevel: "I" | "II" | "III" | "IV" | "V";
  riskLabel: "Low" | "Moderate" | "Significant" | "Major" | "Critical";
  location: string;
  description: string;
  idealSolutions?: string[];
}

export interface EventChoice {
  text: string;
  effectDescription: string;
  approvalEffect: number;
  budgetEffect: number; // in Cr
  trustEffect: number;
  mediaEffect: number;
  outcomeText: string;
}

export interface EventCard {
  id: string;
  title: string;
  description: string;
  type: "Scandal" | "Crisis" | "Opportune" | "Demands" | "International" | "Disaster";
  choices: EventChoice[];
}

export interface OppositionAction {
  title: string;
  leader: string;
  quote: string;
  strategyType: "negative_media_blitz" | "expose_scandal" | "coalition_poaching" | "populist_counterproposal";
  strategyName: string;
  description: string;
  approvalImpactPct: number;
  mediaPressureImpactPct: number;
  coalitionTrustImpactPct: number;
}

export const INDIA_PROBLEMS: IndiaProblem[] = [
  {
    id: "BengaluruFloods",
    title: "Urban Flooding in the IT Corridor",
    category: "Infrastructure",
    riskLevel: "V",
    riskLabel: "Critical",
    location: "Bengaluru, Karnataka",
    description: "Monsoon rains have paralyzed India's tech sector in Bengaluru. Unplanned urbanization and choked storm drains have led to ₹400Cr in lost productivity on Outer Ring Road. Public anger is peaking as residential apartments stay submerged in sewage and corporate leaders warn of moving capital elsewhere.",
    idealSolutions: [
      "Mobilize the State Disaster Response Force (SDRF) with high-capacity municipal industrial pumps to clear flooded basements of outer ring road tech corridors immediately.",
      "Authorize ₹1500 Cr from central municipal relief reserves to construct permanent, deep-graded storm-water channels and demolish illegal lakebed encroachments.",
      "Enforce a mandatory structural audit of all sub-contracted drain networks and suspend operating builders violating local environmental regulations."
    ]
  },
  {
    id: "PunjabFarmers",
    title: "Rabi Wheat Hail Damage & MSP Agitation",
    category: "Agriculture",
    riskLevel: "IV",
    riskLabel: "Major",
    location: "Punjab & Haryana Borders",
    description: "Unseasonal hailstorms have decimated over 40% of the standing Rabi wheat crop. Anger is mounting as local farm unions demand immediate debt waivers and a statutory guarantee on Minimum Support Price (MSP). Rallies are blocking primary railways, threatening food supply chains to Delhi.",
    idealSolutions: [
      "Sanction urgent direct distress cash transfers of ₹8,000 per acre to affected farmers using the State Disaster Incident Mitigation Fund.",
      "Constitute a multi-ministry commission to draft a clear statutory framework for guaranteeing Minimum Support Price (MSP) on essential food crops.",
      "Authorize national and cooperative bank networks to freeze immediate interest collections and restructure current agricultural credit loans."
    ]
  },
  {
    id: "DelhiSmog",
    title: "AQI Crisis and Severe Northern Smog",
    category: "Environment",
    riskLevel: "V",
    riskLabel: "Critical",
    location: "Delhi NCR",
    description: "The Air Quality Index (AQI) has breached 490 (Severe Plus) across North India. Haze and crop stubble smoke are choking children, hospitals report a 40% rise in acute pediatric respiratory emergencies, and international airlines are diverting flights. Business associations demand a permanent ban on thermal power and diesel generators.",
    idealSolutions: [
      "Subsidize 'Happy Seeder' and bio-decomposer zero-till farming machineries by up to 80% to incentivize eco-friendly stubble clearance before winter sowing.",
      "Deploy regional satellite-anchored enforcement cells to monitor crop burning and issue strict fines on major industrial emissions.",
      "Direct ₹1200 Cr to expand high-density electric bus fleets and enforce immediate rotating restrictions on diesel heavy vehicles inside national highways."
    ]
  },
  {
    id: "GraduateJobs",
    title: "Graduate Unemployment & Railway Exam Protests",
    category: "Economy",
    riskLevel: "IV",
    riskLabel: "Major",
    location: "Patna, Bihar & Prayagraj, UP",
    description: "Over 1.5 crore graduates applied for just 12,000 Group-D railway openings, highlighting a severe quality employment deficit. Mass demonstrations have erupted at major intersections, with students demanding direct state-guaranteed skill grants, industrial wage subsidies, and fast-track fill-ups of vacant public posts.",
    idealSolutions: [
      "Launch a comprehensive 'Yuva Kaushal' national skill grant program offering monthly stipends of ₹10,000 for technical apprenticeships across corporate sectors.",
      "Authorize special central tax rebates for manufacturing companies that expand their formal payroll rosters by at least 15% with fresh graduates.",
      "Fast-track central recruitment commissions (UPSC, SSC, RRB) to fill over 2 lakh long-delayed vacant technical and administrative staff positions and streamline test servers."
    ]
  },
  {
    id: "WomenSafety",
    title: "Women's Safety & Transit Security Shortfall",
    category: "Social Safety",
    riskLevel: "IV",
    riskLabel: "Major",
    location: "Kolkata, West Bengal",
    description: "Massive strikes and candlelit vigils paralyze the city following incidents of harassment in unlit tech parks during late-night shifts. Angry citizen collectives demand immediate statewide implementation of GPS-integrated public transit, round-the-clock women-only helpdesks, and fast-track courts with severe penalties.",
    idealSolutions: [
      "Earmark ₹500 Cr to establish a central surveillance command center with high-intensity LED illumination across suburban tech transit routes.",
      "Formulate rapid pink police emergency patrol teams and deploy localized security conductors with active GPS links inside urban overnight buses.",
      "Fast-track legislative ordinances to set up specialized judicial tribunals that hear crime and harassment reports under strict 30-day resolution schedules."
    ]
  },
  {
    id: "TenderScandal",
    title: "Highway Tender Kickback Allegations",
    category: "Governance",
    riskLevel: "V",
    riskLabel: "Critical",
    location: "Mumbai-Pune Expressway Sector",
    description: "A whistleblower contractor has leaked audio tapes alleging regional authorities demand a 40% bribe rate for sub-standard construction clearance. Our lead state coalition partner is threatening to pull support and force a confidence vote if we do not initiate an immediate independent CBI inquiry and blacklist the firm.",
    idealSolutions: [
      "Appoint an independent judicial audit commission headed by a retired Supreme Court Justice to review technical sub-tenders and financial contracts.",
      "Deploy a mandatory blockchain-anchored e-procurement ledger system to trace subcontractor billing and seal structural audit checkpoints.",
      "Enforce absolute blacklisting of developers accused of bribe-taking and suspend the active clearance certificates of involved structural engineers."
    ]
  },
  {
    id: "ChennaiWater",
    title: "Zero Groundwater Day & Tanker Monopoly",
    category: "Water Crisis",
    riskLevel: "IV",
    riskLabel: "Major",
    location: "Chennai, Tamil Nadu",
    description: "Groundwater reserves have run completely dry in Chennai's suburban zones. A powerful private water tanker cartel has hiked prices by 300%, provoking violent street brawls over water taps. Big automotive factories are alerting workers to prepare for temporary layoffs as process water dries up.",
    idealSolutions: [
      "Enjoin state security forces and revenue officers to break private water-tanker cartels, seize illegal extraction units, and enforce state-capped distribution prices.",
      "Earmark ₹2000 Cr to restore dry municipal micro-aquifers, deepen traditional storm-water lakes, and build decentralised waste-water recycling facilities.",
      "Authorize subsidized direct-water voucher cards for residents living in lower-income tenement zones to guarantee essential base hydration needs."
    ]
  },
  {
    id: "RuralHealth",
    title: "Primary Health Center Collapse & Epidemic Risk",
    category: "Health",
    riskLevel: "III",
    riskLabel: "Significant",
    location: "Bastar, Chhattisgarh",
    description: "An outbreak of contaminated water has triggered severe gastrointestinal epidemics in 35 tribal villages. Remote primary health centers are empty, lacking doctors, hydration salts, or clean syringes. Relatives are forced to carry sick patients for hours through muddy forestry trails to reach urban centers.",
    idealSolutions: [
      "Deploy a fleet of mobile diagnostic trailer clinics and emergency medical teams loaded with antibiotics, ORS, and vaccine reservoirs into Bastar immediately.",
      "Authorize ₹400 Cr in incentive bonuses to recruit specialist doctors to work in remote tribal zones, paired with structural upgrades of rural health centers.",
      "Install centralized UV water purifying filters in all village primary schools, health outposts, and local panchayat buildings to eliminate water pathogens."
    ]
  }
];

export const EVENT_CARDS: EventCard[] = [
  {
    id: "ev_coalition_crisis",
    title: "Alliance Seat Partition Demands",
    description: "Our regional coalition ally in West Bengal is demanding an immediate special central grant of ₹2,500 Cr for cyclone rehabilitation, threatening to officially withdraw their 12 Lok Sabha MPs if we don't comply before the phase-wise campaign begins.",
    type: "Demands",
    choices: [
      {
        text: "Accede to all demands and issue the rehabilitation package immediately.",
        effectDescription: "Finances: -₹2500 Cr | Coalition Trust: +25 | Approval: +1.5% | Media: -10",
        approvalEffect: 1.5,
        budgetEffect: -2500,
        trustEffect: 25,
        mediaEffect: -10,
        outcomeText: "You stabilized the alliance core, but critics write frontpage columns warning of active submission to regional blackmail."
      },
      {
        text: "Offer a compromised ₹1,000 Cr package and host a public high-table alliance dinner.",
        effectDescription: "Finances: -₹1000 Cr | Coalition Trust: +5 | Approval: +0.5% | Media: -2",
        approvalEffect: 0.5,
        budgetEffect: -1000,
        trustEffect: 5,
        mediaEffect: -2,
        outcomeText: "The ally accepts the compromise reluctantly, but murmurs of dissatisfaction continue in behind-the-scenes meetings."
      },
      {
        text: "Reject the demands. State that Central resources must be distributed equitably.",
        effectDescription: "Finances: ₹0 | Coalition Trust: -20 | Approval: -2.0% | Media: +15",
        approvalEffect: -2.0,
        budgetEffect: 0,
        trustEffect: -20,
        mediaEffect: 15,
        outcomeText: "The coalition partner storms out of the campaign coordination meeting, triggering a media frenzy about the government's stability."
      }
    ]
  },
  {
    id: "ev_paper_leak",
    title: "State Recruitment Board Paper Leak",
    description: "Leaked question papers for the State Civil Services Exam are showing up on messaging apps 6 hours before testing. 5 lakh protesting candidates have blocked central administrative squares, alleging systemic local board corruption.",
    type: "Crisis",
    choices: [
      {
        text: "Immediately cancel the examination and announce fresh testing under tight military custody.",
        effectDescription: "Finances: -₹200 Cr | Coalition Trust: 0 | Approval: +2.0% | Media: -15",
        approvalEffect: 2.0,
        budgetEffect: -200,
        trustEffect: 0,
        mediaEffect: -15,
        outcomeText: "Voters show strong support for your swift, honest response, but printing and logistics companies take a heavy financial blow."
      },
      {
        text: "Establish a High-Level Judicial Enquiry Commission to review the leak within 60 days.",
        effectDescription: "Finances: -₹10 Cr | Coalition Trust: +5 | Approval: -1.5% | Media: +10",
        approvalEffect: -1.5,
        budgetEffect: -10,
        trustEffect: 5,
        mediaEffect: 10,
        outcomeText: "Citizens are tired of slow-rolling committees. Protesters light effigies of recruiters as opposition media slams your inaction."
      },
      {
        text: "Launch criminal cyber investigations but proceed with the scheduled exam sorting.",
        effectDescription: "Finances: -₹5 Cr | Coalition Trust: -10 | Approval: -4.0% | Media: +25",
        approvalEffect: -4.0,
        budgetEffect: -5,
        trustEffect: -10,
        mediaEffect: 25,
        outcomeText: "Massive strikes take root in regional centers. Students refuse to enter examination halls, demanding your immediate resignation."
      }
    ]
  },
  {
    id: "ev_tech_fdi",
    title: "Global AI Semiconductor FDI",
    description: "A leading Silicon Valley consortium proposes constructing a massive ₹4,000 Cr AI chip packaging foundry in Gujarat. They request speedy single-window land zoning and clean state utility grid priorities.",
    type: "Opportune",
    choices: [
      {
        text: "Approve the single-window fast-track clearance and provide subsidized industrial electricity.",
        effectDescription: "Finances: -₹400 Cr | Coalition Trust: +5 | Approval: +3.5% | Media: -12",
        approvalEffect: 3.5,
        budgetEffect: -400,
        trustEffect: 5,
        mediaEffect: -12,
        outcomeText: "A historic high-tech breakthrough! Media describes your economic vision as highly modern, boosting graduate hiring sentiments."
      },
      {
        text: "Insist they set up in a less-industrialized eastern state to maintain equitable cross-state parity.",
        effectDescription: "Finances: ₹0 | Coalition Trust: +12 | Approval: -1.0% | Media: 0",
        approvalEffect: -1.0,
        budgetEffect: 0,
        trustEffect: 12,
        mediaEffect: 0,
        outcomeText: "The consortium delays local investments to rethink logistics. Helpful for regional optics, but dampens direct growth."
      },
      {
        text: "Charge full commercial utility rates without fast-track exceptions to protect local state-owned discoms.",
        effectDescription: "Finances: +₹100 Cr | Coalition Trust: -5 | Approval: -1.5% | Media: +8",
        approvalEffect: -1.5,
        budgetEffect: 100,
        trustEffect: -5,
        mediaEffect: 8,
        outcomeText: "Negotiations stall. The consortium begins backup discussions with Vietnam, causing business leaders to slam your red-tape."
      }
    ]
  },
  {
    id: "ev_tapi_pipeline",
    title: "Border Energy Transit Disruption",
    description: "Geopolitical skirmishes near transit terminals have disrupted pipeline flows, raising local refinery crude input costs by 15% overnight. Fuel retail rates are under heavy upward pressure.",
    type: "International",
    choices: [
      {
        text: "Subsidize retail fuel using centralized reserves to shield Indian commuters from price shocks.",
        effectDescription: "Finances: -₹1800 Cr | Coalition Trust: +2 | Approval: +2.0% | Media: -10",
        approvalEffect: 2.0,
        budgetEffect: -1800,
        trustEffect: 2,
        mediaEffect: -10,
        outcomeText: "Voters are pleased, but economic advisors worry about fiscal deficit indicators breaching emergency targets."
      },
      {
        text: "Deregulate prices fully and let retail fuel rise matching international market trends.",
        effectDescription: "Finances: ₹0 | Coalition Trust: -12 | Approval: -5.0% | Media: +30",
        approvalEffect: -5.0,
        budgetEffect: 0,
        trustEffect: -12,
        mediaEffect: 30,
        outcomeText: "Inflation spikes instantly. Trucker associations threaten national logistics strikes, and local transport costs climb 12%."
      },
      {
        text: "Sign an emergency trade deal to import heavily discounted fuel reserves from a contested regime.",
        effectDescription: "Finances: -₹800 Cr | Coalition Trust: +5 | Approval: +1.0% | Media: +15",
        approvalEffect: 1.0,
        budgetEffect: -800,
        trustEffect: 5,
        mediaEffect: 15,
        outcomeText: "Saves massive costs, but provokes international warnings and mixed editorial feedback regarding geopolitical ethics."
      }
    ]
  },
  {
    id: "ev_pharma_scandal",
    title: "Generic Pediatric Cough Syrup Warning",
    description: "An export batch of pediatric cough syrup manufactured by a domestic pharma firm failed quality checks in Central Asia, leading to severe illness alerts. Media channels are raising concerns over our safety testing agencies.",
    type: "Scandal",
    choices: [
      {
        text: "Immediately suspend active licenses of the firm and issue mandatory GMP audits for all exporters.",
        effectDescription: "Finances: -₹150 Cr | Coalition Trust: 0 | Approval: +2.5% | Media: -15",
        approvalEffect: 2.5,
        budgetEffect: -150,
        trustEffect: 0,
        mediaEffect: -15,
        outcomeText: "Restores safety trust immediately. Proactive steps prevent a global boycott of Indian generics."
      },
      {
        text: "Initiate a low-profile review committee to check testing protocols without industry shutdowns.",
        effectDescription: "Finances: -₹10 Cr | Coalition Trust: +8 | Approval: -2.0% | Media: +12",
        approvalEffect: -2.0,
        budgetEffect: -10,
        trustEffect: 8,
        mediaEffect: 12,
        outcomeText: "Pharma lobby groups express relief, but health watchdogs accuse the administration of diluting critical regulatory norms."
      },
      {
        text: "Defend domestic manufacturers publicly, blaming foreign geopolitical sabotage or business rivalry.",
        effectDescription: "Finances: ₹0 | Coalition Trust: -10 | Approval: -3.5% | Media: +20",
        approvalEffect: -3.5,
        budgetEffect: 0,
        trustEffect: -10,
        mediaEffect: 20,
        outcomeText: "Stirs nationalist fervor temporarily, but the international health board issues a blistering warning against safety oversights."
      }
    ]
  },
  {
    id: "ev_sublay_strike",
    title: "Metro Tunnel Work Subway Strike",
    description: "Metro construction laborers on the high-density Mumbai Suburban lines have struck work indefinitely. They demand housing stipends and strict safety hazard gear after two key tunnel segments collapsed.",
    type: "Disaster",
    choices: [
      {
        text: "Allocate ₹400 Cr from infrastructure welfare schemes to construct worker transit camps and safety hubs.",
        effectDescription: "Finances: -₹400 Cr | Coalition Trust: +4 | Approval: +2.2% | Media: -12",
        approvalEffect: 2.2,
        budgetEffect: -400,
        trustEffect: 4,
        mediaEffect: -12,
        outcomeText: "Laborers call off protests and resume drilling. Project timeline returns to schedule with favorable coverage."
      },
      {
        text: "Deploy state ESMA (Essential Services Maintenance Act) laws to legally compel return to workspace.",
        effectDescription: "Finances: ₹0 | Coalition Trust: -12 | Approval: -2.5% | Media: +15",
        approvalEffect: -2.5,
        budgetEffect: 0,
        trustEffect: -12,
        mediaEffect: 15,
        outcomeText: "Forces compliance but triggers volatile clashes between state police and regional union leaders in the industrial belt."
      },
      {
        text: "Order developers to absorb all hazard costs, allowing them extra completion leeway in return.",
        effectDescription: "Finances: ₹0 | Coalition Trust: +5 | Approval: -1.0% | Media: +5",
        approvalEffect: -1.0,
        budgetEffect: 0,
        trustEffect: 5,
        mediaEffect: 5,
        outcomeText: "Avoids direct government spending, but delayed transit opening frustrates suburban rail commuters."
      }
    ]
  }
];

export interface RegionState {
  name: string;
  seats: number;
  approval: number; // baseline approval in this state
  weight: number; 
}

export const INITIAL_REGIONS: RegionState[] = [
  { name: "Uttar Pradesh", seats: 80, approval: 45.5, weight: 1.3 },
  { name: "Maharashtra", seats: 48, approval: 48.0, weight: 1.0 },
  { name: "West Bengal", seats: 42, approval: 39.0, weight: 0.9 },
  { name: "Karnataka", seats: 28, approval: 51.2, weight: 0.8 },
  { name: "Bihar", seats: 40, approval: 42.0, weight: 1.1 }
];
