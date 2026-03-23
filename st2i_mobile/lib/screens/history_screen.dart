import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

import '../providers/attendance_provider.dart';
import '../widgets/custom_app_bar.dart';
import '../widgets/status_badge.dart';
import '../widgets/empty_state.dart';
import '../widgets/details_bottom_sheet.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final List<String> _periods = ['Cette semaine', 'Ce mois', 'Personnalisé'];

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AttendanceProvider>().refreshHistory());
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2023),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(primary: AppColors.primary),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      context.read<AttendanceProvider>().setPeriod('Personnalisé', customRange: picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Historique'),
      body: Column(
        children: [
          _buildPeriodSelector(),
          const Divider(height: 1),
          Expanded(
            child: Consumer<AttendanceProvider>(
              builder: (context, ap, child) {
                if (ap.isLoading && ap.history.isEmpty) {
                  return const Center(child: CircularProgressIndicator());
                }

                return RefreshIndicator(
                  onRefresh: () => ap.refreshHistory(),
                  child: CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(child: _buildStatsHeader(ap)),
                      if (ap.history.isEmpty)
                        const SliverFillRemaining(
                          child: EmptyState(
                            title: 'Aucun pointage',
                            message: 'Changez de période ou effectuez votre premier pointage !',
                            icon: Icons.history,
                          ),
                        )
                      else
                        _buildGroupedList(ap),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodSelector() {
    return Consumer<AttendanceProvider>(
      builder: (context, ap, child) {
        return Container(
          height: 60,
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _periods.length,
            itemBuilder: (context, index) {
              final period = _periods[index];
              final isSelected = ap.selectedPeriod == period;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(period),
                  selected: isSelected,
                  onSelected: (val) {
                    if (period == 'Personnalisé') {
                      _selectDateRange();
                    } else {
                      ap.setPeriod(period);
                    }
                  },
                  selectedColor: AppColors.primary,
                  labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black87),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildStatsHeader(AttendanceProvider ap) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Résumé du mois', style: AppTextStyles.titleMedium),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildStatCard('Présents', '${ap.presentDays}', Colors.green),
              const SizedBox(width: 12),
              _buildStatCard('Retards', '${ap.lateDays}', Colors.orange),
              const SizedBox(width: 12),
              _buildStatCard('Taux', '${ap.presenceRate.toStringAsFixed(1)}%', AppColors.primary),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.1)),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildGroupedList(AttendanceProvider ap) {
    // Basic grouping by Month/Year for now, can be sophisticated with Weekly if needed
    // The user asked for "grouped by week", let's attempt a simple week-of-year grouping
    return AnimationLimiter(
      child: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final item = ap.history[index];
            return AnimationConfiguration.staggeredList(
              position: index,
              duration: const Duration(milliseconds: 375),
              child: SlideAnimation(
                verticalOffset: 50.0,
                child: FadeInAnimation(
                  child: _buildListItem(context, item),
                ),
              ),
            );
          },
          childCount: ap.history.length,
        ),
      ),
    );
  }

  Widget _buildListItem(BuildContext context, Map<String, dynamic> item) {
    final bool isArrival = item['type'] == 'arrivée';
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        onTap: () => showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          builder: (context) => DetailsBottomSheet(record: item),
        ),
        leading: CircleAvatar(
          backgroundColor: isArrival ? Colors.green.withOpacity(0.1) : Colors.blue.withOpacity(0.1),
          child: Icon(isArrival ? Icons.login : Icons.logout, color: isArrival ? Colors.green : Colors.blue),
        ),
        title: Row(
          children: [
            Text(item['date'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
            const Spacer(),
            StatusBadge(
              label: item['statut'] ?? 'VALIDE',
              type: item['statut'] == 'retard' ? 'warning' : 'success',
            ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.access_time, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text('${item['heure'] ?? '--:--'}', style: const TextStyle(color: Colors.black87)),
                const SizedBox(width: 16),
                const Icon(Icons.timer_outlined, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text(item['duration'] ?? 'N/A', style: const TextStyle(color: Colors.black87)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
