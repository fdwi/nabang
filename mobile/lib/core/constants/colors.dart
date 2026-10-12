import 'package:flutter/material.dart';

class NabangColors {
  // Brand Palette: Livin' Pink Edition Nabang
  static const Color primary = Color(0xFFE11D48); // Rose 600
  static const Color primaryDark = Color(0xFF881337); // Rose 900
  static const Color primaryDeep = Color(0xFFBE123C); // Rose 700
  static const Color primaryLight = Color(0xFFFB7185); // Rose 400
  static const Color primarySoft = Color(0xFFFFF1F2); // Rose 50
  static const Color primaryBorder = Color(0xFFFECDD3); // Rose 200

  // Gradient
  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF881337), Color(0xFFE11D48), Color(0xFFFB7185)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Neutral Palette
  static const Color background = Color(0xFFFAFBFC);
  static const Color surface = Colors.white;
  static const Color card = Colors.white;
  static const Color border = Color(0xFFE2E8F0);

  // Typography Colors
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF475569); // Slate 600
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400

  // Semantic
  static const Color success = Color(0xFF10B981); // Emerald 500
  static const Color successSoft = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFF59E0B); // Amber 500
  static const Color danger = Color(0xFFEF4444); // Red 500
  static const Color dangerSoft = Color(0xFFFEF2F2);
}
