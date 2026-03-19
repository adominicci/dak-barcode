// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class StagingPartsForTheDayStruct extends FFFirebaseStruct {
  StagingPartsForTheDayStruct({
    int? lPIDDetail,
    String? partListID,
    String? partListDesc,
    String? orderSONumber,
    int? qtyDet,
    String? dropArea,
    int? lpid,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _lPIDDetail = lPIDDetail,
        _partListID = partListID,
        _partListDesc = partListDesc,
        _orderSONumber = orderSONumber,
        _qtyDet = qtyDet,
        _dropArea = dropArea,
        _lpid = lpid,
        super(firestoreUtilData);

  // "LPIDDetail" field.
  int? _lPIDDetail;
  int get lPIDDetail => _lPIDDetail ?? 0;
  set lPIDDetail(int? val) => _lPIDDetail = val;

  void incrementLPIDDetail(int amount) => lPIDDetail = lPIDDetail + amount;

  bool hasLPIDDetail() => _lPIDDetail != null;

  // "PartListID" field.
  String? _partListID;
  String get partListID => _partListID ?? '';
  set partListID(String? val) => _partListID = val;

  bool hasPartListID() => _partListID != null;

  // "PartListDesc" field.
  String? _partListDesc;
  String get partListDesc => _partListDesc ?? '';
  set partListDesc(String? val) => _partListDesc = val;

  bool hasPartListDesc() => _partListDesc != null;

  // "OrderSONumber" field.
  String? _orderSONumber;
  String get orderSONumber => _orderSONumber ?? '';
  set orderSONumber(String? val) => _orderSONumber = val;

  bool hasOrderSONumber() => _orderSONumber != null;

  // "QtyDet" field.
  int? _qtyDet;
  int get qtyDet => _qtyDet ?? 0;
  set qtyDet(int? val) => _qtyDet = val;

  void incrementQtyDet(int amount) => qtyDet = qtyDet + amount;

  bool hasQtyDet() => _qtyDet != null;

  // "DropArea" field.
  String? _dropArea;
  String get dropArea => _dropArea ?? '';
  set dropArea(String? val) => _dropArea = val;

  bool hasDropArea() => _dropArea != null;

  // "LPID" field.
  int? _lpid;
  int get lpid => _lpid ?? 0;
  set lpid(int? val) => _lpid = val;

  void incrementLpid(int amount) => lpid = lpid + amount;

  bool hasLpid() => _lpid != null;

  static StagingPartsForTheDayStruct fromMap(Map<String, dynamic> data) =>
      StagingPartsForTheDayStruct(
        lPIDDetail: castToType<int>(data['LPIDDetail']),
        partListID: data['PartListID'] as String?,
        partListDesc: data['PartListDesc'] as String?,
        orderSONumber: data['OrderSONumber'] as String?,
        qtyDet: castToType<int>(data['QtyDet']),
        dropArea: data['DropArea'] as String?,
        lpid: castToType<int>(data['LPID']),
      );

  static StagingPartsForTheDayStruct? maybeFromMap(dynamic data) => data is Map
      ? StagingPartsForTheDayStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'LPIDDetail': _lPIDDetail,
        'PartListID': _partListID,
        'PartListDesc': _partListDesc,
        'OrderSONumber': _orderSONumber,
        'QtyDet': _qtyDet,
        'DropArea': _dropArea,
        'LPID': _lpid,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'LPIDDetail': serializeParam(
          _lPIDDetail,
          ParamType.int,
        ),
        'PartListID': serializeParam(
          _partListID,
          ParamType.String,
        ),
        'PartListDesc': serializeParam(
          _partListDesc,
          ParamType.String,
        ),
        'OrderSONumber': serializeParam(
          _orderSONumber,
          ParamType.String,
        ),
        'QtyDet': serializeParam(
          _qtyDet,
          ParamType.int,
        ),
        'DropArea': serializeParam(
          _dropArea,
          ParamType.String,
        ),
        'LPID': serializeParam(
          _lpid,
          ParamType.int,
        ),
      }.withoutNulls;

  static StagingPartsForTheDayStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      StagingPartsForTheDayStruct(
        lPIDDetail: deserializeParam(
          data['LPIDDetail'],
          ParamType.int,
          false,
        ),
        partListID: deserializeParam(
          data['PartListID'],
          ParamType.String,
          false,
        ),
        partListDesc: deserializeParam(
          data['PartListDesc'],
          ParamType.String,
          false,
        ),
        orderSONumber: deserializeParam(
          data['OrderSONumber'],
          ParamType.String,
          false,
        ),
        qtyDet: deserializeParam(
          data['QtyDet'],
          ParamType.int,
          false,
        ),
        dropArea: deserializeParam(
          data['DropArea'],
          ParamType.String,
          false,
        ),
        lpid: deserializeParam(
          data['LPID'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'StagingPartsForTheDayStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is StagingPartsForTheDayStruct &&
        lPIDDetail == other.lPIDDetail &&
        partListID == other.partListID &&
        partListDesc == other.partListDesc &&
        orderSONumber == other.orderSONumber &&
        qtyDet == other.qtyDet &&
        dropArea == other.dropArea &&
        lpid == other.lpid;
  }

  @override
  int get hashCode => const ListEquality().hash([
        lPIDDetail,
        partListID,
        partListDesc,
        orderSONumber,
        qtyDet,
        dropArea,
        lpid
      ]);
}

StagingPartsForTheDayStruct createStagingPartsForTheDayStruct({
  int? lPIDDetail,
  String? partListID,
  String? partListDesc,
  String? orderSONumber,
  int? qtyDet,
  String? dropArea,
  int? lpid,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    StagingPartsForTheDayStruct(
      lPIDDetail: lPIDDetail,
      partListID: partListID,
      partListDesc: partListDesc,
      orderSONumber: orderSONumber,
      qtyDet: qtyDet,
      dropArea: dropArea,
      lpid: lpid,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

StagingPartsForTheDayStruct? updateStagingPartsForTheDayStruct(
  StagingPartsForTheDayStruct? stagingPartsForTheDay, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    stagingPartsForTheDay
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addStagingPartsForTheDayStructData(
  Map<String, dynamic> firestoreData,
  StagingPartsForTheDayStruct? stagingPartsForTheDay,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (stagingPartsForTheDay == null) {
    return;
  }
  if (stagingPartsForTheDay.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields = !forFieldValue &&
      stagingPartsForTheDay.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final stagingPartsForTheDayData = getStagingPartsForTheDayFirestoreData(
      stagingPartsForTheDay, forFieldValue);
  final nestedData =
      stagingPartsForTheDayData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      stagingPartsForTheDay.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getStagingPartsForTheDayFirestoreData(
  StagingPartsForTheDayStruct? stagingPartsForTheDay, [
  bool forFieldValue = false,
]) {
  if (stagingPartsForTheDay == null) {
    return {};
  }
  final firestoreData = mapToFirestore(stagingPartsForTheDay.toMap());

  // Add any Firestore field values
  stagingPartsForTheDay.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getStagingPartsForTheDayListFirestoreData(
  List<StagingPartsForTheDayStruct>? stagingPartsForTheDays,
) =>
    stagingPartsForTheDays
        ?.map((e) => getStagingPartsForTheDayFirestoreData(e, true))
        .toList() ??
    [];
