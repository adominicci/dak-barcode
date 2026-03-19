// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class TrailersStruct extends FFFirebaseStruct {
  TrailersStruct({
    int? trailerID,
    String? trailer,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _trailerID = trailerID,
        _trailer = trailer,
        super(firestoreUtilData);

  // "TrailerID" field.
  int? _trailerID;
  int get trailerID => _trailerID ?? 0;
  set trailerID(int? val) => _trailerID = val;

  void incrementTrailerID(int amount) => trailerID = trailerID + amount;

  bool hasTrailerID() => _trailerID != null;

  // "Trailer" field.
  String? _trailer;
  String get trailer => _trailer ?? '';
  set trailer(String? val) => _trailer = val;

  bool hasTrailer() => _trailer != null;

  static TrailersStruct fromMap(Map<String, dynamic> data) => TrailersStruct(
        trailerID: castToType<int>(data['TrailerID']),
        trailer: data['Trailer'] as String?,
      );

  static TrailersStruct? maybeFromMap(dynamic data) =>
      data is Map ? TrailersStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'TrailerID': _trailerID,
        'Trailer': _trailer,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'TrailerID': serializeParam(
          _trailerID,
          ParamType.int,
        ),
        'Trailer': serializeParam(
          _trailer,
          ParamType.String,
        ),
      }.withoutNulls;

  static TrailersStruct fromSerializableMap(Map<String, dynamic> data) =>
      TrailersStruct(
        trailerID: deserializeParam(
          data['TrailerID'],
          ParamType.int,
          false,
        ),
        trailer: deserializeParam(
          data['Trailer'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'TrailersStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is TrailersStruct &&
        trailerID == other.trailerID &&
        trailer == other.trailer;
  }

  @override
  int get hashCode => const ListEquality().hash([trailerID, trailer]);
}

TrailersStruct createTrailersStruct({
  int? trailerID,
  String? trailer,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    TrailersStruct(
      trailerID: trailerID,
      trailer: trailer,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

TrailersStruct? updateTrailersStruct(
  TrailersStruct? trailers, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    trailers
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addTrailersStructData(
  Map<String, dynamic> firestoreData,
  TrailersStruct? trailers,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (trailers == null) {
    return;
  }
  if (trailers.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && trailers.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final trailersData = getTrailersFirestoreData(trailers, forFieldValue);
  final nestedData = trailersData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = trailers.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getTrailersFirestoreData(
  TrailersStruct? trailers, [
  bool forFieldValue = false,
]) {
  if (trailers == null) {
    return {};
  }
  final firestoreData = mapToFirestore(trailers.toMap());

  // Add any Firestore field values
  trailers.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getTrailersListFirestoreData(
  List<TrailersStruct>? trailerss,
) =>
    trailerss?.map((e) => getTrailersFirestoreData(e, true)).toList() ?? [];
