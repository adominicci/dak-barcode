// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class CheckOnLoadDepartmentStatusStruct extends FFFirebaseStruct {
  CheckOnLoadDepartmentStatusStruct({
    int? dropSheetID,
    String? statusOnLoadSlitDS,
    String? statusOnLoadTrimDS,
    String? statusOnLoadWrapDS,
    String? statusOnLoadRollDS,
    String? statusOnLoadPartDS,
    String? statusOnLoadSoffitDS,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _dropSheetID = dropSheetID,
        _statusOnLoadSlitDS = statusOnLoadSlitDS,
        _statusOnLoadTrimDS = statusOnLoadTrimDS,
        _statusOnLoadWrapDS = statusOnLoadWrapDS,
        _statusOnLoadRollDS = statusOnLoadRollDS,
        _statusOnLoadPartDS = statusOnLoadPartDS,
        _statusOnLoadSoffitDS = statusOnLoadSoffitDS,
        super(firestoreUtilData);

  // "DropSheetID" field.
  int? _dropSheetID;
  int get dropSheetID => _dropSheetID ?? 0;
  set dropSheetID(int? val) => _dropSheetID = val;

  void incrementDropSheetID(int amount) => dropSheetID = dropSheetID + amount;

  bool hasDropSheetID() => _dropSheetID != null;

  // "StatusOnLoadSlitDS" field.
  String? _statusOnLoadSlitDS;
  String get statusOnLoadSlitDS => _statusOnLoadSlitDS ?? '';
  set statusOnLoadSlitDS(String? val) => _statusOnLoadSlitDS = val;

  bool hasStatusOnLoadSlitDS() => _statusOnLoadSlitDS != null;

  // "StatusOnLoadTrimDS" field.
  String? _statusOnLoadTrimDS;
  String get statusOnLoadTrimDS => _statusOnLoadTrimDS ?? '';
  set statusOnLoadTrimDS(String? val) => _statusOnLoadTrimDS = val;

  bool hasStatusOnLoadTrimDS() => _statusOnLoadTrimDS != null;

  // "StatusOnLoadWrapDS" field.
  String? _statusOnLoadWrapDS;
  String get statusOnLoadWrapDS => _statusOnLoadWrapDS ?? '';
  set statusOnLoadWrapDS(String? val) => _statusOnLoadWrapDS = val;

  bool hasStatusOnLoadWrapDS() => _statusOnLoadWrapDS != null;

  // "StatusOnLoadRollDS" field.
  String? _statusOnLoadRollDS;
  String get statusOnLoadRollDS => _statusOnLoadRollDS ?? '';
  set statusOnLoadRollDS(String? val) => _statusOnLoadRollDS = val;

  bool hasStatusOnLoadRollDS() => _statusOnLoadRollDS != null;

  // "StatusOnLoadPartDS" field.
  String? _statusOnLoadPartDS;
  String get statusOnLoadPartDS => _statusOnLoadPartDS ?? '';
  set statusOnLoadPartDS(String? val) => _statusOnLoadPartDS = val;

  bool hasStatusOnLoadPartDS() => _statusOnLoadPartDS != null;

  // "StatusOnLoadSoffitDS" field.
  String? _statusOnLoadSoffitDS;
  String get statusOnLoadSoffitDS => _statusOnLoadSoffitDS ?? '';
  set statusOnLoadSoffitDS(String? val) => _statusOnLoadSoffitDS = val;

  bool hasStatusOnLoadSoffitDS() => _statusOnLoadSoffitDS != null;

  static CheckOnLoadDepartmentStatusStruct fromMap(Map<String, dynamic> data) =>
      CheckOnLoadDepartmentStatusStruct(
        dropSheetID: castToType<int>(data['DropSheetID']),
        statusOnLoadSlitDS: data['StatusOnLoadSlitDS'] as String?,
        statusOnLoadTrimDS: data['StatusOnLoadTrimDS'] as String?,
        statusOnLoadWrapDS: data['StatusOnLoadWrapDS'] as String?,
        statusOnLoadRollDS: data['StatusOnLoadRollDS'] as String?,
        statusOnLoadPartDS: data['StatusOnLoadPartDS'] as String?,
        statusOnLoadSoffitDS: data['StatusOnLoadSoffitDS'] as String?,
      );

  static CheckOnLoadDepartmentStatusStruct? maybeFromMap(dynamic data) => data
          is Map
      ? CheckOnLoadDepartmentStatusStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'DropSheetID': _dropSheetID,
        'StatusOnLoadSlitDS': _statusOnLoadSlitDS,
        'StatusOnLoadTrimDS': _statusOnLoadTrimDS,
        'StatusOnLoadWrapDS': _statusOnLoadWrapDS,
        'StatusOnLoadRollDS': _statusOnLoadRollDS,
        'StatusOnLoadPartDS': _statusOnLoadPartDS,
        'StatusOnLoadSoffitDS': _statusOnLoadSoffitDS,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'DropSheetID': serializeParam(
          _dropSheetID,
          ParamType.int,
        ),
        'StatusOnLoadSlitDS': serializeParam(
          _statusOnLoadSlitDS,
          ParamType.String,
        ),
        'StatusOnLoadTrimDS': serializeParam(
          _statusOnLoadTrimDS,
          ParamType.String,
        ),
        'StatusOnLoadWrapDS': serializeParam(
          _statusOnLoadWrapDS,
          ParamType.String,
        ),
        'StatusOnLoadRollDS': serializeParam(
          _statusOnLoadRollDS,
          ParamType.String,
        ),
        'StatusOnLoadPartDS': serializeParam(
          _statusOnLoadPartDS,
          ParamType.String,
        ),
        'StatusOnLoadSoffitDS': serializeParam(
          _statusOnLoadSoffitDS,
          ParamType.String,
        ),
      }.withoutNulls;

  static CheckOnLoadDepartmentStatusStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      CheckOnLoadDepartmentStatusStruct(
        dropSheetID: deserializeParam(
          data['DropSheetID'],
          ParamType.int,
          false,
        ),
        statusOnLoadSlitDS: deserializeParam(
          data['StatusOnLoadSlitDS'],
          ParamType.String,
          false,
        ),
        statusOnLoadTrimDS: deserializeParam(
          data['StatusOnLoadTrimDS'],
          ParamType.String,
          false,
        ),
        statusOnLoadWrapDS: deserializeParam(
          data['StatusOnLoadWrapDS'],
          ParamType.String,
          false,
        ),
        statusOnLoadRollDS: deserializeParam(
          data['StatusOnLoadRollDS'],
          ParamType.String,
          false,
        ),
        statusOnLoadPartDS: deserializeParam(
          data['StatusOnLoadPartDS'],
          ParamType.String,
          false,
        ),
        statusOnLoadSoffitDS: deserializeParam(
          data['StatusOnLoadSoffitDS'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'CheckOnLoadDepartmentStatusStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is CheckOnLoadDepartmentStatusStruct &&
        dropSheetID == other.dropSheetID &&
        statusOnLoadSlitDS == other.statusOnLoadSlitDS &&
        statusOnLoadTrimDS == other.statusOnLoadTrimDS &&
        statusOnLoadWrapDS == other.statusOnLoadWrapDS &&
        statusOnLoadRollDS == other.statusOnLoadRollDS &&
        statusOnLoadPartDS == other.statusOnLoadPartDS &&
        statusOnLoadSoffitDS == other.statusOnLoadSoffitDS;
  }

  @override
  int get hashCode => const ListEquality().hash([
        dropSheetID,
        statusOnLoadSlitDS,
        statusOnLoadTrimDS,
        statusOnLoadWrapDS,
        statusOnLoadRollDS,
        statusOnLoadPartDS,
        statusOnLoadSoffitDS
      ]);
}

CheckOnLoadDepartmentStatusStruct createCheckOnLoadDepartmentStatusStruct({
  int? dropSheetID,
  String? statusOnLoadSlitDS,
  String? statusOnLoadTrimDS,
  String? statusOnLoadWrapDS,
  String? statusOnLoadRollDS,
  String? statusOnLoadPartDS,
  String? statusOnLoadSoffitDS,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    CheckOnLoadDepartmentStatusStruct(
      dropSheetID: dropSheetID,
      statusOnLoadSlitDS: statusOnLoadSlitDS,
      statusOnLoadTrimDS: statusOnLoadTrimDS,
      statusOnLoadWrapDS: statusOnLoadWrapDS,
      statusOnLoadRollDS: statusOnLoadRollDS,
      statusOnLoadPartDS: statusOnLoadPartDS,
      statusOnLoadSoffitDS: statusOnLoadSoffitDS,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

CheckOnLoadDepartmentStatusStruct? updateCheckOnLoadDepartmentStatusStruct(
  CheckOnLoadDepartmentStatusStruct? checkOnLoadDepartmentStatus, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    checkOnLoadDepartmentStatus
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addCheckOnLoadDepartmentStatusStructData(
  Map<String, dynamic> firestoreData,
  CheckOnLoadDepartmentStatusStruct? checkOnLoadDepartmentStatus,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (checkOnLoadDepartmentStatus == null) {
    return;
  }
  if (checkOnLoadDepartmentStatus.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields = !forFieldValue &&
      checkOnLoadDepartmentStatus.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final checkOnLoadDepartmentStatusData =
      getCheckOnLoadDepartmentStatusFirestoreData(
          checkOnLoadDepartmentStatus, forFieldValue);
  final nestedData = checkOnLoadDepartmentStatusData
      .map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      checkOnLoadDepartmentStatus.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getCheckOnLoadDepartmentStatusFirestoreData(
  CheckOnLoadDepartmentStatusStruct? checkOnLoadDepartmentStatus, [
  bool forFieldValue = false,
]) {
  if (checkOnLoadDepartmentStatus == null) {
    return {};
  }
  final firestoreData = mapToFirestore(checkOnLoadDepartmentStatus.toMap());

  // Add any Firestore field values
  checkOnLoadDepartmentStatus.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getCheckOnLoadDepartmentStatusListFirestoreData(
  List<CheckOnLoadDepartmentStatusStruct>? checkOnLoadDepartmentStatuss,
) =>
    checkOnLoadDepartmentStatuss
        ?.map((e) => getCheckOnLoadDepartmentStatusFirestoreData(e, true))
        .toList() ??
    [];
