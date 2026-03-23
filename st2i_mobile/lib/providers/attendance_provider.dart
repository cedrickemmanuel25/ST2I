import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/attendance_service.dart';

class AttendanceProvider with ChangeNotifier {
  final AttendanceService _service = AttendanceService();
  
  Map<String, dynamic>? _todayStatus;
  List<Map<String, dynamic>> _history = [];
  bool _isLoading = false;

  // Filters
  String _selectedPeriod = 'Ce mois';
  DateTimeRange? _customDateRange;

  Map<String, dynamic>? get todayStatus => _todayStatus;
  List<Map<String, dynamic>> get history => _history;
  bool get isLoading => _isLoading;
  String get selectedPeriod => _selectedPeriod;
  DateTimeRange? get customDateRange => _customDateRange;

  // Monthly Stats
  int get presentDays => _history.where((e) => e['statut'] == 'présent' || e['statut'] == 'succès').length;
  int get lateDays => _history.where((e) => e['statut'] == 'retard').length;
  int get absentDays => _history.where((e) => e['statut'] == 'absent').length;
  double get presenceRate {
    if (_history.isEmpty) return 0.0;
    return (presentDays / _history.length) * 100;
  }

  void setPeriod(String period, {DateTimeRange? customRange}) {
    _selectedPeriod = period;
    _customDateRange = customRange;
    refreshHistory();
  }

  Future<void> refreshHomeData() async {
    _isLoading = true;
    notifyListeners();
    try {
      _todayStatus = await _service.getTodayStatus();
      _history = await _service.getHistory(limit: 5);
    } catch (e) {
      debugPrint('Error refreshing home data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshHistory() async {
    _isLoading = true;
    notifyListeners();
    
    String? startStr;
    String? endStr;

    final now = DateTime.now();
    if (_selectedPeriod == 'Cette semaine') {
      final weekStart = now.subtract(Duration(days: now.weekday - 1));
      startStr = DateFormat('yyyy-MM-dd').format(weekStart);
    } else if (_selectedPeriod == 'Ce mois') {
      startStr = DateFormat('yyyy-MM-01').format(now);
    } else if (_selectedPeriod == 'Personnalisé' && _customDateRange != null) {
      startStr = DateFormat('yyyy-MM-dd').format(_customDateRange!.start);
      endStr = DateFormat('yyyy-MM-dd').format(_customDateRange!.end);
    }

    try {
      _history = await _service.getHistory(limit: 100, startDate: startStr, endDate: endStr);
    } catch (e) {
      debugPrint('Error refreshing history: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
