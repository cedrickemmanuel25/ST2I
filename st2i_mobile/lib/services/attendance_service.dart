import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/constants.dart';

class AttendanceService {
  final _storage = const FlutterSecureStorage();
  final String baseUrl = FlavorConfig.instance.apiUrl;

  Future<Map<String, dynamic>> getTodayStatus() async {
    String? token = await _storage.read(key: 'jwt_token');
    final response = await http.get(
      Uri.parse('$baseUrl/pointage/today-status'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to get today status');
  }

  Future<List<Map<String, dynamic>>> getHistory({int limit = 20, String? startDate, String? endDate}) async {
    String? token = await _storage.read(key: 'jwt_token');
    String url = '$baseUrl/pointage/history?limit=$limit';
    if (startDate != null) url += '&start_date=$startDate';
    if (endDate != null) url += '&end_date=$endDate';

    final response = await http.get(
      Uri.parse(url),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['items'];
      return data.cast<Map<String, dynamic>>();
    }
    throw Exception('Failed to get history');
  }
}
