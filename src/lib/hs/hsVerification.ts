export type HsQuestionType = "yes_no" | "single_select";

export type HsQuestion = {
    id: string;
    prompt: string;
    type: HsQuestionType;
    options: string[];
};

export type HsRule = {
    hs6: string;
    title: string;
    keywords: string[];
    expectedAnswers: Record<string, string[]>;
};

export type HsCandidate = {
    hs6: string;
    title?: string;
    confidence?: number;
};

export type RankedCandidate = HsCandidate & {
    adjustedConfidence: number;
    reasons: string[];
};

const QUESTION_BANK: Record<string, HsQuestion> = {
    has_cellular: {
        id: "has_cellular",
        prompt: "Does it have cellular/SIM connectivity?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_router: {
        id: "is_router",
        prompt: "Is it a networking device (router/switch/modem)?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_camera: {
        id: "is_camera",
        prompt: "Is it primarily a camera or video capture device?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_display: {
        id: "is_display",
        prompt: "Is it a TV/monitor/display device?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_computer: {
        id: "is_computer",
        prompt: "Is it a laptop or personal computer?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_printer: {
        id: "is_printer",
        prompt: "Is it a printer or multifunction printer?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_power_converter: {
        id: "is_power_converter",
        prompt: "Is it a power converter/inverter/charger?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_battery: {
        id: "is_battery",
        prompt: "Is it a battery or battery cell?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_solar_panel: {
        id: "is_solar_panel",
        prompt: "Is it a solar panel / photovoltaic module?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_footwear: {
        id: "is_footwear",
        prompt: "Is it footwear (shoes, sneakers, trainers)?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_apparel: {
        id: "is_apparel",
        prompt: "Is it apparel/clothing (not footwear)?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_medical_gloves: {
        id: "is_medical_gloves",
        prompt: "Are these medical/surgical gloves?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_cosmetic: {
        id: "is_cosmetic",
        prompt: "Is it a cosmetic or skin-care product?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_vitamin: {
        id: "is_vitamin",
        prompt: "Is it a vitamin or dietary supplement?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_kitchenware: {
        id: "is_kitchenware",
        prompt: "Is it kitchenware or cookware?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_furniture: {
        id: "is_furniture",
        prompt: "Is it furniture (tables, chairs, cabinets)?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_vehicle_part: {
        id: "is_vehicle_part",
        prompt: "Is it a vehicle body or part?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_tyre: {
        id: "is_tyre",
        prompt: "Is it a tyre/tire?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
    is_engine_oil: {
        id: "is_engine_oil",
        prompt: "Is it engine oil/lubricant?",
        type: "yes_no",
        options: ["Yes", "No"],
    },
};

const HS_RULES: Record<string, HsRule> = {
    "851713": {
        hs6: "851713",
        title: "Smartphones",
        keywords: ["smartphone", "phone", "mobile", "cellphone", "handset"],
        expectedAnswers: {
            has_cellular: ["Yes"],
            is_router: ["No"],
            is_camera: ["No"],
            is_display: ["No"],
            is_computer: ["No"],
        },
    },
    "851762": {
        hs6: "851762",
        title: "Routers / network equipment",
        keywords: ["router", "switch", "modem", "wifi", "network"],
        expectedAnswers: {
            is_router: ["Yes"],
            has_cellular: ["No", "Yes"],
        },
    },
    "852580": {
        hs6: "852580",
        title: "Cameras",
        keywords: ["camera", "cctv", "security camera", "video camera"],
        expectedAnswers: {
            is_camera: ["Yes"],
        },
    },
    "852872": {
        hs6: "852872",
        title: "TVs / monitors",
        keywords: ["tv", "television", "monitor", "display", "screen"],
        expectedAnswers: {
            is_display: ["Yes"],
        },
    },
    "847130": {
        hs6: "847130",
        title: "Laptops",
        keywords: ["laptop", "notebook", "computer"],
        expectedAnswers: {
            is_computer: ["Yes"],
        },
    },
    "844332": {
        hs6: "844332",
        title: "Printers / multifunction",
        keywords: ["printer", "mfp", "multifunction", "copier", "scanner"],
        expectedAnswers: {
            is_printer: ["Yes"],
        },
    },
    "850440": {
        hs6: "850440",
        title: "Inverters / power converters",
        keywords: ["inverter", "converter", "power supply", "charger", "ups"],
        expectedAnswers: {
            is_power_converter: ["Yes"],
        },
    },
    "850760": {
        hs6: "850760",
        title: "Lithium-ion batteries",
        keywords: ["lithium", "li-ion", "battery", "cell"],
        expectedAnswers: {
            is_battery: ["Yes"],
        },
    },
    "854143": {
        hs6: "854143",
        title: "Solar panels",
        keywords: ["solar", "photovoltaic", "pv", "panel"],
        expectedAnswers: {
            is_solar_panel: ["Yes"],
        },
    },
    "401110": {
        hs6: "401110",
        title: "Tyres",
        keywords: ["tyre", "tire"],
        expectedAnswers: {
            is_tyre: ["Yes"],
        },
    },
    "640411": {
        hs6: "640411",
        title: "Sports footwear",
        keywords: ["sneaker", "shoe", "footwear", "trainer"],
        expectedAnswers: {
            is_footwear: ["Yes"],
        },
    },
    "610910": {
        hs6: "610910",
        title: "T-shirts",
        keywords: ["t-shirt", "tee", "shirt", "cotton"],
        expectedAnswers: {
            is_apparel: ["Yes"],
        },
    },
    "401511": {
        hs6: "401511",
        title: "Medical gloves",
        keywords: ["glove", "gloves", "nitrile", "latex", "medical"],
        expectedAnswers: {
            is_medical_gloves: ["Yes"],
        },
    },
    "330499": {
        hs6: "330499",
        title: "Cosmetics",
        keywords: ["cosmetic", "makeup", "skin", "cream", "lotion"],
        expectedAnswers: {
            is_cosmetic: ["Yes"],
        },
    },
    "210690": {
        hs6: "210690",
        title: "Supplements",
        keywords: ["vitamin", "supplement", "nutrition", "capsule"],
        expectedAnswers: {
            is_vitamin: ["Yes"],
        },
    },
    "732393": {
        hs6: "732393",
        title: "Kitchenware",
        keywords: ["kitchen", "cookware", "stainless", "utensil"],
        expectedAnswers: {
            is_kitchenware: ["Yes"],
        },
    },
    "940360": {
        hs6: "940360",
        title: "Wooden furniture",
        keywords: ["furniture", "wood", "chair", "table", "cabinet"],
        expectedAnswers: {
            is_furniture: ["Yes"],
        },
    },
    "870829": {
        hs6: "870829",
        title: "Vehicle parts",
        keywords: ["car", "vehicle", "auto", "bumper", "body panel"],
        expectedAnswers: {
            is_vehicle_part: ["Yes"],
        },
    },
    "271019": {
        hs6: "271019",
        title: "Engine oil",
        keywords: ["engine oil", "lubricant", "motor oil"],
        expectedAnswers: {
            is_engine_oil: ["Yes"],
        },
    },
};

function normalize(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function clamp(value: number, min = 0.1, max = 0.98) {
    return Math.min(max, Math.max(min, value));
}

function keywordScore(rule: HsRule, query?: string) {
    if (!query || rule.keywords.length === 0) return 0;
    const normalized = normalize(query);
    let hits = 0;
    rule.keywords.forEach((keyword) => {
        if (normalized.includes(normalize(keyword))) hits += 1;
    });
    return hits / rule.keywords.length;
}

function answerScore(rule: HsRule, answers: Record<string, string>) {
    const entries = Object.entries(rule.expectedAnswers);
    if (entries.length === 0) return 0;
    let score = 0;
    let count = 0;
    entries.forEach(([questionId, expected]) => {
        const answer = answers[questionId];
        if (!answer) return;
        count += 1;
        if (expected.includes(answer)) {
            score += 1;
        } else {
            score -= 1;
        }
    });
    if (count === 0) return 0;
    return score / count;
}

export function rankCandidates(
    candidates: HsCandidate[],
    query: string | undefined,
    answers: Record<string, string>
): RankedCandidate[] {
    return candidates.map((candidate) => {
        const baseConfidence = candidate.confidence ?? 0.55;
        const rule = HS_RULES[candidate.hs6];
        const reasons: string[] = [];

        let score = baseConfidence;

        if (rule) {
            const kScore = keywordScore(rule, query);
            if (kScore > 0) reasons.push("Matches product keywords");
            score += kScore * 0.2;

            const aScore = answerScore(rule, answers);
            if (aScore !== 0) reasons.push("Matches verification answers");
            score += aScore * 0.2;
        }

        return {
            ...candidate,
            title: candidate.title || rule?.title,
            adjustedConfidence: clamp(score),
            reasons,
        };
    }).sort((a, b) => b.adjustedConfidence - a.adjustedConfidence);
}

export function getDisambiguationQuestions(
    candidates: RankedCandidate[],
    answers: Record<string, string>,
    maxQuestions = 3
): HsQuestion[] {
    const questionScores: Record<string, number> = {};

    candidates.forEach((candidate) => {
        const rule = HS_RULES[candidate.hs6];
        if (!rule) return;
        Object.keys(rule.expectedAnswers).forEach((questionId) => {
            if (answers[questionId]) return;
            questionScores[questionId] = (questionScores[questionId] || 0) + 1;
        });
    });

    const questionIds = Object.keys(questionScores)
        .sort((a, b) => (questionScores[b] || 0) - (questionScores[a] || 0))
        .slice(0, maxQuestions);

    return questionIds.map((id) => QUESTION_BANK[id]).filter(Boolean);
}

export function getHsRule(hs6: string) {
    return HS_RULES[hs6];
}
