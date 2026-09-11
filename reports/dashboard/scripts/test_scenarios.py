"""
SIH 2026 BulkMatrix Scenario Verification Suite
Tests the 3 core SIH dry bulk chartering scenarios against CharterEngine
"""

import sys
from pathlib import Path

# Configure UTF-8 encoding for Windows stdout
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add src to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


from charter_engine import CharterEngine


def test_scenario(engine: CharterEngine, scenario_num: int, title: str, request_data: dict):
    print(f"\n=======================================================")
    print(f"🧪 SCENARIO {scenario_num}: {title}")
    print(f"=======================================================")
    print(f"📦 Input Request: {request_data}")
    
    try:
        recommendation = engine.get_charter_recommendation(request_data)
        
        if "error" in recommendation:
            print(f"❌ Scenario {scenario_num} failed with error: {recommendation['error']}")
            return False

        vessel_rec = recommendation.get("vessel_recommendation", {})
        rec_class = vessel_rec.get("recommended_class") or vessel_rec.get("feasible_classes", ["N/A"])[0] if vessel_rec.get("feasible_classes") else "Multi-Trip Required"
        print(f"🚢 Recommended Vessel Class: {rec_class}")
        print(f"✅ Feasible Vessel Classes: {vessel_rec.get('feasible_classes', [])}")
        
        summary = recommendation.get("summary", {})
        print(f"⚓ Total Port Stay Days: {summary.get('total_port_days', 0)} days")
        print(f"⚠️ Risk Count: {summary.get('risk_count', 0)}")
        
        signal = recommendation.get("buy_hold_signal", {})
        print(f"📈 Buy/Hold Signal: {signal.get('signal', 'N/A')} (Confidence: {signal.get('confidence', 0)*100:.0f}%)")
        print(f"💡 Actionable Advice: {signal.get('reason', 'N/A')}")
        
        assert recommendation.get("vessel_recommendation") is not None, "Vessel recommendation should not be None"
        assert recommendation.get("buy_hold_signal") is not None, "Buy/Hold signal should not be None"
        
        print(f"✅ SCENARIO {scenario_num} PASSED SUCCESSFULLY!")
        return True

        
    except Exception as e:
        print(f"❌ Exception during Scenario {scenario_num}: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("🚀 Initializing CharterEngine for Scenario Validation...")
    engine = CharterEngine()
    
    scenarios = [
        (
            1,
            "150k tonnes Coal: Hay Point -> Paradip",
            {
                "cargo_volume": 150000,
                "commodity": "Coal",
                "origin": "Hay Point",
                "destinations": ["Paradip"],
                "contract_type": "Spot"
            }
        ),
        (
            2,
            "70k tonnes Coal: Gladstone -> Gangavaram",
            {
                "cargo_volume": 70000,
                "commodity": "Coal",
                "origin": "Gladstone",
                "destinations": ["Gangavaram"],
                "contract_type": "Short Term"
            }
        ),
        (
            3,
            "120k tonnes Iron Ore: Port Hedland -> Visakhapatnam (Outer_VGCB)",
            {
                "cargo_volume": 120000,
                "commodity": "Iron Ore",
                "origin": "Port Hedland",
                "destinations": ["Visakhapatnam (Outer_VGCB)"],
                "contract_type": "Spot"
            }
        )
    ]
    
    passed = 0
    total = len(scenarios)
    
    for num, title, req in scenarios:
        if test_scenario(engine, num, title, req):
            passed += 1
            
    print(f"\n=======================================================")
    print(f"🏆 TEST SUMMARY: {passed}/{total} SCENARIOS PASSED")
    print(f"=======================================================")
    
    if passed == total:
        print("🎉 ALL TEST SCENARIOS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("⚠️ SOME SCENARIOS FAILED.")
        sys.exit(1)


if __name__ == "__main__":
    main()
