import 'package:flutter/material.dart';

// Colors
const Color kPrimaryColor = Color(0xFF8B5225);
const Color kSecondaryColor = Color(0xFFFFF8F5);

// Paddings
const double kPadding8 = 8.0;
const double kPadding12 = 12.0;
const double kPadding16 = 16.0;
const double kPadding24 = 24.0;
const double kPadding32 = 32.0;
const double kPadding64 = 64.0;

// Border radius
const double kRadius12 = 12.0;
const double kRadius16 = 16.0;
const double kRadius24 = 24.0;
const double kRadius48 = 48.0;
const double kRadius64 = 64.0;

// Texts
const TextStyle kHeadingStyle = TextStyle(
  fontSize: 24,
  fontWeight: FontWeight.bold,
  color: kPrimaryColor,
);

const TextStyle kSubHeadingStyle = TextStyle(
  fontSize: 16,
  fontWeight: FontWeight.w400,
  color: Colors.black,
);

const TextStyle kBodyTextStyle = TextStyle(
  fontSize: 12,
  fontWeight: FontWeight.normal,
  color: Colors.black87,
);

const TextStyle kButtonTextStyle = TextStyle(
  fontSize: 12,
  fontWeight: FontWeight.bold,
  color: kSecondaryColor,
);

// Buttons
const ButtonStyle kElevatedButtonStyle = ButtonStyle(
  backgroundColor: WidgetStatePropertyAll(kSecondaryColor),
  padding: WidgetStatePropertyAll(
    EdgeInsets.symmetric(horizontal: kPadding64, vertical: kPadding12),
  ),
  shape: WidgetStatePropertyAll(
    RoundedRectangleBorder(
      borderRadius: BorderRadius.all(Radius.circular(kRadius12)),
    ),
  ),
);
