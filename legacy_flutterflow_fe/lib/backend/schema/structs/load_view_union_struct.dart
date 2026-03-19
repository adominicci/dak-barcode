// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class LoadViewUnionStruct extends FFFirebaseStruct {
  LoadViewUnionStruct({
    String? firstOfPartListID,
    int? labelNumber,
    String? orderSoNumber,
    String? loadNumber,
    int? dSSequence,
    String? dropArea,
    bool? scanned,
    int? locationID,
    String? length,
    int? categoryID,
    int? lpid,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _firstOfPartListID = firstOfPartListID,
        _labelNumber = labelNumber,
        _orderSoNumber = orderSoNumber,
        _loadNumber = loadNumber,
        _dSSequence = dSSequence,
        _dropArea = dropArea,
        _scanned = scanned,
        _locationID = locationID,
        _length = length,
        _categoryID = categoryID,
        _lpid = lpid,
        super(firestoreUtilData);

  // "FirstOfPartListID" field.
  String? _firstOfPartListID;
  String get firstOfPartListID => _firstOfPartListID ?? '';
  set firstOfPartListID(String? val) => _firstOfPartListID = val;

  bool hasFirstOfPartListID() => _firstOfPartListID != null;

  // "LabelNumber" field.
  int? _labelNumber;
  int get labelNumber => _labelNumber ?? 0;
  set labelNumber(int? val) => _labelNumber = val;

  void incrementLabelNumber(int amount) => labelNumber = labelNumber + amount;

  bool hasLabelNumber() => _labelNumber != null;

  // "OrderSoNumber" field.
  String? _orderSoNumber;
  String get orderSoNumber => _orderSoNumber ?? '';
  set orderSoNumber(String? val) => _orderSoNumber = val;

  bool hasOrderSoNumber() => _orderSoNumber != null;

  // "LoadNumber" field.
  String? _loadNumber;
  String get loadNumber => _loadNumber ?? '';
  set loadNumber(String? val) => _loadNumber = val;

  bool hasLoadNumber() => _loadNumber != null;

  // "DSSequence" field.
  int? _dSSequence;
  int get dSSequence => _dSSequence ?? 0;
  set dSSequence(int? val) => _dSSequence = val;

  void incrementDSSequence(int amount) => dSSequence = dSSequence + amount;

  bool hasDSSequence() => _dSSequence != null;

  // "DropArea" field.
  String? _dropArea;
  String get dropArea => _dropArea ?? '';
  set dropArea(String? val) => _dropArea = val;

  bool hasDropArea() => _dropArea != null;

  // "Scanned" field.
  bool? _scanned;
  bool get scanned => _scanned ?? false;
  set scanned(bool? val) => _scanned = val;

  bool hasScanned() => _scanned != null;

  // "LocationID" field.
  int? _locationID;
  int get locationID => _locationID ?? 0;
  set locationID(int? val) => _locationID = val;

  void incrementLocationID(int amount) => locationID = locationID + amount;

  bool hasLocationID() => _locationID != null;

  // "length" field.
  String? _length;
  String get length => _length ?? '';
  set length(String? val) => _length = val;

  bool hasLength() => _length != null;

  // "CategoryID" field.
  int? _categoryID;
  int get categoryID => _categoryID ?? 0;
  set categoryID(int? val) => _categoryID = val;

  void incrementCategoryID(int amount) => categoryID = categoryID + amount;

  bool hasCategoryID() => _categoryID != null;

  // "LPID" field.
  int? _lpid;
  int get lpid => _lpid ?? 0;
  set lpid(int? val) => _lpid = val;

  void incrementLpid(int amount) => lpid = lpid + amount;

  bool hasLpid() => _lpid != null;

  static LoadViewUnionStruct fromMap(Map<String, dynamic> data) =>
      LoadViewUnionStruct(
        firstOfPartListID: data['FirstOfPartListID'] as String?,
        labelNumber: castToType<int>(data['LabelNumber']),
        orderSoNumber: data['OrderSoNumber'] as String?,
        loadNumber: data['LoadNumber'] as String?,
        dSSequence: castToType<int>(data['DSSequence']),
        dropArea: data['DropArea'] as String?,
        scanned: data['Scanned'] as bool?,
        locationID: castToType<int>(data['LocationID']),
        length: data['length'] as String?,
        categoryID: castToType<int>(data['CategoryID']),
        lpid: castToType<int>(data['LPID']),
      );

  static LoadViewUnionStruct? maybeFromMap(dynamic data) => data is Map
      ? LoadViewUnionStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'FirstOfPartListID': _firstOfPartListID,
        'LabelNumber': _labelNumber,
        'OrderSoNumber': _orderSoNumber,
        'LoadNumber': _loadNumber,
        'DSSequence': _dSSequence,
        'DropArea': _dropArea,
        'Scanned': _scanned,
        'LocationID': _locationID,
        'length': _length,
        'CategoryID': _categoryID,
        'LPID': _lpid,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'FirstOfPartListID': serializeParam(
          _firstOfPartListID,
          ParamType.String,
        ),
        'LabelNumber': serializeParam(
          _labelNumber,
          ParamType.int,
        ),
        'OrderSoNumber': serializeParam(
          _orderSoNumber,
          ParamType.String,
        ),
        'LoadNumber': serializeParam(
          _loadNumber,
          ParamType.String,
        ),
        'DSSequence': serializeParam(
          _dSSequence,
          ParamType.int,
        ),
        'DropArea': serializeParam(
          _dropArea,
          ParamType.String,
        ),
        'Scanned': serializeParam(
          _scanned,
          ParamType.bool,
        ),
        'LocationID': serializeParam(
          _locationID,
          ParamType.int,
        ),
        'length': serializeParam(
          _length,
          ParamType.String,
        ),
        'CategoryID': serializeParam(
          _categoryID,
          ParamType.int,
        ),
        'LPID': serializeParam(
          _lpid,
          ParamType.int,
        ),
      }.withoutNulls;

  static LoadViewUnionStruct fromSerializableMap(Map<String, dynamic> data) =>
      LoadViewUnionStruct(
        firstOfPartListID: deserializeParam(
          data['FirstOfPartListID'],
          ParamType.String,
          false,
        ),
        labelNumber: deserializeParam(
          data['LabelNumber'],
          ParamType.int,
          false,
        ),
        orderSoNumber: deserializeParam(
          data['OrderSoNumber'],
          ParamType.String,
          false,
        ),
        loadNumber: deserializeParam(
          data['LoadNumber'],
          ParamType.String,
          false,
        ),
        dSSequence: deserializeParam(
          data['DSSequence'],
          ParamType.int,
          false,
        ),
        dropArea: deserializeParam(
          data['DropArea'],
          ParamType.String,
          false,
        ),
        scanned: deserializeParam(
          data['Scanned'],
          ParamType.bool,
          false,
        ),
        locationID: deserializeParam(
          data['LocationID'],
          ParamType.int,
          false,
        ),
        length: deserializeParam(
          data['length'],
          ParamType.String,
          false,
        ),
        categoryID: deserializeParam(
          data['CategoryID'],
          ParamType.int,
          false,
        ),
        lpid: deserializeParam(
          data['LPID'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'LoadViewUnionStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is LoadViewUnionStruct &&
        firstOfPartListID == other.firstOfPartListID &&
        labelNumber == other.labelNumber &&
        orderSoNumber == other.orderSoNumber &&
        loadNumber == other.loadNumber &&
        dSSequence == other.dSSequence &&
        dropArea == other.dropArea &&
        scanned == other.scanned &&
        locationID == other.locationID &&
        length == other.length &&
        categoryID == other.categoryID &&
        lpid == other.lpid;
  }

  @override
  int get hashCode => const ListEquality().hash([
        firstOfPartListID,
        labelNumber,
        orderSoNumber,
        loadNumber,
        dSSequence,
        dropArea,
        scanned,
        locationID,
        length,
        categoryID,
        lpid
      ]);
}

LoadViewUnionStruct createLoadViewUnionStruct({
  String? firstOfPartListID,
  int? labelNumber,
  String? orderSoNumber,
  String? loadNumber,
  int? dSSequence,
  String? dropArea,
  bool? scanned,
  int? locationID,
  String? length,
  int? categoryID,
  int? lpid,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    LoadViewUnionStruct(
      firstOfPartListID: firstOfPartListID,
      labelNumber: labelNumber,
      orderSoNumber: orderSoNumber,
      loadNumber: loadNumber,
      dSSequence: dSSequence,
      dropArea: dropArea,
      scanned: scanned,
      locationID: locationID,
      length: length,
      categoryID: categoryID,
      lpid: lpid,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

LoadViewUnionStruct? updateLoadViewUnionStruct(
  LoadViewUnionStruct? loadViewUnion, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    loadViewUnion
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addLoadViewUnionStructData(
  Map<String, dynamic> firestoreData,
  LoadViewUnionStruct? loadViewUnion,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (loadViewUnion == null) {
    return;
  }
  if (loadViewUnion.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && loadViewUnion.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final loadViewUnionData =
      getLoadViewUnionFirestoreData(loadViewUnion, forFieldValue);
  final nestedData =
      loadViewUnionData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = loadViewUnion.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getLoadViewUnionFirestoreData(
  LoadViewUnionStruct? loadViewUnion, [
  bool forFieldValue = false,
]) {
  if (loadViewUnion == null) {
    return {};
  }
  final firestoreData = mapToFirestore(loadViewUnion.toMap());

  // Add any Firestore field values
  loadViewUnion.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getLoadViewUnionListFirestoreData(
  List<LoadViewUnionStruct>? loadViewUnions,
) =>
    loadViewUnions
        ?.map((e) => getLoadViewUnionFirestoreData(e, true))
        .toList() ??
    [];
