// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class PickPalleLoadScanStruct extends FFFirebaseStruct {
  PickPalleLoadScanStruct({
    int? lpid,
    String? palletLabel,
    bool? palletScan,
    int? palletID,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _lpid = lpid,
        _palletLabel = palletLabel,
        _palletScan = palletScan,
        _palletID = palletID,
        super(firestoreUtilData);

  // "LPID" field.
  int? _lpid;
  int get lpid => _lpid ?? 0;
  set lpid(int? val) => _lpid = val;

  void incrementLpid(int amount) => lpid = lpid + amount;

  bool hasLpid() => _lpid != null;

  // "PalletLabel" field.
  String? _palletLabel;
  String get palletLabel => _palletLabel ?? '';
  set palletLabel(String? val) => _palletLabel = val;

  bool hasPalletLabel() => _palletLabel != null;

  // "PalletScan" field.
  bool? _palletScan;
  bool get palletScan => _palletScan ?? false;
  set palletScan(bool? val) => _palletScan = val;

  bool hasPalletScan() => _palletScan != null;

  // "PalletID" field.
  int? _palletID;
  int get palletID => _palletID ?? 0;
  set palletID(int? val) => _palletID = val;

  void incrementPalletID(int amount) => palletID = palletID + amount;

  bool hasPalletID() => _palletID != null;

  static PickPalleLoadScanStruct fromMap(Map<String, dynamic> data) =>
      PickPalleLoadScanStruct(
        lpid: castToType<int>(data['LPID']),
        palletLabel: data['PalletLabel'] as String?,
        palletScan: data['PalletScan'] as bool?,
        palletID: castToType<int>(data['PalletID']),
      );

  static PickPalleLoadScanStruct? maybeFromMap(dynamic data) => data is Map
      ? PickPalleLoadScanStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'LPID': _lpid,
        'PalletLabel': _palletLabel,
        'PalletScan': _palletScan,
        'PalletID': _palletID,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'LPID': serializeParam(
          _lpid,
          ParamType.int,
        ),
        'PalletLabel': serializeParam(
          _palletLabel,
          ParamType.String,
        ),
        'PalletScan': serializeParam(
          _palletScan,
          ParamType.bool,
        ),
        'PalletID': serializeParam(
          _palletID,
          ParamType.int,
        ),
      }.withoutNulls;

  static PickPalleLoadScanStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      PickPalleLoadScanStruct(
        lpid: deserializeParam(
          data['LPID'],
          ParamType.int,
          false,
        ),
        palletLabel: deserializeParam(
          data['PalletLabel'],
          ParamType.String,
          false,
        ),
        palletScan: deserializeParam(
          data['PalletScan'],
          ParamType.bool,
          false,
        ),
        palletID: deserializeParam(
          data['PalletID'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'PickPalleLoadScanStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is PickPalleLoadScanStruct &&
        lpid == other.lpid &&
        palletLabel == other.palletLabel &&
        palletScan == other.palletScan &&
        palletID == other.palletID;
  }

  @override
  int get hashCode =>
      const ListEquality().hash([lpid, palletLabel, palletScan, palletID]);
}

PickPalleLoadScanStruct createPickPalleLoadScanStruct({
  int? lpid,
  String? palletLabel,
  bool? palletScan,
  int? palletID,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    PickPalleLoadScanStruct(
      lpid: lpid,
      palletLabel: palletLabel,
      palletScan: palletScan,
      palletID: palletID,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

PickPalleLoadScanStruct? updatePickPalleLoadScanStruct(
  PickPalleLoadScanStruct? pickPalleLoadScan, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    pickPalleLoadScan
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addPickPalleLoadScanStructData(
  Map<String, dynamic> firestoreData,
  PickPalleLoadScanStruct? pickPalleLoadScan,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (pickPalleLoadScan == null) {
    return;
  }
  if (pickPalleLoadScan.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && pickPalleLoadScan.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final pickPalleLoadScanData =
      getPickPalleLoadScanFirestoreData(pickPalleLoadScan, forFieldValue);
  final nestedData =
      pickPalleLoadScanData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = pickPalleLoadScan.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getPickPalleLoadScanFirestoreData(
  PickPalleLoadScanStruct? pickPalleLoadScan, [
  bool forFieldValue = false,
]) {
  if (pickPalleLoadScan == null) {
    return {};
  }
  final firestoreData = mapToFirestore(pickPalleLoadScan.toMap());

  // Add any Firestore field values
  pickPalleLoadScan.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getPickPalleLoadScanListFirestoreData(
  List<PickPalleLoadScanStruct>? pickPalleLoadScans,
) =>
    pickPalleLoadScans
        ?.map((e) => getPickPalleLoadScanFirestoreData(e, true))
        .toList() ??
    [];
