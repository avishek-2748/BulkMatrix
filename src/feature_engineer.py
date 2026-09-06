"""
Feature Matrix Builder
Merges all cleaned datasets, engineers features, and creates target variables
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional, List
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Builds the complete feature matrix from cleaned datasets"""
    
    def __init__(self, processed_path: str = "data/processed",
                 features_path: str = "data/features"):
        self.processed_path = Path(processed_path)
        self.features_path = Path(features_path)
        self.processed_path.mkdir(parents=True, exist_ok=True)
        self.features_path.mkdir(parents=True, exist_ok=True)
        self.feature_columns = []
        
    def build(self, cleaned_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        logger.info("=" * 70)
        logger.info("🚀 Starting Feature Matrix Builder")
        logger.info("=" * 70)
        
        # Step 1: Merge time-series data
        logger.info("\n📊 Step 1: Merging time-series data...")
        merged = self._merge_timeseries(cleaned_data)
        logger.info(f"   ✅ Merged: {len(merged)} rows, {len(merged.columns)} columns")
        
        # Step 1.5: Clean numeric columns
        logger.info("\n📊 Step 1.5: Cleaning numeric columns...")
        merged = self._clean_numeric_columns(merged)
        logger.info(f"   ✅ Cleaned numeric columns")
        
        merged.to_csv(self.processed_path / "merged_timeseries.csv", index=False)
        logger.info(f"   💾 Saved: {self.processed_path / 'merged_timeseries.csv'}")
        
        # Step 2: Add temporal features
        logger.info("\n📊 Step 2: Adding temporal features...")
        merged = self._add_temporal_features(merged)
        logger.info(f"   ✅ Added temporal features: {len(merged.columns)} columns total")
        
        # Step 3: Add lag features
        logger.info("\n📊 Step 3: Adding lag features...")
        merged = self._add_lag_features(merged)
        logger.info(f"   ✅ Added lag features: {len(merged.columns)} columns total")
        
        # Step 4: Add rolling statistics
        logger.info("\n📊 Step 4: Adding rolling statistics...")
        merged = self._add_rolling_features(merged)
        logger.info(f"   ✅ Added rolling features: {len(merged.columns)} columns total")
        
        # Step 5: Add ratio features
        logger.info("\n📊 Step 5: Adding ratio features...")
        merged = self._add_ratio_features(merged)
        logger.info(f"   ✅ Added ratio features: {len(merged.columns)} columns total")
        
        # Step 6: Create target variables
        logger.info("\n📊 Step 6: Creating target variables...")
        merged = self._create_targets(merged)
        logger.info(f"   ✅ Created targets: {len(merged.columns)} columns total")
        
        # Step 7: Expand to route-level
        logger.info("\n📊 Step 7: Expanding to route-level...")
        if 'routes' in cleaned_data and 'ports' in cleaned_data:
            merged = self._expand_to_routes(merged, cleaned_data)
            logger.info(f"   ✅ Expanded: {len(merged)} rows, {len(merged.columns)} columns")
        else:
            logger.warning("   ⚠️  Routes or ports data not found, skipping expansion")
        
        # Step 8: Clean final dataset
        logger.info("\n📊 Step 8: Cleaning final dataset...")
        merged = self._clean_final(merged)
        logger.info(f"   ✅ Final shape: {merged.shape}")
        
        # Step 9: Save feature matrix
        logger.info("\n📊 Step 9: Saving feature matrix...")
        self._save_feature_matrix(merged)
        
        logger.info("\n" + "=" * 70)
        logger.info("✅ Feature Matrix Builder Complete!")
        logger.info(f"   📊 Final shape: {merged.shape}")
        logger.info(f"   📅 Date range: {merged['date'].min()} to {merged['date'].max()}")
        logger.info(f"   🛤️  Routes: {merged['route_id'].nunique() if 'route_id' in merged.columns else 0}")
        logger.info("=" * 70)
        
        return merged
    
    def _clean_numeric_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean numeric columns: remove commas, convert to float"""
        df_clean = df.copy()
        
        for col in df_clean.columns:
            if df_clean[col].dtype == 'object':
                try:
                    df_clean[col] = df_clean[col].astype(str).str.replace(',', '').str.strip()
                    df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
                except:
                    pass
        
        # Second pass for any remaining object columns
        for col in df_clean.columns:
            if df_clean[col].dtype == 'object':
                try:
                    df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
                except:
                    pass
        
        return df_clean
    
    def _merge_timeseries(self, cleaned_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """Merge all time-series datasets by date"""
        if 'freight_bdi' not in cleaned_data:
            raise ValueError("freight_bdi dataset not found in cleaned_data")
        
        bdi = cleaned_data['freight_bdi'].copy()
        bdi_cols = ['date', 'bdi_score']
        if 'change_%' in bdi.columns:
            bdi_cols.append('change_%')
        bdi = bdi[bdi_cols]
        merged = bdi
        logger.info(f"   Started with freight_bdi: {len(merged)} rows")
        
        dataset_configs = {
            'freight_proxies': ['date', 'capesize_proxy_gnk', 'panamax_proxy_edry', 'supramax_proxy_sblk'],
            'macro_brent': ['date', 'brent_price'],
            'macro_coal': ['date', 'coal_price'],
            'macro_dxy': ['date', 'dxy'],
            'macro_iron_ore': ['date', 'iron_ore_price'],
            'macro_usd_inr': ['date', 'usd_inr_rate'],
            'fuel_hsfo': ['date', 'hsfo_price_usd'],
            'fuel_vlsfo': ['date', 'vlsfo_price_usd']
        }
        
        for name, cols in dataset_configs.items():
            if name in cleaned_data and not cleaned_data[name].empty:
                df = cleaned_data[name].copy()
                if 'date' in df.columns:
                    available_cols = [col for col in cols if col in df.columns]
                    if available_cols:
                        df = df[available_cols]
                        merged = pd.merge(merged, df, on='date', how='outer')
                        logger.info(f"   Merged {name}: {len(df)} rows → {len(merged)} rows")
        
        merged = merged.sort_values('date').reset_index(drop=True)
        merged = merged.set_index('date').ffill().reset_index()
        return merged
    
    def _add_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df_clean = df.copy()
        df_clean['date'] = pd.to_datetime(df_clean['date'])
        df_clean['day_of_week'] = df_clean['date'].dt.dayofweek
        df_clean['month'] = df_clean['date'].dt.month
        df_clean['quarter'] = df_clean['date'].dt.quarter
        df_clean['year'] = df_clean['date'].dt.year
        df_clean['day_of_year'] = df_clean['date'].dt.dayofyear
        df_clean['is_weekend'] = (df_clean['day_of_week'] >= 5).astype(int)
        df_clean['is_month_end'] = df_clean['date'].dt.is_month_end.astype(int)
        df_clean['is_quarter_end'] = df_clean['date'].dt.is_quarter_end.astype(int)
        df_clean['month_sin'] = np.sin(2 * np.pi * df_clean['month'] / 12)
        df_clean['month_cos'] = np.cos(2 * np.pi * df_clean['month'] / 12)
        df_clean['dow_sin'] = np.sin(2 * np.pi * df_clean['day_of_week'] / 7)
        df_clean['dow_cos'] = np.cos(2 * np.pi * df_clean['day_of_week'] / 7)
        return df_clean
    
    def _add_lag_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df_clean = df.copy()
        key_cols = [
            'bdi_score', 'change_%',
            'brent_price', 'coal_price', 'iron_ore_price',
            'dxy', 'usd_inr_rate', 
            'vlsfo_price_usd', 'hsfo_price_usd',
            'capesize_proxy_gnk', 'panamax_proxy_edry', 'supramax_proxy_sblk'
        ]
        existing_cols = []
        for col in key_cols:
            if col in df_clean.columns and pd.api.types.is_numeric_dtype(df_clean[col]):
                existing_cols.append(col)
        lags = [1, 3, 7, 14, 30]
        for col in existing_cols:
            for lag in lags:
                df_clean[f'{col}_lag_{lag}d'] = df_clean[col].shift(lag)
        return df_clean
    
    def _add_rolling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df_clean = df.copy()
        key_cols = [
            'bdi_score', 'brent_price', 'coal_price', 'iron_ore_price',
            'dxy', 'usd_inr_rate', 'vlsfo_price_usd',
            'capesize_proxy_gnk', 'panamax_proxy_edry', 'supramax_proxy_sblk'
        ]
        existing_cols = []
        for col in key_cols:
            if col in df_clean.columns and pd.api.types.is_numeric_dtype(df_clean[col]):
                existing_cols.append(col)
        windows = [7, 14, 30, 60, 90]
        for col in existing_cols:
            for window in windows:
                if window <= len(df_clean):
                    df_clean[f'{col}_sma_{window}d'] = df_clean[col].rolling(window=window).mean()
                    df_clean[f'{col}_ema_{window}d'] = df_clean[col].ewm(span=window, adjust=False).mean()
                    df_clean[f'{col}_volatility_{window}d'] = df_clean[col].rolling(window=window).std()
                    df_clean[f'{col}_roc_{window}d'] = df_clean[col].pct_change(periods=window) * 100
                    df_clean[f'{col}_range_{window}d'] = (
                        df_clean[col].rolling(window=window).max() - 
                        df_clean[col].rolling(window=window).min()
                    )
        return df_clean
    
    def _add_ratio_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df_clean = df.copy()
        
        def is_numeric_col(col):
            return col in df_clean.columns and pd.api.types.is_numeric_dtype(df_clean[col])
        
        if is_numeric_col('vlsfo_price_usd') and is_numeric_col('coal_price'):
            df_clean['vlsfo_coal_ratio'] = df_clean['vlsfo_price_usd'] / df_clean['coal_price']
        
        if is_numeric_col('vlsfo_price_usd') and is_numeric_col('iron_ore_price'):
            df_clean['vlsfo_iron_ratio'] = df_clean['vlsfo_price_usd'] / df_clean['iron_ore_price']
        
        if is_numeric_col('capesize_proxy_gnk') and is_numeric_col('bdi_score'):
            df_clean['cape_bdi_ratio'] = df_clean['capesize_proxy_gnk'] / df_clean['bdi_score']
        
        if is_numeric_col('panamax_proxy_edry') and is_numeric_col('bdi_score'):
            df_clean['pana_bdi_ratio'] = df_clean['panamax_proxy_edry'] / df_clean['bdi_score']
        
        if is_numeric_col('supramax_proxy_sblk') and is_numeric_col('bdi_score'):
            df_clean['supra_bdi_ratio'] = df_clean['supramax_proxy_sblk'] / df_clean['bdi_score']
        
        if is_numeric_col('dxy'):
            df_clean['dxy_inverse'] = 1 / df_clean['dxy']
        
        if is_numeric_col('vlsfo_price_usd') and is_numeric_col('hsfo_price_usd'):
            df_clean['vlsfo_hsfo_spread'] = df_clean['vlsfo_price_usd'] - df_clean['hsfo_price_usd']
            df_clean['vlsfo_hsfo_ratio'] = df_clean['vlsfo_price_usd'] / df_clean['hsfo_price_usd']
        
        return df_clean
    
    def _create_targets(self, df: pd.DataFrame) -> pd.DataFrame:
        df_clean = df.copy()
        horizons = [15, 30, 90]
        for horizon in horizons:
            df_clean[f'target_bdi_{horizon}d'] = df_clean['bdi_score'].shift(-horizon)
        return df_clean
    
    def _expand_to_routes(self, df: pd.DataFrame, cleaned_data: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        routes = cleaned_data.get('routes', pd.DataFrame())
        ports = cleaned_data.get('ports', pd.DataFrame())
        if routes.empty or ports.empty:
            logger.warning("   Routes or ports data empty, skipping route expansion")
            return df
        
        route_list = []
        for _, route in routes.iterrows():
            origin = route.get('origin_port', '')
            dest = route.get('destination_port', '')
            distance = route.get('distance_nm', 0)
            route_type = route.get('route_type', '')
            
            route_df = df.copy()
            route_df['origin_port'] = origin
            route_df['destination_port'] = dest
            route_df['route_id'] = f"{origin}_{dest}"
            route_df['distance_nm'] = distance
            route_df['route_type'] = route_type
            route_df['expected_sailing_days'] = distance / (14 * 24)
            
            origin_port = ports[ports['port_name'] == origin]
            if not origin_port.empty:
                route_df['origin_max_draft_m'] = origin_port.iloc[0].get('max_draft_m', 0)
                route_df['origin_max_loa_m'] = origin_port.iloc[0].get('max_loa_m', 0)
                route_df['origin_max_beam_m'] = origin_port.iloc[0].get('max_beam_m', 0)
                if 'loading_rate_tpd' in origin_port.columns:
                    route_df['origin_loading_rate_tpd'] = origin_port.iloc[0].get('loading_rate_tpd', 0)
                elif 'discharge_rate_tpd' in origin_port.columns:
                    route_df['origin_loading_rate_tpd'] = origin_port.iloc[0].get('discharge_rate_tpd', 0)
            
            dest_port = ports[ports['port_name'] == dest]
            if not dest_port.empty:
                route_df['dest_max_draft_m'] = dest_port.iloc[0].get('max_draft_m', 0)
                route_df['dest_max_loa_m'] = dest_port.iloc[0].get('max_loa_m', 0)
                route_df['dest_max_beam_m'] = dest_port.iloc[0].get('max_beam_m', 0)
                if 'discharge_rate_tpd' in dest_port.columns:
                    route_df['dest_discharge_rate_tpd'] = dest_port.iloc[0].get('discharge_rate_tpd', 0)
                elif 'loading_rate_tpd' in dest_port.columns:
                    route_df['dest_discharge_rate_tpd'] = dest_port.iloc[0].get('loading_rate_tpd', 0)
            
            if 'congestion' in cleaned_data:
                cong = cleaned_data['congestion']
                dest_cong = cong[cong['port_name'] == dest].copy()
                if not dest_cong.empty:
                    dest_cong = dest_cong[['date', 'waiting_days_at_anchorage', 'waiting_days_at_berth', 'turn_around_time_days']]
                    dest_cong.columns = ['date', 'dest_waiting_anchorage', 'dest_waiting_berth', 'dest_turn_around_days']
                    route_df = pd.merge(route_df, dest_cong, on='date', how='left')
                
                origin_cong = cong[cong['port_name'] == origin].copy()
                if not origin_cong.empty:
                    origin_cong = origin_cong[['date', 'waiting_days_at_anchorage', 'waiting_days_at_berth', 'turn_around_time_days']]
                    origin_cong.columns = ['date', 'origin_waiting_anchorage', 'origin_waiting_berth', 'origin_turn_around_days']
                    route_df = pd.merge(route_df, origin_cong, on='date', how='left')
            
            if 'weather' in cleaned_data:
                weather = cleaned_data['weather']
                dest_weather = weather[weather['port_name'] == dest].copy()
                if not dest_weather.empty:
                    dest_weather = dest_weather[['date', 'monsoon_risk_level', 'cyclone_risk_level', 'typical_disruption_days']]
                    dest_weather.columns = ['date', 'dest_monsoon_risk', 'dest_cyclone_risk', 'dest_disruption_days']
                    route_df = pd.merge(route_df, dest_weather, on='date', how='left')
            
            route_list.append(route_df)
        
        if route_list:
            final_df = pd.concat(route_list, ignore_index=True)
        else:
            return df
        
        if 'disruptions' in cleaned_data:
            disruptions = cleaned_data['disruptions']
            final_df['dest_disruption_flag'] = 0
            final_df['origin_disruption_flag'] = 0
            for _, dis in disruptions.iterrows():
                port = dis.get('port_name', '')
                event_date = dis.get('event_date')
                impact_days = dis.get('impact_days', 0)
                if event_date is not None and pd.notna(event_date):
                    mask_dest = (
                        (final_df['destination_port'] == port) &
                        (final_df['date'] >= event_date) &
                        (final_df['date'] < event_date + pd.Timedelta(days=int(impact_days)))
                    )
                    final_df.loc[mask_dest, 'dest_disruption_flag'] = 1
                    mask_origin = (
                        (final_df['origin_port'] == port) &
                        (final_df['date'] >= event_date) &
                        (final_df['date'] < event_date + pd.Timedelta(days=int(impact_days)))
                    )
                    final_df.loc[mask_origin, 'origin_disruption_flag'] = 1
        
        return final_df
    
    def _clean_final(self, df: pd.DataFrame) -> pd.DataFrame:
        df_clean = df.copy()
        target_cols = [col for col in df_clean.columns if col.startswith('target_')]
        if target_cols:
            df_clean = df_clean.dropna(subset=target_cols, how='all')
        df_clean = df_clean.dropna(how='all')
        if 'route_id' in df_clean.columns and 'date' in df_clean.columns:
            df_clean = df_clean.sort_values(['route_id', 'date']).reset_index(drop=True)
        elif 'date' in df_clean.columns:
            df_clean = df_clean.sort_values('date').reset_index(drop=True)
        return df_clean
    
    def _save_feature_matrix(self, df: pd.DataFrame):
        csv_path = self.features_path / "ml_feature_matrix.csv"
        df.to_csv(csv_path, index=False)
        logger.info(f"   💾 Saved CSV: {csv_path}")
        try:
            parquet_path = self.features_path / "ml_feature_matrix.parquet"
            df.to_parquet(parquet_path, index=False)
            logger.info(f"   💾 Saved Parquet: {parquet_path}")
        except ImportError:
            logger.warning("   ⚠️  pyarrow not installed, skipping parquet save")
        
        import json
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
        logger.info(f"   💾 Saved metadata: {metadata_path}")


def test_feature_engineer():
    from .data_loader import DataLoader
    from .data_cleaner import DataCleaner
    
    logger.info("\n" + "=" * 70)
    logger.info("🧪 Testing Feature Matrix Builder")
    logger.info("=" * 70)
    
    loader = DataLoader()
    raw_data = loader.load_all()
    
    cleaner = DataCleaner()
    cleaned_data = cleaner.clean_all(raw_data)
    
    engineer = FeatureEngineer()
    feature_matrix = engineer.build(cleaned_data)
    
    logger.info("\n📊 Feature Matrix Summary:")
    logger.info(f"   Shape: {feature_matrix.shape}")
    logger.info(f"   Columns: {len(feature_matrix.columns)}")
    logger.info(f"   Date range: {feature_matrix['date'].min()} to {feature_matrix['date'].max()}")
    
    sample_cols = ['date', 'route_id', 'bdi_score', 'target_bdi_15d', 'target_bdi_30d', 'target_bdi_90d']
    available_cols = [col for col in sample_cols if col in feature_matrix.columns]
    logger.info(f"\n📊 Sample data:")
    if available_cols:
        print(feature_matrix[available_cols].head(10).to_string())
    
    logger.info("\n✅ Feature Matrix Builder test completed!")
    return feature_matrix


if __name__ == "__main__":
    test_feature_engineer()