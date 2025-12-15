export type DoseUnit = "mg" | "mcg";
export type DisplayMode = "ml" | "u100" | "both";
export type RoundingMode = "none" | "1" | "0.5";

export interface CalculatorInputs {
  vialAmount: string;
  diluentVolume: string;
  targetDose: string;
  doseUnit: DoseUnit;
  displayMode: DisplayMode;
  roundingEnabled: boolean;
  roundingPrecision: RoundingMode;
}

export interface CalculationResult {
  // Concentración
  concentrationMgPerMl: number;
  concentrationMcgPerMl: number;
  
  // Volumen a extraer
  volumeMl: number;
  volumeMlRounded: number;
  
  // Equivalencia U-100
  unitsU100: number;
  unitsU100Rounded: number;
  
  // Dosis real tras redondeo
  actualDoseMg: number;
  actualDoseMcg: number;
  
  // Validaciones
  isValid: boolean;
  exceedsVial: boolean;
  volumeTooSmall: boolean;
}

export interface InverseCalculationInputs {
  volumeOrUnits: string;
  inputType: "ml" | "units";
}

export interface InverseCalculationResult {
  doseMg: number;
  doseMcg: number;
  isValid: boolean;
}
