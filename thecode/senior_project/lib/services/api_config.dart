import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';

/// Base URL for the PWDSA prediction API.
///
/// - Desktop/web: `http://127.0.0.1:8000`
/// - Android emulator: `http://10.0.2.2:8000` (loopback to host)
/// - Real device: override [apiBaseUrlOverride] or set `--dart-define=API_BASE_URL=...`
class ApiConfig {
  static const String _compileTimeOverride = String.fromEnvironment("API_BASE_URL");
  static String? apiBaseUrlOverride;

  static String get baseUrl {
    if (apiBaseUrlOverride != null && apiBaseUrlOverride!.isNotEmpty) {
      return apiBaseUrlOverride!;
    }
    if (_compileTimeOverride.isNotEmpty) return _compileTimeOverride;
    if (kIsWeb) return "http://127.0.0.1:8000";
    try {
      if (Platform.isAndroid) return "http://10.0.2.2:8000";
    } catch (_) {}
    return "http://127.0.0.1:8000";
  }

  static Uri predictUri() => Uri.parse("$baseUrl/api/v1/predict");
  static Uri healthUri() => Uri.parse("$baseUrl/api/v1/health");
}
