import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'package:screenshot/screenshot.dart';
import 'package:flutter_windowmanager_plus/flutter_windowmanager_plus.dart';

import '../providers/user_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/custom_button.dart';

class QrCodeScreen extends StatefulWidget {
  const QrCodeScreen({super.key});

  @override
  State<QrCodeScreen> createState() => _QrCodeScreenState();
}

class _QrCodeScreenState extends State<QrCodeScreen> {
  final ScreenshotController _screenshotController = ScreenshotController();
  late Timer _timer;
  Duration _timeUntilMidnight = Duration.zero;

  @override
  void initState() {
    super.initState();
    _enableSecureMode();
    _calculateTimeUntilMidnight();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _calculateTimeUntilMidnight();
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    _disableSecureMode();
    super.dispose();
  }

  Future<void> _enableSecureMode() async {
    if (Platform.isAndroid) {
      await FlutterWindowManagerPlus.addFlags(FlutterWindowManagerPlus.FLAG_SECURE);
    }
  }

  Future<void> _disableSecureMode() async {
    if (Platform.isAndroid) {
      await FlutterWindowManagerPlus.clearFlags(FlutterWindowManagerPlus.FLAG_SECURE);
    }
  }

  void _calculateTimeUntilMidnight() {
    final now = DateTime.now();
    final midnight = DateTime(now.year, now.month, now.day, 23, 59, 59);
    setState(() {
      _timeUntilMidnight = midnight.difference(now);
      if (_timeUntilMidnight.isNegative) _timeUntilMidnight = Duration.zero;
    });
  }

  Future<void> _shareQrCode() async {
    final image = await _screenshotController.capture();
    if (image != null) {
      final directory = await getTemporaryDirectory();
      final imagePath = await File('${directory.path}/qr_code.png').create();
      await imagePath.writeAsBytes(image);
      await Share.shareXFiles([XFile(imagePath.path)], text: 'Mon QR Code ST2I');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Accès Sécurisé'),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.primary,
      ),
      body: Consumer<UserProvider>(
        builder: (context, up, child) {
          final token = up.user?.qrCodeToken;
          final isExpired = _timeUntilMidnight.inSeconds == 0;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const SizedBox(height: 20),
                _buildQrSection(token, isExpired),
                const SizedBox(height: 40),
                _buildInfoSection(isExpired),
                const SizedBox(height: 40),
                _buildActions(up),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildQrSection(String? token, bool isExpired) {
    final progress = _timeUntilMidnight.inSeconds / (24 * 3600);

    return Center(
      child: Screenshot(
        controller: _screenshotController,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.1),
                blurRadius: 20,
                spreadRadius: 5,
              )
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 320,
                height: 320,
                child: CircularProgressIndicator(
                  value: progress,
                  strokeWidth: 8,
                  backgroundColor: Colors.grey[200],
                  valueColor: AlwaysStoppedAnimation<Color>(
                    isExpired ? Colors.red : AppColors.primary,
                  ),
                ),
              ),
              ColorFiltered(
                colorFilter: isExpired 
                  ? const ColorFilter.mode(Colors.grey, BlendMode.saturation)
                  : const ColorFilter.mode(Colors.transparent, BlendMode.multiply),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: token != null
                      ? QrImageView(
                          data: token,
                          version: QrVersions.auto,
                          size: 260.0,
                          eyeStyle: const QrEyeStyle(
                            eyeShape: QrEyeShape.square,
                            color: AppColors.primary,
                          ),
                        )
                      : const SizedBox(
                          width: 260,
                          height: 260,
                          child: Center(child: CircularProgressIndicator()),
                        ),
                ),
              ),
              if (isExpired)
                Container(
                  width: 300,
                  height: 300,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.8),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Center(
                    child: Text(
                      'EXPIRÉ',
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 4,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoSection(bool isExpired) {
    final hours = _timeUntilMidnight.inHours;
    final minutes = _timeUntilMidnight.inMinutes % 60;
    
    return Column(
      children: [
        Text(
          isExpired ? 'Code expiré' : 'Expire dans ${hours}h ${minutes}min',
          style: AppTextStyles.headlineSmall.copyWith(
            color: isExpired ? Colors.red : AppColors.primary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Valide aujourd\'hui jusqu\'à 23h59',
          style: AppTextStyles.bodyMedium.copyWith(color: Colors.grey[600]),
        ),
      ],
    );
  }

  Widget _buildActions(UserProvider up) {
    return Column(
      children: [
        CustomButton(
          label: 'Partager le code',
          icon: Icons.share_rounded,
          onPressed: _shareQrCode,
        ),
        const SizedBox(height: 16),
        TextButton.icon(
          onPressed: () => up.fetchProfile(),
          icon: const Icon(Icons.refresh_rounded),
          label: const Text('Actualiser le code'),
          style: TextButton.styleFrom(foregroundColor: AppColors.primary),
        ),
      ],
    );
  }
}
