import React, { createContext, useContext, useState, useCallback } from "react";

// Define the structure for a single review case
export interface ReviewCase {
  caseId: string;
  timestamp: number;
  formData: {
    subject: string;
    role_name?: string;
    role_description?: string;
    tier?: string;
    suggestion?: string;
    tts?: boolean;
    tts_model?: string;
    tts_speed?: number;
    llm_model?: string;
    style?: string;
  };
  imageUrl: string;
  streamingText: string;
  reply: string;
  tierDecision?: string;
}

// Define the context interface
interface ReviewCaseContextType {
  cases: ReviewCase[];
  addCase: (caseData: Omit<ReviewCase, "timestamp">) => void;
  updateCase: (caseId: string, updates: Partial<ReviewCase>) => void;
  getCase: (caseId: string) => ReviewCase | undefined;
  exportToJSON: () => string;
  importFromJSON: (json: string) => void;
  clearCases: () => void;
}

// Create the context
const ReviewCaseContext = createContext<ReviewCaseContextType | undefined>(
  undefined
);

// Provider component
export const ReviewCaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cases, setCases] = useState<ReviewCase[]>([]);

  // Add a new case
  const addCase = useCallback((caseData: Omit<ReviewCase, "timestamp">) => {
    const newCase: ReviewCase = {
      ...caseData,
      timestamp: Date.now(),
    };
    setCases((prev) => [...prev, newCase]);
  }, []);

  // Update an existing case
  const updateCase = useCallback(
    (caseId: string, updates: Partial<ReviewCase>) => {
      setCases((prev) =>
        prev.map((c) => (c.caseId === caseId ? { ...c, ...updates } : c))
      );
    },
    []
  );

  // Get a specific case
  const getCase = useCallback(
    (caseId: string) => {
      return cases.find((c) => c.caseId === caseId);
    },
    [cases]
  );

  // Export all cases to JSON
  const exportToJSON = useCallback(() => {
    return JSON.stringify(cases, null, 2);
  }, [cases]);

  // Import cases from JSON
  const importFromJSON = useCallback((json: string) => {
    try {
      const importedCases = JSON.parse(json) as ReviewCase[];
      setCases(importedCases);
    } catch (error) {
      console.error("Failed to import JSON:", error);
    }
  }, []);

  // Clear all cases
  const clearCases = useCallback(() => {
    setCases([]);
  }, []);

  return (
    <ReviewCaseContext.Provider
      value={{
        cases,
        addCase,
        updateCase,
        getCase,
        exportToJSON,
        importFromJSON,
        clearCases,
      }}
    >
      {children}
    </ReviewCaseContext.Provider>
  );
};

// Custom hook to use the context
export const useReviewCases = () => {
  const context = useContext(ReviewCaseContext);
  if (context === undefined) {
    throw new Error("useReviewCases must be used within a ReviewCaseProvider");
  }
  return context;
};
