// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:senior_project/l10n/app_localizations.dart';
import 'package:senior_project/providers/locale_provider.dart';
import 'package:senior_project/utilities/constants.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  var _hiddenPassword = true;
  final _formKey = GlobalKey<FormState>();
  final _idController = TextEditingController();
  final _passwordController = TextEditingController();

  Widget _buildModernField({
    required TextEditingController controller,
    required String label,
    required String? Function(String?) validator,
    bool obscure = false,
    Widget? suffix,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      obscureText: obscure,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        filled: true,
        fillColor: Colors.white.withOpacity(0.08),
        suffixIcon: suffix,
        contentPadding: const EdgeInsets.symmetric(
          vertical: 18,
          horizontal: 16,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Colors.white),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final language = AppLocalizations.of(context)!;
    final localeProvider = context.watch<LocaleProvider>();
    final currentLocale = localeProvider.locale;
    return Scaffold(
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Color(0xFF050F2C),
                  Color(0xFF0A1F44),
                  Color(0xFF112D4E),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),
          SafeArea(
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  Expanded(
                    flex: 2,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            language.firstWelcomeMessage,
                            style: kHeadingStyle.copyWith(
                              color: Colors.white,
                              fontSize: 30,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            language.loginRequestMessage,
                            style: kHeadingStyle.copyWith(
                              color: Colors.white70,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 4,
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(30),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.2),
                        ),
                      ),
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            _buildModernField(
                              controller: _idController,
                              label: language.id,
                              validator: (value) {
                                if (value!.isEmpty) {
                                  return language.emptyValueMessage;
                                } else if (!RegExp(
                                  r'^[a-zA-Z0-9]+$',
                                ).hasMatch(value)) {
                                  return language.invalidIDFormatMessage;
                                } else if (value.length != 10) {
                                  return language.invalidIDLengthMessage;
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: 20),

                            _buildModernField(
                              controller: _passwordController,
                              label: language.password,
                              obscure: _hiddenPassword,
                              suffix: IconButton(
                                icon: Icon(
                                  _hiddenPassword
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                  color: Colors.white70,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _hiddenPassword = !_hiddenPassword;
                                  });
                                },
                              ),
                              validator: (value) {
                                if (value!.isEmpty) {
                                  return language.emptyValueMessage;
                                } else if (value.length < 8) {
                                  return language.invalidPasswordLengthMessage;
                                } else if (!RegExp(
                                  r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)',
                                ).hasMatch(value)) {
                                  return language.invalidPasswordFormatMessage;
                                }
                                return null;
                              },
                            ),

                            const SizedBox(height: 30),

                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () {
                                  if (_formKey.currentState!.validate()) {
                                    Navigator.pushReplacementNamed(
                                      context,
                                      "/dashboard",
                                    );
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  padding: EdgeInsets.zero,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(25),
                                  ),
                                ),
                                child: Ink(
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [
                                        Color(0xFF1E3C72),
                                        Color(0xFF2A5298),
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(25),
                                  ),
                                  child: Container(
                                    alignment: Alignment.center,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 16,
                                    ),
                                    child: Text(
                                      language.login,

                                      style: const TextStyle(
                                        fontSize: 18,
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 16),

                            TextButton(
                              onPressed: () {
                                if (currentLocale.languageCode == "en") {
                                  localeProvider.setLocale(const Locale("ar"));
                                } else {
                                  localeProvider.setLocale(const Locale("en"));
                                }
                              },
                              child: Text(
                                currentLocale.languageCode == "en"
                                    ? "Switch to Arabic"
                                    : "التبديل إلى الإنجليزية",
                                style: kHeadingStyle.copyWith(
                                  fontSize: 14,
                                  color: Colors.white70,
                                ),
                              ),
                            ),

                            const SizedBox(height: 10),

                            Text(
                              language.loginNote,
                              textAlign: TextAlign.center,
                              style: kHeadingStyle.copyWith(
                                fontSize: 13,
                                color: Colors.white60,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
