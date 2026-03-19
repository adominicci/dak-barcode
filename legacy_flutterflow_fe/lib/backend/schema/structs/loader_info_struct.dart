// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class LoaderInfoStruct extends FFFirebaseStruct {
  LoaderInfoStruct({
    int? loaderID,
    int? fkDropSheetID,
    int? fkLoaderID,
    String? department,
    String? loaderName,
    String? startedAt,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _loaderID = loaderID,
        _fkDropSheetID = fkDropSheetID,
        _fkLoaderID = fkLoaderID,
        _department = department,
        _loaderName = loaderName,
        _startedAt = startedAt,
        super(firestoreUtilData);

  // "LoaderID" field.
  int? _loaderID;
  int get loaderID => _loaderID ?? 0;
  set loaderID(int? val) => _loaderID = val;

  void incrementLoaderID(int amount) => loaderID = loaderID + amount;

  bool hasLoaderID() => _loaderID != null;

  // "fkDropSheetID" field.
  int? _fkDropSheetID;
  int get fkDropSheetID => _fkDropSheetID ?? 0;
  set fkDropSheetID(int? val) => _fkDropSheetID = val;

  void incrementFkDropSheetID(int amount) =>
      fkDropSheetID = fkDropSheetID + amount;

  bool hasFkDropSheetID() => _fkDropSheetID != null;

  // "fkLoaderID" field.
  int? _fkLoaderID;
  int get fkLoaderID => _fkLoaderID ?? 0;
  set fkLoaderID(int? val) => _fkLoaderID = val;

  void incrementFkLoaderID(int amount) => fkLoaderID = fkLoaderID + amount;

  bool hasFkLoaderID() => _fkLoaderID != null;

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

  // "started_at" field.
  String? _startedAt;
  String get startedAt => _startedAt ?? '';
  set startedAt(String? val) => _startedAt = val;

  bool hasStartedAt() => _startedAt != null;

  static LoaderInfoStruct fromMap(Map<String, dynamic> data) =>
      LoaderInfoStruct(
        loaderID: castToType<int>(data['LoaderID']),
        fkDropSheetID: castToType<int>(data['fkDropSheetID']),
        fkLoaderID: castToType<int>(data['fkLoaderID']),
        department: data['Department'] as String?,
        loaderName: data['loader_name'] as String?,
        startedAt: data['started_at'] as String?,
      );

  static LoaderInfoStruct? maybeFromMap(dynamic data) => data is Map
      ? LoaderInfoStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'LoaderID': _loaderID,
        'fkDropSheetID': _fkDropSheetID,
        'fkLoaderID': _fkLoaderID,
        'Department': _department,
        'loader_name': _loaderName,
        'started_at': _startedAt,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'LoaderID': serializeParam(
          _loaderID,
          ParamType.int,
        ),
        'fkDropSheetID': serializeParam(
          _fkDropSheetID,
          ParamType.int,
        ),
        'fkLoaderID': serializeParam(
          _fkLoaderID,
          ParamType.int,
        ),
        'Department': serializeParam(
          _department,
          ParamType.String,
        ),
        'loader_name': serializeParam(
          _loaderName,
          ParamType.String,
        ),
        'started_at': serializeParam(
          _startedAt,
          ParamType.String,
        ),
      }.withoutNulls;

  static LoaderInfoStruct fromSerializableMap(Map<String, dynamic> data) =>
      LoaderInfoStruct(
        loaderID: deserializeParam(
          data['LoaderID'],
          ParamType.int,
          false,
        ),
        fkDropSheetID: deserializeParam(
          data['fkDropSheetID'],
          ParamType.int,
          false,
        ),
        fkLoaderID: deserializeParam(
          data['fkLoaderID'],
          ParamType.int,
          false,
        ),
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
        startedAt: deserializeParam(
          data['started_at'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'LoaderInfoStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is LoaderInfoStruct &&
        loaderID == other.loaderID &&
        fkDropSheetID == other.fkDropSheetID &&
        fkLoaderID == other.fkLoaderID &&
        department == other.department &&
        loaderName == other.loaderName &&
        startedAt == other.startedAt;
  }

  @override
  int get hashCode => const ListEquality().hash(
      [loaderID, fkDropSheetID, fkLoaderID, department, loaderName, startedAt]);
}

LoaderInfoStruct createLoaderInfoStruct({
  int? loaderID,
  int? fkDropSheetID,
  int? fkLoaderID,
  String? department,
  String? loaderName,
  String? startedAt,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    LoaderInfoStruct(
      loaderID: loaderID,
      fkDropSheetID: fkDropSheetID,
      fkLoaderID: fkLoaderID,
      department: department,
      loaderName: loaderName,
      startedAt: startedAt,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

LoaderInfoStruct? updateLoaderInfoStruct(
  LoaderInfoStruct? loaderInfo, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    loaderInfo
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addLoaderInfoStructData(
  Map<String, dynamic> firestoreData,
  LoaderInfoStruct? loaderInfo,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (loaderInfo == null) {
    return;
  }
  if (loaderInfo.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && loaderInfo.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final loaderInfoData = getLoaderInfoFirestoreData(loaderInfo, forFieldValue);
  final nestedData = loaderInfoData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = loaderInfo.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getLoaderInfoFirestoreData(
  LoaderInfoStruct? loaderInfo, [
  bool forFieldValue = false,
]) {
  if (loaderInfo == null) {
    return {};
  }
  final firestoreData = mapToFirestore(loaderInfo.toMap());

  // Add any Firestore field values
  loaderInfo.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getLoaderInfoListFirestoreData(
  List<LoaderInfoStruct>? loaderInfos,
) =>
    loaderInfos?.map((e) => getLoaderInfoFirestoreData(e, true)).toList() ?? [];
