"""
Charter Recommendation Engine
Combines forecasting, feasibility checks, and optimization
"""

import pandas as pd
import numpy as np
from pathlib import Path
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional

# Fix import - use relative import
from .prediction_pipeline import PredictionPipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CharterEngine:
    """Complete charter recommendation engine"""
    
    def __init__(self):
        logger.info("=" * 60)
        logger.info("🚢 Initializing Charter Engine")
        logger.info("=" * 60)
        
        self.prediction = PredictionPipeline()
        
        # Load static data
        self._load_data()
        
        # Cache for faster lookups
        self._build_caches()
        
        logger.info("✅ Charter Engine ready")
        logger.info("=" * 60)
    
    def _load_data(self):
        """Load all static datasets"""
        data_path = Path("data/raw")
        
        try:
            self.ports = pd.read_csv(data_path / "dataset_3_port_infrastructure_rules.csv")
            self.vessels = pd.read_csv(data_path / "dataset_4_vessel_specifications.csv")
            self.routes = pd.read_csv(data_path / "dataset_7_route_distances.csv")
            self.congestion = pd.read_csv(data_path / "dataset_5_port_traffic_timeseries.csv")
            self.weather = pd.read_csv(data_path / "dataset_6_weather_risk_flags.csv")
            self.disruptions = pd.read_csv(data_path / "dataset_8_disruption_events.csv")
            
            # Standardize column names
            for df in [self.ports, self.vessels, self.routes, 
                       self.congestion, self.weather, self.disruptions]:
                df.columns = [c.lower().strip().replace(' ', '_') for c in df.columns]
            
            # Ensure date columns are datetime
            if 'date' in self.congestion.columns:
                self.congestion['date'] = pd.to_datetime(self.congestion['date'])
            if 'date' in self.weather.columns:
                self.weather['date'] = pd.to_datetime(self.weather['date'])
            if 'event_date' in self.disruptions.columns:
                self.disruptions['event_date'] = pd.to_datetime(self.disruptions['event_date'])
            
            logger.info("   ✅ Loaded all datasets")
        except Exception as e:
            logger.error(f"   ❌ Error loading data: {e}")
            raise
    
    def _build_caches(self):
        """Build lookup caches for faster performance"""
        self.port_cache = {row['port_name']: row.to_dict() for _, row in self.ports.iterrows()}
        self.vessel_cache = {row['vessel_class']: row.to_dict() for _, row in self.vessels.iterrows()}
        self.route_cache = {}
        
        for _, row in self.routes.iterrows():
            key = f"{row['origin_port']}_{row['destination_port']}"
            self.route_cache[key] = row.to_dict()
    
    def _find_port_match(self, port_name: str) -> Optional[str]:
        """
        Find matching port name in the port list
        
        Args:
            port_name: Input port name (may be partial)
        
        Returns:
            Exact port name from cache if found, else None
        """
        # Exact match
        if port_name in self.port_cache:
            return port_name
        
        # Case-insensitive exact match
        for p in self.port_cache.keys():
            if p.lower() == port_name.lower():
                return p
        
        # Partial match (input is substring of port name)
        for p in self.port_cache.keys():
            if port_name.lower() in p.lower():
                return p
        
        # Partial match (port name is substring of input)
        for p in self.port_cache.keys():
            if p.lower() in port_name.lower():
                return p
        
        return None
    
    def get_port_info(self, port_name: str) -> Dict:
        """Get port information"""
        matched = self._find_port_match(port_name)
        if matched:
            return self.port_cache.get(matched, {})
        return {}
    
    def get_vessel_info(self, vessel_class: str) -> Dict:
        """Get vessel specification"""
        return self.vessel_cache.get(vessel_class, {})
    
    def check_vessel_feasibility(self, vessel_class: str, 
                                 origin: str, dest: str) -> Dict:
        """
        Check if a vessel class is feasible for a route
        
        Returns:
            {
                'vessel_class': 'Panamax',
                'feasible': True,
                'checks': ['draft_ok', 'loa_ok', 'beam_ok'],
                'reasons': [],
                'issues': []
            }
        """
        vessel = self.get_vessel_info(vessel_class)
        origin_info = self.get_port_info(origin)
        dest_info = self.get_port_info(dest)
        
        if not vessel or not origin_info or not dest_info:
            return {
                'vessel_class': vessel_class,
                'feasible': False,
                'checks': [],
                'reasons': ['Missing data for vessel or port'],
                'issues': ['Data unavailable']
            }
        
        checks = []
        reasons = []
        issues = []
        
        # Check draft
        draft = float(vessel.get('typical_draft_m', 0))
        origin_draft = float(origin_info.get('max_draft_m', 0))
        dest_draft = float(dest_info.get('max_draft_m', 0))
        
        if draft <= origin_draft:
            checks.append('origin_draft_ok')
        else:
            issues.append(f"Origin draft: {draft}m > {origin_draft}m")
        
        if draft <= dest_draft:
            checks.append('dest_draft_ok')
        else:
            issues.append(f"Destination draft: {draft}m > {dest_draft}m")
        
        # Check LOA
        loa = float(vessel.get('typical_loa_m', 0))
        origin_loa = float(origin_info.get('max_loa_m', 0))
        dest_loa = float(dest_info.get('max_loa_m', 0))
        
        if loa <= origin_loa:
            checks.append('origin_loa_ok')
        else:
            issues.append(f"Origin LOA: {loa}m > {origin_loa}m")
        
        if loa <= dest_loa:
            checks.append('dest_loa_ok')
        else:
            issues.append(f"Destination LOA: {loa}m > {dest_loa}m")
        
        # Check Beam
        beam = float(vessel.get('typical_beam_m', 0))
        origin_beam = float(origin_info.get('max_beam_m', 0))
        dest_beam = float(dest_info.get('max_beam_m', 0))
        
        if beam <= origin_beam:
            checks.append('origin_beam_ok')
        else:
            issues.append(f"Origin beam: {beam}m > {origin_beam}m")
        
        if beam <= dest_beam:
            checks.append('dest_beam_ok')
        else:
            issues.append(f"Destination beam: {beam}m > {dest_beam}m")
        
        # Determine feasibility
        feasible = len(issues) == 0
        
        return {
            'vessel_class': vessel_class,
            'feasible': feasible,
            'checks': checks,
            'reasons': reasons,
            'issues': issues,
            'vessel_specs': {
                'draft': draft,
                'loa': loa,
                'beam': beam,
                'dwt_max': vessel.get('dwt_max', 0)
            },
            'port_limits': {
                'origin': {'draft': origin_draft, 'loa': origin_loa, 'beam': origin_beam},
                'destination': {'draft': dest_draft, 'loa': dest_loa, 'beam': dest_beam}
            }
        }
    
    def recommend_vessel(self, cargo_volume: float, origin: str, destinations: List[str]) -> Dict:
        """
        Recommend the best vessel class for a cargo
        
        Args:
            cargo_volume: Tonnes to ship
            origin: Origin port name
            destinations: List of destination port names (check all)
        """
        # Find origin port
        origin_port = self._find_port_match(origin)
        if not origin_port:
            return {
                'recommended_class': None,
                'alternative_classes': [],
                'all_feasible': [],
                'infeasible': [],
                'feasibility_details': [],
                'message': f"Origin port not found: {origin}"
            }
        
        # Find all destination ports
        dest_ports = []
        for d in destinations:
            matched = self._find_port_match(d)
            if matched:
                dest_ports.append(matched)
        
        if not dest_ports:
            return {
                'recommended_class': None,
                'alternative_classes': [],
                'all_feasible': [],
                'infeasible': [],
                'feasibility_details': [],
                'message': f"No destination ports found: {destinations}"
            }
        
        logger.info(f"🔍 Origin: '{origin}' → '{origin_port}'")
        logger.info(f"🔍 Destinations: {destinations} → {dest_ports}")
        
        vessel_classes = ['Handysize', 'Supramax', 'Panamax', 'Capesize']
        recommendations = []
        
        for vc in vessel_classes:
            vessel = self.get_vessel_info(vc)
            if not vessel:
                continue
            
            max_dwt = float(vessel.get('dwt_max', 0))
            min_dwt = float(vessel.get('dwt_min', 0))
            
            logger.info(f"📊 {vc}: max_dwt={max_dwt}, cargo={cargo_volume}")
            
            # Check if this vessel can carry the cargo
            if cargo_volume <= max_dwt:
                # Check feasibility at EACH destination
                feasible_destinations = []
                issues_by_dest = {}
                
                for dest_port in dest_ports:
                    feasibility = self.check_vessel_feasibility(vc, origin_port, dest_port)
                    if feasibility['feasible']:
                        feasible_destinations.append(dest_port)
                    else:
                        issues_by_dest[dest_port] = feasibility['issues']
                
                recommendations.append({
                    'vessel_class': vc,
                    'feasible': len(feasible_destinations) > 0,
                    'feasible_destinations': feasible_destinations,
                    'issues_by_destination': issues_by_dest,
                    'max_dwt': max_dwt,
                    'min_dwt': min_dwt,
                    'draft_required': float(vessel.get('typical_draft_m', 0)),
                    'loa_required': float(vessel.get('typical_loa_m', 0)),
                    'beam_required': float(vessel.get('typical_beam_m', 0))
                })
            else:
                # Check if multiple trips are feasible
                trips_needed = int(cargo_volume / max_dwt) + 1
                total_capacity = trips_needed * max_dwt
                
                # Check feasibility at destinations for multi-trip
                feasible_destinations = []
                for dest_port in dest_ports:
                    feasibility = self.check_vessel_feasibility(vc, origin_port, dest_port)
                    if feasibility['feasible']:
                        feasible_destinations.append(dest_port)
                
                recommendations.append({
                    'vessel_class': vc,
                    'feasible': False,
                    'feasible_destinations': feasible_destinations,
                    'issues_by_destination': {},
                    'max_dwt': max_dwt,
                    'min_dwt': min_dwt,
                    'draft_required': float(vessel.get('typical_draft_m', 0)),
                    'loa_required': float(vessel.get('typical_loa_m', 0)),
                    'beam_required': float(vessel.get('typical_beam_m', 0)),
                    'multi_trip_suggestion': {
                        'trips_needed': trips_needed,
                        'total_capacity': total_capacity,
                        'can_handle': total_capacity >= cargo_volume and len(feasible_destinations) > 0
                    }
                })
        
        # Sort: feasible first, then by size
        recommendations.sort(key=lambda x: (not x['feasible'], x['max_dwt']))
        
        # Get vessel classes by feasibility
        feasible_classes = [r['vessel_class'] for r in recommendations if r['feasible']]
        infeasible_classes = [r['vessel_class'] for r in recommendations if not r['feasible']]
        
        logger.info(f"📊 Feasible classes: {feasible_classes}")
        logger.info(f"📊 Infeasible classes: {infeasible_classes}")
        
        if feasible_classes:
            best = recommendations[0]
            return {
                'recommended_class': best['vessel_class'],
                'alternative_classes': feasible_classes[1:4],
                'all_feasible': feasible_classes,
                'infeasible': infeasible_classes,
                'feasible_destinations': best['feasible_destinations'],
                'feasibility_details': recommendations,
                'message': f"✅ Recommended: {best['vessel_class']} is feasible at {len(best['feasible_destinations'])} destination(s)"
            }
        else:
            # Check for multi-trip options
            multi_trip_options = []
            for r in recommendations:
                if r.get('multi_trip_suggestion', {}).get('can_handle', False):
                    multi_trip_options.append({
                        'vessel_class': r['vessel_class'],
                        'trips_needed': r['multi_trip_suggestion']['trips_needed'],
                        'total_capacity': r['multi_trip_suggestion']['total_capacity'],
                        'feasible_destinations': r['feasible_destinations']
                    })
            
            if multi_trip_options:
                best_multi = multi_trip_options[0]
                return {
                    'recommended_class': None,
                    'alternative_classes': [],
                    'all_feasible': [],
                    'infeasible': infeasible_classes,
                    'feasibility_details': recommendations,
                    'multi_trip_options': multi_trip_options,
                    'message': f"💡 No single vessel feasible. Use {best_multi['trips_needed']} x {best_multi['vessel_class']} (total: {best_multi['total_capacity']} tonnes) at {', '.join(best_multi['feasible_destinations'])}"
                }
            else:
                return {
                    'recommended_class': None,
                    'alternative_classes': [],
                    'all_feasible': [],
                    'infeasible': infeasible_classes,
                    'feasibility_details': recommendations,
                    'multi_trip_options': [],
                    'message': '❌ No vessel can carry this cargo. Consider splitting into smaller shipments.'
                }
    
    def estimate_port_time(self, port_name: str, cargo_volume: float) -> Dict:
        """
        Estimate total port time: waiting + discharge
        """
        # Find matching port
        matched_port = self._find_port_match(port_name)
        if not matched_port:
            return {'error': 'Port not found', 'port_name': port_name}
        
        port = self.get_port_info(matched_port)
        if not port:
            return {'error': 'Port not found', 'port_name': port_name}
        
        # Get latest congestion data
        cong_data = self.congestion[self.congestion['port_name'] == matched_port]
        if not cong_data.empty:
            latest = cong_data.iloc[-1]
            waiting_anchorage = float(latest.get('waiting_days_at_anchorage', 0))
            waiting_berth = float(latest.get('waiting_days_at_berth', 0))
            waiting_days = waiting_anchorage + waiting_berth
            vessels_at_anchorage = int(latest.get('vessels_at_anchorage', 0))
            berth_occupancy = float(latest.get('berth_occupancy_pct', 0))
        else:
            waiting_days = 1.0
            vessels_at_anchorage = 0
            berth_occupancy = 50
        
        # Calculate discharge time
        discharge_rate = float(port.get('discharge_rate_tpd', 10000))
        discharge_days = cargo_volume / discharge_rate if discharge_rate > 0 else 0
        
        total_time = waiting_days + discharge_days
        
        # Risk level based on waiting days
        if waiting_days > 3:
            congestion_risk = 'HIGH'
        elif waiting_days > 1.5:
            congestion_risk = 'MEDIUM'
        else:
            congestion_risk = 'LOW'
        
        return {
            'port_name': matched_port,
            'waiting_days': round(waiting_days, 1),
            'discharge_days': round(discharge_days, 1),
            'total_days': round(total_time, 1),
            'vessels_at_anchorage': vessels_at_anchorage,
            'berth_occupancy_pct': berth_occupancy,
            'congestion_risk': congestion_risk,
            'discharge_rate_tpd': discharge_rate
        }
    
    def get_risk_alerts(self, port_name: str, arrival_window: Tuple[str, str]) -> List[Dict]:
        """
        Get risk alerts for a port in a date window
        """
        alerts = []
        
        # Find matching port
        matched_port = self._find_port_match(port_name)
        if not matched_port:
            return alerts
        
        # Parse window
        start_date = pd.to_datetime(arrival_window[0]) if arrival_window and arrival_window[0] else None
        end_date = pd.to_datetime(arrival_window[1]) if arrival_window and len(arrival_window) > 1 and arrival_window[1] else None
        
        # Get months in window
        if start_date and end_date:
            months = set()
            current = start_date
            while current <= end_date:
                months.add(current.month)
                current += timedelta(days=30)
        else:
            months = set(range(1, 13))  # All months
        
        # Weather alerts - use date column to extract month
        weather_data = self.weather[self.weather['port_name'] == matched_port]
        if not weather_data.empty:
            # Extract month from date column
            weather_data = weather_data.copy()
            weather_data['month'] = pd.to_datetime(weather_data['date']).dt.month
            
            # Get unique month-risk mappings
            for month in months:
                month_data = weather_data[weather_data['month'] == month]
                if not month_data.empty:
                    row = month_data.iloc[0]
                    
                    monsoon = row.get('monsoon_risk_level', 'LOW')
                    if monsoon in ['HIGH', 'MEDIUM']:
                        alerts.append({
                            'type': 'weather',
                            'subtype': 'monsoon',
                            'severity': monsoon.upper(),
                            'message': f"Monsoon {monsoon} risk in {pd.Timestamp(2026, month, 1).strftime('%B')}",
                            'icon': '🌧️'
                        })
                    
                    cyclone = row.get('cyclone_risk_level', 'LOW')
                    if cyclone in ['HIGH', 'MEDIUM']:
                        alerts.append({
                            'type': 'weather',
                            'subtype': 'cyclone',
                            'severity': cyclone.upper(),
                            'message': f"Cyclone {cyclone} risk in {pd.Timestamp(2026, month, 1).strftime('%B')}",
                            'icon': '🌀'
                        })
        
        # Congestion alerts
        cong_data = self.congestion[self.congestion['port_name'] == matched_port]
        if not cong_data.empty:
            latest = cong_data.iloc[-1]
            waiting = float(latest.get('waiting_days_at_berth', 0))
            if waiting > 3:
                alerts.append({
                    'type': 'congestion',
                    'severity': 'HIGH',
                    'message': f"High congestion: {waiting:.1f} days waiting at berth",
                    'icon': '🚢'
                })
            elif waiting > 1.5:
                alerts.append({
                    'type': 'congestion',
                    'severity': 'MEDIUM',
                    'message': f"Moderate congestion: {waiting:.1f} days waiting",
                    'icon': '🚢'
                })
        
        # Disruption alerts (check if any in window)
        disruptions = self.disruptions[self.disruptions['port_name'] == matched_port]
        if start_date and end_date and not disruptions.empty:
            for _, dis in disruptions.iterrows():
                event_date = pd.to_datetime(dis.get('event_date'))
                if start_date <= event_date <= end_date:
                    alerts.append({
                        'type': 'disruption',
                        'severity': 'HIGH',
                        'message': f"{dis.get('event_type', 'Event')}: {dis.get('notes', '')}",
                        'icon': '⚠️'
                    })
        
        # Sort by severity
        severity_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
        alerts.sort(key=lambda x: severity_order.get(x.get('severity', 'LOW'), 3))
        
        return alerts
    
    def get_charter_recommendation(self, request: Dict) -> Dict:
        """
        Complete charter recommendation
        
        Args:
            request: {
                'cargo_volume': 150000,
                'commodity': 'coal',
                'origin': 'Hay Point',
                'destinations': ['Paradip', 'Dhamra'],
                'contract_type': 'short_term',
                'arrival_window': ['2026-10-01', '2026-10-15']
            }
        """
        logger.info("📊 Generating charter recommendation...")
        
        cargo_volume = request['cargo_volume']
        origin = request['origin']
        destinations = request['destinations']
        arrival_window = request.get('arrival_window', [None, None])
        
        # 1. Vessel Recommendation (pass ALL destinations)
        vessel_rec = self.recommend_vessel(cargo_volume, origin, destinations)
        
        # 2. Forecast for each destination
        forecasts = []
        for dest in destinations:
            route_id = f"{origin}_{dest}"
            for horizon in [15, 30, 90]:
                pred = self.prediction.predict(
                    route_id, horizon, 
                    arrival_window[0] or datetime.now().strftime('%Y-%m-%d')
                )
                forecasts.append(pred)
        
        # 3. Port time estimates
        port_times = []
        for dest in destinations:
            port_times.append(self.estimate_port_time(dest, cargo_volume))
        
        # 4. Risk alerts
        risk_alerts = []
        for dest in destinations:
            risk_alerts.extend(self.get_risk_alerts(dest, arrival_window))
        
        # 5. Buy/Hold signal (use first destination)
        route_id = f"{origin}_{destinations[0]}"
        current_rate = self.prediction.get_current_rate(route_id)
        forecast_rate = forecasts[0].get('prediction', current_rate) if forecasts else current_rate
        buy_hold = self.prediction.get_buy_hold_signal(
            current_rate, forecast_rate, 30
        )
        
        # 6. Best port selection
        if port_times:
            # Filter out error entries
            valid_ports = [p for p in port_times if 'error' not in p]
            if valid_ports:
                best_port = min(valid_ports, key=lambda x: x.get('total_days', 999))
            else:
                best_port = None
        else:
            best_port = None
        
        return {
            'request': request,
            'vessel_recommendation': vessel_rec,
            'forecasts': forecasts,
            'port_times': port_times,
            'risk_alerts': risk_alerts,
            'buy_hold_signal': buy_hold,
            'summary': {
                'best_vessel': vessel_rec.get('recommended_class', 'None'),
                'best_port': best_port.get('port_name') if best_port else 'None',
                'total_port_days': best_port.get('total_days', 0) if best_port else 0,
                'risk_count': len(risk_alerts),
                'forecast_available': len(forecasts) > 0,
                'multi_trip_options': vessel_rec.get('multi_trip_options', [])
            }
        }


