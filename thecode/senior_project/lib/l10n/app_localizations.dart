import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
  ];

  /// No description provided for @secondWelcomeMessage.
  ///
  /// In en, this message translates to:
  /// **'Welcome, {name}!'**
  String secondWelcomeMessage(Object name);

  /// No description provided for @correctIDMessage.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid employee ID'**
  String get correctIDMessage;

  /// No description provided for @correctPasswordMessage.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid password'**
  String get correctPasswordMessage;

  /// No description provided for @id.
  ///
  /// In en, this message translates to:
  /// **'Employee ID'**
  String get id;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @firstWelcomeMessage.
  ///
  /// In en, this message translates to:
  /// **'Welcome to the Water Analyzer app!'**
  String get firstWelcomeMessage;

  /// No description provided for @loginRequestMessage.
  ///
  /// In en, this message translates to:
  /// **'Please log in to continue'**
  String get loginRequestMessage;

  /// No description provided for @loginNote.
  ///
  /// In en, this message translates to:
  /// **'NOTE: if you don\'t have an account or forgot your password, please contact your administrator'**
  String get loginNote;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Log in'**
  String get login;

  /// No description provided for @dashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get dashboard;

  /// No description provided for @results.
  ///
  /// In en, this message translates to:
  /// **'Results'**
  String get results;

  /// No description provided for @reports.
  ///
  /// In en, this message translates to:
  /// **'Reports'**
  String get reports;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @provideData.
  ///
  /// In en, this message translates to:
  /// **'Please provide the required data to view results'**
  String get provideData;

  /// No description provided for @viewResults.
  ///
  /// In en, this message translates to:
  /// **'View Results'**
  String get viewResults;

  /// No description provided for @emptyValueMessage.
  ///
  /// In en, this message translates to:
  /// **'Make sure to enter a value in the field'**
  String get emptyValueMessage;

  /// No description provided for @nonNumricalMessage.
  ///
  /// In en, this message translates to:
  /// **'Make sure to enter a numrical value only'**
  String get nonNumricalMessage;

  /// No description provided for @invalidIDLengthMessage.
  ///
  /// In en, this message translates to:
  /// **'Employee ID must be exactly 10 characters'**
  String get invalidIDLengthMessage;

  /// No description provided for @invalidIDFormatMessage.
  ///
  /// In en, this message translates to:
  /// **'Field must contain only letters and/or numbers'**
  String get invalidIDFormatMessage;

  /// No description provided for @invalidIDMessage.
  ///
  /// In en, this message translates to:
  /// **'Employee ID must be exactly 10 characters and contain only letters and/or numbers'**
  String get invalidIDMessage;

  /// No description provided for @invalidPasswordLengthMessage.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters'**
  String get invalidPasswordLengthMessage;

  /// No description provided for @invalidPasswordFormatMessage.
  ///
  /// In en, this message translates to:
  /// **'Password must contain at least one uppercase letter, one lowercase letter, and one number'**
  String get invalidPasswordFormatMessage;

  /// No description provided for @greaterThanZeroValidationMessage.
  ///
  /// In en, this message translates to:
  /// **'Value of this field must be greater than 0'**
  String get greaterThanZeroValidationMessage;

  /// No description provided for @positiveNumberValidationMessage.
  ///
  /// In en, this message translates to:
  /// **'Value of this field must be positive'**
  String get positiveNumberValidationMessage;

  /// No description provided for @pressureValidationMessage.
  ///
  /// In en, this message translates to:
  /// **'Value of this field cannot exceed MAIP'**
  String get pressureValidationMessage;

  /// No description provided for @valueBetweenValidationMessage.
  ///
  /// In en, this message translates to:
  /// **'Value of this field must be between {firstNumber} and {secondNumber}'**
  String valueBetweenValidationMessage(Object firstNumber, Object secondNumber);

  /// No description provided for @decisionResult.
  ///
  /// In en, this message translates to:
  /// **'{decision}'**
  String decisionResult(Object decision);

  /// No description provided for @showResults.
  ///
  /// In en, this message translates to:
  /// **'Show Results'**
  String get showResults;

  /// No description provided for @probabilities.
  ///
  /// In en, this message translates to:
  /// **'Probabilities'**
  String get probabilities;

  /// No description provided for @lowRisk.
  ///
  /// In en, this message translates to:
  /// **'Low Risk'**
  String get lowRisk;

  /// No description provided for @moderateRisk.
  ///
  /// In en, this message translates to:
  /// **'Medium Risk'**
  String get moderateRisk;

  /// No description provided for @highRisk.
  ///
  /// In en, this message translates to:
  /// **'High Risk'**
  String get highRisk;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
