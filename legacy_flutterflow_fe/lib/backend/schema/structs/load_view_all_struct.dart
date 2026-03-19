// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class LoadViewAllStruct extends FFFirebaseStruct {
  LoadViewAllStruct({
    int? dropSheetID,
    int? dropsheetcustid,
    String? dSSequence,
    String? loadNumber,
    String? driver,
    String? status,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _dropSheetID = dropSheetID,
        _dropsheetcustid = dropsheetcustid,
        _dSSequence = dSSequence,
        _loadNumber = loadNumber,
        _driver = driver,
        _status = status,
        super(firestoreUtilData);

  // "DropSheetID" field.
  int? _dropSheetID;
  int get dropSheetID => _dropSheetID ?? 0;
  set dropSheetID(int? val) => _dropSheetID = val;

  void incrementDropSheetID(int amount) => dropSheetID = dropSheetID + amount;

  bool hasDropSheetID() => _dropSheetID != null;

  // "Dropsheetcustid" field.
  int? _dropsheetcustid;
  int get dropsheetcustid => _dropsheetcustid ?? 0;
  set dropsheetcustid(int? val) => _dropsheetcustid = val;

  void incrementDropsheetcustid(int amount) =>
      dropsheetcustid = dropsheetcustid + amount;

  bool hasDropsheetcustid() => _dropsheetcustid != null;

  // "DSSequence" field.
  String? _dSSequence;
  String get dSSequence => _dSSequence ?? '';
  set dSSequence(String? val) => _dSSequence = val;

  bool hasDSSequence() => _dSSequence != null;

  // "LoadNumber" field.
  String? _loadNumber;
  String get loadNumber => _loadNumber ?? '';
  set loadNumber(String? val) => _loadNumber = val;

  bool hasLoadNumber() => _loadNumber != null;

  // "Driver" field.
  String? _driver;
  String get driver => _driver ?? '';
  set driver(String? val) => _driver = val;

  bool hasDriver() => _driver != null;

  // "Status" field.
  String? _status;
  String get status => _status ?? '';
  set status(String? val) => _status = val;

  bool hasStatus() => _status != null;

  static LoadViewAllStruct fromMap(Map<String, dynamic> data) =>
      LoadViewAllStruct(
        dropSheetID: castToType<int>(data['DropSheetID']),
        dropsheetcustid: castToType<int>(data['Dropsheetcustid']),
        dSSequence: data['DSSequence'] as String?,
        loadNumber: data['LoadNumber'] as String?,
        driver: data['Driver'] as String?,
        status: data['Status'] as String?,
      );

  static LoadViewAllStruct? maybeFromMap(dynamic data) => data is Map
      ? LoadViewAllStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'DropSheetID': _dropSheetID,
        'Dropsheetcustid': _dropsheetcustid,
        'DSSequence': _dSSequence,
        'LoadNumber': _loadNumber,
        'Driver': _driver,
        'Status': _status,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'DropSheetID': serializeParam(
          _dropSheetID,
          ParamType.int,
        ),
        'Dropsheetcustid': serializeParam(
          _dropsheetcustid,
          ParamType.int,
        ),
        'DSSequence': serializeParam(
          _dSSequence,
          ParamType.String,
        ),
        'LoadNumber': serializeParam(
          _loadNumber,
          ParamType.String,
        ),
        'Driver': serializeParam(
          _driver,
          ParamType.String,
        ),
        'Status': serializeParam(
          _status,
          ParamType.String,
        ),
      }.withoutNulls;

  static LoadViewAllStruct fromSerializableMap(Map<String, dynamic> data) =>
      LoadViewAllStruct(
        dropSheetID: deserializeParam(
          data['DropSheetID'],
          ParamType.int,
          false,
        ),
        dropsheetcustid: deserializeParam(
          data['Dropsheetcustid'],
          ParamType.int,
          false,
        ),
        dSSequence: deserializeParam(
          data['DSSequence'],
          ParamType.String,
          false,
        ),
        loadNumber: deserializeParam(
          data['LoadNumber'],
          ParamType.String,
          false,
        ),
        driver: deserializeParam(
          data['Driver'],
          ParamType.String,
          false,
        ),
        status: deserializeParam(
          data['Status'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'LoadViewAllStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is LoadViewAllStruct &&
        dropSheetID == other.dropSheetID &&
        dropsheetcustid == other.dropsheetcustid &&
        dSSequence == other.dSSequence &&
        loadNumber == other.loadNumber &&
        driver == other.driver &&
        status == other.status;
  }

  @override
  int get hashCode => const ListEquality().hash(
      [dropSheetID, dropsheetcustid, dSSequence, loadNumber, driver, status]);
}

LoadViewAllStruct createLoadViewAllStruct({
  int? dropSheetID,
  int? dropsheetcustid,
  String? dSSequence,
  String? loadNumber,
  String? driver,
  String? status,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    LoadViewAllStruct(
      dropSheetID: dropSheetID,
      dropsheetcustid: dropsheetcustid,
      dSSequence: dSSequence,
      loadNumber: loadNumber,
      driver: driver,
      status: status,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

LoadViewAllStruct? updateLoadViewAllStruct(
  LoadViewAllStruct? loadViewAll, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    loadViewAll
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addLoadViewAllStructData(
  Map<String, dynamic> firestoreData,
  LoadViewAllStruct? loadViewAll,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (loadViewAll == null) {
    return;
  }
  if (loadViewAll.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && loadViewAll.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final loadViewAllData =
      getLoadViewAllFirestoreData(loadViewAll, forFieldValue);
  final nestedData =
      loadViewAllData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = loadViewAll.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getLoadViewAllFirestoreData(
  LoadViewAllStruct? loadViewAll, [
  bool forFieldValue = false,
]) {
  if (loadViewAll == null) {
    return {};
  }
  final firestoreData = mapToFirestore(loadViewAll.toMap());

  // Add any Firestore field values
  loadViewAll.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getLoadViewAllListFirestoreData(
  List<LoadViewAllStruct>? loadViewAlls,
) =>
    loadViewAlls?.map((e) => getLoadViewAllFirestoreData(e, true)).toList() ??
    [];
