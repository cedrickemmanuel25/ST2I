import 'main_common.dart';
import 'utils/constants.dart';
import 'package:flutter/material.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  FlavorConfig.initialize(flavor: AppFlavor.dev);
  await mainCommon();
}
