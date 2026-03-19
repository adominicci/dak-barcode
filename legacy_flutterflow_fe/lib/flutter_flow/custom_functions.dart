import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'lat_lng.dart';
import 'place.dart';
import 'uploaded_file.dart';
import '/backend/backend.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '/backend/schema/structs/index.dart';
import '/backend/schema/enums/enums.dart';
import '/auth/firebase_auth/auth_util.dart';

bool isNumeric(String valueNumeric) {
  // check if value is numeric no characters
  return double.tryParse(valueNumeric) != null ||
      int.tryParse(valueNumeric) != null;
}

String? getDateTime() {
  final now = DateTime.now();
  final formatter = DateFormat('MM-dd-yyyy HH:mm');
  return formatter.format(now);
}

bool isArray(dynamic myArgument) {
  // pass a json and check if it is a list or a string return true for list
  if (myArgument is List) {
    return true;
  } else {
    return false;
  }
}

String formatDate(String dateString) {
  // take a string formated like this 2024-07-31T23:23:45 to MM-dd-yyyy hh:nn AM/PM
  DateTime dateTime = DateTime.parse(dateString);
  String formattedDate = DateFormat('MM-dd-yyyy hh:mm a').format(dateTime);
  return formattedDate;
}
