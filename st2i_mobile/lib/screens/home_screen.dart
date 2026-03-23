import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../providers/user_provider.dart';
import '../providers/attendance_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/status_badge.dart';
import '../widgets/custom_button.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Timer _timer;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) setState(() => _now = DateTime.now());
    });
    
    _loadData();
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  Future<void> _loadData() async {
    context.read<UserProvider>().fetchProfile();
    context.read<AttendanceProvider>().refreshHomeData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Accueil'),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 24),
              _buildStatusCard(),
              const SizedBox(height: 32),
              _buildHistoryHeader(),
              const SizedBox(height: 16),
              _buildRecentHistory(),
              const SizedBox(height: 32),
              _buildQrCard(),
            ],
          ),
        ).animate().fadeIn(duration: 600.ms),
      ),
    );
  }

  Widget _buildHeader() {
    return Consumer<UserProvider>(
      builder: (context, up, child) {
        if (up.isLoading && up.user == null) return _buildShimmerHeader();
        
        final name = up.user?.prenom ?? 'Utilisateur';
        final dateStr = DateFormat('EEEE d MMMM yyyy', 'fr_FR').format(_now);
        final timeStr = DateFormat('HH:mm:ss').format(_now);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Bonjour, $name 👋', style: AppTextStyles.headlineLarge),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(dateStr, style: AppTextStyles.bodyMedium),
                Text(timeStr, style: AppTextStyles.titleMedium.copyWith(color: AppColors.primary)),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildStatusCard() {
    return Consumer<AttendanceProvider>(
      builder: (context, ap, child) {
        if (ap.isLoading && ap.todayStatus == null) return _buildShimmerCard();

        final status = ap.todayStatus;
        if (status == null || status['type'] == 'none') {
          return _buildInfoCard(
            color: const Color(0xFFFFF3E0),
            title: "Vous n'avez pas encore pointé",
            subtitle: "Une alerte sera envoyée à 09:30 si vous ne pointez pas.",
            icon: Icons.warning_amber_rounded,
            iconColor: Colors.orange,
            buttonLabel: "Pointer maintenant",
            onAction: () => context.go('/scan'),
          );
        }

        if (status['type'] == 'arrivée') {
          return _buildInfoCard(
            color: const Color(0xFFE8F5E9),
            title: "Pointage Arrivée : ${status['time']}",
            subtitle: "Bonne journée de travail chez ST2I !",
            icon: Icons.check_circle_outline,
            iconColor: Colors.green,
            buttonLabel: "Pointer départ",
            onAction: () => context.go('/scan'),
          );
        }

        return _buildInfoCard(
          color: const Color(0xFFE3F2FD),
          title: "Journée terminée",
          subtitle: "Durée totale estimée : ${status['duration'] ?? '--:--'}",
          icon: Icons.task_alt,
          iconColor: Colors.blue,
        );
      },
    );
  }

  Widget _buildInfoCard({
    required Color color,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    String? buttonLabel,
    VoidCallback? onAction,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: iconColor.withOpacity(0.1)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor, size: 40),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTextStyles.titleMedium),
                    Text(subtitle, style: AppTextStyles.labelSmall),
                  ],
                ),
              ),
            ],
          ),
          if (buttonLabel != null) ...[
            const SizedBox(height: 20),
            CustomButton(label: buttonLabel, onPressed: onAction),
          ],
        ],
      ),
    );
  }

  Widget _buildHistoryHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text('Derniers pointages', style: AppTextStyles.titleMedium),
        TextButton(
          onPressed: () => context.go('/history'),
          child: const Text('Voir tout'),
        ),
      ],
    );
  }

  Widget _buildRecentHistory() {
    return Consumer<AttendanceProvider>(
      builder: (context, ap, child) {
        if (ap.isLoading && ap.history.isEmpty) return _buildShimmerHistory();
        if (ap.history.isEmpty) return const Center(child: Text('Aucun historique récent'));

        return Column(
          children: ap.history.map((h) => _buildHistoryTile(h)).toList(),
        );
      },
    );
  }

  Widget _buildHistoryTile(Map<String, dynamic> item) {
    final bool isArrival = item['type'] == 'arrivée';
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.withOpacity(0.1)),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isArrival ? Colors.green.withOpacity(0.1) : Colors.blue.withOpacity(0.1),
          child: Icon(isArrival ? Icons.login : Icons.logout, color: isArrival ? Colors.green : Colors.blue, size: 20),
        ),
        title: Text(isArrival ? 'Arrivée' : 'Départ', style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(item['date'] ?? ''),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(item['heure'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
            StatusBadge(label: item['statut'] ?? 'succès', type: item['statut'] == 'retard' ? 'warning' : 'success'),
          ],
        ),
      ),
    );
  }

  Widget _buildQrCard() {
    return Consumer<UserProvider>(
      builder: (context, up, child) {
        final token = up.user?.qrCodeToken;
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
          ),
          child: Row(
            children: [
              if (token != null)
                SizedBox(
                  width: 60,
                  height: 60,
                  child: QrImageView(data: "ST2I:$token", version: QrVersions.auto),
                )
              else
                Container(width: 60, height: 60, color: Colors.grey[200], child: const Icon(Icons.qr_code_2)),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Mon QR Code', style: AppTextStyles.titleMedium),
                    Text('Utilisez ce code sur la tablette', style: AppTextStyles.labelSmall),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => context.go('/qr-code'),
                icon: const Icon(Icons.open_in_new),
                color: AppColors.primary,
              ),
            ],
          ),
        );
      },
    );
  }

  // Shimmer Helpers
  Widget _buildShimmerHeader() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 200, height: 32, color: Colors.white),
          const SizedBox(height: 8),
          Container(width: 150, height: 16, color: Colors.white),
        ],
      ),
    );
  }

  Widget _buildShimmerCard() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: Container(width: double.infinity, height: 150, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20))),
    );
  }

  Widget _buildShimmerHistory() {
    return Column(
      children: List.generate(3, (index) => Shimmer.fromColors(
        baseColor: Colors.grey[300]!,
        highlightColor: Colors.grey[100]!,
        child: Container(margin: const EdgeInsets.only(bottom: 12), width: double.infinity, height: 70, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12))),
      )),
    );
  }
}
