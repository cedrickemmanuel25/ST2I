import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final String type; // success, warning, error, info

  const StatusBadge({
    super.key,
    required this.label,
    required this.type,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;

    switch (type) {
      case 'success':
        bgColor = const Color(0xFF27AE60).withOpacity(0.1);
        textColor = const Color(0xFF27AE60);
        break;
      case 'warning':
        bgColor = const Color(0xFFF39C12).withOpacity(0.1);
        textColor = const Color(0xFFF39C12);
        break;
      case 'error':
        bgColor = const Color(0xFFE74C3C).withOpacity(0.1);
        textColor = const Color(0xFFE74C3C);
        break;
      default:
        bgColor = Colors.blue.withOpacity(0.1);
        textColor = Colors.blue;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          color: textColor,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
