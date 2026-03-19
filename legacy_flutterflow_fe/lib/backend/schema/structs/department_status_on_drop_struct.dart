// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class DepartmentStatusOnDropStruct extends FFFirebaseStruct {
  DepartmentStatusOnDropStruct({
    int? custDropSheetID,
    String? statusOnLoadSlit,
    String? statusOnLoadTrim,
    String? statusOnLoadWrap,
    String? statusOnLoadRoll,
    String? statusOnLoadPart,
    String? statusOnLoadSoffit,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _custDropSheetID = custDropSheetID,
        _statusOnLoadSlit = statusOnLoadSlit,
        _statusOnLoadTrim = statusOnLoadTrim,
        _statusOnLoadWrap = statusOnLoadWrap,
        _statusOnLoadRoll = statusOnLoadRoll,
        _statusOnLoadPart = statusOnLoadPart,
        _statusOnLoadSoffit = statusOnLoadSoffit,
        super(firestoreUtilData);

  // "CustDropSheetID" field.
  int? _custDropSheetID;
  int get custDropSheetID => _custDropSheetID ?? 0;
  set custDropSheetID(int? val) => _custDropSheetID = val;

  void incrementCustDropSheetID(int amount) =>
      custDropSheetID = custDropSheetID + amount;

  bool hasCustDropSheetID() => _custDropSheetID != null;

  // "StatusOnLoadSlit" field.
  String? _statusOnLoadSlit;
  String get statusOnLoadSlit => _statusOnLoadSlit ?? '';
  set statusOnLoadSlit(String? val) => _statusOnLoadSlit = val;

  bool hasStatusOnLoadSlit() => _statusOnLoadSlit != null;

  // "StatusOnLoadTrim" field.
  String? _statusOnLoadTrim;
  String get statusOnLoadTrim => _statusOnLoadTrim ?? '';
  set statusOnLoadTrim(String? val) => _statusOnLoadTrim = val;

  bool hasStatusOnLoadTrim() => _statusOnLoadTrim != null;

  // "StatusOnLoadWrap" field.
  String? _statusOnLoadWrap;
  String get statusOnLoadWrap => _statusOnLoadWrap ?? '';
  set statusOnLoadWrap(String? val) => _statusOnLoadWrap = val;

  bool hasStatusOnLoadWrap() => _statusOnLoadWrap != null;

  // "StatusOnLoadRoll" field.
  String? _statusOnLoadRoll;
  String get statusOnLoadRoll => _statusOnLoadRoll ?? '';
  set statusOnLoadRoll(String? val) => _statusOnLoadRoll = val;

  bool hasStatusOnLoadRoll() => _statusOnLoadRoll != null;

  // "StatusOnLoadPart" field.
  String? _statusOnLoadPart;
  String get statusOnLoadPart => _statusOnLoadPart ?? '';
  set statusOnLoadPart(String? val) => _statusOnLoadPart = val;

  bool hasStatusOnLoadPart() => _statusOnLoadPart != null;

  // "StatusOnLoadSoffit" field.
  String? _statusOnLoadSoffit;
  String get statusOnLoadSoffit => _statusOnLoadSoffit ?? '';
  set statusOnLoadSoffit(String? val) => _statusOnLoadSoffit = val;

  bool hasStatusOnLoadSoffit() => _statusOnLoadSoffit != null;

  static DepartmentStatusOnDropStruct fromMap(Map<String, dynamic> data) =>
      DepartmentStatusOnDropStruct(
        custDropSheetID: castToType<int>(data['CustDropSheetID']),
        statusOnLoadSlit: data['StatusOnLoadSlit'] as String?,
        statusOnLoadTrim: data['StatusOnLoadTrim'] as String?,
        statusOnLoadWrap: data['StatusOnLoadWrap'] as String?,
        statusOnLoadRoll: data['StatusOnLoadRoll'] as String?,
        statusOnLoadPart: data['StatusOnLoadPart'] as String?,
        statusOnLoadSoffit: data['StatusOnLoadSoffit'] as String?,
      );

  static DepartmentStatusOnDropStruct? maybeFromMap(dynamic data) => data is Map
      ? DepartmentStatusOnDropStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'CustDropSheetID': _custDropSheetID,
        'StatusOnLoadSlit': _statusOnLoadSlit,
        'StatusOnLoadTrim': _statusOnLoadTrim,
        'StatusOnLoadWrap': _statusOnLoadWrap,
        'StatusOnLoadRoll': _statusOnLoadRoll,
        'StatusOnLoadPart': _statusOnLoadPart,
        'StatusOnLoadSoffit': _statusOnLoadSoffit,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'CustDropSheetID': serializeParam(
          _custDropSheetID,
          ParamType.int,
        ),
        'StatusOnLoadSlit': serializeParam(
          _statusOnLoadSlit,
          ParamType.String,
        ),
        'StatusOnLoadTrim': serializeParam(
          _statusOnLoadTrim,
          ParamType.String,
        ),
        'StatusOnLoadWrap': serializeParam(
          _statusOnLoadWrap,
          ParamType.String,
        ),
        'StatusOnLoadRoll': serializeParam(
          _statusOnLoadRoll,
          ParamType.String,
        ),
        'StatusOnLoadPart': serializeParam(
          _statusOnLoadPart,
          ParamType.String,
        ),
        'StatusOnLoadSoffit': serializeParam(
          _statusOnLoadSoffit,
          ParamType.String,
        ),
      }.withoutNulls;

  static DepartmentStatusOnDropStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      DepartmentStatusOnDropStruct(
        custDropSheetID: deserializeParam(
          data['CustDropSheetID'],
          ParamType.int,
          false,
        ),
        statusOnLoadSlit: deserializeParam(
          data['StatusOnLoadSlit'],
          ParamType.String,
          false,
        ),
        statusOnLoadTrim: deserializeParam(
          data['StatusOnLoadTrim'],
          ParamType.String,
          false,
        ),
        statusOnLoadWrap: deserializeParam(
          data['StatusOnLoadWrap'],
          ParamType.String,
          false,
        ),
        statusOnLoadRoll: deserializeParam(
          data['StatusOnLoadRoll'],
          ParamType.String,
          false,
        ),
        statusOnLoadPart: deserializeParam(
          data['StatusOnLoadPart'],
          ParamType.String,
          false,
        ),
        statusOnLoadSoffit: deserializeParam(
          data['StatusOnLoadSoffit'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'DepartmentStatusOnDropStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is DepartmentStatusOnDropStruct &&
        custDropSheetID == other.custDropSheetID &&
        statusOnLoadSlit == other.statusOnLoadSlit &&
        statusOnLoadTrim == other.statusOnLoadTrim &&
        statusOnLoadWrap == other.statusOnLoadWrap &&
        statusOnLoadRoll == other.statusOnLoadRoll &&
        statusOnLoadPart == other.statusOnLoadPart &&
        statusOnLoadSoffit == other.statusOnLoadSoffit;
  }

  @override
  int get hashCode => const ListEquality().hash([
        custDropSheetID,
        statusOnLoadSlit,
        statusOnLoadTrim,
        statusOnLoadWrap,
        statusOnLoadRoll,
        statusOnLoadPart,
        statusOnLoadSoffit
      ]);
}

DepartmentStatusOnDropStruct createDepartmentStatusOnDropStruct({
  int? custDropSheetID,
  String? statusOnLoadSlit,
  String? statusOnLoadTrim,
  String? statusOnLoadWrap,
  String? statusOnLoadRoll,
  String? statusOnLoadPart,
  String? statusOnLoadSoffit,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    DepartmentStatusOnDropStruct(
      custDropSheetID: custDropSheetID,
      statusOnLoadSlit: statusOnLoadSlit,
      statusOnLoadTrim: statusOnLoadTrim,
      statusOnLoadWrap: statusOnLoadWrap,
      statusOnLoadRoll: statusOnLoadRoll,
      statusOnLoadPart: statusOnLoadPart,
      statusOnLoadSoffit: statusOnLoadSoffit,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

DepartmentStatusOnDropStruct? updateDepartmentStatusOnDropStruct(
  DepartmentStatusOnDropStruct? departmentStatusOnDrop, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    departmentStatusOnDrop
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addDepartmentStatusOnDropStructData(
  Map<String, dynamic> firestoreData,
  DepartmentStatusOnDropStruct? departmentStatusOnDrop,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (departmentStatusOnDrop == null) {
    return;
  }
  if (departmentStatusOnDrop.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields = !forFieldValue &&
      departmentStatusOnDrop.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final departmentStatusOnDropData = getDepartmentStatusOnDropFirestoreData(
      departmentStatusOnDrop, forFieldValue);
  final nestedData =
      departmentStatusOnDropData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      departmentStatusOnDrop.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getDepartmentStatusOnDropFirestoreData(
  DepartmentStatusOnDropStruct? departmentStatusOnDrop, [
  bool forFieldValue = false,
]) {
  if (departmentStatusOnDrop == null) {
    return {};
  }
  final firestoreData = mapToFirestore(departmentStatusOnDrop.toMap());

  // Add any Firestore field values
  departmentStatusOnDrop.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getDepartmentStatusOnDropListFirestoreData(
  List<DepartmentStatusOnDropStruct>? departmentStatusOnDrops,
) =>
    departmentStatusOnDrops
        ?.map((e) => getDepartmentStatusOnDropFirestoreData(e, true))
        .toList() ??
    [];
