// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class DropAreaStruct extends FFFirebaseStruct {
  DropAreaStruct({
    int? dropAreaID,
    String? dropArea,
    bool? wrapLocation,
    bool? partLocation,
    bool? rollLocation,
    bool? loadLocation,
    bool? driverLocation,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _dropAreaID = dropAreaID,
        _dropArea = dropArea,
        _wrapLocation = wrapLocation,
        _partLocation = partLocation,
        _rollLocation = rollLocation,
        _loadLocation = loadLocation,
        _driverLocation = driverLocation,
        super(firestoreUtilData);

  // "DropAreaID" field.
  int? _dropAreaID;
  int get dropAreaID => _dropAreaID ?? 0;
  set dropAreaID(int? val) => _dropAreaID = val;

  void incrementDropAreaID(int amount) => dropAreaID = dropAreaID + amount;

  bool hasDropAreaID() => _dropAreaID != null;

  // "DropArea" field.
  String? _dropArea;
  String get dropArea => _dropArea ?? '';
  set dropArea(String? val) => _dropArea = val;

  bool hasDropArea() => _dropArea != null;

  // "WrapLocation" field.
  bool? _wrapLocation;
  bool get wrapLocation => _wrapLocation ?? false;
  set wrapLocation(bool? val) => _wrapLocation = val;

  bool hasWrapLocation() => _wrapLocation != null;

  // "PartLocation" field.
  bool? _partLocation;
  bool get partLocation => _partLocation ?? false;
  set partLocation(bool? val) => _partLocation = val;

  bool hasPartLocation() => _partLocation != null;

  // "RollLocation" field.
  bool? _rollLocation;
  bool get rollLocation => _rollLocation ?? false;
  set rollLocation(bool? val) => _rollLocation = val;

  bool hasRollLocation() => _rollLocation != null;

  // "LoadLocation" field.
  bool? _loadLocation;
  bool get loadLocation => _loadLocation ?? false;
  set loadLocation(bool? val) => _loadLocation = val;

  bool hasLoadLocation() => _loadLocation != null;

  // "DriverLocation" field.
  bool? _driverLocation;
  bool get driverLocation => _driverLocation ?? false;
  set driverLocation(bool? val) => _driverLocation = val;

  bool hasDriverLocation() => _driverLocation != null;

  static DropAreaStruct fromMap(Map<String, dynamic> data) => DropAreaStruct(
        dropAreaID: castToType<int>(data['DropAreaID']),
        dropArea: data['DropArea'] as String?,
        wrapLocation: data['WrapLocation'] as bool?,
        partLocation: data['PartLocation'] as bool?,
        rollLocation: data['RollLocation'] as bool?,
        loadLocation: data['LoadLocation'] as bool?,
        driverLocation: data['DriverLocation'] as bool?,
      );

  static DropAreaStruct? maybeFromMap(dynamic data) =>
      data is Map ? DropAreaStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'DropAreaID': _dropAreaID,
        'DropArea': _dropArea,
        'WrapLocation': _wrapLocation,
        'PartLocation': _partLocation,
        'RollLocation': _rollLocation,
        'LoadLocation': _loadLocation,
        'DriverLocation': _driverLocation,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'DropAreaID': serializeParam(
          _dropAreaID,
          ParamType.int,
        ),
        'DropArea': serializeParam(
          _dropArea,
          ParamType.String,
        ),
        'WrapLocation': serializeParam(
          _wrapLocation,
          ParamType.bool,
        ),
        'PartLocation': serializeParam(
          _partLocation,
          ParamType.bool,
        ),
        'RollLocation': serializeParam(
          _rollLocation,
          ParamType.bool,
        ),
        'LoadLocation': serializeParam(
          _loadLocation,
          ParamType.bool,
        ),
        'DriverLocation': serializeParam(
          _driverLocation,
          ParamType.bool,
        ),
      }.withoutNulls;

  static DropAreaStruct fromSerializableMap(Map<String, dynamic> data) =>
      DropAreaStruct(
        dropAreaID: deserializeParam(
          data['DropAreaID'],
          ParamType.int,
          false,
        ),
        dropArea: deserializeParam(
          data['DropArea'],
          ParamType.String,
          false,
        ),
        wrapLocation: deserializeParam(
          data['WrapLocation'],
          ParamType.bool,
          false,
        ),
        partLocation: deserializeParam(
          data['PartLocation'],
          ParamType.bool,
          false,
        ),
        rollLocation: deserializeParam(
          data['RollLocation'],
          ParamType.bool,
          false,
        ),
        loadLocation: deserializeParam(
          data['LoadLocation'],
          ParamType.bool,
          false,
        ),
        driverLocation: deserializeParam(
          data['DriverLocation'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'DropAreaStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is DropAreaStruct &&
        dropAreaID == other.dropAreaID &&
        dropArea == other.dropArea &&
        wrapLocation == other.wrapLocation &&
        partLocation == other.partLocation &&
        rollLocation == other.rollLocation &&
        loadLocation == other.loadLocation &&
        driverLocation == other.driverLocation;
  }

  @override
  int get hashCode => const ListEquality().hash([
        dropAreaID,
        dropArea,
        wrapLocation,
        partLocation,
        rollLocation,
        loadLocation,
        driverLocation
      ]);
}

DropAreaStruct createDropAreaStruct({
  int? dropAreaID,
  String? dropArea,
  bool? wrapLocation,
  bool? partLocation,
  bool? rollLocation,
  bool? loadLocation,
  bool? driverLocation,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    DropAreaStruct(
      dropAreaID: dropAreaID,
      dropArea: dropArea,
      wrapLocation: wrapLocation,
      partLocation: partLocation,
      rollLocation: rollLocation,
      loadLocation: loadLocation,
      driverLocation: driverLocation,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

DropAreaStruct? updateDropAreaStruct(
  DropAreaStruct? dropAreaStruct, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    dropAreaStruct
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addDropAreaStructData(
  Map<String, dynamic> firestoreData,
  DropAreaStruct? dropAreaStruct,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (dropAreaStruct == null) {
    return;
  }
  if (dropAreaStruct.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && dropAreaStruct.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final dropAreaStructData =
      getDropAreaFirestoreData(dropAreaStruct, forFieldValue);
  final nestedData =
      dropAreaStructData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = dropAreaStruct.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getDropAreaFirestoreData(
  DropAreaStruct? dropAreaStruct, [
  bool forFieldValue = false,
]) {
  if (dropAreaStruct == null) {
    return {};
  }
  final firestoreData = mapToFirestore(dropAreaStruct.toMap());

  // Add any Firestore field values
  dropAreaStruct.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getDropAreaListFirestoreData(
  List<DropAreaStruct>? dropAreaStructs,
) =>
    dropAreaStructs?.map((e) => getDropAreaFirestoreData(e, true)).toList() ??
    [];
