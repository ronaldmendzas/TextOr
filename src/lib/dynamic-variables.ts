import type { DynamicVariable, CalculatorResult } from "@/types";
import { format } from "date-fns";

export const DYNAMIC_VARIABLES: DynamicVariable[] = [
  {
    pattern: /\{\{date\}\}/g,
    name: "date",
    description: "Current date (YYYY-MM-DD)",
    resolver: () => format(new Date(), "yyyy-MM-dd"),
  },
  {
    pattern: /\{\{time\}\}/g,
    name: "time",
    description: "Current time (HH:mm)",
    resolver: () => format(new Date(), "HH:mm"),
  },
  {
    pattern: /\{\{datetime\}\}/g,
    name: "datetime",
    description: "Current date and time",
    resolver: () => format(new Date(), "yyyy-MM-dd HH:mm"),
  },
  {
    pattern: /\{\{year\}\}/g,
    name: "year",
    description: "Current year",
    resolver: () => format(new Date(), "yyyy"),
  },
  {
    pattern: /\{\{month\}\}/g,
    name: "month",
    description: "Current month name",
    resolver: () => format(new Date(), "MMMM"),
  },
  {
    pattern: /\{\{day\}\}/g,
    name: "day",
    description: "Current day of week",
    resolver: () => format(new Date(), "EEEE"),
  },
  {
    pattern: /\{\{timestamp\}\}/g,
    name: "timestamp",
    description: "Unix timestamp",
    resolver: () => Date.now().toString(),
  },
  {
    pattern: /\{\{random\}\}/g,
    name: "random",
    description: "Random number (1-100)",
    resolver: () => Math.floor(Math.random() * 100 + 1).toString(),
  },
  {
    pattern: /\{\{uuid\}\}/g,
    name: "uuid",
    description: "Random UUID",
    resolver: () => crypto.randomUUID(),
  },
];

export function resolveDynamicVariables(text: string): string {
  let result = text;

  for (const variable of DYNAMIC_VARIABLES) {
    result = result.replace(variable.pattern, variable.resolver());
  }

  return result;
}

export function detectDynamicVariable(
  text: string
): DynamicVariable | undefined {
  for (const variable of DYNAMIC_VARIABLES) {
    if (text.match(variable.pattern)) {
      return variable;
    }
  }
  return undefined;
}

const CALCULATOR_PATTERN = /^=([0-9+\-*/().\s]+)$/;

export function detectCalculatorExpression(text: string): string | null {
  const match = text.match(CALCULATOR_PATTERN);
  return match ? match[1]?.trim() ?? null : null;
}

export function evaluateExpression(expression: string): CalculatorResult {
  try {
    const sanitized = expression.replace(/[^0-9+\-*/().]/g, "");

    if (!sanitized || sanitized !== expression.replace(/\s/g, "")) {
      return { expression, result: 0, isValid: false };
    }

    const result = Function(`"use strict"; return (${sanitized})`)() as number;

    if (typeof result !== "number" || !isFinite(result)) {
      return { expression, result: 0, isValid: false };
    }

    return {
      expression,
      result: Math.round(result * 1000000) / 1000000,
      isValid: true,
    };
  } catch {
    return { expression, result: 0, isValid: false };
  }
}

export function processInlineCalculation(text: string): string | null {
  const expression = detectCalculatorExpression(text);
  if (!expression) return null;

  const result = evaluateExpression(expression);
  if (!result.isValid) return null;

  return result.result.toString();
}

export interface ProcessedText {
  text: string;
  hasVariables: boolean;
  hasCalculation: boolean;
  calculationResult?: number;
}

export function processText(text: string): ProcessedText {
  let processedText = text;
  let hasVariables = false;
  let hasCalculation = false;
  let calculationResult: number | undefined;

  for (const variable of DYNAMIC_VARIABLES) {
    if (variable.pattern.test(processedText)) {
      hasVariables = true;
      processedText = processedText.replace(variable.pattern, variable.resolver());
    }
    variable.pattern.lastIndex = 0;
  }

  const expression = detectCalculatorExpression(processedText);
  if (expression) {
    const result = evaluateExpression(expression);
    if (result.isValid) {
      hasCalculation = true;
      calculationResult = result.result;
    }
  }

  return {
    text: processedText,
    hasVariables,
    hasCalculation,
    calculationResult,
  };
}
