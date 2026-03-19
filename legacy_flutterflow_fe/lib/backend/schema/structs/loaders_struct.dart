// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class LoadersStruct extends FFFirebaseStruct {
  LoadersStruct({
    int? loaderID,
    String? loader,
    bool? isActive,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _loaderID = loaderID,
        _loader = loader,
        _isActive = isActive,
        super(firestoreUtilData);

  // "LoaderID" field.
  int? _loaderID;
  int get loaderID => _loaderID ?? 0;
  set loaderID(int? val) => _loaderID = val;

  void incrementLoaderID(int amount) => loaderID = loaderID + amount;

  bool hasLoaderID() => _loaderID != null;

  // "Loader" field.
  String? _loader;
  String get loader => _loader ?? '';
  set loader(String? val) => _loader = val;

  bool hasLoader() => _loader != null;

  // "IsActive" field.
  bool? _isActive;
  bool get isActive => _isActive ?? false;
  set isActive(bool? val) => _isActive = val;

  bool hasIsActive() => _isActive != null;

  static LoadersStruct fromMap(Map<String, dynamic> data) => LoadersStruct(
        loaderID: castToType<int>(data['LoaderID']),
        loader: data['Loader'] as String?,
        isActive: data['IsActive'] as bool?,
      );

  static LoadersStruct? maybeFromMap(dynamic data) =>
      data is Map ? LoadersStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'LoaderID': _loaderID,
        'Loader': _loader,
        'IsActive': _isActive,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'LoaderID': serializeParam(
          _loaderID,
          ParamType.int,
        ),
        'Loader': serializeParam(
          _loader,
          ParamType.String,
        ),
        'IsActive': serializeParam(
          _isActive,
          ParamType.bool,
        ),
      }.withoutNulls;

  static LoadersStruct fromSerializableMap(Map<String, dynamic> data) =>
      LoadersStruct(
        loaderID: deserializeParam(
          data['LoaderID'],
          ParamType.int,
          false,
        ),
        loader: deserializeParam(
          data['Loader'],
          ParamType.String,
          false,
        ),
        isActive: deserializeParam(
          data['IsActive'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'LoadersStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is LoadersStruct &&
        loaderID == other.loaderID &&
        loader == other.loader &&
        isActive == other.isActive;
  }

  @override
  int get hashCode => const ListEquality().hash([loaderID, loader, isActive]);
}

LoadersStruct createLoadersStruct({
  int? loaderID,
  String? loader,
  bool? isActive,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    LoadersStruct(
      loaderID: loaderID,
      loader: loader,
      isActive: isActive,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

LoadersStruct? updateLoadersStruct(
  LoadersStruct? loaders, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    loaders
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addLoadersStructData(
  Map<String, dynamic> firestoreData,
  LoadersStruct? loaders,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (loaders == null) {
    return;
  }
  if (loaders.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && loaders.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final loadersData = getLoadersFirestoreData(loaders, forFieldValue);
  final nestedData = loadersData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = loaders.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getLoadersFirestoreData(
  LoadersStruct? loaders, [
  bool forFieldValue = false,
]) {
  if (loaders == null) {
    return {};
  }
  final firestoreData = mapToFirestore(loaders.toMap());

  // Add any Firestore field values
  loaders.firestoreUtilData.fieldValues.forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getLoadersListFirestoreData(
  List<LoadersStruct>? loaderss,
) =>
    loaderss?.map((e) => getLoadersFirestoreData(e, true)).toList() ?? [];
