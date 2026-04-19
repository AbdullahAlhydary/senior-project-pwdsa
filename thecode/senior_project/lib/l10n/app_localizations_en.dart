// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String secondWelcomeMessage(Object name) {
    return 'Welcome, $name!';
  }

  @override
  String get correctIDMessage => 'Please enter a valid employee ID';

  @override
  String get correctPasswordMessage => 'Please enter a valid password';

  @override
  String get id => 'Employee ID';

  @override
  String get password => 'Password';

  @override
  String get firstWelcomeMessage => 'Welcome to the Water Analyzer app!';

  @override
  String get loginRequestMessage => 'Please log in to continue';

  @override
  String get loginNote =>
      'NOTE: if you don\'t have an account or forgot your password, please contact your administrator';

  @override
  String get login => 'Log in';

  @override
  String get dashboard => 'Dashboard';

  @override
  String get results => 'Results';

  @override
  String get reports => 'Reports';

  @override
  String get settings => 'Settings';

  @override
  String get provideData => 'Please provide the required data to view results';

  @override
  String get viewResults => 'View Results';

  @override
  String get emptyValueMessage => 'Make sure to enter a value in the field';

  @override
  String get nonNumricalMessage => 'Make sure to enter a numrical value only';

  @override
  String get invalidIDLengthMessage =>
      'Employee ID must be exactly 10 characters';

  @override
  String get invalidIDFormatMessage =>
      'Field must contain only letters and/or numbers';

  @override
  String get invalidIDMessage =>
      'Employee ID must be exactly 10 characters and contain only letters and/or numbers';

  @override
  String get invalidPasswordLengthMessage =>
      'Password must be at least 8 characters';

  @override
  String get invalidPasswordFormatMessage =>
      'Password must contain at least one uppercase letter, one lowercase letter, and one number';

  @override
  String get greaterThanZeroValidationMessage =>
      'Value of this field must be greater than 0';

  @override
  String get positiveNumberValidationMessage =>
      'Value of this field must be positive';

  @override
  String get pressureValidationMessage =>
      'Value of this field cannot exceed MAIP';

  @override
  String valueBetweenValidationMessage(
    Object firstNumber,
    Object secondNumber,
  ) {
    return 'Value of this field must be between $firstNumber and $secondNumber';
  }

  @override
  String decisionResult(Object decision) {
    return '$decision';
  }

  @override
  String get showResults => 'Show Results';

  @override
  String get probabilities => 'Probabilities';

  @override
  String get lowRisk => 'Low Risk';

  @override
  String get moderateRisk => 'Medium Risk';

  @override
  String get highRisk => 'High Risk';

  @override
  String get logout => 'Logout';
}
