// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class SingleLabelScanLoadStruct extends FFFirebaseStruct {
  SingleLabelScanLoadStruct({
    String? partListID,
    int? labelNumber,
    bool? scanned,
    int? loadingLocationID,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _partListID = partListID,
        _labelNumber = labelNumber,
        _scanned = scanned,
        _loadingLocationID = loadingLocationID,
        super(firestoreUtilData);

  // "PartListID" field.
  String? _partListID;
  String get partListID => _partListID ?? '';
  set partListID(String? val) => _partListID = val;

  bool hasPartListID() => _partListID != null;

  // "LabelNumber" field.
  int? _labelNumber;
  int get labelNumber => _labelNumber ?? 0;
  set labelNumber(int? val) => _labelNumber = val;

  void incrementLabelNumber(int amount) => labelNumber = labelNumber + amount;

  bool hasLabelNumber() => _labelNumber != null;

  // "Scanned" field.
  bool? _scanned;
  bool get scanned => _scanned ?? false;
  set scanned(bool? val) => _scanned = val;

  bool hasScanned() => _scanned != null;

  // "LoadingLocationID" field.
  int? _loadingLocationID;
  int get loadingLocationID => _loadingLocationID ?? 0;
  set loadingLocationID(int? val) => _loadingLocationID = val;

  void incrementLoadingLocationID(int amount) =>
      loadingLocationID = loadingLocationID + amount;

  bool hasLoadingLocationID() => _loadingLocationID != null;

  static SingleLabelScanLoadStruct fromMap(Map<String, dynamic> data) =>
      SingleLabelScanLoadStruct(
        partListID: data['PartListID'] as String?,
        labelNumber: castToType<int>(data['LabelNumber']),
        scanned: data['Scanned'] as bool?,
        loadingLocationID: castToType<int>(data['LoadingLocationID']),
      );

  static SingleLabelScanLoadStruct? maybeFromMap(dynamic data) => data is Map
      ? SingleLabelScanLoadStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'PartListID': _partListID,
        'LabelNumber': _labelNumber,
        'Scanned': _scanned,
        'LoadingLocationID': _loadingLocationID,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'PartListID': serializeParam(
          _partListID,
          ParamType.String,
        ),
        'LabelNumber': serializeParam(
          _labelNumber,
          ParamType.int,
        ),
        'Scanned': serializeParam(
          _scanned,
          ParamType.bool,
        ),
        'LoadingLocationID': serializeParam(
          _loadingLocationID,
          ParamType.int,
        ),
      }.withoutNulls;

  static SingleLabelScanLoadStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      SingleLabelScanLoadStruct(
        partListID: deserializeParam(
          data['PartListID'],
          ParamType.String,
          false,
        ),
        labelNumber: deserializeParam(
          data['LabelNumber'],
          ParamType.int,
          false,
        ),
        scanned: deserializeParam(
          data['Scanned'],
          ParamType.bool,
          false,
        ),
        loadingLocationID: deserializeParam(
          data['LoadingLocationID'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'SingleLabelScanLoadStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is SingleLabelScanLoadStruct &&
        partListID == other.partListID &&
        labelNumber == other.labelNumber &&
        scanned == other.scanned &&
        loadingLocationID == other.loadingLocationID;
  }

  @override
  int get hashCode => const ListEquality()
      .hash([partListID, labelNumber, scanned, loadingLocationID]);
}

SingleLabelScanLoadStruct createSingleLabelScanLoadStruct({
  String? partListID,
  int? labelNumber,
  bool? scanned,
  int? loadingLocationID,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    SingleLabelScanLoadStruct(
      partListID: partListID,
      labelNumber: labelNumber,
      scanned: scanned,
      loadingLocationID: loadingLocationID,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

SingleLabelScanLoadStruct? updateSingleLabelScanLoadStruct(
  SingleLabelScanLoadStruct? singleLabelScanLoad, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    singleLabelScanLoad
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addSingleLabelScanLoadStructData(
  Map<String, dynamic> firestoreData,
  SingleLabelScanLoadStruct? singleLabelScanLoad,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (singleLabelScanLoad == null) {
    return;
  }
  if (singleLabelScanLoad.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && singleLabelScanLoad.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final singleLabelScanLoadData =
      getSingleLabelScanLoadFirestoreData(singleLabelScanLoad, forFieldValue);
  final nestedData =
      singleLabelScanLoadData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      singleLabelScanLoad.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getSingleLabelScanLoadFirestoreData(
  SingleLabelScanLoadStruct? singleLabelScanLoad, [
  bool forFieldValue = false,
]) {
  if (singleLabelScanLoad == null) {
    return {};
  }
  final firestoreData = mapToFirestore(singleLabelScanLoad.toMap());

  // Add any Firestore field values
  singleLabelScanLoad.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getSingleLabelScanLoadListFirestoreData(
  List<SingleLabelScanLoadStruct>? singleLabelScanLoads,
) =>
    singleLabelScanLoads
        ?.map((e) => getSingleLabelScanLoadFirestoreData(e, true))
        .toList() ??
    [];
