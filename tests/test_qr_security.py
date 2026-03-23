import pytest
from datetime import datetime, date
from sqlalchemy import create_mock_engine
from app.utils.qr_security import generate_secure_qr_token, validate_qr_token_v2
from app.utils.geo_utils import calculate_distance

def test_qr_token_generation():
    token = generate_secure_qr_token(1)
    parts = token.split(":")
    assert len(parts) == 4
    assert parts[0] == "1"
    assert parts[1] == str(date.today())

def test_qr_token_validation_success(mocker):
    # Mock DB session
    db = mocker.Mock()
    db.query.return_value.filter.return_value.first.return_value = None
    
    token = generate_secure_qr_token(1)
    assert validate_qr_token_v2(db, token, 1) is True

def test_qr_token_validation_wrong_user(mocker):
    db = mocker.Mock()
    token = generate_secure_qr_token(1)
    assert validate_qr_token_v2(db, token, 2) is False

def test_geo_distance():
    # Plateau -> Cocody approximately 5km
    dist = calculate_distance(5.3261, -4.0197, 5.3484, -3.9786)
    assert 4000 < dist < 6000

def test_qr_token_blacklist(mocker):
    db = mocker.Mock()
    # Simulate token already in blacklist
    db.query.return_value.filter.return_value.first.return_value = True
    
    token = generate_secure_qr_token(1)
    assert validate_qr_token_v2(db, token, 1) is False
