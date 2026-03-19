// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class LoadViewDetailSequenceAllStruct extends FFFirebaseStruct {
  LoadViewDetailSequenceAllStruct({
    int? dropSequence,
    int? dropSheetID,
    int? dropSheetCustID,
    String? loadNumber,
    String? loadDate,
    int? locationID,
    int? dSSequence,
    int? fkCustomerID,
    String? customerName,
    String? driver,
    String? totalCount,
    int? labelCount,
    int? scanned,
    int? needPick,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _dropSequence = dropSequence,
        _dropSheetID = dropSheetID,
        _dropSheetCustID = dropSheetCustID,
        _loadNumber = loadNumber,
        _loadDate = loadDate,
        _locationID = locationID,
        _dSSequence = dSSequence,
        _fkCustomerID = fkCustomerID,
        _customerName = customerName,
        _driver = driver,
        _totalCount = totalCount,
        _labelCount = labelCount,
        _scanned = scanned,
        _needPick = needPick,
        super(firestoreUtilData);

  // "DropSequence" field.
  int? _dropSequence;
  int get dropSequence => _dropSequence ?? 0;
  set dropSequence(int? val) => _dropSequence = val;

  void incrementDropSequence(int amount) =>
      dropSequence = dropSequence + amount;

  bool hasDropSequence() => _dropSequence != null;

  // "DropSheetID" field.
  int? _dropSheetID;
  int get dropSheetID => _dropSheetID ?? 0;
  set dropSheetID(int? val) => _dropSheetID = val;

  void incrementDropSheetID(int amount) => dropSheetID = dropSheetID + amount;

  bool hasDropSheetID() => _dropSheetID != null;

  // "DropSheetCustID" field.
  int? _dropSheetCustID;
  int get dropSheetCustID => _dropSheetCustID ?? 0;
  set dropSheetCustID(int? val) => _dropSheetCustID = val;

  void incrementDropSheetCustID(int amount) =>
      dropSheetCustID = dropSheetCustID + amount;

  bool hasDropSheetCustID() => _dropSheetCustID != null;

  // "LoadNumber" field.
  String? _loadNumber;
  String get loadNumber => _loadNumber ?? '';
  set loadNumber(String? val) => _loadNumber = val;

  bool hasLoadNumber() => _loadNumber != null;

  // "LoadDate" field.
  String? _loadDate;
  String get loadDate => _loadDate ?? '';
  set loadDate(String? val) => _loadDate = val;

  bool hasLoadDate() => _loadDate != null;

  // "LocationID" field.
  int? _locationID;
  int get locationID => _locationID ?? 0;
  set locationID(int? val) => _locationID = val;

  void incrementLocationID(int amount) => locationID = locationID + amount;

  bool hasLocationID() => _locationID != null;

  // "DSSequence" field.
  int? _dSSequence;
  int get dSSequence => _dSSequence ?? 0;
  set dSSequence(int? val) => _dSSequence = val;

  void incrementDSSequence(int amount) => dSSequence = dSSequence + amount;

  bool hasDSSequence() => _dSSequence != null;

  // "fkCustomerID" field.
  int? _fkCustomerID;
  int get fkCustomerID => _fkCustomerID ?? 0;
  set fkCustomerID(int? val) => _fkCustomerID = val;

  void incrementFkCustomerID(int amount) =>
      fkCustomerID = fkCustomerID + amount;

  bool hasFkCustomerID() => _fkCustomerID != null;

  // "CustomerName" field.
  String? _customerName;
  String get customerName => _customerName ?? '';
  set customerName(String? val) => _customerName = val;

  bool hasCustomerName() => _customerName != null;

  // "Driver" field.
  String? _driver;
  String get driver => _driver ?? '';
  set driver(String? val) => _driver = val;

  bool hasDriver() => _driver != null;

  // "TotalCount" field.
  String? _totalCount;
  String get totalCount => _totalCount ?? '';
  set totalCount(String? val) => _totalCount = val;

  bool hasTotalCount() => _totalCount != null;

  // "LabelCount" field.
  int? _labelCount;
  int get labelCount => _labelCount ?? 0;
  set labelCount(int? val) => _labelCount = val;

  void incrementLabelCount(int amount) => labelCount = labelCount + amount;

  bool hasLabelCount() => _labelCount != null;

  // "Scanned" field.
  int? _scanned;
  int get scanned => _scanned ?? 0;
  set scanned(int? val) => _scanned = val;

  void incrementScanned(int amount) => scanned = scanned + amount;

  bool hasScanned() => _scanned != null;

  // "NeedPick" field.
  int? _needPick;
  int get needPick => _needPick ?? 0;
  set needPick(int? val) => _needPick = val;

  void incrementNeedPick(int amount) => needPick = needPick + amount;

  bool hasNeedPick() => _needPick != null;

  static LoadViewDetailSequenceAllStruct fromMap(Map<String, dynamic> data) =>
      LoadViewDetailSequenceAllStruct(
        dropSequence: castToType<int>(data['DropSequence']),
        dropSheetID: castToType<int>(data['DropSheetID']),
        dropSheetCustID: castToType<int>(data['DropSheetCustID']),
        loadNumber: data['LoadNumber'] as String?,
        loadDate: data['LoadDate'] as String?,
        locationID: castToType<int>(data['LocationID']),
        dSSequence: castToType<int>(data['DSSequence']),
        fkCustomerID: castToType<int>(data['fkCustomerID']),
        customerName: data['CustomerName'] as String?,
        driver: data['Driver'] as String?,
        totalCount: data['TotalCount'] as String?,
        labelCount: castToType<int>(data['LabelCount']),
        scanned: castToType<int>(data['Scanned']),
        needPick: castToType<int>(data['NeedPick']),
      );

  static LoadViewDetailSequenceAllStruct? maybeFromMap(dynamic data) => data
          is Map
      ? LoadViewDetailSequenceAllStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'DropSequence': _dropSequence,
        'DropSheetID': _dropSheetID,
        'DropSheetCustID': _dropSheetCustID,
        'LoadNumber': _loadNumber,
        'LoadDate': _loadDate,
        'LocationID': _locationID,
        'DSSequence': _dSSequence,
        'fkCustomerID': _fkCustomerID,
        'CustomerName': _customerName,
        'Driver': _driver,
        'TotalCount': _totalCount,
        'LabelCount': _labelCount,
        'Scanned': _scanned,
        'NeedPick': _needPick,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'DropSequence': serializeParam(
          _dropSequence,
          ParamType.int,
        ),
        'DropSheetID': serializeParam(
          _dropSheetID,
          ParamType.int,
        ),
        'DropSheetCustID': serializeParam(
          _dropSheetCustID,
          ParamType.int,
        ),
        'LoadNumber': serializeParam(
          _loadNumber,
          ParamType.String,
        ),
        'LoadDate': serializeParam(
          _loadDate,
          ParamType.String,
        ),
        'LocationID': serializeParam(
          _locationID,
          ParamType.int,
        ),
        'DSSequence': serializeParam(
          _dSSequence,
          ParamType.int,
        ),
        'fkCustomerID': serializeParam(
          _fkCustomerID,
          ParamType.int,
        ),
        'CustomerName': serializeParam(
          _customerName,
          ParamType.String,
        ),
        'Driver': serializeParam(
          _driver,
          ParamType.String,
        ),
        'TotalCount': serializeParam(
          _totalCount,
          ParamType.String,
        ),
        'LabelCount': serializeParam(
          _labelCount,
          ParamType.int,
        ),
        'Scanned': serializeParam(
          _scanned,
          ParamType.int,
        ),
        'NeedPick': serializeParam(
          _needPick,
          ParamType.int,
        ),
      }.withoutNulls;

  static LoadViewDetailSequenceAllStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      LoadViewDetailSequenceAllStruct(
        dropSequence: deserializeParam(
          data['DropSequence'],
          ParamType.int,
          false,
        ),
        dropSheetID: deserializeParam(
          data['DropSheetID'],
          ParamType.int,
          false,
        ),
        dropSheetCustID: deserializeParam(
          data['DropSheetCustID'],
          ParamType.int,
          false,
        ),
        loadNumber: deserializeParam(
          data['LoadNumber'],
          ParamType.String,
          false,
        ),
        loadDate: deserializeParam(
          data['LoadDate'],
          ParamType.String,
          false,
        ),
        locationID: deserializeParam(
          data['LocationID'],
          ParamType.int,
          false,
        ),
        dSSequence: deserializeParam(
          data['DSSequence'],
          ParamType.int,
          false,
        ),
        fkCustomerID: deserializeParam(
          data['fkCustomerID'],
          ParamType.int,
          false,
        ),
        customerName: deserializeParam(
          data['CustomerName'],
          ParamType.String,
          false,
        ),
        driver: deserializeParam(
          data['Driver'],
          ParamType.String,
          false,
        ),
        totalCount: deserializeParam(
          data['TotalCount'],
          ParamType.String,
          false,
        ),
        labelCount: deserializeParam(
          data['LabelCount'],
          ParamType.int,
          false,
        ),
        scanned: deserializeParam(
          data['Scanned'],
          ParamType.int,
          false,
        ),
        needPick: deserializeParam(
          data['NeedPick'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'LoadViewDetailSequenceAllStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is LoadViewDetailSequenceAllStruct &&
        dropSequence == other.dropSequence &&
        dropSheetID == other.dropSheetID &&
        dropSheetCustID == other.dropSheetCustID &&
        loadNumber == other.loadNumber &&
        loadDate == other.loadDate &&
        locationID == other.locationID &&
        dSSequence == other.dSSequence &&
        fkCustomerID == other.fkCustomerID &&
        customerName == other.customerName &&
        driver == other.driver &&
        totalCount == other.totalCount &&
        labelCount == other.labelCount &&
        scanned == other.scanned &&
        needPick == other.needPick;
  }

  @override
  int get hashCode => const ListEquality().hash([
        dropSequence,
        dropSheetID,
        dropSheetCustID,
        loadNumber,
        loadDate,
        locationID,
        dSSequence,
        fkCustomerID,
        customerName,
        driver,
        totalCount,
        labelCount,
        scanned,
        needPick
      ]);
}

LoadViewDetailSequenceAllStruct createLoadViewDetailSequenceAllStruct({
  int? dropSequence,
  int? dropSheetID,
  int? dropSheetCustID,
  String? loadNumber,
  String? loadDate,
  int? locationID,
  int? dSSequence,
  int? fkCustomerID,
  String? customerName,
  String? driver,
  String? totalCount,
  int? labelCount,
  int? scanned,
  int? needPick,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    LoadViewDetailSequenceAllStruct(
      dropSequence: dropSequence,
      dropSheetID: dropSheetID,
      dropSheetCustID: dropSheetCustID,
      loadNumber: loadNumber,
      loadDate: loadDate,
      locationID: locationID,
      dSSequence: dSSequence,
      fkCustomerID: fkCustomerID,
      customerName: customerName,
      driver: driver,
      totalCount: totalCount,
      labelCount: labelCount,
      scanned: scanned,
      needPick: needPick,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

LoadViewDetailSequenceAllStruct? updateLoadViewDetailSequenceAllStruct(
  LoadViewDetailSequenceAllStruct? loadViewDetailSequenceAll, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    loadViewDetailSequenceAll
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addLoadViewDetailSequenceAllStructData(
  Map<String, dynamic> firestoreData,
  LoadViewDetailSequenceAllStruct? loadViewDetailSequenceAll,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (loadViewDetailSequenceAll == null) {
    return;
  }
  if (loadViewDetailSequenceAll.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields = !forFieldValue &&
      loadViewDetailSequenceAll.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final loadViewDetailSequenceAllData =
      getLoadViewDetailSequenceAllFirestoreData(
          loadViewDetailSequenceAll, forFieldValue);
  final nestedData =
      loadViewDetailSequenceAllData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      loadViewDetailSequenceAll.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getLoadViewDetailSequenceAllFirestoreData(
  LoadViewDetailSequenceAllStruct? loadViewDetailSequenceAll, [
  bool forFieldValue = false,
]) {
  if (loadViewDetailSequenceAll == null) {
    return {};
  }
  final firestoreData = mapToFirestore(loadViewDetailSequenceAll.toMap());

  // Add any Firestore field values
  loadViewDetailSequenceAll.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getLoadViewDetailSequenceAllListFirestoreData(
  List<LoadViewDetailSequenceAllStruct>? loadViewDetailSequenceAlls,
) =>
    loadViewDetailSequenceAlls
        ?.map((e) => getLoadViewDetailSequenceAllFirestoreData(e, true))
        .toList() ??
    [];
