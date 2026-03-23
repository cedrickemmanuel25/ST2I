class AppConstants {
  static const String devApiUrl = "http://192.168.100.10:8000"; // Physical device access
  static const String prodApiUrl = "https://api.st2i.com";
  
  static const String loginEndpoint = "/auth/login";
  static const String presenceEndpoint = "/presences";
  
  static const int qrExpiryDays = 7;
}

enum AppFlavor {
  dev,
  prod,
}

class FlavorConfig {
  final AppFlavor flavor;
  final String apiUrl;
  
  static FlavorConfig? _instance;
  
  FlavorConfig._internal(this.flavor, this.apiUrl);
  
  static void initialize({required AppFlavor flavor}) {
    String url = flavor == AppFlavor.dev ? AppConstants.devApiUrl : AppConstants.prodApiUrl;
    _instance = FlavorConfig._internal(flavor, url);
  }
  
  static FlavorConfig get instance => _instance!;
}
