import 'main_common.dart';
import 'utils/constants.dart';

void main() {
  FlavorConfig.initialize(flavor: AppFlavor.prod);
  mainCommon();
}
