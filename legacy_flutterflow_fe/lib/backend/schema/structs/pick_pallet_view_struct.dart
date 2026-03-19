// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class PickPalletViewStruct extends FFFirebaseStruct {
  PickPalletViewStruct({
    int? lpid,
    int? palletID,
    bool? palletPick,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _lpid = lpid,
        _palletID = palletID,
        _palletPick = palletPick,
        super(firestoreUtilData);

  // "LPID" field.
  int? _lpid;
  int get lpid => _lpid ?? 0;
  set lpid(int? val) => _lpid = val;

  void incrementLpid(int amount) => lpid = lpid + amount;

  bool hasLpid() => _lpid != null;

  // "PalletID" field.
  int? _palletID;
  int get palletID => _palletID ?? 0;
  set palletID(int? val) => _palletID = val;

  void incrementPalletID(int amount) => palletID = palletID + amount;

  bool hasPalletID() => _palletID != null;

  // "PalletPick" field.
  bool? _palletPick;
  bool get palletPick => _palletPick ?? false;
  set palletPick(bool? val) => _palletPick = val;

  bool hasPalletPick() => _palletPick != null;

  static PickPalletViewStruct fromMap(Map<String, dynamic> data) =>
      PickPalletViewStruct(
        lpid: castToType<int>(data['LPID']),
        palletID: castToType<int>(data['PalletID']),
        palletPick: data['PalletPick'] as bool?,
      );

  static PickPalletViewStruct? maybeFromMap(dynamic data) => data is Map
      ? PickPalletViewStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'LPID': _lpid,
        'PalletID': _palletID,
        'PalletPick': _palletPick,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'LPID': serializeParam(
          _lpid,
          ParamType.int,
        ),
        'PalletID': serializeParam(
          _palletID,
          ParamType.int,
        ),
        'PalletPick': serializeParam(
          _palletPick,
          ParamType.bool,
        ),
      }.withoutNulls;

  static PickPalletViewStruct fromSerializableMap(Map<String, dynamic> data) =>
      PickPalletViewStruct(
        lpid: deserializeParam(
          data['LPID'],
          ParamType.int,
          false,
        ),
        palletID: deserializeParam(
          data['PalletID'],
          ParamType.int,
          false,
        ),
        palletPick: deserializeParam(
          data['PalletPick'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'PickPalletViewStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is PickPalletViewStruct &&
        lpid == other.lpid &&
        palletID == other.palletID &&
        palletPick == other.palletPick;
  }

  @override
  int get hashCode => const ListEquality().hash([lpid, palletID, palletPick]);
}

PickPalletViewStruct createPickPalletViewStruct({
  int? lpid,
  int? palletID,
  bool? palletPick,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    PickPalletViewStruct(
      lpid: lpid,
      palletID: palletID,
      palletPick: palletPick,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

PickPalletViewStruct? updatePickPalletViewStruct(
  PickPalletViewStruct? pickPalletView, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    pickPalletView
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addPickPalletViewStructData(
  Map<String, dynamic> firestoreData,
  PickPalletViewStruct? pickPalletView,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (pickPalletView == null) {
    return;
  }
  if (pickPalletView.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && pickPalletView.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final pickPalletViewData =
      getPickPalletViewFirestoreData(pickPalletView, forFieldValue);
  final nestedData =
      pickPalletViewData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = pickPalletView.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getPickPalletViewFirestoreData(
  PickPalletViewStruct? pickPalletView, [
  bool forFieldValue = false,
]) {
  if (pickPalletView == null) {
    return {};
  }
  final firestoreData = mapToFirestore(pickPalletView.toMap());

  // Add any Firestore field values
  pickPalletView.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getPickPalletViewListFirestoreData(
  List<PickPalletViewStruct>? pickPalletViews,
) =>
    pickPalletViews
        ?.map((e) => getPickPalletViewFirestoreData(e, true))
        .toList() ??
    [];
