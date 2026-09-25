import {
  getMarketOverviewData,
  getMarketIndexDetailData,
} from '../services/marketDataService.js';

export const getMarketOverview = async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const data = await getMarketOverviewData(forceRefresh);
    res.json(data);
  } catch (error) {
    console.error('Error in getMarketOverview:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMarketIndexDetail = async (req, res) => {
  try {
    const { indexKey } = req.params;
    const { range = '30d', refresh } = req.query;
    const forceRefresh = refresh === 'true';

    const data = await getMarketIndexDetailData(indexKey, range, forceRefresh);
    res.json(data);
  } catch (error) {
    console.error(`Error in getMarketIndexDetail (${req.params?.indexKey}):`, error);
    res.status(404).json({ success: false, error: error.message });
  }
};

// Returns compact latest macro indicators for Charter Planner and ML systems
export const getLatestMacroIndicators = async (req, res) => {
  try {
    const overview = await getMarketOverviewData();
    const indicators = {};
    for (const idx of overview.indices) {
      indicators[idx.id] = {
        name: idx.name,
        value: idx.currentValue,
        unit: idx.unit,
        changePercent: idx.changePercent,
        lastUpdated: idx.lastUpdated,
        isLive: idx.isLive,
      };
    }
    res.json({ success: true, indicators });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
