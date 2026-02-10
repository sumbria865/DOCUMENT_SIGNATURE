import * as React from "react";

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

export const Tabs = ({ defaultValue, children }: TabsProps) => {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsContextType {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

const useTabs = () => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used inside Tabs");
  return ctx;
};

export const TabsList = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex space-x-2 mb-4">{children}</div>;
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
        ${
          isActive
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
