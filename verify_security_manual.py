import sys
import os
# Add current dir to path
sys.path.append(os.getcwd())

from app.utils.qr_security import generate_secure_qr_token, validate_qr_token_v2
from app.utils.geo_utils import calculate_distance
from unittest.mock import MagicMock

def verify():
    print("--- Verifying QR Security ---")
    user_id = 123
    token = generate_secure_qr_token(user_id)
    print(f"Generated Token: {token}")
    
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None
    
    is_valid = validate_qr_token_v2(mock_db, token, user_id)
    print(f"Validation for user {user_id}: {is_valid}")
    assert is_valid == True
    
    is_invalid = validate_qr_token_v2(mock_db, token, 456)
    print(f"Validation for wrong user 456: {is_invalid}")
    assert is_invalid == False
    
    print("\n--- Verifying Geofencing ---")
    # Office: 5.3261, -4.0197
    # Close point: 5.3262, -4.0198
    dist = calculate_distance(5.3261, -4.0197, 5.3262, -4.0198)
    print(f"Distance for close point: {dist:.2f}m")
    assert dist < 50
    
    # Far point: 5.4, -4.1
    dist_far = calculate_distance(5.3261, -4.0197, 5.4, -4.1)
    print(f"Distance for far point: {dist_far:.2f}m")
    assert dist_far > 1000
    
    print("\nSUCCESS: All security logic verified.")

if __name__ == "__main__":
    try:
        verify()
    except Exception as e:
        print(f"\nFAILURE: {e}")
        sys.exit(1)
