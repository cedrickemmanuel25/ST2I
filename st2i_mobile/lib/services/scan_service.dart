import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/constants.dart';

class ScanService {
  final _storage = const FlutterSecureStorage();
  final String baseUrl = FlavorConfig.instance.apiUrl;

  Future<Position> getCurrentPosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      return Future.error('Location permissions are permanently denied.');
    }

    return await Geolocator.getCurrentPosition();
  }

  Future<Map<String, dynamic>> submitScan({
    required String qrToken,
    required double lat,
    required double lon,
    required String type,
  }) async {
    String? token = await _storage.read(key: 'jwt_token');
    
    final response = await http.post(
      Uri.parse('$baseUrl/pointage/scan'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({
        'qr_token': qrToken,
        'latitude': lat,
        'longitude': lon,
        'type': type,
      }),
    );

    return json.decode(response.body);
  }
}
