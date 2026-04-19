// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:senior_project/l10n/app_localizations.dart';
import 'package:senior_project/views/dashboard_view.dart';
import 'package:senior_project/views/results_view.dart';
import 'package:senior_project/views/settings_view.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final language = AppLocalizations.of(context)!;

    final pages = [
      const DashboardView(),
      const ResultsView(),
      const SettingsView(),
    ];

    return Scaffold(
      extendBody: true,

      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF050F2C), Color(0xFF0A1F44), Color(0xFF112D4E)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: IndexedStack(index: _selectedIndex, children: pages),
      ),

      appBar: AppBar(
        title: Text(
          language.secondWelcomeMessage("Saud"),
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        centerTitle: false,
        elevation: 0,
        backgroundColor: Colors.white.withOpacity(0.08),
        foregroundColor: Colors.white,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            border: Border(
              bottom: BorderSide(color: Colors.white.withOpacity(0.1)),
            ),
          ),
        ),
      ),

      bottomNavigationBar: Container(
        margin: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.15)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.35),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          backgroundColor: Colors.transparent,
          selectedItemColor: Colors.white,
          unselectedItemColor: Colors.white60,
          currentIndex: _selectedIndex,

          onTap: (index) => setState(() => _selectedIndex = index),

          items: [
            BottomNavigationBarItem(
              icon: _navIcon(Icons.dashboard, 0),
              label: language.dashboard,
            ),
            BottomNavigationBarItem(
              icon: _navIcon(Icons.history, 1),
              label: language.results,
            ),
            BottomNavigationBarItem(
              icon: _navIcon(Icons.settings, 2),
              label: language.settings,
            ),
          ],
        ),
      ),
    );
  }

  Widget _navIcon(IconData icon, int index) {
    final isActive = _selectedIndex == index;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: isActive ? Colors.white.withOpacity(0.15) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        boxShadow: isActive
            ? [
                BoxShadow(
                  color: Colors.blue.withOpacity(0.25),
                  blurRadius: 12,
                  offset: const Offset(0, 5),
                ),
              ]
            : [],
      ),
      child: Icon(
        icon,
        size: isActive ? 28 : 24,
        color: isActive ? Colors.white : Colors.white60,
      ),
    );
  }
}
