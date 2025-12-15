"use client";

import React, { useState, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
  Calculator,
  Syringe,
  PenTool,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  useCalculator,
  formatNumber,
} from "@/hooks/useCalculator";
import {
  CalculatorInputs,
} from "@/types/calculator";

const STORAGE_KEY = "vial-calculator-state";

// Conversión HGH: 1 mg = 3 IU (estándar farmacéutico)
const HGH_IU_PER_MG = 3;

// Pluma: cartucho estándar de 3 mL, 1 click = 1 IU
const PEN_CARTRIDGE_ML = 3;

const defaultInputs: CalculatorInputs = {
  vialAmount: "5",
  diluentVolume: "1",
  targetDose: "250",
  doseUnit: "mcg",
  displayMode: "both",
  roundingEnabled: false,
  roundingPrecision: "1",
};

// Opciones predefinidas
const SYRINGE_OPTIONS = ["0.3", "0.5", "1"];
const VIAL_OPTIONS_PEPTIDE = ["5", "10", "15"];
const VIAL_OPTIONS_HGH = ["10", "12", "16", "36"]; // IU comunes de HGH
const VIAL_OPTIONS_PEN = ["12", "16", "24", "36"]; // IU para plumas
const DILUENT_OPTIONS = ["1", "2", "3", "5"];
const DOSE_OPTIONS_MCG = ["50", "100", "250", "500"];
const DOSE_OPTIONS_MG = ["0.5", "1", "2.5", "5"];
const DOSE_OPTIONS_IU = ["2", "4", "6", "8"]; // IU comunes para HGH
const VIAL_OPTIONS_PEN_MG = ["4", "5", "8", "12"]; // mg comunes para plumas
const DOSE_OPTIONS_PEN_MG = ["0.5", "1", "1.5", "2"]; // mg comunes para dosis de pluma

type CalculatorMode = "syringe" | "pen";
type ProductType = "peptide" | "hgh";

