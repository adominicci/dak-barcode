// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class SelectDropSheetMenuStruct extends FFFirebaseStruct {
  SelectDropSheetMenuStruct({
    int? dropSheetID,
    String? loadNumber,
    String? loadNum,
    String? trailer,
    double? percentCompleted,
    String? loadedTS,
    double? dropWeight,
    int? driver,
    String? driverName,
    bool? allLoaded,
    String? loader,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _dropSheetID = dropSheetID,
        _loadNumber = loadNumber,
        _loadNum = loadNum,
        _trailer = trailer,
        _percentCompleted = percentCompleted,
        _loadedTS = loadedTS,
        _dropWeight = dropWeight,
        _driver = driver,
        _driverName = driverName,
        _allLoaded = allLoaded,
        _loader = loader,
        super(firestoreUtilData);

  // "DropSheetID" field.
  int? _dropSheetID;
  int get dropSheetID => _dropSheetID ?? 0;
  set dropSheetID(int? val) => _dropSheetID = val;

  void incrementDropSheetID(int amount) => dropSheetID = dropSheetID + amount;

  bool hasDropSheetID() => _dropSheetID != null;

  // "LoadNumber" field.
  String? _loadNumber;
  String get loadNumber => _loadNumber ?? ' ';
  set loadNumber(String? val) => _loadNumber = val;

  bool hasLoadNumber() => _loadNumber != null;

  // "LoadNum" field.
  String? _loadNum;
  String get loadNum => _loadNum ?? ' ';
  set loadNum(String? val) => _loadNum = val;

  bool hasLoadNum() => _loadNum != null;

  // "Trailer" field.
  String? _trailer;
  String get trailer => _trailer ?? ' ';
  set trailer(String? val) => _trailer = val;

  bool hasTrailer() => _trailer != null;

  // "PercentCompleted" field.
  double? _percentCompleted;
  double get percentCompleted => _percentCompleted ?? 0.0;
  set percentCompleted(double? val) => _percentCompleted = val;

  void incrementPercentCompleted(double amount) =>
      percentCompleted = percentCompleted + amount;

  bool hasPercentCompleted() => _percentCompleted != null;

  // "LoadedTS" field.
  String? _loadedTS;
  String get loadedTS => _loadedTS ?? '';
  set loadedTS(String? val) => _loadedTS = val;

  bool hasLoadedTS() => _loadedTS != null;

  // "DropWeight" field.
  double? _dropWeight;
  double get dropWeight => _dropWeight ?? 0.0;
  set dropWeight(double? val) => _dropWeight = val;

  void incrementDropWeight(double amount) => dropWeight = dropWeight + amount;

  bool hasDropWeight() => _dropWeight != null;

  // "Driver" field.
  int? _driver;
  int get driver => _driver ?? 0;
  set driver(int? val) => _driver = val;

  void incrementDriver(int amount) => driver = driver + amount;

  bool hasDriver() => _driver != null;

  // "DriverName" field.
  String? _driverName;
  String get driverName => _driverName ?? '';
  set driverName(String? val) => _driverName = val;

  bool hasDriverName() => _driverName != null;

  // "AllLoaded" field.
  bool? _allLoaded;
  bool get allLoaded => _allLoaded ?? false;
  set allLoaded(bool? val) => _allLoaded = val;

  bool hasAllLoaded() => _allLoaded != null;

  // "Loader" field.
  String? _loader;
  String get loader => _loader ?? '';
  set loader(String? val) => _loader = val;

  bool hasLoader() => _loader != null;

  static SelectDropSheetMenuStruct fromMap(Map<String, dynamic> data) =>
      SelectDropSheetMenuStruct(
        dropSheetID: castToType<int>(data['DropSheetID']),
        loadNumber: data['LoadNumber'] as String?,
        loadNum: data['LoadNum'] as String?,
        trailer: data['Trailer'] as String?,
        percentCompleted: castToType<double>(data['PercentCompleted']),
        loadedTS: data['LoadedTS'] as String?,
        dropWeight: castToType<double>(data['DropWeight']),
        driver: castToType<int>(data['Driver']),
        driverName: data['DriverName'] as String?,
        allLoaded: data['AllLoaded'] as bool?,
        loader: data['Loader'] as String?,
      );

  static SelectDropSheetMenuStruct? maybeFromMap(dynamic data) => data is Map
      ? SelectDropSheetMenuStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'DropSheetID': _dropSheetID,
        'LoadNumber': _loadNumber,
        'LoadNum': _loadNum,
        'Trailer': _trailer,
        'PercentCompleted': _percentCompleted,
        'LoadedTS': _loadedTS,
        'DropWeight': _dropWeight,
        'Driver': _driver,
        'DriverName': _driverName,
        'AllLoaded': _allLoaded,
        'Loader': _loader,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'DropSheetID': serializeParam(
          _dropSheetID,
          ParamType.int,
        ),
        'LoadNumber': serializeParam(
          _loadNumber,
          ParamType.String,
        ),
        'LoadNum': serializeParam(
          _loadNum,
          ParamType.String,
        ),
        'Trailer': serializeParam(
          _trailer,
          ParamType.String,
        ),
        'PercentCompleted': serializeParam(
          _percentCompleted,
          ParamType.double,
        ),
        'LoadedTS': serializeParam(
          _loadedTS,
          ParamType.String,
        ),
        'DropWeight': serializeParam(
          _dropWeight,
          ParamType.double,
        ),
        'Driver': serializeParam(
          _driver,
          ParamType.int,
        ),
        'DriverName': serializeParam(
          _driverName,
          ParamType.String,
        ),
        'AllLoaded': serializeParam(
          _allLoaded,
          ParamType.bool,
        ),
        'Loader': serializeParam(
          _loader,
          ParamType.String,
        ),
      }.withoutNulls;

  static SelectDropSheetMenuStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      SelectDropSheetMenuStruct(
        dropSheetID: deserializeParam(
          data['DropSheetID'],
          ParamType.int,
          false,
        ),
        loadNumber: deserializeParam(
          data['LoadNumber'],
          ParamType.String,
          false,
        ),
        loadNum: deserializeParam(
          data['LoadNum'],
          ParamType.String,
          false,
        ),
        trailer: deserializeParam(
          data['Trailer'],
          ParamType.String,
          false,
        ),
        percentCompleted: deserializeParam(
          data['PercentCompleted'],
          ParamType.double,
          false,
        ),
        loadedTS: deserializeParam(
          data['LoadedTS'],
          ParamType.String,
          false,
        ),
        dropWeight: deserializeParam(
          data['DropWeight'],
          ParamType.double,
          false,
        ),
        driver: deserializeParam(
          data['Driver'],
          ParamType.int,
          false,
        ),
        driverName: deserializeParam(
          data['DriverName'],
          ParamType.String,
          false,
        ),
        allLoaded: deserializeParam(
          data['AllLoaded'],
          ParamType.bool,
          false,
        ),
        loader: deserializeParam(
          data['Loader'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'SelectDropSheetMenuStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is SelectDropSheetMenuStruct &&
        dropSheetID == other.dropSheetID &&
        loadNumber == other.loadNumber &&
        loadNum == other.loadNum &&
        trailer == other.trailer &&
        percentCompleted == other.percentCompleted &&
        loadedTS == other.loadedTS &&
        dropWeight == other.dropWeight &&
        driver == other.driver &&
        driverName == other.driverName &&
        allLoaded == other.allLoaded &&
        loader == other.loader;
  }

  @override
  int get hashCode => const ListEquality().hash([
        dropSheetID,
        loadNumber,
        loadNum,
        trailer,
        percentCompleted,
        loadedTS,
        dropWeight,
        driver,
        driverName,
        allLoaded,
        loader
      ]);
}

SelectDropSheetMenuStruct createSelectDropSheetMenuStruct({
  int? dropSheetID,
  String? loadNumber,
  String? loadNum,
  String? trailer,
  double? percentCompleted,
  String? loadedTS,
  double? dropWeight,
  int? driver,
  String? driverName,
  bool? allLoaded,
  String? loader,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    SelectDropSheetMenuStruct(
      dropSheetID: dropSheetID,
      loadNumber: loadNumber,
      loadNum: loadNum,
      trailer: trailer,
      percentCompleted: percentCompleted,
      loadedTS: loadedTS,
      dropWeight: dropWeight,
      driver: driver,
      driverName: driverName,
      allLoaded: allLoaded,
      loader: loader,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

SelectDropSheetMenuStruct? updateSelectDropSheetMenuStruct(
  SelectDropSheetMenuStruct? selectDropSheetMenu, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    selectDropSheetMenu
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addSelectDropSheetMenuStructData(
  Map<String, dynamic> firestoreData,
  SelectDropSheetMenuStruct? selectDropSheetMenu,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (selectDropSheetMenu == null) {
    return;
  }
  if (selectDropSheetMenu.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && selectDropSheetMenu.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final selectDropSheetMenuData =
      getSelectDropSheetMenuFirestoreData(selectDropSheetMenu, forFieldValue);
  final nestedData =
      selectDropSheetMenuData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      selectDropSheetMenu.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getSelectDropSheetMenuFirestoreData(
  SelectDropSheetMenuStruct? selectDropSheetMenu, [
  bool forFieldValue = false,
]) {
  if (selectDropSheetMenu == null) {
    return {};
  }
  final firestoreData = mapToFirestore(selectDropSheetMenu.toMap());

  // Add any Firestore field values
  selectDropSheetMenu.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getSelectDropSheetMenuListFirestoreData(
  List<SelectDropSheetMenuStruct>? selectDropSheetMenus,
) =>
    selectDropSheetMenus
        ?.map((e) => getSelectDropSheetMenuFirestoreData(e, true))
        .toList() ??
    [];
