// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class DropAreaAllStruct extends FFFirebaseStruct {
  DropAreaAllStruct({
    int? dropAreaID,
    String? dropArea,
    bool? wrapLocation,
    bool? rollLocation,
    bool? partLocation,
    String? firstCharacter,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _dropAreaID = dropAreaID,
        _dropArea = dropArea,
        _wrapLocation = wrapLocation,
        _rollLocation = rollLocation,
        _partLocation = partLocation,
        _firstCharacter = firstCharacter,
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

  // "wrapLocation" field.
  bool? _wrapLocation;
  bool get wrapLocation => _wrapLocation ?? false;
  set wrapLocation(bool? val) => _wrapLocation = val;

  bool hasWrapLocation() => _wrapLocation != null;

  // "rollLocation" field.
  bool? _rollLocation;
  bool get rollLocation => _rollLocation ?? false;
  set rollLocation(bool? val) => _rollLocation = val;

  bool hasRollLocation() => _rollLocation != null;

  // "partLocation" field.
  bool? _partLocation;
  bool get partLocation => _partLocation ?? false;
  set partLocation(bool? val) => _partLocation = val;

  bool hasPartLocation() => _partLocation != null;

  // "firstCharacter" field.
  String? _firstCharacter;
  String get firstCharacter => _firstCharacter ?? '';
  set firstCharacter(String? val) => _firstCharacter = val;

  bool hasFirstCharacter() => _firstCharacter != null;

  static DropAreaAllStruct fromMap(Map<String, dynamic> data) =>
      DropAreaAllStruct(
        dropAreaID: castToType<int>(data['DropAreaID']),
        dropArea: data['DropArea'] as String?,
        wrapLocation: data['wrapLocation'] as bool?,
        rollLocation: data['rollLocation'] as bool?,
        partLocation: data['partLocation'] as bool?,
        firstCharacter: data['firstCharacter'] as String?,
      );

  static DropAreaAllStruct? maybeFromMap(dynamic data) => data is Map
      ? DropAreaAllStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'DropAreaID': _dropAreaID,
        'DropArea': _dropArea,
        'wrapLocation': _wrapLocation,
        'rollLocation': _rollLocation,
        'partLocation': _partLocation,
        'firstCharacter': _firstCharacter,
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
        'wrapLocation': serializeParam(
          _wrapLocation,
          ParamType.bool,
        ),
        'rollLocation': serializeParam(
          _rollLocation,
          ParamType.bool,
        ),
        'partLocation': serializeParam(
          _partLocation,
          ParamType.bool,
        ),
        'firstCharacter': serializeParam(
          _firstCharacter,
          ParamType.String,
        ),
      }.withoutNulls;

  static DropAreaAllStruct fromSerializableMap(Map<String, dynamic> data) =>
      DropAreaAllStruct(
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
          data['wrapLocation'],
          ParamType.bool,
          false,
        ),
        rollLocation: deserializeParam(
          data['rollLocation'],
          ParamType.bool,
          false,
        ),
        partLocation: deserializeParam(
          data['partLocation'],
          ParamType.bool,
          false,
        ),
        firstCharacter: deserializeParam(
          data['firstCharacter'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'DropAreaAllStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is DropAreaAllStruct &&
        dropAreaID == other.dropAreaID &&
        dropArea == other.dropArea &&
        wrapLocation == other.wrapLocation &&
        rollLocation == other.rollLocation &&
        partLocation == other.partLocation &&
        firstCharacter == other.firstCharacter;
  }

  @override
  int get hashCode => const ListEquality().hash([
        dropAreaID,
        dropArea,
        wrapLocation,
        rollLocation,
        partLocation,
        firstCharacter
      ]);
}

DropAreaAllStruct createDropAreaAllStruct({
  int? dropAreaID,
  String? dropArea,
  bool? wrapLocation,
  bool? rollLocation,
  bool? partLocation,
  String? firstCharacter,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    DropAreaAllStruct(
      dropAreaID: dropAreaID,
      dropArea: dropArea,
      wrapLocation: wrapLocation,
      rollLocation: rollLocation,
      partLocation: partLocation,
      firstCharacter: firstCharacter,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

DropAreaAllStruct? updateDropAreaAllStruct(
  DropAreaAllStruct? dropAreaAll, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    dropAreaAll
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addDropAreaAllStructData(
  Map<String, dynamic> firestoreData,
  DropAreaAllStruct? dropAreaAll,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (dropAreaAll == null) {
    return;
  }
  if (dropAreaAll.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && dropAreaAll.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final dropAreaAllData =
      getDropAreaAllFirestoreData(dropAreaAll, forFieldValue);
  final nestedData =
      dropAreaAllData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = dropAreaAll.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getDropAreaAllFirestoreData(
  DropAreaAllStruct? dropAreaAll, [
  bool forFieldValue = false,
]) {
  if (dropAreaAll == null) {
    return {};
  }
  final firestoreData = mapToFirestore(dropAreaAll.toMap());

  // Add any Firestore field values
  dropAreaAll.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getDropAreaAllListFirestoreData(
  List<DropAreaAllStruct>? dropAreaAlls,
) =>
    dropAreaAlls?.map((e) => getDropAreaAllFirestoreData(e, true)).toList() ??
    [];
