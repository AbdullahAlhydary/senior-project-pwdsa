// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String secondWelcomeMessage(Object name) {
    return 'مرحبا بك, $name!';
  }

  @override
  String get correctIDMessage => 'يرجى إدخال رقم موظف صالح';

  @override
  String get correctPasswordMessage => 'يرجى إدخال كلمة مرور صالحة';

  @override
  String get id => 'رقم الموظف';

  @override
  String get password => 'كلمة المرور';

  @override
  String get firstWelcomeMessage => 'مرحبا بك في تطبيق محلل المياه!';

  @override
  String get loginRequestMessage => 'يرجى تسجيل الدخول للمتابعة';

  @override
  String get loginNote =>
      'ملاحظة: إذا لم يكن لديك حساب أو نسيت كلمة المرور، يرجى الاتصال بالمسؤول الخاص بك';

  @override
  String get login => 'تسجيل الدخول';

  @override
  String get dashboard => 'لوحة التحكم';

  @override
  String get results => 'النتائج';

  @override
  String get reports => 'التقارير';

  @override
  String get settings => 'الإعدادات';

  @override
  String get provideData => 'قدم البيانات المطلوبة لرؤية النتائج';

  @override
  String get viewResults => 'أظهر النتائج';

  @override
  String get emptyValueMessage => 'يرجى التأكد من إدخال قيمة في الحقل';

  @override
  String get nonNumricalMessage => 'يرجى التأكد من إدخال أرقام فقط';

  @override
  String get invalidIDLengthMessage =>
      'يجب أن يتكون رقم الموظف من 10 أحرف بالضبط';

  @override
  String get invalidIDFormatMessage =>
      'يجب أن يتكون الحقل من حروف و/أو أرقام فقط';

  @override
  String get invalidIDMessage =>
      'يجب ان يتكون رقم الموظف من 10 احرف مع/أو أرقام فقط';

  @override
  String get invalidPasswordLengthMessage =>
      'يجب أن تكون كلمة المرور 8 أحرف على الأقل';

  @override
  String get invalidPasswordFormatMessage =>
      'يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم';

  @override
  String get greaterThanZeroValidationMessage =>
      'قيمة هذا الحقل يجب أن تكون أكبر من 0';

  @override
  String get positiveNumberValidationMessage =>
      'قيمة هذا الحقل يجب أن تكون موجبة';

  @override
  String get pressureValidationMessage =>
      'قيمة هذا الحقل يجب ألا تتعدى قيمة الحقل MAIP';

  @override
  String valueBetweenValidationMessage(
    Object firstNumber,
    Object secondNumber,
  ) {
    return 'قيمة هذا الحقل يجب أن تكون بين $firstNumber إلى $secondNumber';
  }

  @override
  String decisionResult(Object decision) {
    return '$decision';
  }

  @override
  String get showResults => 'إظهار النتائج';

  @override
  String get probabilities => 'الإحتمالات';

  @override
  String get lowRisk => 'خطر طفيف';

  @override
  String get moderateRisk => 'خطر متوسط';

  @override
  String get highRisk => 'خطر كبير';

  @override
  String get logout => 'تسجيل الخروج';
}
