"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import {
  ChevronUp,
  ChevronDown,
  Calculator,
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
const VIAL_OPTIONS = ["5", "10", "15"];
const DILUENT_OPTIONS = ["1", "2", "3", "5"];
const DOSE_OPTIONS_MCG = ["50", "100", "250", "500"];
const DOSE_OPTIONS_MG = ["0.5", "1", "2.5", "5"];

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
  const [syringeVolume, setSyringeVolume] = useState("0.3");

  // Cálculos
  const result = useCalculator(inputs);

  // Handlers
  const updateInput = useCallback(
    (field: keyof CalculatorInputs, value: string) => {
      setInputs((prev) => ({ ...prev, [field]: value }));
    },
    [setInputs]
  );

  // Calcular máximo de unidades según la jeringa
  const maxUnits = parseFloat(syringeVolume) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="mx-auto max-w-md">
        {/* Header con logo */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src="/logo-qspain.jpg"
              alt="Q-Spain Logo"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Calculadora de Dosis de Péptidos
              </h1>
            </div>
          </div>
        </header>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6 space-y-6">
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
                  ¿Cuántos mg de péptido tiene el vial?
                </label>
                <NumberInputWithArrows
                  value={inputs.vialAmount}
                  onChange={(val) => updateInput("vialAmount", val)}
                  unit="mg"
                  step={1}
                  min={1}
                  max={100}
                />
              </div>
              <OptionButtons
                options={VIAL_OPTIONS}
                value={inputs.vialAmount}
                onChange={(val) => updateInput("vialAmount", val)}
                unit="mg"
              />
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
                  <NumberInputWithArrows
                    value={inputs.targetDose}
                    onChange={(val) => updateInput("targetDose", val)}
                    unit={inputs.doseUnit}
                    step={inputs.doseUnit === "mcg" ? 50 : 0.5}
                    min={inputs.doseUnit === "mcg" ? 10 : 0.1}
                    max={inputs.doseUnit === "mcg" ? 5000 : 50}
                  />
                </div>
              </div>
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
            </div>

            {/* Botón calcular (decorativo, el cálculo es en tiempo real) */}
            <Button
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-6 text-base rounded-xl"
            >
              <Calculator className="h-5 w-5 mr-2" />
              Calcular
            </Button>

            {/* Resultado */}
            {result.isValid && (
              <div className="pt-4 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-slate-700 text-lg">
                    Para una dosis de{" "}
                    <span className="font-bold">{inputs.targetDose}{inputs.doseUnit}</span>,{" "}
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
                      {formatNumber(result.concentrationMgPerMl)} mg/mL
                    </p>
                  </div>
                </div>

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
