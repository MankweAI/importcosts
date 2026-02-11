import { create } from 'zustand';
import { PSEO_Mode, CalcStatus, CalculationInputs, CalculationResult, RouteContext } from '@/types/pseo';

interface PSEOCalculatorState {
    mode: PSEO_Mode;
    setMode: (mode: PSEO_Mode) => void;

    status: CalcStatus;
    setStatus: (status: CalcStatus) => void;

    inputs: CalculationInputs;
    updateInput: (key: keyof CalculationInputs, value: any) => void;
    setInputs: (inputs: Partial<CalculationInputs>) => void;

    result: CalculationResult | null;
    setResult: (result: CalculationResult | null) => void;

    routeContext: RouteContext | null;
    setRouteContext: (context: RouteContext) => void;

    reset: () => void;
}

const DEFAULT_INPUTS: CalculationInputs = {
    invoiceValue: 0,
    currency: 'USD',
    exchangeRate: 18.5, // TODO: Fetch live rate
    freightCost: 0,
    insuranceCost: 0,
    otherCharges: 0,
    quantity: 1,
    incoterm: 'FOB',
    importerType: 'VAT_REGISTERED',
    originCountry: '',
    hsCode: '',
    targetSellingPrice: 0,
    targetMarginPercent: 0,
};

export const usePSEOCalculatorStore = create<PSEOCalculatorState>((set) => ({
    mode: 'professional', // Default, can be overridden by URL param
    setMode: (mode) => set({ mode }),

    status: 'idle',
    setStatus: (status) => set({ status }),

    inputs: DEFAULT_INPUTS,
    updateInput: (key, value) =>
        set((state) => ({
            inputs: { ...state.inputs, [key]: value },
            status: 'editing', // Reset status to editing on input change
        })),
    setInputs: (newInputs) =>
        set((state) => ({
            inputs: { ...state.inputs, ...newInputs },
        })),

    result: null,
    setResult: (result) => set({ result, status: 'success' }),

    routeContext: null,
    setRouteContext: (routeContext) => set({ routeContext }),

    reset: () =>
        set({
            mode: 'professional',
            status: 'idle',
            inputs: DEFAULT_INPUTS,
            result: null,
        }),
}));
