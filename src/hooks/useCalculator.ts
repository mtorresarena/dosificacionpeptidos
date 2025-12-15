"use client";

import { useMemo } from "react";
import {
  CalculatorInputs,
  CalculationResult,
  InverseCalculationInputs,
  InverseCalculationResult,
  RoundingMode,
} from "@/types/calculator";

/**
 * Formatea un número eliminando ceros finales innecesarios
 * y evitando notación científica
 */
export function formatNumber(
  value: number,
  maxDecimals: number = 3
): string {
  if (!isFinite(value) || isNaN(value)) return "—";
  
  // Redondear al número de decimales especificado
  const rounded = Number(value.toFixed(maxDecimals));
  
  // Convertir a string sin notación científica
  const str = rounded.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
    useGrouping: false,
  });
  
  return str;
}

/**
 * Redondea unidades U-100 según la precisión especificada
 */
function roundUnits(units: number, precision: RoundingMode): number {
  if (precision === "none") return units;
  
  const step = precision === "1" ? 1 : 0.5;
  return Math.round(units / step) * step;
}

/**
 * Hook principal para cálculos de reconstitución
 */
export function useCalculator(inputs: CalculatorInputs): CalculationResult {
  return useMemo(() => {
    const vialMg = parseFloat(inputs.vialAmount) || 0;
    const diluentMl = parseFloat(inputs.diluentVolume) || 0;
    const targetDoseValue = parseFloat(inputs.targetDose) || 0;
    
    // Resultado vacío/inválido
    const emptyResult: CalculationResult = {
      concentrationMgPerMl: 0,
      concentrationMcgPerMl: 0,
      volumeMl: 0,
      volumeMlRounded: 0,
      unitsU100: 0,
      unitsU100Rounded: 0,
      actualDoseMg: 0,
      actualDoseMcg: 0,
      isValid: false,
      exceedsVial: false,
      volumeTooSmall: false,
    };
    
    // Validar entradas básicas
    if (vialMg <= 0 || diluentMl <= 0 || targetDoseValue <= 0) {
      return emptyResult;
    }
    
    // ============================================
    // FÓRMULAS EXPLÍCITAS
    // ============================================
    
    // 1. Concentración final: mg/mL = vialMg / diluyenteMl
    const mgPerMl = vialMg / diluentMl;
    
    // 2. Convertir dosis a mg si está en mcg
    // Si el usuario entra mcg: dosisMg = mcg / 1000
    const dosisMg = inputs.doseUnit === "mcg" 
      ? targetDoseValue / 1000 
      : targetDoseValue;
    
    // 3. Volumen necesario: mL = dosisMg / mgPerMl
    const mlNecesarios = dosisMg / mgPerMl;
    
    // 4. Equivalencia U-100: unidades = mL × 100
    const unidadesU100 = mlNecesarios * 100;
    
    // ============================================
    // REDONDEO
    // ============================================
    
    let unitsRounded = unidadesU100;
    let mlRounded = mlNecesarios;
    
    if (inputs.roundingEnabled && inputs.roundingPrecision !== "none") {
      // Redondear unidades según precisión
      unitsRounded = roundUnits(unidadesU100, inputs.roundingPrecision);
      // Recalcular mL desde unidades redondeadas
      mlRounded = unitsRounded / 100;
    }
    
    // ============================================
    // DOSIS REAL TRAS REDONDEO
    // ============================================
    
    // dosisRealMg = mlRounded × mgPerMl
    const actualDoseMg = mlRounded * mgPerMl;
    const actualDoseMcg = actualDoseMg * 1000;
    
    // ============================================
    // VALIDACIONES
    // ============================================
    
    // La dosis supera el total del vial
    const exceedsVial = dosisMg > vialMg;
    
    // Volumen muy pequeño (< 0.02 mL)
    const volumeTooSmall = mlNecesarios < 0.02 && mlNecesarios > 0;
    
    return {
      concentrationMgPerMl: mgPerMl,
      concentrationMcgPerMl: mgPerMl * 1000,
      volumeMl: mlNecesarios,
      volumeMlRounded: mlRounded,
      unitsU100: unidadesU100,
      unitsU100Rounded: unitsRounded,
      actualDoseMg,
      actualDoseMcg,
      isValid: true,
      exceedsVial,
      volumeTooSmall,
    };
  }, [inputs]);
}

/**
 * Hook para cálculo inverso (de volumen a dosis)
 */
export function useInverseCalculator(
  inputs: InverseCalculationInputs,
  concentrationMgPerMl: number
): InverseCalculationResult {
  return useMemo(() => {
    const value = parseFloat(inputs.volumeOrUnits) || 0;
    
    if (value <= 0 || concentrationMgPerMl <= 0) {
      return {
        doseMg: 0,
        doseMcg: 0,
        isValid: false,
      };
    }
    
    // Si es unidades U-100, convertir a mL primero
    // 1 mL = 100 unidades → mL = unidades / 100
    const volumeMl = inputs.inputType === "units" ? value / 100 : value;
    
    // Calcular dosis: mg = mL × concentración
    const doseMg = volumeMl * concentrationMgPerMl;
    const doseMcg = doseMg * 1000;
    
    return {
      doseMg,
      doseMcg,
      isValid: true,
    };
  }, [inputs, concentrationMgPerMl]);
}
