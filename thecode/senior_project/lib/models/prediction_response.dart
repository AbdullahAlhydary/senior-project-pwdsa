class PredictionResponse {
  final String decision;
  final double confidence;
  final Map<String, double> probabilities;
  final String summary;
  final String modelName;

  PredictionResponse({
    required this.decision,
    required this.confidence,
    required this.probabilities,
    required this.summary,
    required this.modelName,
  });

  factory PredictionResponse.fromJson(Map<String, dynamic> json) {
    final probs = (json["probabilities"] as Map<String, dynamic>).map(
      (k, v) => MapEntry(k, (v as num).toDouble()),
    );
    return PredictionResponse(
      decision: json["decision"] as String,
      confidence: (json["confidence"] as num).toDouble(),
      probabilities: probs,
      summary: json["summary"] as String? ?? "",
      modelName: json["model_name"] as String? ?? "unknown",
    );
  }
}
