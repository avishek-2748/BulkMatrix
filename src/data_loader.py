"""
Data Loader Module
Loads all 15 datasets from data/raw/ with proper date parsing and types
"""

import pandas as pd
from pathlib import Path
from typing import Dict, Optional
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataLoader:
    """Loads all datasets from data/raw/ directory"""
    
    def __init__(self, raw_data_path: str = "data/raw"):
        """
        Initialize DataLoader with path to raw data
        
        Args:
            raw_data_path: Path to folder containing raw CSV files
        """
        self.raw_path = Path(raw_data_path)
        self.data = {}
        
    def load_all(self) -> Dict[str, pd.DataFrame]:
        """
        Load all 15 datasets into a dictionary
        
        Returns:
            Dictionary with dataset names as keys and DataFrames as values
        """
        logger.info("=" * 60)
        logger.info("Loading all datasets from: %s", self.raw_path)
        logger.info("=" * 60)
        
        # Dataset 1: Freight Indices
        self.data['freight_bdi'] = self._load_csv('dataset_1_freight_bdi_daily.csv', parse_dates=True)
        
        self.data['freight_proxies'] = self._load_csv('dataset_1_freight_vessel_proxies.csv', parse_dates=True)
        
        # Dataset 2: Macro & Commodities
        self.data['macro_brent'] = self._load_csv('dataset_2_macro_brent_oil_daily.csv', parse_dates=True)
        
        self.data['macro_coal'] = self._load_csv('dataset_2_macro_coal_newcastle_daily.csv', parse_dates=True)
        
        self.data['macro_dxy'] = self._load_csv('dataset_2_macro_dxy_usd_index.csv', parse_dates=True)
        
        self.data['macro_iron_ore'] = self._load_csv('dataset_2_macro_iron_ore_daily.csv', parse_dates=True)
        
        self.data['macro_usd_inr'] = self._load_csv('dataset_2_macro_usd_inr_daily.csv', parse_dates=True)
        
        # Dataset 3: Port Infrastructure (static)
        self.data['ports'] = self._load_csv('dataset_3_port_infrastructure_rules.csv', parse_dates=False)
        
        # Dataset 4: Vessel Specifications (static)
        self.data['vessels'] = self._load_csv('dataset_4_vessel_specifications.csv', parse_dates=False)
        
        # Dataset 5: Congestion (use main timeseries, skip legacy)
        self.data['congestion'] = self._load_csv('dataset_5_port_traffic_timeseries.csv', parse_dates=True)
        
        # Dataset 6: Weather Risk
        self.data['weather'] = self._load_csv('dataset_6_weather_risk_flags.csv', parse_dates=True)
        
        # Dataset 7: Route Distances (static)
        self.data['routes'] = self._load_csv('dataset_7_route_distances.csv', parse_dates=False)
        
        # Dataset 8: Disruption Events
        self.data['disruptions'] = self._load_csv('dataset_8_disruption_events.csv', parse_dates=True)
        
        # Dataset 9: Bunker Fuel
        self.data['fuel'] = self._load_csv('dataset_9_bunker_fuel_prices.csv', parse_dates=True)
        
        # Print summary
        self._print_summary()
        
        return self.data
    
    def _load_csv(self, filename: str, parse_dates: bool = True) -> pd.DataFrame:
        """
        Load a single CSV file with error handling
        
        Args:
            filename: Name of CSV file in raw_path
            parse_dates: Whether to parse date column
            
        Returns:
            pandas DataFrame
        """
        filepath = self.raw_path / filename
        
        if not filepath.exists():
            logger.warning(f"⚠️  File not found: {filename}")
            return pd.DataFrame()
        
        try:
            # Load CSV
            df = pd.read_csv(filepath)
            
            # Parse dates if requested
            if parse_dates:
                # Try to find date column
                date_cols = ['Date', 'date', 'DATE', 'event_date', 'Date_x', 'Date_y']
                for col in date_cols:
                    if col in df.columns:
                        df[col] = pd.to_datetime(df[col])
                        df = df.rename(columns={col: 'date'})
                        break
                
                # If no date column found, check first column
                if 'date' not in df.columns:
                    # Try first column as date
                    first_col = df.columns[0]
                    try:
                        df[first_col] = pd.to_datetime(df[first_col])
                        df = df.rename(columns={first_col: 'date'})
                    except:
                        pass
            
            # Standardize all column names: lowercase, strip, replace spaces with underscores
            df.columns = [col.lower().strip().replace(' ', '_') for col in df.columns]
            
            # Rename 'price' column to specific names based on dataset
            if 'price' in df.columns:
                if 'bdi' in filename:
                    df = df.rename(columns={'price': 'bdi_score'})
                elif 'brent' in filename:
                    df = df.rename(columns={'price': 'brent_price'})
                elif 'coal' in filename:
                    df = df.rename(columns={'price': 'coal_price'})
                elif 'iron_ore' in filename:
                    df = df.rename(columns={'price': 'iron_ore_price'})
                elif 'dxy' in filename:
                    df = df.rename(columns={'price': 'dxy'})
                elif 'usd_inr' in filename:
                    df = df.rename(columns={'price': 'usd_inr_rate'})
            
            # For vessel proxies, ensure Date is renamed properly
            if 'date' in df.columns:
                pass  # Already handled above
            
            logger.info(f"✅ Loaded: {filename} ({len(df)} rows, {len(df.columns)} columns)")
            return df
            
        except Exception as e:
            logger.error(f"❌ Error loading {filename}: {e}")
            return pd.DataFrame()
    
    def _print_summary(self):
        """Print summary of loaded datasets"""
        logger.info("=" * 60)
        logger.info("📊 Dataset Loading Summary")
        logger.info("=" * 60)
        
        total_rows = 0
        for name, df in self.data.items():
            if not df.empty:
                rows = len(df)
                cols = len(df.columns)
                total_rows += rows
                logger.info(f"  {name:20s} : {rows:>6,} rows, {cols:>3} columns")
            else:
                logger.warning(f"  {name:20s} : ⚠️  EMPTY")
        
        logger.info("-" * 60)
        logger.info(f"  TOTAL : {total_rows:>6,} rows across {len(self.data)} datasets")
        logger.info("=" * 60)
    
    def get(self, key: str) -> Optional[pd.DataFrame]:
        """
        Get a specific dataset by key
        
        Args:
            key: Dataset key (e.g., 'freight_bdi', 'ports')
            
        Returns:
            pandas DataFrame or None if not found
        """
        return self.data.get(key)
    
    def list_datasets(self) -> list:
        """List all available dataset keys"""
        return list(self.data.keys())


# Quick test function
def test_loader():
    """Test the DataLoader"""
    loader = DataLoader()
    data = loader.load_all()
    
    print("\n🔍 Available datasets:")
    for key in loader.list_datasets():
        df = loader.get(key)
        print(f"  - {key}: {len(df)} rows")
    
    return loader


if __name__ == "__main__":
    test_loader()