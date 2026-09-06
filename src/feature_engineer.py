"""
Feature Matrix Builder
Merges all cleaned datasets, engineers features, and creates target variables
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional, List
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Builds the complete feature matrix from cleaned datasets"""
    
    def __init__(self, processed_path: str = "data/processed",
                 features_path: str = "data/features"):
        """
        Initialize FeatureEngineer
        
        Args:
            processed_path: Path to save processed intermediate files
            features_path: Path to save final feature matrix
        """
        self.processed_path = Path(processed_path)
        self.features_path = Path(features_path)
        
        # Create directories
        self.processed_path.mkdir(parents=True, exist_ok=True)
        self.features_path.mkdir(parents=True, exist_ok=True)
        
        self.feature_columns = []
        
    def build(self, cleaned_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Build the complete feature matrix
        
        Args:
            cleaned_data: Dictionary of cleaned DataFrames from DataCleaner
            
        Returns:
            Complete feature matrix DataFrame
        """
        logger.info("=" * 70)
        logger.info("Starting Feature Matrix Builder")
        logger.info("=" * 70)
        
        # Step 1: Merge time-series data
        logger.info("\n📊 Step 1: Merging time-series data...")
        merged = self._merge_timeseries(cleaned_data)
        logger.info(f"   ✅ Merged: {len(merged)} rows, {len(merged.columns)} columns")
        
        # Save merged data
        merged.to_csv(self.processed_path / "merged_timeseries.csv", index=False)
        
        # Step 2: Add temporal features
        logger.info("\n📊 Step 2: Adding temporal features...")
        merged = self._add_temporal_features(merged)
        logger.info(f"   ✅ Added temporal features: {len(merged.columns)} columns total")
        
        # Step 3: Add lag features
        logger.info("\n📊 Step 3: Adding lag features...")
        merged = self._add_lag_features(merged)
        logger.info(f"   ✅ Added lag features: {len(merged.columns)} columns total")
        
        # Step 4: Add rolling statistics (SMA, EMA, volatility)
        logger.info("\n📊 Step 4: Adding rolling statistics...")
        merged = self._add_rolling_features(merged)
        logger.info(f"   ✅ Added rolling features: {len(merged.columns)} columns total")
        
        # Step 5: Create target variables
        logger.info("\n📊 Step 5: Creating target variables...")
        merged = self._create_targets(merged)
        logger.info(f"   ✅ Created targets: {len(merged.columns)} columns total")
        
        # Step 6: Expand to route-level
        logger.info("\n📊 Step 6: Expanding to route-level...")
        if 'routes' in cleaned_data and 'ports' in cleaned_data:
            merged = self._expand_to_routes(merged, cleaned_data)
            logger.info(f"   ✅ Expanded: {len(merged)} rows, {len(merged.columns)} columns")
        else:
            logger.warning("   ⚠️  Routes or ports data not found, skipping expansion")
        
        # Step 7: Save final feature matrix
        logger.info("\n📊 Step 7: Saving feature matrix...")
        self._save_feature_matrix(merged)
        
        logger.info("\n" + "=" * 70)
        logger.info("✅ Feature Matrix Builder Complete!")
        logger.info(f"   Final shape: {merged.shape}")
        logger.info(f"   Date range: {merged['date'].min()} to {merged['date'].max()}")
        logger.info("=" * 70)
        
        return merged
    
    def _merge_timeseries(self, cleaned_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Merge all time-series datasets by date
        """
        # Start with freight_bdi
        if 'freight_bdi' not in cleaned_data:
            raise ValueError("freight_bdi dataset not found in cleaned_data")
        
        merged = cleaned_data['freight_bdi'].copy()
        logger.info(f"   Started with freight_bdi: {len(merged)} rows")
        
        # List of time-series datasets to merge
        ts_datasets = [
            'freight_proxies',
            'macro_brent',
            'macro_coal',
            'macro_dxy',
            'macro_iron_ore',
            'macro_usd_inr',
            'fuel_hsfo',
            'fuel_vlsfo'
        ]
        
        for name in ts_datasets:
            if name in cleaned_data and not cleaned_data[name].empty:
                df = cleaned_data[name].copy()
                
                # Ensure date column exists
                if 'date' in df.columns:
                    # Merge on date
                    merged = pd.merge(merged, df, on='date', how='outer')
                    logger.info(f"   Merged {name}: {len(df)} rows → {len(merged)} rows")
                else:
                    logger.warning(f"   ⚠️  {name} has no date column, skipping")
        
        # Sort by date
        merged = merged.sort_values('date').reset_index(drop=True)
        
        # Forward-fill any remaining gaps (should be minimal)
        merged = merged.set_index('date').ffill().reset_index()
        
        return merged
    
    def _add_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add temporal features: day_of_week, month, quarter, year, cyclical encodings
        """
        df_clean = df.copy()
        
        # Ensure date is datetime
        df_clean['date'] = pd.to_datetime(df_clean['date'])
        
        # Basic temporal features
        df_clean['day_of_week'] = df_clean['date'].dt.dayofweek  # Monday=0, Sunday=6
        df_clean['month'] = df_clean['date'].dt.month
        df_clean['quarter'] = df_clean['date'].dt.quarter
        df_clean['year'] = df_clean['date'].dt.year
        df_clean['day_of_year'] = df_clean['date'].dt.dayofyear
        
        # Weekend flag
        df_clean['is_weekend'] = (df_clean['day_of_week'] >= 5).astype(int)
        
        # Month-end and quarter-end flags
        df_clean['is_month_end'] = df_clean['date'].dt.is_month_end.astype(int)
        df_clean['is_quarter_end'] = df_clean['date'].dt.is_quarter_end.astype(int)
        
        # Cyclical encoding for month (sin/cos)
        df_clean['month_sin'] = np.sin(2 * np.pi * df_clean['month'] / 12)
        df_clean['month_cos'] = np.cos(2 * np.pi * df_clean['month'] / 12)
        
        # Cyclical encoding for day of week (sin/cos)
        df_clean['dow_sin'] = np.sin(2 * np.pi * df_clean['day_of_week'] / 7)
        df_clean['dow_cos'] = np.cos(2 * np.pi * df_clean['day_of_week'] / 7)
        
        return df_clean
    
    def _add_lag_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add lag features for key columns
        """
        df_clean = df.copy()
        
        # Identify key columns for lag features
        key_cols = ['bdi_score', 'brent_price', 'coal_price', 'iron_ore_price',
                   'dxy', 'usd_inr_rate', 'vlsfo_price_usd', 'hsfo_price_usd',
                   'cape_proxy', 'pana_proxy', 'supra_proxy']
        
        # Filter to columns that actually exist
        existing_cols = [col for col in key_cols if col in df_clean.columns]
        
        # Lags to create: 1, 3, 7, 14, 30 days
        lags = [1, 3, 7, 14, 30]
        
        for col in existing_cols:
            for lag in lags:
                df_clean[f'{col}_lag_{lag}d'] = df_clean[col].shift(lag)
        
        return df_clean
    
    def _add_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add rolling statistics: SMA, EMA, volatility
        """
        df_clean = df.copy()
        
        # Key columns for rolling features
        key_cols = ['bdi_score', 'brent_price', 'coal_price', 'iron_ore_price',
                   'dxy', 'usd_inr_rate', 'vlsfo_price_usd']
        
        existing_cols = [col for col in key_cols if col in df_clean.columns]
        
        # Windows: 7, 14, 30, 60, 90 days
        windows = [7, 14, 30, 60, 90]
        
        for col in existing_cols:
            for window in windows:
                # Simple Moving Average
                df_clean[f'{col}_sma_{window}d'] = df_clean[col].rolling(window=window).mean()
                
                # Exponential Moving Average
                df_clean[f'{col}_ema_{window}d'] = df_clean[col].ewm(span=window, adjust=False).mean()
                
                # Volatility (rolling standard deviation)
                df_clean[f'{col}_volatility_{window}d'] = df_clean[col].rolling(window=window).std()
                
                # Rate of Change
                df_clean[f'{col}_roc_{window}d'] = df_clean[col].pct_change(periods=window) * 100
        
        return df_clean
    
    def _create_targets(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create target variables: 15-day, 30-day, 90-day ahead BDI
        """
        df_clean = df.copy()
        
        # Target horizons
        horizons = [15, 30, 90]
        
        for horizon in horizons:
            df_clean[f'target_bdi_{horizon}d'] = df_clean['bdi_score'].shift(-horizon)
        
        return df_clean
    
    def _expand_to_routes(self, df: pd.DataFrame, 
                         cleaned_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Expand the feature matrix to route-level (origin-destination pairs)
        """
        # Get routes and ports data
        routes = cleaned_data.get('routes', pd.DataFrame())
        ports = cleaned_data.get('ports', pd.DataFrame())
        
        if routes.empty or ports.empty:
            logger.warning("   Routes or ports data empty, skipping route expansion")
            return df
        
        # Create a base route for each origin-destination pair
        route_list = []
        
        for _, route in routes.iterrows():
            origin = route.get('origin_port', '')
            dest = route.get('destination_port', '')
            distance = route.get('distance_nm', 0)
            sailing_days = route.get('expected_sailing_days', 0)
            
            # Create a copy of the time-series for this route
            route_df = df.copy()
            
            # Add route-specific features
            route_df['origin_port'] = origin
            route_df['destination_port'] = dest
            route_df['route_id'] = f"{origin}_{dest}"
            route_df['distance_nm'] = distance
            route_df['expected_sailing_days'] = sailing_days
            
            # Add origin port constraints
            origin_port = ports[ports['port_name'] == origin]
            if not origin_port.empty:
                route_df['origin_max_draft_m'] = origin_port.iloc[0].get('max_draft_m', 0)
                route_df['origin_max_loa_m'] = origin_port.iloc[0].get('max_loa_m', 0)
                route_df['origin_max_beam_m'] = origin_port.iloc[0].get('max_beam_m', 0)
                route_df['origin_loading_rate_tpd'] = origin_port.iloc[0].get('loading_rate_tpd', 0)
            
            # Add destination port constraints
            dest_port = ports[ports['port_name'] == dest]
            if not dest_port.empty:
                route_df['dest_max_draft_m'] = dest_port.iloc[0].get('max_draft_m', 0)
                route_df['dest_max_loa_m'] = dest_port.iloc[0].get('max_loa_m', 0)
                route_df['dest_max_beam_m'] = dest_port.iloc[0].get('max_beam_m', 0)
                route_df['dest_discharge_rate_tpd'] = dest_port.iloc[0].get('discharge_rate_tpd', 0)
            
            # Add congestion data for destination port
            if 'congestion' in cleaned_data:
                cong = cleaned_data['congestion']
                dest_cong = cong[cong['port_name'] == dest].copy()
                if not dest_cong.empty:
                    dest_cong = dest_cong[['date', 'waiting_days_at_anchorage', 'waiting_days_at_berth']]
                    dest_cong.columns = ['date', 'dest_waiting_anchorage', 'dest_waiting_berth']
                    route_df = pd.merge(route_df, dest_cong, on='date', how='left')
            
            # Add weather risk data
            if 'weather' in cleaned_data:
                weather = cleaned_data['weather']
                dest_weather = weather[weather['port_name'] == dest].copy()
                if not dest_weather.empty:
                    dest_weather = dest_weather[['date', 'monsoon_risk_level', 'cyclone_risk_level']]
                    dest_weather.columns = ['date', 'dest_monsoon_risk', 'dest_cyclone_risk']
                    route_df = pd.merge(route_df, dest_weather, on='date', how='left')
            
            route_list.append(route_df)
        
        # Combine all routes
        final_df = pd.concat(route_list, ignore_index=True)
        
        # Add disruption flag
        if 'disruptions' in cleaned_data:
            disruptions = cleaned_data['disruptions']
            final_df['dest_disruption_flag'] = 0
            
            for _, dis in disruptions.iterrows():
                port = dis.get('port_name', '')
                event_date = dis.get('event_date')
                impact_days = dis.get('impact_days', 0)
                
                if event_date is not None and pd.notna(event_date):
                    mask = (
                        (final_df['destination_port'] == port) &
                        (final_df['date'] >= event_date) &
                        (final_df['date'] < event_date + pd.Timedelta(days=int(impact_days)))
                    )
                    final_df.loc[mask, 'dest_disruption_flag'] = 1
        
        return final_df
    
    def _save_feature_matrix(self, df: pd.DataFrame):
        """Save the final feature matrix"""
        
        # Save as CSV
        csv_path = self.features_path / "ml_feature_matrix.csv"
        df.to_csv(csv_path, index=False)
        logger.info(f"   ✅ Saved CSV: {csv_path}")
        
        # Save as Parquet (faster loading)
        try:
            parquet_path = self.features_path / "ml_feature_matrix.parquet"
            df.to_parquet(parquet_path, index=False)
            logger.info(f"   ✅ Saved Parquet: {parquet_path}")
        except ImportError:
            logger.warning("   ⚠️  pyarrow not installed, skipping parquet save")
        
        # Save metadata
        import json
        from datetime import datetime
        
        metadata = {
            'created_at': datetime.now().isoformat(),
            'shape': list(df.shape),
            'date_range': f"{df['date'].min()} to {df['date'].max()}",
            'num_routes': df['route_id'].nunique() if 'route_id' in df.columns else 0,
            'num_features': len(df.columns),
            'columns': df.columns.tolist()
        }
        
        metadata_path = self.features_path / "feature_matrix_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        logger.info(f"   ✅ Saved metadata: {metadata_path}")


def test_feature_engineer():
    """Test the FeatureEngineer"""
    from .data_loader import DataLoader
    from .data_cleaner import DataCleaner
    
    logger.info("\n" + "=" * 70)
    logger.info("🧪 Testing Feature Matrix Builder")
    logger.info("=" * 70)
    
    # Step 1: Load raw data
    loader = DataLoader()
    raw_data = loader.load_all()
    
    # Step 2: Clean data
    cleaner = DataCleaner()
    cleaned_data = cleaner.clean_all(raw_data)
    
    # Step 3: Build feature matrix
    engineer = FeatureEngineer()
    feature_matrix = engineer.build(cleaned_data)
    
    # Print summary
    logger.info("\n📊 Feature Matrix Summary:")
    logger.info(f"   Shape: {feature_matrix.shape}")
    logger.info(f"   Columns: {len(feature_matrix.columns)}")
    logger.info(f"   Date range: {feature_matrix['date'].min()} to {feature_matrix['date'].max()}")
    
    # Show sample columns
    sample_cols = ['date', 'route_id', 'bdi_score', 'target_bdi_30d']
    available_cols = [col for col in sample_cols if col in feature_matrix.columns]
    logger.info(f"\n📊 Sample data:")
    print(feature_matrix[available_cols].head(10).to_string())
    
    logger.info("\n✅ Feature Matrix Builder test completed!")
    return feature_matrix


if __name__ == "__main__":
    test_feature_engineer()