import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/notification_provider.dart';
import '../models/notification_model.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../widgets/empty_state.dart';
import '../widgets/status_badge.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Notifications', 
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all, color: Colors.white),
            tooltip: 'Tout marquer comme lu',
            onPressed: () => context.read<NotificationProvider>().markAllAsRead(),
          ),
        ],
      ),
      body: Consumer<NotificationProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.notifications.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.notifications.isEmpty) {
            return const EmptyState(
              title: 'Aucune notification',
              message: 'Vous êtes à jour ! Vos alertes s\'afficheront ici.',
              icon: Icons.notifications_none_outlined,
            );
          }

          final grouped = _groupNotifications(provider.notifications);

          return RefreshIndicator(
            onRefresh: () => provider.fetchNotifications(),
            child: ListView.builder(
              itemCount: grouped.length,
              itemBuilder: (context, index) {
                final entry = grouped.entries.elementAt(index);
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                      child: Text(entry.key, 
                        style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.bold)),
                    ),
                    ...entry.value.map((n) => _buildNotificationTile(context, n)),
                  ],
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildNotificationTile(BuildContext context, NotificationModel n) {
    return Dismissible(
      key: Key(n.id.toString()),
      background: Container(
        color: Colors.blue.withOpacity(0.1),
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: const Icon(Icons.mark_chat_read, color: Colors.blue),
      ),
      confirmDismiss: (direction) async {
        context.read<NotificationProvider>().markAsRead(n.id);
        return false; // Don't remove from UI manually, Provider will re-render
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: n.estLu ? Colors.white : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: n.estLu ? null : Border.all(color: Colors.blue.withOpacity(0.3), width: 1),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: const Offset(0, 2))],
        ),
        child: ListTile(
          leading: _getIcon(n.type),
          title: Text(n.titre, style: TextStyle(fontWeight: n.estLu ? FontWeight.normal : FontWeight.bold)),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(n.message),
              const SizedBox(height: 4),
              Text(DateFormat('HH:mm').format(n.dateEnvoi), style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
          onTap: () => context.read<NotificationProvider>().markAsRead(n.id),
        ),
      ),
    );
  }

  Widget _getIcon(String type) {
    switch (type) {
      case 'alerte': return const CircleAvatar(backgroundColor: Color(0xFFFFEBEE), child: Icon(Icons.warning_amber, color: AppColors.error, size: 20));
      case 'rappel': return const CircleAvatar(backgroundColor: Color(0xFFE3F2FD), child: Icon(Icons.notifications_active, color: AppColors.secondary, size: 20));
      default: return const CircleAvatar(backgroundColor: Color(0xFFF5F5F5), child: Icon(Icons.info_outline, color: AppColors.textSecondary, size: 20));
    }
  }

  Map<String, List<NotificationModel>> _groupNotifications(List<NotificationModel> list) {
    final now = DateTime.now();
    final today = DateFormat('yyyy-MM-dd').format(now);
    final yesterday = DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 1)));

    Map<String, List<NotificationModel>> groups = {};
    for (var n in list) {
      final date = DateFormat('yyyy-MM-dd').format(n.dateEnvoi);
      String label;
      if (date == today) label = "Aujourd'hui";
      else if (date == yesterday) label = "Hier";
      else label = DateFormat('dd MMMM').format(n.dateEnvoi);

      if (!groups.containsKey(label)) groups[label] = [];
      groups[label]!.add(n);
    }
    return groups;
  }
}
