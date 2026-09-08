# Model Performance Dashboard

Generated: 2026-09-09 00:00:36

## Summary

| Horizon   | Best MAE      | Best RMSE     | Best MAPE        | Recommended   |
|:----------|:--------------|:--------------|:-----------------|:--------------|
| 15 days   | Prophet (393) | Prophet (501) | Prophet (21.7%)  | Prophet       |
| 30 days   | Prophet (382) | Prophet (499) | Prophet (22.6%)  | Prophet       |
| 90 days   | Prophet (415) | Prophet (519) | LightGBM (21.3%) | LightGBM      |

## Files Generated

- `model_comparison_mae.png` - Bar chart of MAE
- `model_comparison_mape.png` - Bar chart of MAPE
- `model_heatmap.png` - Performance heatmap
- `model_radar.png` - Radar chart
- `model_summary.csv` - Summary table
- `forecast_vs_actual.png` - Forecast vs actual plot
