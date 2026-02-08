import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface TierData {
  id: string;
  imgUrl: string;
  tier: string;
  subject: string;
  roleName?: string;
  comment: string;
}

interface TierContextType {
  items: TierData[];
  addItem: (item: TierData) => void;
  updateItemComment: (id: string, comment: string) => void;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

export const TierProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<TierData[]>([]);

  const addItem = (item: TierData) => {
    setItems((prev) => [...prev, item]);
  };

  const updateItemComment = (id: string, comment: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, comment } : item)),
    );
  };

  return (
    <TierContext.Provider value={{ items, addItem, updateItemComment }}>
      {children}
    </TierContext.Provider>
  );
};

export const useTierContext = () => {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error("useTierContext must be used within a TierProvider");
  }
  return context;
};
