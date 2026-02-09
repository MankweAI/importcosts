
export interface AuthoritySource {
    id: string;
    name: string;
    url: string;
    type: "sars_html" | "sars_pdf" | "itac_html" | "itac_pdf" | "nrcs_pdf" | "govza_html" | "other_official";
}

export const SOURCES: Record<string, AuthoritySource> = {
    "SARS_PROHIBITED_RESTRICTED_MAIN": {
        id: "SARS_PROHIBITED_RESTRICTED_MAIN",
        name: "SARS Prohibited and Restricted Imports",
        url: "https://www.sars.gov.za/customs-and-excise/prohibited-restricted-and-counterfeit-goods/",
        type: "sars_html"
    },
    "ITAC_IMPORT_CONTROL": {
        id: "ITAC_IMPORT_CONTROL",
        name: "ITAC Import Control",
        url: "https://itac.org.za/import-control/",
        type: "itac_html"
    },
    "NRCS_LOA_PROCEDURE": {
        id: "NRCS_LOA_PROCEDURE",
        name: "NRCS LOA Administrative Procedure",
        url: "https://www.nrcs.org.za/Documents/Electrotech/LOA%20Admin%20Procedure/LOA%20ADMIN%20Revised%2012_06%20May%202019.pdf",
        type: "nrcs_pdf"
    }
};
