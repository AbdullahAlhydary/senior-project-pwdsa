// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:senior_project/l10n/app_localizations.dart';
import 'package:senior_project/pages/dashboard_page.dart';
import 'package:senior_project/pages/login_page.dart';
import 'providers/locale_provider.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => LocaleProvider(),
      child: const SeniorProjectApp(),
    ),
  );
}

class SeniorProjectApp extends StatelessWidget {
  const SeniorProjectApp({super.key});

  @override
  Widget build(BuildContext context) {
    final locale = context.watch<LocaleProvider>().locale;
    const primary = Color(0xFF1E3C72);
    const secondary = Color(0xFF2A5298);
    const background = Color(0xFF050F2C);
    const surface = Color(0xFF0A1F44);
    final theme = ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      fontFamily: "Cairo",
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: secondary,
        surface: surface,
        background: background,
        error: Colors.redAccent,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: false,
        foregroundColor: Colors.white,
        titleTextStyle: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: Colors.white,
          fontFamily: "Cairo",
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 6,
          shadowColor: Colors.black54,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withOpacity(0.06),
        labelStyle: const TextStyle(color: Colors.white70),
        hintStyle: const TextStyle(color: Colors.white38),

        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),

        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.12)),
        ),

        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Colors.white, width: 1.2),
        ),

        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Colors.redAccent),
        ),
      ),

      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: Colors.white,
        unselectedItemColor: Colors.white60,
        type: BottomNavigationBarType.fixed,
        elevation: 12,
      ),

      cardTheme: CardThemeData(
        color: Colors.white.withOpacity(0.06),
        elevation: 6,
        shadowColor: Colors.black54,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      ),

      iconTheme: const IconThemeData(color: Colors.white),

      dividerTheme: DividerThemeData(color: Colors.white.withOpacity(0.08)),
    );

    return MaterialApp(
      debugShowCheckedModeBanner: false,

      theme: theme,

      initialRoute: "/",
      routes: {
        "/": (context) => const LoginPage(),
        "/dashboard": (context) => const DashboardPage(),
      },

      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale("en"), Locale("ar")],
      locale: locale,
    );
  }
}
