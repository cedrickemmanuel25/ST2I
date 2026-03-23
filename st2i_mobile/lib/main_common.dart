import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/notification_provider.dart';
import 'providers/attendance_provider.dart';
import 'providers/user_provider.dart';
import 'utils/local_notifications_helper.dart';
import 'theme/app_theme.dart';
import 'router/app_router.dart';
import 'package:intl/date_symbol_data_local.dart';

Future<void> mainCommon() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('fr_FR', null);
  await LocalNotificationsHelper.init();
  
  // Schedule daily reminders (placeholder times)
  LocalNotificationsHelper.scheduleDailyReminder(
    id: 1, title: 'ST2I - Début de journée', body: 'N\'oubliez pas de pointer votre arrivée !',
    hour: 8, minute: 0
  );
  LocalNotificationsHelper.scheduleDailyReminder(
    id: 2, title: 'ST2I - Fin de journée', body: 'N\'oubliez pas de pointer votre départ !',
    hour: 17, minute: 0
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
      ],
      child: const ST2IApp(),
    ),
  );
}

class ST2IApp extends StatelessWidget {
  const ST2IApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'ST2I Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: AppRouter.router,
    );
  }
}
