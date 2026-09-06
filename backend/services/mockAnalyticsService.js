export const getFreightData = async () => {
  return [
    { month: 'Jan', bdi: 1500, coalFreight: 14.2, ironOreFreight: 16.5 },
    { month: 'Feb', bdi: 1420, coalFreight: 13.8, ironOreFreight: 15.9 },
    { month: 'Mar', bdi: 1680, coalFreight: 15.1, ironOreFreight: 17.8 },
    { month: 'Apr', bdi: 1850, coalFreight: 16.5, ironOreFreight: 19.2 },
    { month: 'May', bdi: 1790, coalFreight: 16.0, ironOreFreight: 18.5 },
    { month: 'Jun', bdi: 1950, coalFreight: 17.8, ironOreFreight: 20.4 },
  ];
};

export const getCongestionData = async () => {
  return [
    { port: 'Paradip', waitingDays: 4.2, turnaroundTime: 7.5 },
    { port: 'Vizag', waitingDays: 2.1, turnaroundTime: 5.0 },
    { port: 'Gangavaram', waitingDays: 1.5, turnaroundTime: 4.2 },
    { port: 'Dhamra', waitingDays: 1.0, turnaroundTime: 3.8 },
    { port: 'Haldia', waitingDays: 5.5, turnaroundTime: 9.1 },
  ];
};

export const getRiskCalendarData = async () => {
  return [
    { region: 'East Coast India', Jan: 'Low', Feb: 'Low', Mar: 'Low', Apr: 'Medium', May: 'High', Jun: 'High', Jul: 'High', Aug: 'High', Sep: 'Medium', Oct: 'High', Nov: 'Medium', Dec: 'Low' },
    { region: 'South Africa (Maputo)', Jan: 'Medium', Feb: 'High', Mar: 'Medium', Apr: 'Low', May: 'Low', Jun: 'Low', Jul: 'Low', Aug: 'Low', Sep: 'Low', Oct: 'Low', Nov: 'Medium', Dec: 'Medium' },
    { region: 'Australia (East)', Jan: 'High', Feb: 'High', Mar: 'High', Apr: 'Medium', May: 'Low', Jun: 'Low', Jul: 'Low', Aug: 'Low', Sep: 'Low', Oct: 'Medium', Nov: 'Medium', Dec: 'High' },
    { region: 'Indonesia', Jan: 'High', Feb: 'High', Mar: 'Medium', Apr: 'Low', May: 'Low', Jun: 'Low', Jul: 'Low', Aug: 'Low', Sep: 'Low', Oct: 'Medium', Nov: 'High', Dec: 'High' }
  ];
};

export const getCommodityData = async () => {
  return [
    { month: 'Jan', coalPrice: 135, ironOrePrice: 110 },
    { month: 'Feb', coalPrice: 138, ironOrePrice: 115 },
    { month: 'Mar', coalPrice: 142, ironOrePrice: 112 },
    { month: 'Apr', coalPrice: 140, ironOrePrice: 118 },
    { month: 'May', coalPrice: 145, ironOrePrice: 120 },
    { month: 'Jun', coalPrice: 148, ironOrePrice: 125 },
  ];
};

export const getFxData = async () => {
  return [
    { month: 'Jan', usdInr: 82.5, dxy: 103.2 },
    { month: 'Feb', usdInr: 82.8, dxy: 104.1 },
    { month: 'Mar', usdInr: 83.1, dxy: 103.8 },
    { month: 'Apr', usdInr: 83.0, dxy: 104.5 },
    { month: 'May', usdInr: 83.4, dxy: 105.0 },
    { month: 'Jun', usdInr: 83.6, dxy: 105.5 },
  ];
};

export const getFuelData = async () => {
  return [
    { month: 'Jan', vlsfo: 620, hsfo: 450 },
    { month: 'Feb', vlsfo: 635, hsfo: 460 },
    { month: 'Mar', vlsfo: 650, hsfo: 475 },
    { month: 'Apr', vlsfo: 645, hsfo: 470 },
    { month: 'May', vlsfo: 660, hsfo: 485 },
    { month: 'Jun', vlsfo: 680, hsfo: 500 },
  ];
};
