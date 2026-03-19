// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class SelectLabelsSingleStageStruct extends FFFirebaseStruct {
  SelectLabelsSingleStageStruct({
    String? partListID,
    int? labelNumber,
    bool? picked,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _partListID = partListID,
        _labelNumber = labelNumber,
        _picked = picked,
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

  // "Picked" field.
  bool? _picked;
  bool get picked => _picked ?? false;
  set picked(bool? val) => _picked = val;

  bool hasPicked() => _picked != null;

  static SelectLabelsSingleStageStruct fromMap(Map<String, dynamic> data) =>
      SelectLabelsSingleStageStruct(
        partListID: data['PartListID'] as String?,
        labelNumber: castToType<int>(data['LabelNumber']),
        picked: data['Picked'] as bool?,
      );

  static SelectLabelsSingleStageStruct? maybeFromMap(dynamic data) =>
      data is Map
          ? SelectLabelsSingleStageStruct.fromMap(data.cast<String, dynamic>())
          : null;

  Map<String, dynamic> toMap() => {
        'PartListID': _partListID,
        'LabelNumber': _labelNumber,
        'Picked': _picked,
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
        'Picked': serializeParam(
          _picked,
          ParamType.bool,
        ),
      }.withoutNulls;

  static SelectLabelsSingleStageStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      SelectLabelsSingleStageStruct(
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
        picked: deserializeParam(
          data['Picked'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'SelectLabelsSingleStageStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is SelectLabelsSingleStageStruct &&
        partListID == other.partListID &&
        labelNumber == other.labelNumber &&
        picked == other.picked;
  }

  @override
  int get hashCode =>
      const ListEquality().hash([partListID, labelNumber, picked]);
}

SelectLabelsSingleStageStruct createSelectLabelsSingleStageStruct({
  String? partListID,
  int? labelNumber,
  bool? picked,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    SelectLabelsSingleStageStruct(
      partListID: partListID,
      labelNumber: labelNumber,
      picked: picked,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

SelectLabelsSingleStageStruct? updateSelectLabelsSingleStageStruct(
  SelectLabelsSingleStageStruct? selectLabelsSingleStage, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    selectLabelsSingleStage
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addSelectLabelsSingleStageStructData(
  Map<String, dynamic> firestoreData,
  SelectLabelsSingleStageStruct? selectLabelsSingleStage,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (selectLabelsSingleStage == null) {
    return;
  }
  if (selectLabelsSingleStage.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields = !forFieldValue &&
      selectLabelsSingleStage.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final selectLabelsSingleStageData = getSelectLabelsSingleStageFirestoreData(
      selectLabelsSingleStage, forFieldValue);
  final nestedData =
      selectLabelsSingleStageData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      selectLabelsSingleStage.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getSelectLabelsSingleStageFirestoreData(
  SelectLabelsSingleStageStruct? selectLabelsSingleStage, [
  bool forFieldValue = false,
]) {
  if (selectLabelsSingleStage == null) {
    return {};
  }
  final firestoreData = mapToFirestore(selectLabelsSingleStage.toMap());

  // Add any Firestore field values
  selectLabelsSingleStage.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getSelectLabelsSingleStageListFirestoreData(
  List<SelectLabelsSingleStageStruct>? selectLabelsSingleStages,
) =>
    selectLabelsSingleStages
        ?.map((e) => getSelectLabelsSingleStageFirestoreData(e, true))
        .toList() ??
    [];
