"""
Model Comparison Dashboard
Generates visualizations comparing all forecasting models
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json
import logging
import warnings
warnings.filterwarnings('ignore')

# Set style
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelDashboard:
    """Generate comparison dashboard for all models"""
    
    def __init__(self, output_path: str = "reports/dashboard"):
        self.output_path = Path(output_path)
        self.output_path.mkdir(parents=True, exist_ok=True)
        
        # Colors for models
        self.colors = {
            'Prophet': '#FF6B6B',
            'XGBoost': '#4ECDC4',
            'CatBoost': '#45B7D1',
            'LightGBM': '#96CEB4',
            'SARIMAX': '#FFEAA7',
            'LinearRegression': '#DDA0DD'
        }
        
        # Model order for consistent display
        self.model_order = ['Prophet', 'XGBoost', 'CatBoost', 'LightGBM', 'SARIMAX', 'LinearRegression']
    
    def load_results(self):
        """Load all model results"""
        results = {}
        
        # Load baseline results
        baseline_path = Path("models/baseline/baseline_results.csv")
        if baseline_path.exists():
            df_baseline = pd.read_csv(baseline_path)
            results['baseline'] = df_baseline
            logger.info(f"✅ Loaded baseline results: {len(df_baseline)} rows")
        
        # Load ensemble results
        ensemble_path = Path("models/ensemble/ensemble_results.csv")
        if ensemble_path.exists():
            df_ensemble = pd.read_csv(ensemble_path)
            results['ensemble'] = df_ensemble
            logger.info(f"✅ Loaded ensemble results: {len(df_ensemble)} rows")
        
        return results
    
    def combine_results(self, results_dict):
        """Combine baseline and ensemble results"""
        all_results = []
        
        for source, df in results_dict.items():
            all_results.append(df)
        
        if all_results:
            combined = pd.concat(all_results, ignore_index=True)
            # Clean model names
            combined['model'] = combined['model'].str.replace('LinearRegression', 'Linear Regression')
            return combined
        else:
            return pd.DataFrame()
    
    def create_bar_chart(self, df, metric='mae', title=None, save=True):
        """Create bar chart comparing models by metric"""
        fig, axes = plt.subplots(1, 3, figsize=(18, 6))
        fig.suptitle(title or f'Model Comparison by {metric.upper()}', fontsize=16, fontweight='bold')
        
        horizons = sorted(df['horizon'].unique())
        
        for i, horizon in enumerate(horizons):
            ax = axes[i]
            subset = df[df['horizon'] == horizon]
            
            # Sort by metric
            subset = subset.sort_values(metric)
            
            # Create bars
            bars = ax.bar(subset['model'], subset[metric], 
                         color=[self.colors.get(m, '#888888') for m in subset['model']],
                         edgecolor='black', linewidth=0.5)
            
            # Add value labels on top of bars
            for bar in bars:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height + height*0.02,
                       f'{height:.0f}', ha='center', va='bottom', fontsize=9, fontweight='bold')
            
            ax.set_title(f'{horizon}-Day Forecast', fontsize=12, fontweight='bold')
            ax.set_xlabel('Model')
            ax.set_ylabel(metric.upper())
            ax.tick_params(axis='x', rotation=45)
            ax.grid(True, alpha=0.3)
            
            # Add horizontal line for best model
            best_value = subset[metric].min()
            ax.axhline(y=best_value, color='green', linestyle='--', alpha=0.5, 
                      label=f'Best: {best_value:.0f}')
            ax.legend()
        
        plt.tight_layout()
        
        if save:
            filename = f'model_comparison_{metric}.png'
            plt.savefig(self.output_path / filename, dpi=150, bbox_inches='tight')
            logger.info(f"💾 Saved: {filename}")
        
        plt.show()
        return fig
    
    def create_heatmap(self, df, save=True):
        """Create heatmap of model performance"""
        # Pivot table: models x horizons
        pivot_mae = df.pivot_table(index='model', columns='horizon', values='mae')
        pivot_rmse = df.pivot_table(index='model', columns='horizon', values='rmse')
        pivot_mape = df.pivot_table(index='model', columns='horizon', values='mape')
        
        # Reorder models
        pivot_mae = pivot_mae.reindex([m for m in self.model_order if m in pivot_mae.index])
        pivot_rmse = pivot_rmse.reindex([m for m in self.model_order if m in pivot_rmse.index])
        pivot_mape = pivot_mape.reindex([m for m in self.model_order if m in pivot_mape.index])
        
        fig, axes = plt.subplots(1, 3, figsize=(18, 6))
        fig.suptitle('Model Performance Heatmap', fontsize=16, fontweight='bold')
        
        # MAE Heatmap
        sns.heatmap(pivot_mae, annot=True, fmt='.0f', cmap='YlOrRd', 
                   ax=axes[0], cbar_kws={'label': 'MAE'})
        axes[0].set_title('MAE (Lower is Better)', fontsize=12, fontweight='bold')
        
        # RMSE Heatmap
        sns.heatmap(pivot_rmse, annot=True, fmt='.0f', cmap='YlOrRd',
                   ax=axes[1], cbar_kws={'label': 'RMSE'})
        axes[1].set_title('RMSE (Lower is Better)', fontsize=12, fontweight='bold')
        
        # MAPE Heatmap
        sns.heatmap(pivot_mape, annot=True, fmt='.1f', cmap='YlOrRd',
                   ax=axes[2], cbar_kws={'label': 'MAPE (%)'})
        axes[2].set_title('MAPE % (Lower is Better)', fontsize=12, fontweight='bold')
        
        plt.tight_layout()
        
        if save:
            filename = 'model_heatmap.png'
            plt.savefig(self.output_path / filename, dpi=150, bbox_inches='tight')
            logger.info(f"💾 Saved: {filename}")
        
        plt.show()
        return fig
    
    def create_radar_chart(self, df, save=True):
        """Create radar chart for model comparison"""
        # Normalize metrics (lower is better, so invert)
        metrics = ['mae', 'rmse', 'mape']
        
        # Get best model per metric
        best_mae = df.groupby('horizon')['mae'].min().mean()
        best_rmse = df.groupby('horizon')['rmse'].min().mean()
        best_mape = df.groupby('horizon')['mape'].min().mean()
        
        # Normalize and invert (so higher = better)
        df_norm = df.copy()
        df_norm['mae_norm'] = 1 - (df_norm['mae'] / (2 * best_mae))
        df_norm['rmse_norm'] = 1 - (df_norm['rmse'] / (2 * best_rmse))
        df_norm['mape_norm'] = 1 - (df_norm['mape'] / (2 * best_mape))
        
        # Clip to [0, 1]
        for col in ['mae_norm', 'rmse_norm', 'mape_norm']:
            df_norm[col] = df_norm[col].clip(0, 1)
        
        # Average across horizons
        radar_data = df_norm.groupby('model')[['mae_norm', 'rmse_norm', 'mape_norm']].mean()
        radar_data = radar_data.reindex([m for m in self.model_order if m in radar_data.index])
        
        # Radar chart
        fig, ax = plt.subplots(figsize=(10, 8), subplot_kw=dict(projection='polar'))
        
        angles = np.linspace(0, 2 * np.pi, len(metrics), endpoint=False).tolist()
        angles += angles[:1]  # Close the loop
        
        for model in radar_data.index:
            values = radar_data.loc[model].values.tolist()
            values += values[:1]  # Close the loop
            
            ax.plot(angles, values, 'o-', linewidth=2, label=model, 
                   color=self.colors.get(model, '#888888'))
            ax.fill(angles, values, alpha=0.1, color=self.colors.get(model, '#888888'))
        
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(['MAE', 'RMSE', 'MAPE'])
        ax.set_ylim(0, 1)
        ax.set_title('Model Performance Radar (Higher = Better)', fontsize=14, fontweight='bold', pad=20)
        ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0))
        ax.grid(True)
        
        plt.tight_layout()
        
        if save:
            filename = 'model_radar.png'
            plt.savefig(self.output_path / filename, dpi=150, bbox_inches='tight')
            logger.info(f"💾 Saved: {filename}")
        
        plt.show()
        return fig
    
    def create_summary_table(self, df, save=True):
        """Create summary table with best model per horizon"""
        summary = []
        
        for horizon in sorted(df['horizon'].unique()):
            subset = df[df['horizon'] == horizon]
            
            # Best model for each metric
            best_mae = subset.loc[subset['mae'].idxmin()]
            best_rmse = subset.loc[subset['rmse'].idxmin()]
            best_mape = subset.loc[subset['mape'].idxmin()]
            
            summary.append({
                'Horizon': f'{horizon} days',
                'Best MAE': f"{best_mae['model']} ({best_mae['mae']:.0f})",
                'Best RMSE': f"{best_rmse['model']} ({best_rmse['rmse']:.0f})",
                'Best MAPE': f"{best_mape['model']} ({best_mape['mape']:.1f}%)",
                'Recommended': best_mape['model']
            })
        
        summary_df = pd.DataFrame(summary)
        
        # Print summary
        print("\n" + "=" * 70)
        print("📊 MODEL COMPARISON SUMMARY")
        print("=" * 70)
        print(summary_df.to_string(index=False))
        print("=" * 70)
        
        if save:
            summary_df.to_csv(self.output_path / "model_summary.csv", index=False)
            logger.info(f"💾 Saved: model_summary.csv")
        
        return summary_df
    
    def create_forecast_vs_actual(self, df, save=True):
        """Create forecast vs actual scatter plot"""
        # This would require actual predictions, we'll create a placeholder
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Placeholder data - you can replace with actual predictions
        models = df['model'].unique()
        colors = [self.colors.get(m, '#888888') for m in models]
        
        # Simulate some data for visualization
        np.random.seed(42)
        for model, color in zip(models, colors):
            x = np.random.uniform(500, 3000, 20)
            y = x + np.random.normal(0, 200, 20)
            ax.scatter(x, y, alpha=0.6, label=model, color=color)
        
        # Perfect prediction line
        min_val = 0
        max_val = 3500
        ax.plot([min_val, max_val], [min_val, max_val], 'k--', alpha=0.5, label='Perfect Prediction')
        
        ax.set_xlabel('Actual Values')
        ax.set_ylabel('Predicted Values')
        ax.set_title('Forecast vs Actual (Simulated)')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        if save:
            filename = 'forecast_vs_actual.png'
            plt.savefig(self.output_path / filename, dpi=150, bbox_inches='tight')
            logger.info(f"💾 Saved: {filename}")
        
        plt.show()
        return fig
    
    def generate_report(self, df):
        """Generate complete dashboard report"""
        logger.info("\n" + "=" * 60)
        logger.info("📊 Generating Model Comparison Dashboard")
        logger.info("=" * 60)
        
        # 1. Bar Charts
        logger.info("\n📈 Creating bar charts...")
        self.create_bar_chart(df, metric='mae', title='Model Comparison by MAE')
        self.create_bar_chart(df, metric='mape', title='Model Comparison by MAPE %')
        
        # 2. Heatmap
        logger.info("\n📊 Creating heatmap...")
        self.create_heatmap(df)
        
        # 3. Radar Chart
        logger.info("\n🔄 Creating radar chart...")
        self.create_radar_chart(df)
        
        # 4. Summary Table
        logger.info("\n📋 Creating summary table...")
        summary = self.create_summary_table(df)
        
        # 5. Forecast vs Actual
        logger.info("\n📉 Creating forecast vs actual plot...")
        self.create_forecast_vs_actual(df)
        
        # 6. Save combined report
        report_path = self.output_path / "dashboard_report.md"
        with open(report_path, 'w') as f:
            f.write("# Model Performance Dashboard\n\n")
            f.write(f"Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("## Summary\n\n")
            f.write(summary.to_markdown(index=False))
            f.write("\n\n")
            f.write("## Files Generated\n\n")
            f.write("- `model_comparison_mae.png` - Bar chart of MAE\n")
            f.write("- `model_comparison_mape.png` - Bar chart of MAPE\n")
            f.write("- `model_heatmap.png` - Performance heatmap\n")
            f.write("- `model_radar.png` - Radar chart\n")
            f.write("- `model_summary.csv` - Summary table\n")
            f.write("- `forecast_vs_actual.png` - Forecast vs actual plot\n")
        
        logger.info(f"\n✅ Report saved to: {report_path}")
        
        return summary


def test_dashboard():
    """Test the dashboard"""
    logger.info("\n" + "=" * 60)
    logger.info("🧪 Testing Model Dashboard")
    logger.info("=" * 60)
    
    # Create dashboard
    dashboard = ModelDashboard()
    
    # Load results
    results = dashboard.load_results()
    
    if not results:
        logger.error("❌ No results found!")
        return
    
    # Combine results
    df = dashboard.combine_results(results)
    
    if df.empty:
        logger.error("❌ No data to display!")
        return
    
    logger.info(f"\n📊 Total models: {len(df)}")
    logger.info(f"📊 Models: {df['model'].unique().tolist()}")
    logger.info(f"📊 Horizons: {df['horizon'].unique().tolist()}")
    
    # Generate dashboard
    dashboard.generate_report(df)
    
    logger.info("\n" + "=" * 60)
    logger.info("✅ Dashboard generation complete!")
    logger.info(f"📁 Check: {dashboard.output_path}")
    logger.info("=" * 60)
    
    return df


if __name__ == "__main__":
    test_dashboard()