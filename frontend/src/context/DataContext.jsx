import { createContext, useContext, useState } from 'react';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    isLoading: false,
    kpis: null,
    fleet: [],
  });

  return (
    <DataContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
