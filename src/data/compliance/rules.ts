/**
 * Compliance Rules Registry
 * Auto-generated from ITAC R.91 and SARS Prohibited List
 * Last updated: 2026-02-09
 * 
 * Extracted rules: 6
 * Preserved hardcoded rules: 3
 * Total: 9
 */

import { RiskRule } from '@/types/pseo';

export const COMPLIANCE_RULES: RiskRule[] = [
  {
    "rule_id": "ITAC_USED_GOODS_GLOBAL",
    "authority_id": "ITAC",
    "rule_type": "permit_required",
    "title": "Import Permit Required for All Used or Second‑hand Goods",
    "summary": "All second-hand or used goods, including waste and scrap, require an ITAC import permit unless specifically exempted in Schedule 4.",
    "severity": "high",
    "match": {
      "hs_match": [
        "*"
      ],
      "condition_match": {
        "used_goods": true,
        "excluded_schedule_4_headings": [
          "49.02",
          "49.03",
          "49.04",
          "49.05",
          "49.06",
          "49.09",
          "49.10",
          "49.11",
          "92.01",
          "92.02",
          "92.03",
          "92.04",
          "92.06",
          "92.07"
        ]
      }
    },
    "required_action": {
      "steps": [
        "All second-hand or used goods, including waste and scrap, require an ITAC import permit unless specifically exempted in Schedule 4."
      ],
      "required_documents": [
        "ITAC Import Permit"
      ]
    },
    "official_refs": [
      {
        "source_type": "gazette",
        "url": "http://www.itac.org.za/",
        "document_title": "ITAC Import Control Regulations (R.91)",
        "published_date": null
      }
    ],
    "source_ref": "ITAC R.91, Government Gazette No. 35007 of 10 Feb 2012, para I(b) and Schedule 4"
  },
  {
    "rule_id": "ITAC_SCHEDULE1_USED_CLOTHING_63_09",
    "authority_id": "ITAC",
    "rule_type": "permit_required",
    "title": "Import Permit Required for Worn Clothing and Other Worn Articles",
    "summary": "Worn clothing and other worn articles classified under tariff heading 63.09 may only be imported with an ITAC import permit.",
    "severity": "high",
    "match": {
      "hs_match": [
        "6309"
      ],
      "condition_match": {
        "used_goods": true
      }
    },
    "required_action": {
      "steps": [
        "Worn clothing and other worn articles classified under tariff heading 63.09 may only be imported with an ITAC import permit."
      ],
      "required_documents": [
        "ITAC Import Permit"
      ]
    },
    "official_refs": [
      {
        "source_type": "gazette",
        "url": "http://www.itac.org.za/",
        "document_title": "ITAC Import Control Regulations (R.91)",
        "published_date": null
      }
    ],
    "source_ref": "ITAC R.91, Government Gazette No. 35007 of 10 Feb 2012, Schedule 1 (Worn clothing and other worn articles 63.09)"
  },
  {
    "rule_id": "ITAC_SCHEDULE1_ROAD_WHEELS_8708_70_2_8716_90_20",
    "authority_id": "ITAC",
    "rule_type": "permit_required",
    "title": "Import Permit Required for Road Wheels and Wheel Rims Fitted with Tyres",
    "summary": "Road wheels fitted with tyres and wheel rims fitted with tyres under tariff headings 8708.70.2 and 8716.90.20 require an ITAC import permit.",
    "severity": "high",
    "match": {
      "hs_match": [
        "8708702",
        "87169020"
      ]
    },
    "required_action": {
      "steps": [
        "Road wheels fitted with tyres and wheel rims fitted with tyres under tariff headings 8708.70.2 and 8716.90.20 require an ITAC import permit."
      ],
      "required_documents": [
        "ITAC Import Permit"
      ]
    },
    "official_refs": [
      {
        "source_type": "gazette",
        "url": "http://www.itac.org.za/",
        "document_title": "ITAC Import Control Regulations (R.91)",
        "published_date": null
      }
    ],
    "source_ref": "ITAC R.91 as amended by Notice R.1290, Government Gazette No. 39567 of 31 Dec 2015, Schedule 1 insertion"
  },
  {
    "rule_id": "SARS_NRCS_INSPECTION_8471_COMPUTERS_20230607",
    "authority_id": "NRCS",
    "rule_type": "inspection_risk",
    "title": "NRCS Border Detention Risk for Computers and Data Processing Machines",
    "summary": "Goods classified under the listed computer and automatic data processing machine tariff headings are to be detained for NRCS at the border.",
    "severity": "medium",
    "match": {
      "hs_match": [
        "8471",
        "84713",
        "847141",
        "847149",
        "847150",
        "847160",
        "847170",
        "847180",
        "847190"
      ],
      "condition_match": {
        "detained_for_NRCS": true
      }
    },
    "required_action": {
      "steps": [
        "Goods classified under the listed computer and automatic data processing machine tariff headings are to be detained for NRCS at the border."
      ],
      "required_documents": []
    },
    "official_refs": [
      {
        "source_type": "regulatory",
        "url": "https://www.nrcs.org.za/",
        "document_title": "NRCS Letter of Authority Requirements",
        "published_date": null
      }
    ],
    "source_ref": "SARS Prohibited and Restricted Imports and Exports list, update of 7 June 2023 (\"The below tariff headings are to be detained for NRCS ... 84.71, 8471.3, 8471.41, 8471.49, 8471.50, 8471.60, 8471.70, 8471.80, 8471.90\")"
  },
  {
    "rule_id": "SARS_NRCS_INSPECTION_8517_TELECOM_20230607",
    "authority_id": "NRCS",
    "rule_type": "inspection_risk",
    "title": "NRCS Border Detention Risk for Telephone and Network Apparatus",
    "summary": "Telephone and other communication apparatus under the listed tariff headings are to be detained for NRCS at the border.",
    "severity": "medium",
    "match": {
      "hs_match": [
        "851762",
        "85176210",
        "85176290",
        "851769"
      ],
      "condition_match": {
        "detained_for_NRCS": true
      }
    },
    "required_action": {
      "steps": [
        "Telephone and other communication apparatus under the listed tariff headings are to be detained for NRCS at the border."
      ],
      "required_documents": []
    },
    "official_refs": [
      {
        "source_type": "regulatory",
        "url": "https://www.nrcs.org.za/",
        "document_title": "NRCS Letter of Authority Requirements",
        "published_date": null
      }
    ],
    "source_ref": "SARS Prohibited and Restricted Imports and Exports list, update of 7 June 2023 (\"The below tariff headings are to be detained for NRCS ... 8517.62, 8517.62.10, 8517.62.90, 8517.69\")"
  },
  {
    "rule_id": "SARS_NRCS_LOA_8701_91_TO_8701_95_20221017",
    "authority_id": "NRCS",
    "rule_type": "loa_required",
    "title": "NRCS Letter of Authority Required for Certain Tractors",
    "summary": "Tractors classified under tariff headings 8701.91 to 8701.95 require a Letter of Authority from NRCS.",
    "severity": "high",
    "match": {
      "hs_match": [
        "870191-870195"
      ]
    },
    "required_action": {
      "steps": [
        "Tractors classified under tariff headings 8701.91 to 8701.95 require a Letter of Authority from NRCS."
      ],
      "required_documents": [
        "NRCS Letter of Authority"
      ]
    },
    "official_refs": [
      {
        "source_type": "regulatory",
        "url": "https://www.nrcs.org.za/",
        "document_title": "NRCS Letter of Authority Requirements",
        "published_date": null
      }
    ],
    "source_ref": "SARS Prohibited and Restricted Imports and Exports list, update of 17 October 2022 (\"Tariff Heading 8701.91 – 8701.95 Letter of Authority required from NRCS\")"
  },
  {
    "rule_id": "NRCS_LOA_ELECTRONICS",
    "authority_id": "NRCS",
    "rule_type": "loa_required",
    "title": "Letter of Authority (LOA) Likely Required",
    "summary": "Electronic and electrical equipment often requires an LOA from the NRCS to ensure safety standards.",
    "severity": "medium",
    "match": {
      "hs_match": [
        "85"
      ]
    },
    "required_action": {
      "steps": [
        "Check if product falls under Compulsory Specifications (VCs).",
        "Apply for LOA from NRCS if applicable.",
        "Pay non-refundable levy to NRCS."
      ],
      "required_documents": [
        "Test Reports (IEC standards)",
        "LOA Application Form",
        "Proof of Payment"
      ]
    },
    "official_refs": [
      {
        "source_type": "regulatory",
        "url": "https://www.nrcs.org.za/",
        "document_title": "NRCS LOA Procedure",
        "published_date": "2019-05-06"
      }
    ]
  },
  {
    "rule_id": "SAHPRA_MEDICAMENTS",
    "authority_id": "SAHPRA",
    "rule_type": "permit_required",
    "title": "SAHPRA License/Registration Required",
    "summary": "Medical products must be registered with the South African Health Products Regulatory Authority (SAHPRA).",
    "severity": "high",
    "match": {
      "hs_match": [
        "30"
      ]
    },
    "required_action": {
      "steps": [
        "Ensure product is registered with SAHPRA.",
        "Importer must hold a valid Section 22C license."
      ],
      "required_documents": [
        "SAHPRA License",
        "Registration Certificate"
      ]
    },
    "official_refs": [
      {
        "source_type": "other_official",
        "url": "https://www.sahpra.org.za/",
        "document_title": "SAHPRA Regulatory Requirements",
        "published_date": null
      }
    ]
  },
  {
    "rule_id": "TEXTILE_LABELING",
    "authority_id": "SARS",
    "rule_type": "inspection_risk",
    "title": "Strict Labeling & Composition Requirements",
    "summary": "Textiles are high-risk for customs stops. Labels must explicitly state composition and country of origin.",
    "severity": "medium",
    "match": {
      "hs_match": [
        "61",
        "62",
        "63"
      ]
    },
    "required_action": {
      "steps": [
        "Ensure strictly accurate composition labels (e.g. '100% Cotton').",
        "Permanently affixed labels required."
      ],
      "required_documents": [
        "Packing List (detailed)",
        "Commercial Invoice"
      ]
    },
    "official_refs": [
      {
        "source_type": "customs_list",
        "url": "https://www.sars.gov.za/customs-and-excise/travellers/prohibited-and-restricted-goods/",
        "document_title": "SARS Prohibited and Restricted Goods",
        "published_date": null
      }
    ]
  }
];
