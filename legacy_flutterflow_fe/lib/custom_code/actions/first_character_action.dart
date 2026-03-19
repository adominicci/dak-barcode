// Automatic FlutterFlow imports
import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/backend/schema/enums/enums.dart';
import '/actions/actions.dart' as action_blocks;
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom action code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

Future firstCharacterAction(
  List<DropAreaAllStruct>? dropAreaList,
) async {
  if (dropAreaList == null || dropAreaList.isEmpty) {
    FFAppState().dropAreaAll = [];
    return;
  }

  final List<DropAreaAllStruct> updatedList = dropAreaList.map((dropArea) {
    final String? dropAreaValue = dropArea.dropArea;

    String? firstChar;

    if (dropAreaValue != null && dropAreaValue.isNotEmpty) {
      firstChar = dropAreaValue.substring(0, 1);
    }

    return DropAreaAllStruct(
      dropArea: dropArea.dropArea,
      firstCharacter: firstChar,
    );
  }).toList();

  FFAppState().dropAreaAll = updatedList;
}
