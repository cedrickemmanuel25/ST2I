class UserModel {
  final int id;
  final String nom;
  final String prenom;
  final String email;
  final String role;
  final String statut;
  final String? qrCodeToken;
  final DateTime? qrCodeExpiry;

  UserModel({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.email,
    required this.role,
    required this.statut,
    this.qrCodeToken,
    this.qrCodeExpiry,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      nom: json['nom'],
      prenom: json['prenom'],
      email: json['email'],
      role: json['role'],
      statut: json['statut'],
      qrCodeToken: json['qr_code_token'],
      qrCodeExpiry: json['qr_code_expiry'] != null 
          ? DateTime.parse(json['qr_code_expiry']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nom': nom,
      'prenom': prenom,
      'email': email,
      'role': role,
      'statut': statut,
      'qr_code_token': qrCodeToken,
      'qr_code_expiry': qrCodeExpiry?.toIso8601String(),
    };
  }

  String get fullName => "$prenom $nom";
  String get initials => "${prenom[0]}${nom[0]}".toUpperCase();
}
