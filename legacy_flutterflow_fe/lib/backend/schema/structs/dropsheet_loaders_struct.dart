// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

/// This is for the loaders for each dropsheet
class DropsheetLoadersStruct extends FFFirebaseStruct {
  DropsheetLoadersStruct({
    String? department,
    String? loaderName,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _department = department,
        _loaderName = loaderName,
        super(firestoreUtilData);

  // "Department" field.
  String? _department;
  String get department => _department ?? '';
  set department(String? val) => _department = val;

  bool hasDepartment() => _department != null;

  // "loader_name" field.
  String? _loaderName;
  String get loaderName => _loaderName ?? '';
  set loaderName(String? val) => _loaderName = val;

  bool hasLoaderName() => _loaderName != null;

  static DropsheetLoadersStruct fromMap(Map<String, dynamic> data) =>
      DropsheetLoadersStruct(
        department: data['Department'] as String?,
        loaderName: data['loader_name'] as String?,
      );

  static DropsheetLoadersStruct? maybeFromMap(dynamic data) => data is Map
      ? DropsheetLoadersStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'Department': _department,
        'loader_name': _loaderName,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'Department': serializeParam(
          _department,
          ParamType.String,
        ),
        'loader_name': serializeParam(
          _loaderName,
          ParamType.String,
        ),
      }.withoutNulls;

  static DropsheetLoadersStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      DropsheetLoadersStruct(
        department: deserializeParam(
          data['Department'],
          ParamType.String,
          false,
        ),
        loaderName: deserializeParam(
          data['loader_name'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'DropsheetLoadersStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is DropsheetLoadersStruct &&
        department == other.department &&
        loaderName == other.loaderName;
  }

  @override
  int get hashCode => const ListEquality().hash([department, loaderName]);
}

DropsheetLoadersStruct createDropsheetLoadersStruct({
  String? department,
  String? loaderName,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    DropsheetLoadersStruct(
      department: department,
      loaderName: loaderName,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

DropsheetLoadersStruct? updateDropsheetLoadersStruct(
  DropsheetLoadersStruct? dropsheetLoaders, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    dropsheetLoaders
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addDropsheetLoadersStructData(
  Map<String, dynamic> firestoreData,
  DropsheetLoadersStruct? dropsheetLoaders,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (dropsheetLoaders == null) {
    return;
  }
  if (dropsheetLoaders.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && dropsheetLoaders.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final dropsheetLoadersData =
      getDropsheetLoadersFirestoreData(dropsheetLoaders, forFieldValue);
  final nestedData =
      dropsheetLoadersData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = dropsheetLoaders.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getDropsheetLoadersFirestoreData(
  DropsheetLoadersStruct? dropsheetLoaders, [
  bool forFieldValue = false,
]) {
  if (dropsheetLoaders == null) {
    return {};
  }
  final firestoreData = mapToFirestore(dropsheetLoaders.toMap());

  // Add any Firestore field values
  dropsheetLoaders.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getDropsheetLoadersListFirestoreData(
  List<DropsheetLoadersStruct>? dropsheetLoaderss,
) =>
    dropsheetLoaderss
        ?.map((e) => getDropsheetLoadersFirestoreData(e, true))
        .toList() ??
    [];
