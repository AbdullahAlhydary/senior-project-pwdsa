import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/prediction_response.dart';
import 'api_config.dart';

class PredictionException implements Exception {
  final String message;
  PredictionException(this.message);
  @override
  String toString() => message;
}

class PredictionService {
  final http.Client _client;
  final Duration timeout;

  PredictionService({http.Client? client, this.timeout = const Duration(seconds: 10)})
      : _client = client ?? http.Client();

  Future<PredictionResponse> predict(Map<String, dynamic> payload) async {
    http.Response resp;
    try {
      resp = await _client
          .post(
            ApiConfig.predictUri(),
            headers: {"Content-Type": "application/json"},
            body: jsonEncode(payload),
          )
          .timeout(timeout);
    } on TimeoutException {
      throw PredictionException("Request timed out. Is the backend running?");
    } catch (e) {
      throw PredictionException("Could not reach the backend ($e).");
    }

    if (resp.statusCode == 200) {
      final body = jsonDecode(utf8.decode(resp.bodyBytes)) as Map<String, dynamic>;
      return PredictionResponse.fromJson(body);
    }
    String detail = "HTTP ${resp.statusCode}";
    try {
      final err = jsonDecode(utf8.decode(resp.bodyBytes));
      if (err is Map && err["detail"] != null) detail = err["detail"].toString();
    } catch (_) {}
    throw PredictionException(detail);
  }

  void dispose() => _client.close();
}
