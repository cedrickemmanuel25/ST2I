import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../models/user_model.dart';
import '../services/user_service.dart';
import '../widgets/notification_badge.dart';
import '../widgets/status_badge.dart';
import '../theme/app_colors.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final UserService _userService = UserService();
  UserModel? _user;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    try {
      final user = await _userService.fetchProfile();
      setState(() {
        _user = user;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    }
  }

  Future<void> _refreshQr() async {
    if (_user == null) return;
    try {
      await _userService.refreshQrToken(_user!.id);
      await _loadProfile();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur de rafraîchissement: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mon Profil'),
        elevation: 0,
        actions: [
          const NotificationBadge(color: Colors.white),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              // TODO: Implement actual logout via AuthProvider
              Navigator.of(context).pushReplacementNamed('/login');
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  _buildHeader(_user!),
                  const SizedBox(height: 24),
                  _buildQrSection(_user!),
                  const SizedBox(height: 24),
                  _buildDetailsSection(_user!),
                  const SizedBox(height: 24),
                  _buildHistorySection(),
                ],
              ),
            ),
    );
  }

  Widget _buildHeader(UserModel user) {
    final color = AppColors.primary;
    return Column(
      children: [
        CircleAvatar(
          radius: 50,
          backgroundColor: color,
          child: Text(
            user.initials,
            style: const TextStyle(fontSize: 32, color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          user.fullName,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        Text(
          user.email,
          style: TextStyle(color: Colors.grey[600]),
        ),
      ],
    );
  }

  Widget _buildQrSection(UserModel user) {
    const color = AppColors.primary;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 5)),
        ],
      ),
      child: Column(
        children: [
          const Text(
            "Ma Carte d'Accès",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
          ),
          const SizedBox(height: 20),
          if (user.qrCodeToken != null)
            QrImageView(
              data: "ST2I:${user.qrCodeToken}",
              version: QrVersions.auto,
              size: 200.0,
              foregroundColor: color,
            )
          else
            const Text("Aucun QR code généré"),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: _refreshQr,
            icon: const Icon(Icons.refresh),
            label: const Text('Rafraîchir mon QR'),
            style: ElevatedButton.styleFrom(
              backgroundColor: color,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsSection(UserModel user) {
    return Column(
      children: [
        _buildInfoTile(Icons.person, "Rôle", user.role.toUpperCase()),
        ListTile(
          leading: const Icon(Icons.info, color: AppColors.primary),
          title: const Text("Statut", style: TextStyle(fontSize: 14, color: Colors.grey)),
          trailing: StatusBadge(
            label: user.statut, 
            type: user.statut == 'actif' ? 'success' : 'error'
          ),
        ),
      ],
    );
  }

  Widget _buildInfoTile(IconData icon, String label, String value) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFF1E3A5F)),
      title: Text(label, style: const TextStyle(fontSize: 14, color: Colors.grey)),
      subtitle: Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black87)),
    );
  }

  Widget _buildHistorySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            "Dernières Présences",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15), side: BorderSide(color: Colors.grey[200]!)),
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 3, // Simulated display
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              return ListTile(
                leading: const Icon(Icons.check_circle, color: Colors.green),
                title: const Text("Pointage Entrée"),
                subtitle: Text("23 Mars 2026 - 08:3${index} AM"),
                trailing: const Text("ST2I-Main", style: TextStyle(fontSize: 12)),
              );
            },
          ),
        ),
      ],
    );
  }
}
