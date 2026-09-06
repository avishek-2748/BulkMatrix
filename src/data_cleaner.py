"""
Data Cleaner Module
Cleans, standardizes, and prepares all datasets for merging
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional
import logging
import warnings
warnings.filterwarnings('ignore', category=FutureWarning)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataCleaner:
    """Cleans and standardizes all datasets"""
    
    def __init__(self):
        self.cleaned_data = {}
        
    def clean_all(self, raw_data: Dict[str, pd.DataFrame]) -> Dict[str, pd.DataFrame]:
        """
        Clean all datasets
        
        Args:
            raw_data: Dictionary of raw DataFrames from DataLoader
            
        Returns:
            Dictionary of cleaned DataFrames
        """
        logger.info("=" * 60)
        logger.info("Starting Data Cleaning Process")
        logger.info("=" * 60)
        
        for name, df in raw_data.items():
            if df.empty:
                logger.warning(f"⚠️  Skipping {name}: Empty DataFrame")
                self.cleaned_data[name] = df
                continue
            
            logger.info(f"🔄 Cleaning: {name} ({len(df)} rows)")
            
            # Route to appropriate cleaning method
            if name in ['ports', 'vessels', 'routes']:
                cleaned = self._clean_static(df)
                self.cleaned_data[name] = cleaned
            elif name == 'fuel':
                # Special handling: split VLSFO and HSFO
                split_results = self._clean_fuel(df)
                for key, cleaned_df in split_results.items():
                    self.cleaned_data[key] = cleaned_df
                continue
            elif name in ['congestion', 'weather']:
                cleaned = self._clean_port_timeseries(df)
                self.cleaned_data[name] = cleaned
            elif name == 'disruptions':
                cleaned = self._clean_disruptions(df)
                self.cleaned_data[name] = cleaned
            else:
                cleaned = self._clean_timeseries(df)
                self.cleaned_data[name] = cleaned
            
            logger.info(f"   ✅ {name}: {len(cleaned)} rows, {len(cleaned.columns)} columns")
        
        logger.info("=" * 60)
        logger.info("✅ Data Cleaning Complete!")
        logger.info("=" * 60)
        
        return self.cleaned_data
    
    def _clean_fuel(self, df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
        """
        Split fuel dataset into VLSFO and HSFO separate datasets
        
        Fuel dataset has multiple fuel types per date (VLSFO, HSFO)
        Split them into separate DataFrames for proper time-series handling
        """
        df_clean = df.copy()
        
        # Standardize column names (already done in loader, but safe)
        df_clean.columns = [col.lower().strip().replace(' ', '_') for col in df_clean.columns]
        
        # Ensure date is datetime
        if 'date' in df_clean.columns:
            df_clean['date'] = pd.to_datetime(df_clean['date'])
        else:
            logger.warning("   ⚠️  No date column found in fuel data")
            return {'fuel': df_clean}
        
        # Check if fuel_type column exists
        if 'fuel_type' not in df_clean.columns:
            logger.warning("   ⚠️  No fuel_type column found, treating as regular timeseries")
            return {'fuel': self._clean_timeseries(df_clean)}
        
        # Split by fuel type
        fuel_types = df_clean['fuel_type'].unique()
        split_data = {}
        
        for fuel_type in fuel_types:
            fuel_df = df_clean[df_clean['fuel_type'] == fuel_type].copy()
            fuel_df = fuel_df.drop('fuel_type', axis=1)
            
            # Sort by date
            fuel_df = fuel_df.sort_values('date').reset_index(drop=True)
            
            # Set date as index for resampling
            fuel_df = fuel_df.set_index('date')
            
            # Resample to daily frequency (forward-fill)
            fuel_df = fuel_df.resample('D').ffill()
            
            # Reset index
            fuel_df = fuel_df.reset_index()
            
            # Rename price column to include fuel type
            price_cols = [col for col in fuel_df.columns if 'price' in col or 'usd' in col]
            for col in price_cols:
                fuel_df = fuel_df.rename(columns={col: f'{fuel_type.lower()}_price_usd'})
            
            # Remove outliers
            numeric_cols = fuel_df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                mean = fuel_df[col].mean()
                std = fuel_df[col].std()
                if std > 0:
                    fuel_df[col] = fuel_df[col].clip(
                        lower=mean - 5*std,
                        upper=mean + 5*std
                    )
            
            # Store with fuel type in name
            key = f'fuel_{fuel_type.lower()}'
            split_data[key] = fuel_df
            logger.info(f"   ✅ {key}: {len(fuel_df)} rows, {len(fuel_df.columns)} columns")
        
        return split_data
    
    def _clean_timeseries(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean time-series datasets (freight, macro)
        
        Steps:
        1. Ensure date column exists and is datetime
        2. Set date as index
        3. Resample to daily frequency (forward-fill)
        4. Remove outliers (clip beyond 5 std)
        """
        df_clean = df.copy()
        
        # Ensure date column is datetime
        if 'date' in df_clean.columns:
            df_clean['date'] = pd.to_datetime(df_clean['date'])
            df_clean = df_clean.sort_values('date').reset_index(drop=True)
        else:
            logger.warning("   ⚠️  No date column found, skipping resampling")
            return df_clean
        
        # Set date as index for resampling
        df_clean = df_clean.set_index('date')
        
        # Resample to daily frequency (forward-fill)
        df_clean = df_clean.resample('D').ffill()
        
        # Remove outliers (clip beyond 5 std deviations)
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            mean = df_clean[col].mean()
            std = df_clean[col].std()
            if std > 0:
                df_clean[col] = df_clean[col].clip(
                    lower=mean - 5*std,
                    upper=mean + 5*std
                )
        
        # Reset index to make date a column again
        df_clean = df_clean.reset_index()
        
        return df_clean
    
    def _clean_static(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean static datasets (ports, vessels, routes)
        
        Steps:
        1. Remove duplicates
        2. Strip whitespace from string columns
        """
        df_clean = df.copy()
        
        # Remove duplicates
        df_clean = df_clean.drop_duplicates().reset_index(drop=True)
        
        # Strip whitespace from string columns
        str_cols = df_clean.select_dtypes(include=['object', 'string']).columns
        for col in str_cols:
            df_clean[col] = df_clean[col].astype(str).str.strip()
        
        return df_clean
    
    def _clean_disruptions(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean disruption events dataset
        
        Steps:
        1. Ensure event_date is datetime
        2. Sort by date
        3. Fill missing impact_days with median
        """
        df_clean = df.copy()
        
        # Ensure event_date is datetime
        if 'event_date' in df_clean.columns:
            df_clean['event_date'] = pd.to_datetime(df_clean['event_date'])
            df_clean = df_clean.sort_values('event_date').reset_index(drop=True)
        
        # Fill missing impact_days with median
        if 'impact_days' in df_clean.columns:
            median_days = df_clean['impact_days'].median()
            df_clean['impact_days'] = df_clean['impact_days'].fillna(median_days)
        
        return df_clean
    
    def _clean_port_timeseries(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean port time-series datasets (congestion, weather)
        
        Steps:
        1. Ensure date is datetime
        2. Sort by port and date
        3. Forward-fill missing values per port
        """
        df_clean = df.copy()
        
        # Ensure date is datetime
        if 'date' in df_clean.columns:
            df_clean['date'] = pd.to_datetime(df_clean['date'])
        else:
            logger.warning("   ⚠️  No date column found")
            return df_clean
        
        # Sort by port and date
        if 'port_name' in df_clean.columns:
            df_clean = df_clean.sort_values(['port_name', 'date']).reset_index(drop=True)
            
            # Forward-fill per port
            numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                df_clean[col] = df_clean.groupby('port_name')[col].ffill()
        
        return df_clean
    
    def get(self, key: str) -> Optional[pd.DataFrame]:
        """Get a cleaned dataset by key"""
        return self.cleaned_data.get(key)
    
    def list_datasets(self) -> list:
        """List all available cleaned dataset keys"""
        return list(self.cleaned_data.keys())


def test_cleaner():
    """Test the DataCleaner"""
    from .data_loader import DataLoader
    
    logger.info("\n" + "=" * 60)
    logger.info("🧪 Testing Data Cleaner")
    logger.info("=" * 60)
    
    # Load raw data
    loader = DataLoader()
    raw_data = loader.load_all()
    
    # Clean data
    cleaner = DataCleaner()
    cleaned_data = cleaner.clean_all(raw_data)
    
    # Print summary
    logger.info("\n📊 Cleaned Dataset Summary:")
    for key, df in cleaned_data.items():
        logger.info(f"  {key:25s} : {len(df):>6,} rows, {len(df.columns):>3} columns")
    
    logger.info("\n📊 Sample of cleaned fuel_vlsfo:")
    fuel_vlsfo = cleaner.get('fuel_vlsfo')
    if fuel_vlsfo is not None and not fuel_vlsfo.empty:
        print(fuel_vlsfo[['date', 'vlsfo_price_usd']].head(10).to_string())
    
    logger.info("\n📊 Sample of cleaned fuel_hsfo:")
    fuel_hsfo = cleaner.get('fuel_hsfo')
    if fuel_hsfo is not None and not fuel_hsfo.empty:
        print(fuel_hsfo[['date', 'hsfo_price_usd']].head(10).to_string())
    
    logger.info("\n✅ Data Cleaner test completed successfully!")
    return cleaner


if __name__ == "__main__":
    test_cleaner()