# ============================================
# Quick Test
# ============================================

def test_charter_engine():
    """Test the charter engine"""
    logger.info("\n🧪 Testing Charter Engine")
    logger.info("=" * 60)
    
    engine = CharterEngine()
    
    # Test request
    request = {
        'cargo_volume': 150000,
        'commodity': 'coal',
        'origin': 'Hay Point',
        'destinations': ['Paradip', 'Dhamra'],
        'contract_type': 'short_term',
        'arrival_window': ['2026-10-01', '2026-10-15']
    }
    
    result = engine.get_charter_recommendation(request)
    
    print("\n" + "=" * 60)
    print("📊 CHARTER RECOMMENDATION RESULT")
    print("=" * 60)
    print(f"Vessel: {result['vessel_recommendation']['recommended_class']}")
    print(f"Message: {result['vessel_recommendation']['message']}")
    print(f"Multi-trip: {result['vessel_recommendation'].get('multi_trip_options', [])}")
    print(f"Buy/Hold: {result['buy_hold_signal']['signal']}")
    print(f"Best Port: {result['summary']['best_port']}")
    print(f"Total Port Days: {result['summary']['total_port_days']}")
    print(f"Risk Alerts: {len(result['risk_alerts'])}")
    print("=" * 60)
    
    return engine


if __name__ == "__main__":
    test_charter_engine()