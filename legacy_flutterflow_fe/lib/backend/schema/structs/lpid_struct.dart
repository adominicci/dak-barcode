// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class LpidStruct extends FFFirebaseStruct {
  LpidStruct({
    int? lpid,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _lpid = lpid,
        super(firestoreUtilData);

  // "LPID" field.
  int? _lpid;
  int get lpid => _lpid ?? 0;
  set lpid(int? val) => _lpid = val;

  void incrementLpid(int amount) => lpid = lpid + amount;

  bool hasLpid() => _lpid != null;

  static LpidStruct fromMap(Map<String, dynamic> data) => LpidStruct(
        lpid: castToType<int>(data['LPID']),
      );

  static LpidStruct? maybeFromMap(dynamic data) =>
      data is Map ? LpidStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'LPID': _lpid,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'LPID': serializeParam(
          _lpid,
          ParamType.int,
        ),
      }.withoutNulls;

  static LpidStruct fromSerializableMap(Map<String, dynamic> data) =>
      LpidStruct(
        lpid: deserializeParam(
          data['LPID'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'LpidStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is LpidStruct && lpid == other.lpid;
  }

  @override
  int get hashCode => const ListEquality().hash([lpid]);
}

LpidStruct createLpidStruct({
  int? lpid,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    LpidStruct(
      lpid: lpid,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

LpidStruct? updateLpidStruct(
  LpidStruct? lpidStruct, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    lpidStruct
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addLpidStructData(
  Map<String, dynamic> firestoreData,
  LpidStruct? lpidStruct,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (lpidStruct == null) {
    return;
  }
  if (lpidStruct.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && lpidStruct.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final lpidStructData = getLpidFirestoreData(lpidStruct, forFieldValue);
  final nestedData = lpidStructData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = lpidStruct.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getLpidFirestoreData(
  LpidStruct? lpidStruct, [
  bool forFieldValue = false,
]) {
  if (lpidStruct == null) {
    return {};
  }
  final firestoreData = mapToFirestore(lpidStruct.toMap());

  // Add any Firestore field values
  lpidStruct.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getLpidListFirestoreData(
  List<LpidStruct>? lpidStructs,
) =>
    lpidStructs?.map((e) => getLpidFirestoreData(e, true)).toList() ?? [];