// Componente de jeringa visual
function SyringeVisualization({ units, maxUnits = 30 }: { units: number; maxUnits?: number }) {
  const fillPercentage = Math.min((units / maxUnits) * 100, 100);

  return (
    <div className="relative w-full max-w-xs mx-auto mt-6">
      {/* Jeringa horizontal */}
      <div className="relative h-16 flex items-center">
        {/* Émbolo */}
        <div className="w-4 h-10 bg-slate-300 rounded-l-sm border-2 border-slate-400" />

        {/* Cuerpo de la jeringa */}
        <div className="flex-1 h-12 bg-white border-2 border-slate-300 rounded-r-lg relative overflow-hidden">
          {/* Líquido */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-300 to-cyan-400 transition-all duration-300"
            style={{ width: `${fillPercentage}%` }}
          />

          {/* Marcas de medición */}
          <div className="absolute inset-0 flex justify-between px-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex flex-col items-center justify-end h-full">
                <div className="w-px h-3 bg-slate-400" />
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {Math.round((i / 6) * maxUnits)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Punta de la jeringa */}
        <div className="w-6 h-2 bg-slate-300 rounded-r-full border-2 border-slate-400 border-l-0" />
      </div>
    </div>
  );
}

// Componente de visualización de pluma/clicks
function PenVisualization({ clicks }: { clicks: number }) {
  return (
    <div className="relative w-full max-w-xs mx-auto mt-6">
      <div className="flex flex-col items-center">
        {/* Icono de pluma grande */}
        <div className="relative">
          <div className="w-32 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{clicks}</span>
            </div>
          </div>
          {/* Punta de la pluma */}
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-3 bg-slate-500 rounded-r-full" />
          {/* Dial de la pluma */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-10 bg-slate-400 rounded-l-lg" />
        </div>

        {/* Indicador de clicks */}
        <div className="mt-4 flex items-center gap-1">
          {Array.from({ length: Math.min(clicks, 10) }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-cyan-500 rounded-full"
            />
          ))}
          {clicks > 10 && (
            <span className="text-xs text-slate-500 ml-1">+{clicks - 10}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para grupo de botones de selección
function OptionButtons({
  options,
  value,
  onChange,
  unit
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  unit: string;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
            value === option
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          {option}{unit}
        </button>
      ))}
    </div>
  );
}

// Componente de input con flechas
function NumberInputWithArrows({
  value,
  onChange,
  unit,
  step = 1,
  min = 0,
  max = 9999,
}: {
  value: string;
  onChange: (val: string) => void;
  unit: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  const numValue = parseFloat(value) || 0;

  const increment = () => {
    const newVal = Math.min(numValue + step, max);
    onChange(String(newVal));
  };

  const decrement = () => {
    const newVal = Math.max(numValue - step, min);
    onChange(String(newVal));
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <button
          onClick={increment}
          className="p-1 hover:bg-slate-100 rounded transition-colors"
          aria-label="Incrementar"
        >
          <ChevronUp className="h-5 w-5 text-slate-600" />
        </button>
        <button
          onClick={decrement}
          className="p-1 hover:bg-slate-100 rounded transition-colors"
          aria-label="Decrementar"
        >
          <ChevronDown className="h-5 w-5 text-slate-600" />
        </button>
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleInput}
          className="w-24 px-3 py-2 pr-12 text-right text-lg font-semibold border-2 border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
          {unit}
        </span>
      </div>
    </div>
  );
}

export function VialCalculator() {
  const [inputs, setInputs] = useLocalStorage<CalculatorInputs>(
    STORAGE_KEY,
    defaultInputs
  );
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>("syringe");
  const [syringeVolume, setSyringeVolume] = useState("0.3");
  const [productType, setProductType] = useState<ProductType>("peptide");
  const [vialAmountIU, setVialAmountIU] = useState("10"); // Para HGH en IU
  const [targetDoseIU, setTargetDoseIU] = useState("4"); // Dosis en IU para HGH

  // Estados para pluma
  const [penVialIU, setPenVialIU] = useState("12"); // IU en el cartucho
  const [penDoseIU, setPenDoseIU] = useState("4"); // Dosis deseada en IU
  const [penInputUnit, setPenInputUnit] = useState<"IU" | "mg">("IU"); // Unidad para cantidad cartucho
  const [penVialMgInput, setPenVialMgInput] = useState("4"); // mg en el cartucho
  const [penDoseUnit, setPenDoseUnit] = useState<"IU" | "mg">("IU"); // Unidad para dosis
  const [penDoseMgInput, setPenDoseMgInput] = useState("1"); // Dosis en mg

  // Convertir IU a mg para HGH
  const vialMgFromIU = parseFloat(vialAmountIU) / HGH_IU_PER_MG;
  const doseMgFromIU = parseFloat(targetDoseIU) / HGH_IU_PER_MG;

  // Crear inputs modificados para HGH
  const calculatorInputs: CalculatorInputs = productType === "hgh"
    ? {
        ...inputs,
        vialAmount: String(vialMgFromIU),
        targetDose: String(doseMgFromIU * 1000), // Convertir a mcg para el cálculo
        doseUnit: "mcg",
      }
    : inputs;

  // Cálculos
  const result = useCalculator(calculatorInputs);

  // Cálculos para pluma
  // Calcular IU efectivos según la unidad seleccionada
  const penVialIUCalc = penInputUnit === "IU"
    ? parseFloat(penVialIU)
    : parseFloat(penVialMgInput) * HGH_IU_PER_MG;
  const penDoseIUCalc = penDoseUnit === "IU"
    ? parseFloat(penDoseIU)
    : parseFloat(penDoseMgInput) * HGH_IU_PER_MG;

  // En una pluma: el cartucho tiene 3mL, con X IU reconstituidos
  // Concentración = IU / 3mL = IU/mL
  // Cada click = 1 IU en el dial, pero el volumen real depende de la concentración
  // Si la pluma está calibrada para 1 click = 1 IU (como las plumas de insulina/HGH)
  // Entonces clicks = dosis en IU
  const penConcentrationIUperML = penVialIUCalc / PEN_CARTRIDGE_ML;
  const penClicksNeeded = Math.round(penDoseIUCalc); // 1 click = 1 IU
  const penVolumeML = penDoseIUCalc / penConcentrationIUperML;
  const penVialMg = penVialIUCalc / HGH_IU_PER_MG;
  const penDoseMg = penDoseIUCalc / HGH_IU_PER_MG;
  const penIsValid = penVialIUCalc > 0 && penDoseIUCalc > 0;
  const penExceedsVial = penDoseIUCalc > penVialIUCalc;

  // Handlers
  const updateInput = useCallback(
    (field: keyof CalculatorInputs, value: string) => {
      setInputs((prev) => ({ ...prev, [field]: value }));
    },
    [setInputs]
  );

  // Calcular máximo de unidades según la jeringa
  const maxUnits = parseFloat(syringeVolume) * 100;

  // Cambiar tipo de producto
  const handleProductTypeChange = (type: ProductType) => {
    setProductType(type);
    if (type === "hgh") {
      // Valores por defecto para HGH
      setVialAmountIU("10");
      setTargetDoseIU("4");
      updateInput("diluentVolume", "1");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="mx-auto max-w-md">
        {/* Header con logo */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/dosificacionpeptidos/logo-qspain.jpg"
              alt="Q-Spain Logo"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Calculadora de Dosis
              </h1>
            </div>
          </div>
        </header>

        {/* Selector de modo: Jeringa vs Pluma */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCalculatorMode("syringe")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium transition-all ${
              calculatorMode === "syringe"
                ? "bg-cyan-500 text-white border-cyan-500 shadow-lg"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Syringe className="h-5 w-5" />
            Jeringa
          </button>
          <button
            onClick={() => setCalculatorMode("pen")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium transition-all ${
              calculatorMode === "pen"
                ? "bg-cyan-500 text-white border-cyan-500 shadow-lg"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            <PenTool className="h-5 w-5" />
            Pluma
          </button>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6 space-y-6">

            {/* ==================== MODO JERINGA ==================== */}
            {calculatorMode === "syringe" && (
              <>
                {/* Selector de tipo de producto */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">
                    Tipo de producto
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProductTypeChange("peptide")}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        productType === "peptide"
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      Péptidos
                    </button>
                    <button
                      onClick={() => handleProductTypeChange("hgh")}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        productType === "hgh"
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      HGH
                    </button>
                  </div>
                </div>

                {/* Volumen de jeringa */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      ¿Cuál es el volumen total de la jeringa?
                    </label>
                    <NumberInputWithArrows
                      value={syringeVolume}
                      onChange={setSyringeVolume}
                      unit="ml"
                      step={0.1}
                      min={0.1}
                      max={3}
                    />
                  </div>
                  <OptionButtons
                    options={SYRINGE_OPTIONS}
                    value={syringeVolume}
                    onChange={setSyringeVolume}
                    unit="ml"
                  />
                </div>

                {/* Cantidad del vial */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      {productType === "hgh"
                        ? "¿Cuántas IU tiene el vial de HGH?"
                        : "¿Cuántos mg de péptido tiene el vial?"
                      }
                    </label>
                    {productType === "hgh" ? (
                      <NumberInputWithArrows
                        value={vialAmountIU}
                        onChange={setVialAmountIU}
                        unit="IU"
                        step={2}
                        min={2}
                        max={100}
                      />
                    ) : (
                      <NumberInputWithArrows
                        value={inputs.vialAmount}
                        onChange={(val) => updateInput("vialAmount", val)}
                        unit="mg"
                        step={1}
                        min={1}
                        max={100}
                      />
                    )}
                  </div>
                  {productType === "hgh" ? (
                    <>
                      <OptionButtons
                        options={VIAL_OPTIONS_HGH}
                        value={vialAmountIU}
                        onChange={setVialAmountIU}
                        unit="IU"
                      />
                      <p className="text-xs text-slate-500">
                        = {formatNumber(vialMgFromIU, 2)} mg (1 mg = 3 IU)
                      </p>
                    </>
                  ) : (
                    <OptionButtons
                      options={VIAL_OPTIONS_PEPTIDE}
                      value={inputs.vialAmount}
                      onChange={(val) => updateInput("vialAmount", val)}
                      unit="mg"
                    />
                  )}
                </div>

                {/* Diluyente */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      ¿Cuánta agua bacteriostática añades?
                    </label>
                    <NumberInputWithArrows
                      value={inputs.diluentVolume}
                      onChange={(val) => updateInput("diluentVolume", val)}
                      unit="ml"
                      step={0.5}
                      min={0.5}
                      max={10}
                    />
                  </div>
                  <OptionButtons
                    options={DILUENT_OPTIONS}
                    value={inputs.diluentVolume}
                    onChange={(val) => updateInput("diluentVolume", val)}
                    unit="ml"
                  />
                </div>

                {/* Dosis deseada */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      ¿Cuál es tu dosis deseada?
                    </label>
                    <div className="flex items-center gap-2">
                      {productType === "hgh" ? (
                        <NumberInputWithArrows
                          value={targetDoseIU}
                          onChange={setTargetDoseIU}
                          unit="IU"
                          step={1}
                          min={1}
                          max={20}
                        />
                      ) : (
                        <NumberInputWithArrows
                          value={inputs.targetDose}
                          onChange={(val) => updateInput("targetDose", val)}
                          unit={inputs.doseUnit}
                          step={inputs.doseUnit === "mcg" ? 50 : 0.5}
                          min={inputs.doseUnit === "mcg" ? 10 : 0.1}
                          max={inputs.doseUnit === "mcg" ? 5000 : 50}
                        />
                      )}
                    </div>
                  </div>

                  {productType === "hgh" ? (
                    <>
                      <OptionButtons
                        options={DOSE_OPTIONS_IU}
                        value={targetDoseIU}
                        onChange={setTargetDoseIU}
                        unit="IU"
                      />
                      <p className="text-xs text-slate-500">
                        = {formatNumber(doseMgFromIU, 2)} mg (1 mg = 3 IU)
                      </p>
                    </>
                  ) : (
                    <>
                      {/* Selector mg/mcg */}
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => updateInput("doseUnit", "mg")}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            inputs.doseUnit === "mg"
                              ? "bg-cyan-500 text-white border-cyan-500"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          mg
                        </button>
                        <button
                          onClick={() => updateInput("doseUnit", "mcg")}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            inputs.doseUnit === "mcg"
                              ? "bg-cyan-500 text-white border-cyan-500"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          mcg
                        </button>
                      </div>
                      <OptionButtons
                        options={inputs.doseUnit === "mcg" ? DOSE_OPTIONS_MCG : DOSE_OPTIONS_MG}
                        value={inputs.targetDose}
                        onChange={(val) => updateInput("targetDose", val)}
                        unit={inputs.doseUnit}
                      />
                    </>
                  )}
                </div>

                {/* Botón calcular (decorativo, el cálculo es en tiempo real) */}
                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-6 text-base rounded-xl"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  Calcular
                </Button>

                {/* Resultado Jeringa */}
                {result.isValid && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-center">
                      <p className="text-slate-700 text-lg">
                        Para una dosis de{" "}
                        <span className="font-bold">
                          {productType === "hgh"
                            ? `${targetDoseIU} IU`
                            : `${inputs.targetDose}${inputs.doseUnit}`
                          }
                        </span>,{" "}
                        <span className="text-cyan-600 font-bold">
                          lleva la jeringa hasta {formatNumber(result.unitsU100Rounded, 1)}
                        </span>
                      </p>
                    </div>

                    {/* Jeringa visual */}
                    <SyringeVisualization
                      units={result.unitsU100Rounded}
                      maxUnits={maxUnits}
                    />

                    {/* Info adicional */}
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">Volumen</p>
                        <p className="font-bold text-slate-800">
                          {formatNumber(result.volumeMlRounded)} mL
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">Concentración</p>
                        <p className="font-bold text-slate-800">
                          {productType === "hgh"
                            ? `${formatNumber(result.concentrationMgPerMl * HGH_IU_PER_MG, 1)} IU/mL`
                            : `${formatNumber(result.concentrationMgPerMl)} mg/mL`
                          }
                        </p>
                      </div>
                    </div>

                    {/* Equivalencias para HGH */}
                    {productType === "hgh" && (
                      <div className="mt-3 p-3 bg-cyan-50 rounded-lg text-center text-sm">
                        <p className="text-cyan-700">
                          <span className="font-medium">{targetDoseIU} IU</span> = <span className="font-medium">{formatNumber(doseMgFromIU, 2)} mg</span>
                        </p>
                      </div>
                    )}

                    {/* Alertas */}
                    {result.exceedsVial && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        Advertencia: La dosis supera el contenido total del vial.
                      </div>
                    )}
                    {result.volumeTooSmall && !result.exceedsVial && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                        Advertencia: Volumen muy pequeño (&lt;0,02 mL), puede ser difícil de medir con precisión.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ==================== MODO PLUMA ==================== */}
            {calculatorMode === "pen" && (
              <>
                {/* Info del cartucho */}
                <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-600">
                  <p className="font-medium">Pluma de insulina</p>
                  <p>Cartucho estándar: {PEN_CARTRIDGE_ML} mL | 1 click = 1 IU</p>
                </div>

                {/* Cantidad en el cartucho */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      ¿Cuánto has reconstituido en el cartucho?
                    </label>
                    {penInputUnit === "IU" ? (
                      <NumberInputWithArrows
                        value={penVialIU}
                        onChange={setPenVialIU}
                        unit="IU"
                        step={2}
                        min={4}
                        max={100}
                      />
                    ) : (
                      <NumberInputWithArrows
                        value={penVialMgInput}
                        onChange={setPenVialMgInput}
                        unit="mg"
                        step={1}
                        min={1}
                        max={50}
                      />
                    )}
                  </div>
                  {/* Selector IU/mg para cartucho */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setPenInputUnit("IU")}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        penInputUnit === "IU"
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      IU
                    </button>
                    <button
                      onClick={() => setPenInputUnit("mg")}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        penInputUnit === "mg"
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      mg
                    </button>
                  </div>
                  {penInputUnit === "IU" ? (
                    <OptionButtons
                      options={VIAL_OPTIONS_PEN}
                      value={penVialIU}
                      onChange={setPenVialIU}
                      unit="IU"
                    />
                  ) : (
                    <OptionButtons
                      options={VIAL_OPTIONS_PEN_MG}
                      value={penVialMgInput}
                      onChange={setPenVialMgInput}
                      unit="mg"
                    />
                  )}
                  <p className="text-xs text-slate-500">
                    = {formatNumber(penVialMg, 2)} mg = {formatNumber(penVialIUCalc, 0)} IU en {PEN_CARTRIDGE_ML} mL ({formatNumber(penConcentrationIUperML, 1)} IU/mL)
                  </p>
                </div>

                {/* Dosis deseada */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      ¿Cuál es tu dosis deseada?
                    </label>
                    {penDoseUnit === "IU" ? (
                      <NumberInputWithArrows
                        value={penDoseIU}
                        onChange={setPenDoseIU}
                        unit="IU"
                        step={1}
                        min={1}
                        max={50}
                      />
                    ) : (
                      <NumberInputWithArrows
                        value={penDoseMgInput}
                        onChange={setPenDoseMgInput}
                        unit="mg"
                        step={0.5}
                        min={0.1}
                        max={20}
                      />
                    )}
                  </div>
                  {/* Selector IU/mg para dosis */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setPenDoseUnit("IU")}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        penDoseUnit === "IU"
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      IU
                    </button>
                    <button
                      onClick={() => setPenDoseUnit("mg")}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        penDoseUnit === "mg"
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      mg
                    </button>
                  </div>
                  {penDoseUnit === "IU" ? (
                    <OptionButtons
                      options={DOSE_OPTIONS_IU}
                      value={penDoseIU}
                      onChange={setPenDoseIU}
                      unit="IU"
                    />
                  ) : (
                    <OptionButtons
                      options={DOSE_OPTIONS_PEN_MG}
                      value={penDoseMgInput}
                      onChange={setPenDoseMgInput}
                      unit="mg"
                    />
                  )}
                  <p className="text-xs text-slate-500">
                    = {formatNumber(penDoseMg, 2)} mg = {formatNumber(penDoseIUCalc, 1)} IU
                  </p>
                </div>

                {/* Botón calcular */}
                <Button
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-6 text-base rounded-xl"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  Calcular Clicks
                </Button>

                {/* Resultado Pluma */}
                {penIsValid && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-center">
                      <p className="text-slate-700 text-lg mb-2">
                        Para una dosis de{" "}
                        <span className="font-bold">
                          {penDoseUnit === "IU"
                            ? `${penDoseIU} IU`
                            : `${penDoseMgInput} mg (${formatNumber(penDoseIUCalc, 1)} IU)`
                          }
                        </span>
                      </p>
                      <p className="text-3xl font-bold text-cyan-600">
                        {penClicksNeeded} clicks
                      </p>
                    </div>

                    {/* Pluma visual */}
                    <PenVisualization clicks={penClicksNeeded} />

                    {/* Info adicional */}
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">Volumen inyectado</p>
                        <p className="font-bold text-slate-800">
                          {formatNumber(penVolumeML, 3)} mL
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">Concentración</p>
                        <p className="font-bold text-slate-800">
                          {formatNumber(penConcentrationIUperML, 1)} IU/mL
                        </p>
                      </div>
                    </div>

                    {/* Equivalencia */}
                    <div className="mt-3 p-3 bg-cyan-50 rounded-lg text-center text-sm">
                      <p className="text-cyan-700">
                        <span className="font-medium">{penClicksNeeded} clicks</span> = <span className="font-medium">{formatNumber(penDoseIUCalc, 1)} IU</span> = <span className="font-medium">{formatNumber(penDoseMg, 2)} mg</span>
                      </p>
                    </div>

                    {/* Alertas */}
                    {penExceedsVial && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        Advertencia: La dosis supera el contenido total del cartucho.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-slate-400 text-center pt-4">
              Estas herramientas de cálculo son solo para fines educativos e investigación, no constituyen consejo médico. Consulta siempre con profesionales de la salud.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
