import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/scan_service.dart';
import '../widgets/scan_overlay.dart';
import '../widgets/notification_badge.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with SingleTickerProviderStateMixin {
  MobileScannerController? controller;
  bool isScanning = true;
  bool isPaused = false;
  String scanType = "arrivée";

  final ScanService _scanService = ScanService();
  late AnimationController _animationController;

  Map<String, dynamic>? scanResult;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _requestPermissions();
  }

  Future<void> _requestPermissions() async {
    await [Permission.camera, Permission.location].request();
    _startCamera();
  }

  void _startCamera() {
    controller = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
    );
    setState(() {});
  }

  @override
  void dispose() {
    controller?.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (!isScanning || isPaused) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode?.rawValue == null) return;
    _handleScan(barcode!.rawValue);
  }

  Future<void> _handleScan(String? code) async {
    if (code == null) return;

    setState(() {
      isPaused = true;
      isScanning = false;
    });

    try {
      final pos = await _scanService.getCurrentPosition();
      final result = await _scanService.submitScan(
        qrToken: code,
        lat: pos.latitude,
        lon: pos.longitude,
        type: scanType,
      );
      _showFeedback(result);
    } catch (e) {
      _showFeedback({'statut': 'error', 'detail': e.toString()});
    }

    Timer(const Duration(seconds: 5), () {
      if (mounted) {
        setState(() {
          isPaused = false;
          isScanning = true;
          scanResult = null;
        });
      }
    });
  }

  void _showFeedback(Map<String, dynamic> result) {
    setState(() {
      scanResult = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          _buildCameraPreview(),
          _buildOverlay(),
          _buildTopToggle(),
          _buildNotificationIcon(),
          if (scanResult != null) _buildResultFeedback(scanResult!),
        ],
      ),
    );
  }

  Widget _buildNotificationIcon() {
    return SafeArea(
      child: Align(
        alignment: Alignment.topRight,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: const NotificationBadge(color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildCameraPreview() {
    if (controller == null) {
      return const Center(child: CircularProgressIndicator());
    }
    return MobileScanner(
      controller: controller!,
      onDetect: _onDetect,
    );
  }

  Widget _buildOverlay() {
    return CustomPaint(
      painter: ScanOverlayPainter(
        animation: _animationController,
        color: const Color(0xFF1E3A5F),
      ),
      child: Container(),
    );
  }

  Widget _buildTopToggle() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Align(
          alignment: Alignment.topCenter,
          child: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.5),
              borderRadius: BorderRadius.circular(30),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildToggleButton("Arrivée", "arrivée"),
                _buildToggleButton("Départ", "départ"),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildToggleButton(String label, String value) {
    bool isSelected = scanType == value;
    return GestureDetector(
      onTap: () => setState(() => scanType = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1E3A5F) : Colors.transparent,
          borderRadius: BorderRadius.circular(25),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: Colors.white,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildResultFeedback(Map<String, dynamic> result) {
    Color bgColor;
    IconData icon;
    String message = result['detail'] ?? result['message'] ?? 'Erreur inconnue';
    String statut = result['statut'] ?? 'error';

    if (statut == 'succès') {
      bgColor = Colors.green.withOpacity(0.9);
      icon = Icons.check_circle_outline;
    } else if (statut == 'hors_horaires' || statut == 'hors_zone') {
      bgColor = Colors.orange.withOpacity(0.9);
      icon = Icons.warning_amber_rounded;
    } else {
      bgColor = Colors.red.withOpacity(0.9);
      icon = Icons.error_outline;
    }

    return Container(
      color: bgColor,
      width: double.infinity,
      height: double.infinity,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: Colors.white, size: 100),
          const SizedBox(height: 24),
          Text(
            statut.toUpperCase().replaceAll('_', ' '),
            style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }
}
