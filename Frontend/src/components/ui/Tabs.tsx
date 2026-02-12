import * as React from "react";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  setValue: (v: string) => void;
} | null>(null);

const useTabs = () => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used inside Tabs");
  return ctx;
};

export const Tabs = ({
  defaultValue = "",
  value,
  onValueChange,
  children,
  className,
}: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  // If value prop is passed, use controlled mode
  const activeValue = value !== undefined ? value : internalValue;

  const setValue = (v: string) => {
    if (onValueChange) onValueChange(v);       // controlled
    else setInternalValue(v);                  // uncontrolled
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div className={`flex space-x-2 mb-4 ${className ?? ""}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger = ({ value, children }: TabsTriggerProps) => {
  const { value: active, setValue } = useTabs();
  const isActive = active === value;

  return (
    <button
      onClick={() => setValue(value)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition
        ${isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const TabsContent = ({ value, children }: TabsContentProps) => {
  const { value: active } = useTabs();
  if (active !== value) return null;
  return <div className="mt-4">{children}</div>;
};