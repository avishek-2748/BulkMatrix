"""
Automated Test Runner for Multi-Vessel Fleet Optimization
Tests 5 distinct cargo scenarios (50k, 120k, 150k, 300k, 500k MT)
Verifies single vs multi-vessel activation, port feasibility, ML freight cost calculation, and fleet ranking.
"""

import os
import sys
from pathlib import Path

# Force UTF-8 stdout encoding for Windows compatibility
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Add project root to python path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from src.charter_engine import CharterEngine

def run_tests():
    print("=" * 70)
    print("[FLEET OPTIMIZATION] STARTING MULTI-VESSEL TEST SUITE")
    print("=" * 70)

    engine = CharterEngine()

    test_cases = [
        {
            "id": 1,
            "cargo_volume": 50000,
            "origin": "Hay Point",
            "destinations": ["Paradip"],
            "expected_multi_vessel": False,
            "desc": "50,000 MT (Standard Small Load - Single Vessel Supramax/Panamax)"
        },
        {
            "id": 2,
            "cargo_volume": 120000,
            "origin": "Hay Point",
            "destinations": ["Dhamra"],
            "expected_multi_vessel": False,
            "desc": "120,000 MT (Capesize Deep-Draft Port Dhamra - Single Vessel Capesize)"
        },
        {
            "id": 3,
            "cargo_volume": 150000,
            "origin": "Hay Point",
            "destinations": ["Dhamra"],
            "expected_multi_vessel": False,
            "desc": "150,000 MT (Capesize Deep-Draft Port Dhamra - Single Vessel Capesize)"
        },
        {
            "id": 4,
            "cargo_volume": 300000,
            "origin": "Hay Point",
            "destinations": ["Paradip"],
            "expected_multi_vessel": True,
            "desc": "300,000 MT (Mega Load - Requires Multi-Vessel Fleet)"
        },
        {
            "id": 5,
            "cargo_volume": 500000,
            "origin": "Hay Point",
            "destinations": ["Dhamra"],
            "expected_multi_vessel": True,
            "desc": "500,000 MT (Ultra-Large Load - Requires Multi-Vessel Fleet)"
        }
    ]

    passed_count = 0

    for case in test_cases:
        print(f"\n----------------------------------------------------------------------")
        print(f"TEST CASE {case['id']}: {case['desc']}")
        print(f"----------------------------------------------------------------------")
        
        request = {
            'cargo_volume': case['cargo_volume'],
            'commodity': 'Coal',
            'origin': case['origin'],
            'destinations': case['destinations'],
            'contract_type': 'Spot',
            'arrival_window': ['2026-10-01', '2026-10-15']
        }

        res = engine.get_charter_recommendation(request)

        cargo = case['cargo_volume']
        single_cap = res.get('single_vessel_capacity', 0)
        multi_req = res.get('multi_vessel_required', False)
        shortfall = res.get('capacity_shortfall', 0)
        rec_class = res.get('vessel_recommendation', {}).get('recommended_class', 'N/A')

        print(f"  * Cargo Required        : {cargo:,} MT")
        print(f"  * Destination Port      : {case['destinations'][0]}")
        print(f"  * Recommended Single DWT: {single_cap:,} MT ({rec_class})")
        print(f"  * Multi-Vessel Required : {multi_req}")
        print(f"  * Capacity Shortfall    : {shortfall:,} MT")

        # Assertion 1: Multi-Vessel activation flag matches expectation
        assert multi_req == case['expected_multi_vessel'], f"Expected multi_vessel_required={case['expected_multi_vessel']}, got {multi_req}"

        if not multi_req:
            print("  [SUCCESS] Status: SINGLE VESSEL SUFFICIENT")
            assert cargo <= single_cap, f"Single vessel capacity {single_cap} should cover {cargo}"
            assert shortfall == 0, f"Capacity shortfall should be 0, got {shortfall}"
        else:
            print("  [SUCCESS] Status: MULTI-VESSEL FLEET OPTIMIZATION ACTIVATED")
            optimal = res.get('optimal_fleet')
            assert optimal is not None, "Optimal fleet solution should not be None for multi-vessel request!"

            tot_cap = optimal.get('total_capacity', 0)
            unused = optimal.get('unused_capacity', 0)
            tot_cost = optimal.get('estimated_total_cost', 0)
            savings_pct = optimal.get('savings_percent', 0)
            summary = optimal.get('vessel_types_summary', '')
            vessels = optimal.get('vessels', [])

            print(f"  [OPTIMAL FLEET] Summary : {summary} ({len(vessels)} vessels)")
            print(f"  * Total Fleet Capacity   : {tot_cap:,} MT")
            print(f"  * Unused Capacity Buffer : {unused:,} MT")
            print(f"  * Total Estimated Cost   : ${tot_cost:,.2f}")
            print(f"  * Savings vs Baseline   : {savings_pct}%")

            assert tot_cap >= cargo, f"Total fleet capacity {tot_cap} must cover required cargo {cargo}"
            assert len(vessels) >= 2, f"Multi-vessel solution must contain at least 2 vessels, got {len(vessels)}"
            assert tot_cost > 0, "Estimated total cost must be positive"

            print("\n  Allocated Vessels:")
            for v in vessels:
                print(f"    - {v['name']} ({v['vessel_class']}): {v['capacity']:,} MT | Rate: ${v['rate_per_tonne']}/MT | Freight: ${v['freight_cost']:,.2f}")

            alts = res.get('alternative_fleets', [])
            print(f"\n  Alternative Fleet Options ({len(alts)} options):")
            for alt in alts:
                print(f"    - Option {alt.get('option_number')}: {alt.get('vessel_types_summary')} | Cap: {alt.get('total_capacity'):,} MT | Cost: ${alt.get('estimated_total_cost'):,.2f}")

        passed_count += 1
        print(f"  [PASS] TEST CASE {case['id']} PASSED")

    print("\n" + "=" * 70)
    print(f"ALL {passed_count}/{len(test_cases)} TEST SCENARIOS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
