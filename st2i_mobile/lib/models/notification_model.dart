class NotificationModel {
  final int id;
  final String titre;
  final String message;
  final String type;
  final DateTime dateEnvoi;
  bool estLu;

  NotificationModel({
    required this.id,
    required this.titre,
    required this.message,
    required this.type,
    required this.dateEnvoi,
    this.estLu = false,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'],
      titre: json['titre'],
      message: json['message'],
      type: json['type'],
      dateEnvoi: DateTime.parse(json['date_envoi']),
      estLu: json['est_lu'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titre': titre,
      'message': message,
      'type': type,
      'date_envoi': dateEnvoi.toIso8601String(),
      'est_lu': estLu,
    };
  }
}
