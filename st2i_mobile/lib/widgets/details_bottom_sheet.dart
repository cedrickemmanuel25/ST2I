import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class DetailsBottomSheet extends StatelessWidget {
  final Map<String, dynamic> record;

  const DetailsBottomSheet({super.key, required this.record});

  @override
  Widget build(BuildContext context) {
    bool isArrival = record['type'] == 'arrivée';

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Détails du Pointage',
                style: AppTextStyles.titleMedium.copyWith(fontSize: 20),
              ),
              IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
            ],
          ),
          const Divider(),
          const SizedBox(height: 16),
          _buildRow(Icons.calendar_today, 'Date', record['date'] ?? '--'),
          _buildRow(Icons.access_time, 'Heure', record['heure'] ?? '--'),
          _buildRow(isArrival ? Icons.login : Icons.logout, 'Type', isArrival ? 'Entrée' : 'Sortie'),
          _buildRow(Icons.location_on_outlined, 'Position GPS', '${record['latitude'] ?? 'N/A'}, ${record['longitude'] ?? 'N/A'}'),
          _buildRow(Icons.devices, 'Appareil', record['device_id'] ?? 'Mobile personnel'),
          _buildRow(Icons.verified_user_outlined, 'Statut', record['statut']?.toUpperCase() ?? 'VALIDE'),
          const SizedBox(height: 24),
          const SizedBox(width: double.infinity, child: Text('Pointage certifié par ST2I System', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 12))),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(width: 16),
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 14)),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        ],
      ),
    );
  }
}
