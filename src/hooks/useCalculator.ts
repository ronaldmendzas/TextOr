import { useState, useCallback } from "react";
import { evaluateExpression } from "@/lib";

interface CalculatorState {
  expression: string;
  result: number | null;
  isValid: boolean;
}

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>({
    expression: "",
    result: null,
    isValid: false,
  });

  const calculate = useCallback((expression: string) => {
    const cleanExpression = expression.replace(/^=/, "").trim();

    if (!cleanExpression) {
      setState({ expression: "", result: null, isValid: false });
      return null;
    }

    const result = evaluateExpression(cleanExpression);

    setState({
      expression: cleanExpression,
      result: result.isValid ? result.result : null,
      isValid: result.isValid,
    });

    return result.isValid ? result.result : null;
  }, []);

  const reset = useCallback(() => {
    setState({ expression: "", result: null, isValid: false });
  }, []);

  return {
    ...state,
    calculate,
    reset,
  };
}
