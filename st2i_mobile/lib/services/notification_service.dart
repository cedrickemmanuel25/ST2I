import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/notification_model.dart';
import '../utils/constants.dart';

class NotificationService {
  final _storage = const FlutterSecureStorage();

  Future<List<NotificationModel>> getNotifications() async {
    final token = await _storage.read(key: 'jwt_token');
    final response = await http.get(
      Uri.parse('${FlavorConfig.instance.apiUrl}/notifications/'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return (data['items'] as List)
          .map((item) => NotificationModel.fromJson(item))
          .toList();
    } else {
      throw Exception('Failed to load notifications');
    }
  }

  Future<void> markAsRead(int notificationId) async {
    final token = await _storage.read(key: 'jwt_token');
    await http.patch(
      Uri.parse('${FlavorConfig.instance.apiUrl}/notifications/$notificationId/read'),
      headers: {'Authorization': 'Bearer $token'},
    );
  }

  Future<void> markAllAsRead() async {
    final token = await _storage.read(key: 'jwt_token');
    await http.patch(
      Uri.parse('${FlavorConfig.instance.apiUrl}/notifications/read-all'),
      headers: {'Authorization': 'Bearer $token'},
    );
  }
}
