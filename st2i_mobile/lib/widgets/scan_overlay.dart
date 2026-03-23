import 'package:flutter/material.dart';

class ScanOverlayPainter extends CustomPainter {
  final Animation<double> animation;
  final Color color;

  ScanOverlayPainter({required this.animation, required this.color}) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;

    const double cornerSize = 30;
    final double padding = size.width * 0.15;
    final Rect scanRect = Rect.fromLTRB(padding, size.height * 0.3, size.width - padding, size.height * 0.3 + (size.width - 2 * padding));

    // Draw corners
    // Top Left
    canvas.drawPath(Path()..moveTo(scanRect.left, scanRect.top + cornerSize)..lineTo(scanRect.left, scanRect.top)..lineTo(scanRect.left + cornerSize, scanRect.top), paint);
    // Top Right
    canvas.drawPath(Path()..moveTo(scanRect.right - cornerSize, scanRect.top)..lineTo(scanRect.right, scanRect.top)..lineTo(scanRect.right, scanRect.top + cornerSize), paint);
    // Bottom Left
    canvas.drawPath(Path()..moveTo(scanRect.left, scanRect.bottom - cornerSize)..lineTo(scanRect.left, scanRect.bottom)..lineTo(scanRect.left + cornerSize, scanRect.bottom), paint);
    // Bottom Right
    canvas.drawPath(Path()..moveTo(scanRect.right - cornerSize, scanRect.bottom)..lineTo(scanRect.right, scanRect.bottom)..lineTo(scanRect.right, scanRect.bottom - cornerSize), paint);

    // Scan Line Animation
    final lineY = scanRect.top + (scanRect.height * animation.value);
    final linePaint = Paint()
      ..color = color.withOpacity(0.5)
      ..strokeWidth = 2;
    
    canvas.drawLine(Offset(scanRect.left + 5, lineY), Offset(scanRect.right - 5, lineY), linePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
