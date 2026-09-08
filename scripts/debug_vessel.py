import pandas as pd
from pathlib import Path

# Get the project root (parent of scripts folder)
project_root = Path(__file__).parent.parent

print(f"📁 Project root: {project_root}")

# Load data using absolute path from project root
ports = pd.read_csv(project_root / 'data/raw/dataset_3_port_infrastructure_rules.csv')
vessels = pd.read_csv(project_root / 'data/raw/dataset_4_vessel_specifications.csv')

print('='*70)
print('DEBUG: VESSEL & PORT DATA')
print('='*70)

print('\n--- VESSEL SPECIFICATIONS ---')
print(vessels[['vessel_class', 'dwt_min', 'dwt_max', 'typical_draft_m', 'typical_loa_m', 'typical_beam_m']].to_string())

print('\n--- PORT CONSTRAINTS (PARADIP) ---')
paradip = ports[ports['port_name'].str.contains('Paradip', case=False)]
if not paradip.empty:
    print(paradip[['port_name', 'max_draft_m', 'max_loa_m', 'max_beam_m', 'max_vessel_class']].to_string())
else:
    print('Paradip not found!')

print('\n--- PORT CONSTRAINTS (DHAMRA) ---')
dhamra = ports[ports['port_name'].str.contains('Dhamra', case=False)]
if not dhamra.empty:
    print(dhamra[['port_name', 'max_draft_m', 'max_loa_m', 'max_beam_m', 'max_vessel_class']].to_string())
else:
    print('Dhamra not found!')

print('\n--- ALL PORT NAMES ---')
print(ports['port_name'].tolist())

print('\n' + '='*70)
print('CHECKING VESSEL FEASIBILITY FOR 150,000 TONNES')
print('='*70)

CARGO = 150000

for _, vessel in vessels.iterrows():
    vc = vessel['vessel_class']
    max_dwt = vessel['dwt_max']
    draft = vessel['typical_draft_m']
    loa = vessel['typical_loa_m']
    beam = vessel['typical_beam_m']
    
    print(f'\n--- {vc} ---')
    print(f'   Max DWT: {max_dwt} tonnes')
    
    if CARGO <= max_dwt:
        print(f'   Can carry {CARGO} tonnes')
        
        # Check Paradip
        if not paradip.empty:
            p_draft = paradip.iloc[0]['max_draft_m']
            p_loa = paradip.iloc[0]['max_loa_m']
            p_beam = paradip.iloc[0]['max_beam_m']
            
            draft_ok = draft <= p_draft
            loa_ok = loa <= p_loa
            beam_ok = beam <= p_beam
            
            print(f'   Paradip: Draft {draft}m <= {p_draft}m? {draft_ok}')
            print(f'            LOA {loa}m <= {p_loa}m? {loa_ok}')
            print(f'            Beam {beam}m <= {p_beam}m? {beam_ok}')
            print(f'   Feasible at Paradip: {draft_ok and loa_ok and beam_ok}')
        
        # Check Dhamra
        if not dhamra.empty:
            d_draft = dhamra.iloc[0]['max_draft_m']
            d_loa = dhamra.iloc[0]['max_loa_m']
            d_beam = dhamra.iloc[0]['max_beam_m']
            
            draft_ok = draft <= d_draft
            loa_ok = loa <= d_loa
            beam_ok = beam <= d_beam
            
            print(f'   Dhamra: Draft {draft}m <= {d_draft}m? {draft_ok}')
            print(f'           LOA {loa}m <= {d_loa}m? {loa_ok}')
            print(f'           Beam {beam}m <= {d_beam}m? {beam_ok}')
            print(f'   Feasible at Dhamra: {draft_ok and loa_ok and beam_ok}')
    else:
        print(f'   Cannot carry {CARGO} tonnes (max: {max_dwt})')
        print(f'   Could use {int(CARGO/max_dwt)+1} trips of {vc}')

print('\n' + '='*70)
print('MULTI-TRIP OPTIONS FOR 150,000 TONNES')
print('='*70)

vessel_list = vessels.to_dict('records')
best_combination = None
best_trips = 999

for i, v1 in enumerate(vessel_list):
    for j, v2 in enumerate(vessel_list):
        total_capacity = v1['dwt_max'] + v2['dwt_max']
        trips = 2
        if total_capacity >= CARGO:
            if trips < best_trips:
                best_trips = trips
                best_combination = f"{v1['vessel_class']} + {v2['vessel_class']} = {total_capacity} tonnes ({trips} trips)"

if best_combination:
    print(f'Best multi-trip option: {best_combination}')
else:
    print('No combination found')