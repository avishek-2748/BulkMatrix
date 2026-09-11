"""
Generate Final Model Performance Report
Using regularized per-route CatBoost models
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

plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FinalReportGenerator:
    """Generate final model performance report"""
    
    def __init__(self, output_path: str = "reports/final"):
        self.output_path = Path(output_path)
        self.output_path.mkdir(parents=True, exist_ok=True)
        
        # Colors
        self.colors = {
            'catboost': '#FF6B6B',
            'xgboost': '#4ECDC4',
            'lightgbm': '#45B7D1'
        }
    
    def load_results(self):
        """Load final training results"""
        results_path = Path("models/metadata/training_results_full.csv")
        
        if not results_path.exists():
            # Try alternative location
            results_path = Path("models/training_results_full.csv")
        
        if not results_path.exists():
            logger.error(f"❌ Results file not found: {results_path}")
            return None
        
        df = pd.read_csv(results_path)
        logger.info(f"✅ Loaded {len(df)} rows from {results_path.name}")
        return df
    
    def create_summary_table(self, df):
        """Create summary table of model performance"""
        summary = df.groupby(['model', 'horizon']).agg({
            'mae': ['mean', 'std'],
            'rmse': ['mean', 'std'],
            'mape': ['mean', 'std']
        }).round(2)
        
        # Flatten columns
        summary.columns = ['mae_mean', 'mae_std', 'rmse_mean', 'rmse_std', 'mape_mean', 'mape_std']
        summary = summary.reset_index()
        
        return summary
    
    def create_bar_chart(self, df):
        """Create bar chart comparing models by MAPE"""
        fig, axes = plt.subplots(1, 3, figsize=(18, 6))
        fig.suptitle('Model Performance by Horizon (MAPE %)', fontsize=16, fontweight='bold')
        
        # Aggregate by model and horizon
        agg_df = df.groupby(['model', 'horizon']).agg({
            'mape': 'mean',
            'mae': 'mean',
            'rmse': 'mean'
        }).reset_index()
        
        horizons = sorted(agg_df['horizon'].unique())
        
        for i, horizon in enumerate(horizons):
            ax = axes[i]
            subset = agg_df[agg_df['horizon'] == horizon]
            subset = subset.sort_values('mape')
            
            bars = ax.bar(subset['model'], subset['mape'],
                         color=[self.colors.get(m, '#888888') for m in subset['model']],
                         edgecolor='black', linewidth=0.5)
            
            for bar in bars:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height + height*0.02,
                       f'{height:.1f}%', ha='center', va='bottom', fontsize=10, fontweight='bold')
            
            ax.set_title(f'{horizon}-Day Forecast', fontsize=12, fontweight='bold')
            ax.set_xlabel('Model')
            ax.set_ylabel('MAPE (%)')
            ax.tick_params(axis='x', rotation=0)
            ax.grid(True, alpha=0.3)
            
            # Best model line
            best_value = subset['mape'].min()
            ax.axhline(y=best_value, color='green', linestyle='--', alpha=0.5,
                      label=f'Best: {best_value:.1f}%')
            ax.legend()
        
        plt.tight_layout()
        plt.savefig(self.output_path / 'final_model_comparison.png', dpi=150, bbox_inches='tight')
        logger.info(f"💾 Saved: final_model_comparison.png")
        plt.close()
    
    def create_heatmap(self, df):
        """Create heatmap of model performance"""
        agg_df = df.groupby(['model', 'horizon']).agg({
            'mape': 'mean',
            'mae': 'mean',
            'rmse': 'mean'
        }).reset_index()
        
        # Pivot for heatmap
        pivot_mape = agg_df.pivot(index='model', columns='horizon', values='mape')
        pivot_mae = agg_df.pivot(index='model', columns='horizon', values='mae')
        pivot_rmse = agg_df.pivot(index='model', columns='horizon', values='rmse')
        
        fig, axes = plt.subplots(1, 3, figsize=(18, 5))
        fig.suptitle('Model Performance Heatmap', fontsize=16, fontweight='bold')
        
        # MAPE Heatmap
        sns.heatmap(pivot_mape, annot=True, fmt='.1f', cmap='YlOrRd',
                   ax=axes[0], cbar_kws={'label': 'MAPE (%)'})
        axes[0].set_title('MAPE % (Lower is Better)', fontsize=12, fontweight='bold')
        
        # MAE Heatmap
        sns.heatmap(pivot_mae, annot=True, fmt='.0f', cmap='YlOrRd',
                   ax=axes[1], cbar_kws={'label': 'MAE'})
        axes[1].set_title('MAE (Lower is Better)', fontsize=12, fontweight='bold')
        
        # RMSE Heatmap
        sns.heatmap(pivot_rmse, annot=True, fmt='.0f', cmap='YlOrRd',
                   ax=axes[2], cbar_kws={'label': 'RMSE'})
        axes[2].set_title('RMSE (Lower is Better)', fontsize=12, fontweight='bold')
        
        plt.tight_layout()
        plt.savefig(self.output_path / 'final_heatmap.png', dpi=150, bbox_inches='tight')
        logger.info(f"💾 Saved: final_heatmap.png")
        plt.close()
    
    def create_radar_chart(self, df):
        """Create radar chart comparing models"""
        agg_df = df.groupby(['model', 'horizon']).agg({
            'mape': 'mean'
        }).reset_index()
        
        # Get best MAPE for normalization
        best_mape = agg_df.groupby('horizon')['mape'].min()
        
        # Normalize (lower is better, so we invert)
        models = agg_df['model'].unique()
        horizons = sorted(agg_df['horizon'].unique())
        
        fig, ax = plt.subplots(figsize=(10, 8), subplot_kw=dict(projection='polar'))
        
        angles = np.linspace(0, 2 * np.pi, len(horizons), endpoint=False).tolist()
        angles += angles[:1]
        
        for model in models:
            model_data = agg_df[agg_df['model'] == model]
            values = []
            for h in horizons:
                mape = model_data[model_data['horizon'] == h]['mape'].values[0]
                # Normalize: 1 - (mape / best_mape) → higher is better
                norm_value = 1 - (mape / best_mape[h])
                values.append(max(0, min(1, norm_value)))
            values += values[:1]
            
            ax.plot(angles, values, 'o-', linewidth=2, label=model,
                   color=self.colors.get(model, '#888888'))
            ax.fill(angles, values, alpha=0.1, color=self.colors.get(model, '#888888'))
        
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels([f'{h}d' for h in horizons])
        ax.set_ylim(0, 1)
        ax.set_title('Model Performance Radar (Higher = Better)', fontsize=14, fontweight='bold', pad=20)
        ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0))
        ax.grid(True)
        
        plt.tight_layout()
        plt.savefig(self.output_path / 'final_radar.png', dpi=150, bbox_inches='tight')
        logger.info(f"💾 Saved: final_radar.png")
        plt.close()
    
    def generate_report(self, df):
        """Generate complete report"""
        logger.info("\n" + "="*60)
        logger.info("📊 Generating Final Model Report")
        logger.info("="*60)
        
        # Summary
        summary = self.create_summary_table(df)
        summary.to_csv(self.output_path / 'final_model_summary.csv', index=False)
        logger.info(f"💾 Saved: final_model_summary.csv")
        
        # Visualizations
        self.create_bar_chart(df)
        self.create_heatmap(df)
        self.create_radar_chart(df)
        
        # Print summary
        print("\n" + "="*60)
        print("📊 FINAL MODEL PERFORMANCE SUMMARY")
        print("="*60)
        
        # Average MAPE by model
        avg_mape = df.groupby('model')['mape'].mean().round(2)
        print("\nAverage MAPE by Model:")
        for model, mape in avg_mape.items():
            print(f"  {model}: {mape:.2f}%")
        
        # Best model
        best_model = avg_mape.idxmin()
        best_mape = avg_mape.min()
        print(f"\n🏆 Best Model Overall: {best_model} ({best_mape:.2f}%)")
        
        # By horizon
        print("\nBest Model by Horizon:")
        for horizon in sorted(df['horizon'].unique()):
            subset = df[df['horizon'] == horizon]
            best = subset.loc[subset['mape'].idxmin()]
            print(f"  {horizon}d: {best['model']} ({best['mape']:.2f}%)")
        
        # Save report
        report_path = self.output_path / "final_report.md"
        with open(report_path, 'w') as f:
            f.write("# Final Model Performance Report\n\n")
            f.write(f"Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("## Overview\n\n")
            f.write(f"- **Total models evaluated**: {len(df)}\n")
            f.write(f"- **Models**: {', '.join(df['model'].unique())}\n")
            f.write(f"- **Horizons**: {', '.join(map(str, sorted(df['horizon'].unique())))}\n\n")
            f.write("## Best Models\n\n")
            f.write("| Horizon | Best Model | MAPE |\n")
            f.write("|---------|------------|------|\n")
            for horizon in sorted(df['horizon'].unique()):
                subset = df[df['horizon'] == horizon]
                best = subset.loc[subset['mape'].idxmin()]
                f.write(f"| {horizon}d | {best['model']} | {best['mape']:.2f}% |\n")
            f.write("\n## Average MAPE by Model\n\n")
            for model, mape in avg_mape.items():
                f.write(f"- **{model}**: {mape:.2f}%\n")
            f.write(f"\n🏆 **Best Model Overall**: {best_model} ({best_mape:.2f}%)\n")
        
        logger.info(f"💾 Saved: {report_path}")
        logger.info("✅ Report generation complete!")


def main():
    generator = FinalReportGenerator()
    df = generator.load_results()
    
    if df is None:
        logger.error("❌ No results found. Please run training first.")
        return
    
    generator.generate_report(df)
    print("\n📁 Report saved to: reports/final/")


if __name__ == "__main__":
    main()