import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../utils/constants.dart';

class UserService {
  final _storage = const FlutterSecureStorage();
  final String baseUrl = FlavorConfig.instance.apiUrl;

  Future<Map<String, String>> _getHeaders() async {
    String? token = await _storage.read(key: 'jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<UserModel> fetchProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'), // Or /users/me depending on backend routing
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      return UserModel.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load profile');
    }
  }

  Future<void> refreshQrToken(int userId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users/$userId/generate-qr'),
      headers: await _getHeaders(),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to refresh QR token');
    }
  }
}
