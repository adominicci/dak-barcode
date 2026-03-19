// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class GetAllPercentAndLabelCountStruct extends FFFirebaseStruct {
  GetAllPercentAndLabelCountStruct({
    int? dropSheetID,
    double? rollScannedPercent,
    int? rollHasLabels,
    double? wrapScannedPercent,
    int? wrapHasLabels,
    int? partHasLabels,
    double? partcannedPercent,
    bool? allLoaded,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _dropSheetID = dropSheetID,
        _rollScannedPercent = rollScannedPercent,
        _rollHasLabels = rollHasLabels,
        _wrapScannedPercent = wrapScannedPercent,
        _wrapHasLabels = wrapHasLabels,
        _partHasLabels = partHasLabels,
        _partcannedPercent = partcannedPercent,
        _allLoaded = allLoaded,
        super(firestoreUtilData);

  // "DropSheetID" field.
  int? _dropSheetID;
  int get dropSheetID => _dropSheetID ?? 0;
  set dropSheetID(int? val) => _dropSheetID = val;

  void incrementDropSheetID(int amount) => dropSheetID = dropSheetID + amount;

  bool hasDropSheetID() => _dropSheetID != null;

  // "RollScannedPercent" field.
  double? _rollScannedPercent;
  double get rollScannedPercent => _rollScannedPercent ?? 0.0;
  set rollScannedPercent(double? val) => _rollScannedPercent = val;

  void incrementRollScannedPercent(double amount) =>
      rollScannedPercent = rollScannedPercent + amount;

  bool hasRollScannedPercent() => _rollScannedPercent != null;

  // "RollHasLabels" field.
  int? _rollHasLabels;
  int get rollHasLabels => _rollHasLabels ?? 0;
  set rollHasLabels(int? val) => _rollHasLabels = val;

  void incrementRollHasLabels(int amount) =>
      rollHasLabels = rollHasLabels + amount;

  bool hasRollHasLabels() => _rollHasLabels != null;

  // "WrapScannedPercent" field.
  double? _wrapScannedPercent;
  double get wrapScannedPercent => _wrapScannedPercent ?? 0.0;
  set wrapScannedPercent(double? val) => _wrapScannedPercent = val;

  void incrementWrapScannedPercent(double amount) =>
      wrapScannedPercent = wrapScannedPercent + amount;

  bool hasWrapScannedPercent() => _wrapScannedPercent != null;

  // "WrapHasLabels" field.
  int? _wrapHasLabels;
  int get wrapHasLabels => _wrapHasLabels ?? 0;
  set wrapHasLabels(int? val) => _wrapHasLabels = val;

  void incrementWrapHasLabels(int amount) =>
      wrapHasLabels = wrapHasLabels + amount;

  bool hasWrapHasLabels() => _wrapHasLabels != null;

  // "PartHasLabels" field.
  int? _partHasLabels;
  int get partHasLabels => _partHasLabels ?? 0;
  set partHasLabels(int? val) => _partHasLabels = val;

  void incrementPartHasLabels(int amount) =>
      partHasLabels = partHasLabels + amount;

  bool hasPartHasLabels() => _partHasLabels != null;

  // "PartcannedPercent" field.
  double? _partcannedPercent;
  double get partcannedPercent => _partcannedPercent ?? 0.0;
  set partcannedPercent(double? val) => _partcannedPercent = val;

  void incrementPartcannedPercent(double amount) =>
      partcannedPercent = partcannedPercent + amount;

  bool hasPartcannedPercent() => _partcannedPercent != null;

  // "AllLoaded" field.
  bool? _allLoaded;
  bool get allLoaded => _allLoaded ?? false;
  set allLoaded(bool? val) => _allLoaded = val;

  bool hasAllLoaded() => _allLoaded != null;

  static GetAllPercentAndLabelCountStruct fromMap(Map<String, dynamic> data) =>
      GetAllPercentAndLabelCountStruct(
        dropSheetID: castToType<int>(data['DropSheetID']),
        rollScannedPercent: castToType<double>(data['RollScannedPercent']),
        rollHasLabels: castToType<int>(data['RollHasLabels']),
        wrapScannedPercent: castToType<double>(data['WrapScannedPercent']),
        wrapHasLabels: castToType<int>(data['WrapHasLabels']),
        partHasLabels: castToType<int>(data['PartHasLabels']),
        partcannedPercent: castToType<double>(data['PartcannedPercent']),
        allLoaded: data['AllLoaded'] as bool?,
      );

  static GetAllPercentAndLabelCountStruct? maybeFromMap(dynamic data) => data
          is Map
      ? GetAllPercentAndLabelCountStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'DropSheetID': _dropSheetID,
        'RollScannedPercent': _rollScannedPercent,
        'RollHasLabels': _rollHasLabels,
        'WrapScannedPercent': _wrapScannedPercent,
        'WrapHasLabels': _wrapHasLabels,
        'PartHasLabels': _partHasLabels,
        'PartcannedPercent': _partcannedPercent,
        'AllLoaded': _allLoaded,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'DropSheetID': serializeParam(
          _dropSheetID,
          ParamType.int,
        ),
        'RollScannedPercent': serializeParam(
          _rollScannedPercent,
          ParamType.double,
        ),
        'RollHasLabels': serializeParam(
          _rollHasLabels,
          ParamType.int,
        ),
        'WrapScannedPercent': serializeParam(
          _wrapScannedPercent,
          ParamType.double,
        ),
        'WrapHasLabels': serializeParam(
          _wrapHasLabels,
          ParamType.int,
        ),
        'PartHasLabels': serializeParam(
          _partHasLabels,
          ParamType.int,
        ),
        'PartcannedPercent': serializeParam(
          _partcannedPercent,
          ParamType.double,
        ),
        'AllLoaded': serializeParam(
          _allLoaded,
          ParamType.bool,
        ),
      }.withoutNulls;

  static GetAllPercentAndLabelCountStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      GetAllPercentAndLabelCountStruct(
        dropSheetID: deserializeParam(
          data['DropSheetID'],
          ParamType.int,
          false,
        ),
        rollScannedPercent: deserializeParam(
          data['RollScannedPercent'],
          ParamType.double,
          false,
        ),
        rollHasLabels: deserializeParam(
          data['RollHasLabels'],
          ParamType.int,
          false,
        ),
        wrapScannedPercent: deserializeParam(
          data['WrapScannedPercent'],
          ParamType.double,
          false,
        ),
        wrapHasLabels: deserializeParam(
          data['WrapHasLabels'],
          ParamType.int,
          false,
        ),
        partHasLabels: deserializeParam(
          data['PartHasLabels'],
          ParamType.int,
          false,
        ),
        partcannedPercent: deserializeParam(
          data['PartcannedPercent'],
          ParamType.double,
          false,
        ),
        allLoaded: deserializeParam(
          data['AllLoaded'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'GetAllPercentAndLabelCountStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is GetAllPercentAndLabelCountStruct &&
        dropSheetID == other.dropSheetID &&
        rollScannedPercent == other.rollScannedPercent &&
        rollHasLabels == other.rollHasLabels &&
        wrapScannedPercent == other.wrapScannedPercent &&
        wrapHasLabels == other.wrapHasLabels &&
        partHasLabels == other.partHasLabels &&
        partcannedPercent == other.partcannedPercent &&
        allLoaded == other.allLoaded;
  }

  @override
  int get hashCode => const ListEquality().hash([
        dropSheetID,
        rollScannedPercent,
        rollHasLabels,
        wrapScannedPercent,
        wrapHasLabels,
        partHasLabels,
        partcannedPercent,
        allLoaded
      ]);
}

GetAllPercentAndLabelCountStruct createGetAllPercentAndLabelCountStruct({
  int? dropSheetID,
  double? rollScannedPercent,
  int? rollHasLabels,
  double? wrapScannedPercent,
  int? wrapHasLabels,
  int? partHasLabels,
  double? partcannedPercent,
  bool? allLoaded,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    GetAllPercentAndLabelCountStruct(
      dropSheetID: dropSheetID,
      rollScannedPercent: rollScannedPercent,
      rollHasLabels: rollHasLabels,
      wrapScannedPercent: wrapScannedPercent,
      wrapHasLabels: wrapHasLabels,
      partHasLabels: partHasLabels,
      partcannedPercent: partcannedPercent,
      allLoaded: allLoaded,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

GetAllPercentAndLabelCountStruct? updateGetAllPercentAndLabelCountStruct(
  GetAllPercentAndLabelCountStruct? getAllPercentAndLabelCount, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    getAllPercentAndLabelCount
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addGetAllPercentAndLabelCountStructData(
  Map<String, dynamic> firestoreData,
  GetAllPercentAndLabelCountStruct? getAllPercentAndLabelCount,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (getAllPercentAndLabelCount == null) {
    return;
  }
  if (getAllPercentAndLabelCount.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields = !forFieldValue &&
      getAllPercentAndLabelCount.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final getAllPercentAndLabelCountData =
      getGetAllPercentAndLabelCountFirestoreData(
          getAllPercentAndLabelCount, forFieldValue);
  final nestedData = getAllPercentAndLabelCountData
      .map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      getAllPercentAndLabelCount.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getGetAllPercentAndLabelCountFirestoreData(
  GetAllPercentAndLabelCountStruct? getAllPercentAndLabelCount, [
  bool forFieldValue = false,
]) {
  if (getAllPercentAndLabelCount == null) {
    return {};
  }
  final firestoreData = mapToFirestore(getAllPercentAndLabelCount.toMap());

  // Add any Firestore field values
  getAllPercentAndLabelCount.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getGetAllPercentAndLabelCountListFirestoreData(
  List<GetAllPercentAndLabelCountStruct>? getAllPercentAndLabelCounts,
) =>
    getAllPercentAndLabelCounts
        ?.map((e) => getGetAllPercentAndLabelCountFirestoreData(e, true))
        .toList() ??
    [];
