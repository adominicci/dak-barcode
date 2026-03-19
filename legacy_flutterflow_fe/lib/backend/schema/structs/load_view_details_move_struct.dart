// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class LoadViewDetailsMoveStruct extends FFFirebaseStruct {
  LoadViewDetailsMoveStruct({
    int? dropSheetCustID,
    String? partListID,
    String? qtyDet,
    int? labelNumber,
    bool? scanned,
    String? orderSONumber,
    String? customerName,
    int? loadingLocationID,
    String? dropArea,
    String? partColor,
    int? fkDropSheetID,
    int? recordType,
    int? lpid,
    int? dSSequence,
    bool? unload,
    bool? unloadManualScan,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _dropSheetCustID = dropSheetCustID,
        _partListID = partListID,
        _qtyDet = qtyDet,
        _labelNumber = labelNumber,
        _scanned = scanned,
        _orderSONumber = orderSONumber,
        _customerName = customerName,
        _loadingLocationID = loadingLocationID,
        _dropArea = dropArea,
        _partColor = partColor,
        _fkDropSheetID = fkDropSheetID,
        _recordType = recordType,
        _lpid = lpid,
        _dSSequence = dSSequence,
        _unload = unload,
        _unloadManualScan = unloadManualScan,
        super(firestoreUtilData);

  // "DropSheetCustID" field.
  int? _dropSheetCustID;
  int get dropSheetCustID => _dropSheetCustID ?? 0;
  set dropSheetCustID(int? val) => _dropSheetCustID = val;

  void incrementDropSheetCustID(int amount) =>
      dropSheetCustID = dropSheetCustID + amount;

  bool hasDropSheetCustID() => _dropSheetCustID != null;

  // "PartListID" field.
  String? _partListID;
  String get partListID => _partListID ?? '';
  set partListID(String? val) => _partListID = val;

  bool hasPartListID() => _partListID != null;

  // "QtyDet" field.
  String? _qtyDet;
  String get qtyDet => _qtyDet ?? '';
  set qtyDet(String? val) => _qtyDet = val;

  bool hasQtyDet() => _qtyDet != null;

  // "LabelNumber" field.
  int? _labelNumber;
  int get labelNumber => _labelNumber ?? 0;
  set labelNumber(int? val) => _labelNumber = val;

  void incrementLabelNumber(int amount) => labelNumber = labelNumber + amount;

  bool hasLabelNumber() => _labelNumber != null;

  // "Scanned" field.
  bool? _scanned;
  bool get scanned => _scanned ?? false;
  set scanned(bool? val) => _scanned = val;

  bool hasScanned() => _scanned != null;

  // "OrderSONumber" field.
  String? _orderSONumber;
  String get orderSONumber => _orderSONumber ?? '';
  set orderSONumber(String? val) => _orderSONumber = val;

  bool hasOrderSONumber() => _orderSONumber != null;

  // "CustomerName" field.
  String? _customerName;
  String get customerName => _customerName ?? '';
  set customerName(String? val) => _customerName = val;

  bool hasCustomerName() => _customerName != null;

  // "LoadingLocationID" field.
  int? _loadingLocationID;
  int get loadingLocationID => _loadingLocationID ?? 0;
  set loadingLocationID(int? val) => _loadingLocationID = val;

  void incrementLoadingLocationID(int amount) =>
      loadingLocationID = loadingLocationID + amount;

  bool hasLoadingLocationID() => _loadingLocationID != null;

  // "DropArea" field.
  String? _dropArea;
  String get dropArea => _dropArea ?? '';
  set dropArea(String? val) => _dropArea = val;

  bool hasDropArea() => _dropArea != null;

  // "PartColor" field.
  String? _partColor;
  String get partColor => _partColor ?? '';
  set partColor(String? val) => _partColor = val;

  bool hasPartColor() => _partColor != null;

  // "fkDropSheetID" field.
  int? _fkDropSheetID;
  int get fkDropSheetID => _fkDropSheetID ?? 0;
  set fkDropSheetID(int? val) => _fkDropSheetID = val;

  void incrementFkDropSheetID(int amount) =>
      fkDropSheetID = fkDropSheetID + amount;

  bool hasFkDropSheetID() => _fkDropSheetID != null;

  // "RecordType" field.
  int? _recordType;
  int get recordType => _recordType ?? 0;
  set recordType(int? val) => _recordType = val;

  void incrementRecordType(int amount) => recordType = recordType + amount;

  bool hasRecordType() => _recordType != null;

  // "LPID" field.
  int? _lpid;
  int get lpid => _lpid ?? 0;
  set lpid(int? val) => _lpid = val;

  void incrementLpid(int amount) => lpid = lpid + amount;

  bool hasLpid() => _lpid != null;

  // "DSSequence" field.
  int? _dSSequence;
  int get dSSequence => _dSSequence ?? 0;
  set dSSequence(int? val) => _dSSequence = val;

  void incrementDSSequence(int amount) => dSSequence = dSSequence + amount;

  bool hasDSSequence() => _dSSequence != null;

  // "Unload" field.
  bool? _unload;
  bool get unload => _unload ?? false;
  set unload(bool? val) => _unload = val;

  bool hasUnload() => _unload != null;

  // "UnloadManualScan" field.
  bool? _unloadManualScan;
  bool get unloadManualScan => _unloadManualScan ?? false;
  set unloadManualScan(bool? val) => _unloadManualScan = val;

  bool hasUnloadManualScan() => _unloadManualScan != null;

  static LoadViewDetailsMoveStruct fromMap(Map<String, dynamic> data) =>
      LoadViewDetailsMoveStruct(
        dropSheetCustID: castToType<int>(data['DropSheetCustID']),
        partListID: data['PartListID'] as String?,
        qtyDet: data['QtyDet'] as String?,
        labelNumber: castToType<int>(data['LabelNumber']),
        scanned: data['Scanned'] as bool?,
        orderSONumber: data['OrderSONumber'] as String?,
        customerName: data['CustomerName'] as String?,
        loadingLocationID: castToType<int>(data['LoadingLocationID']),
        dropArea: data['DropArea'] as String?,
        partColor: data['PartColor'] as String?,
        fkDropSheetID: castToType<int>(data['fkDropSheetID']),
        recordType: castToType<int>(data['RecordType']),
        lpid: castToType<int>(data['LPID']),
        dSSequence: castToType<int>(data['DSSequence']),
        unload: data['Unload'] as bool?,
        unloadManualScan: data['UnloadManualScan'] as bool?,
      );

  static LoadViewDetailsMoveStruct? maybeFromMap(dynamic data) => data is Map
      ? LoadViewDetailsMoveStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'DropSheetCustID': _dropSheetCustID,
        'PartListID': _partListID,
        'QtyDet': _qtyDet,
        'LabelNumber': _labelNumber,
        'Scanned': _scanned,
        'OrderSONumber': _orderSONumber,
        'CustomerName': _customerName,
        'LoadingLocationID': _loadingLocationID,
        'DropArea': _dropArea,
        'PartColor': _partColor,
        'fkDropSheetID': _fkDropSheetID,
        'RecordType': _recordType,
        'LPID': _lpid,
        'DSSequence': _dSSequence,
        'Unload': _unload,
        'UnloadManualScan': _unloadManualScan,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'DropSheetCustID': serializeParam(
          _dropSheetCustID,
          ParamType.int,
        ),
        'PartListID': serializeParam(
          _partListID,
          ParamType.String,
        ),
        'QtyDet': serializeParam(
          _qtyDet,
          ParamType.String,
        ),
        'LabelNumber': serializeParam(
          _labelNumber,
          ParamType.int,
        ),
        'Scanned': serializeParam(
          _scanned,
          ParamType.bool,
        ),
        'OrderSONumber': serializeParam(
          _orderSONumber,
          ParamType.String,
        ),
        'CustomerName': serializeParam(
          _customerName,
          ParamType.String,
        ),
        'LoadingLocationID': serializeParam(
          _loadingLocationID,
          ParamType.int,
        ),
        'DropArea': serializeParam(
          _dropArea,
          ParamType.String,
        ),
        'PartColor': serializeParam(
          _partColor,
          ParamType.String,
        ),
        'fkDropSheetID': serializeParam(
          _fkDropSheetID,
          ParamType.int,
        ),
        'RecordType': serializeParam(
          _recordType,
          ParamType.int,
        ),
        'LPID': serializeParam(
          _lpid,
          ParamType.int,
        ),
        'DSSequence': serializeParam(
          _dSSequence,
          ParamType.int,
        ),
        'Unload': serializeParam(
          _unload,
          ParamType.bool,
        ),
        'UnloadManualScan': serializeParam(
          _unloadManualScan,
          ParamType.bool,
        ),
      }.withoutNulls;

  static LoadViewDetailsMoveStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      LoadViewDetailsMoveStruct(
        dropSheetCustID: deserializeParam(
          data['DropSheetCustID'],
          ParamType.int,
          false,
        ),
        partListID: deserializeParam(
          data['PartListID'],
          ParamType.String,
          false,
        ),
        qtyDet: deserializeParam(
          data['QtyDet'],
          ParamType.String,
          false,
        ),
        labelNumber: deserializeParam(
          data['LabelNumber'],
          ParamType.int,
          false,
        ),
        scanned: deserializeParam(
          data['Scanned'],
          ParamType.bool,
          false,
        ),
        orderSONumber: deserializeParam(
          data['OrderSONumber'],
          ParamType.String,
          false,
        ),
        customerName: deserializeParam(
          data['CustomerName'],
          ParamType.String,
          false,
        ),
        loadingLocationID: deserializeParam(
          data['LoadingLocationID'],
          ParamType.int,
          false,
        ),
        dropArea: deserializeParam(
          data['DropArea'],
          ParamType.String,
          false,
        ),
        partColor: deserializeParam(
          data['PartColor'],
          ParamType.String,
          false,
        ),
        fkDropSheetID: deserializeParam(
          data['fkDropSheetID'],
          ParamType.int,
          false,
        ),
        recordType: deserializeParam(
          data['RecordType'],
          ParamType.int,
          false,
        ),
        lpid: deserializeParam(
          data['LPID'],
          ParamType.int,
          false,
        ),
        dSSequence: deserializeParam(
          data['DSSequence'],
          ParamType.int,
          false,
        ),
        unload: deserializeParam(
          data['Unload'],
          ParamType.bool,
          false,
        ),
        unloadManualScan: deserializeParam(
          data['UnloadManualScan'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'LoadViewDetailsMoveStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is LoadViewDetailsMoveStruct &&
        dropSheetCustID == other.dropSheetCustID &&
        partListID == other.partListID &&
        qtyDet == other.qtyDet &&
        labelNumber == other.labelNumber &&
        scanned == other.scanned &&
        orderSONumber == other.orderSONumber &&
        customerName == other.customerName &&
        loadingLocationID == other.loadingLocationID &&
        dropArea == other.dropArea &&
        partColor == other.partColor &&
        fkDropSheetID == other.fkDropSheetID &&
        recordType == other.recordType &&
        lpid == other.lpid &&
        dSSequence == other.dSSequence &&
        unload == other.unload &&
        unloadManualScan == other.unloadManualScan;
  }

  @override
  int get hashCode => const ListEquality().hash([
        dropSheetCustID,
        partListID,
        qtyDet,
        labelNumber,
        scanned,
        orderSONumber,
        customerName,
        loadingLocationID,
        dropArea,
        partColor,
        fkDropSheetID,
        recordType,
        lpid,
        dSSequence,
        unload,
        unloadManualScan
      ]);
}

LoadViewDetailsMoveStruct createLoadViewDetailsMoveStruct({
  int? dropSheetCustID,
  String? partListID,
  String? qtyDet,
  int? labelNumber,
  bool? scanned,
  String? orderSONumber,
  String? customerName,
  int? loadingLocationID,
  String? dropArea,
  String? partColor,
  int? fkDropSheetID,
  int? recordType,
  int? lpid,
  int? dSSequence,
  bool? unload,
  bool? unloadManualScan,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    LoadViewDetailsMoveStruct(
      dropSheetCustID: dropSheetCustID,
      partListID: partListID,
      qtyDet: qtyDet,
      labelNumber: labelNumber,
      scanned: scanned,
      orderSONumber: orderSONumber,
      customerName: customerName,
      loadingLocationID: loadingLocationID,
      dropArea: dropArea,
      partColor: partColor,
      fkDropSheetID: fkDropSheetID,
      recordType: recordType,
      lpid: lpid,
      dSSequence: dSSequence,
      unload: unload,
      unloadManualScan: unloadManualScan,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

LoadViewDetailsMoveStruct? updateLoadViewDetailsMoveStruct(
  LoadViewDetailsMoveStruct? loadViewDetailsMove, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    loadViewDetailsMove
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addLoadViewDetailsMoveStructData(
  Map<String, dynamic> firestoreData,
  LoadViewDetailsMoveStruct? loadViewDetailsMove,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (loadViewDetailsMove == null) {
    return;
  }
  if (loadViewDetailsMove.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && loadViewDetailsMove.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final loadViewDetailsMoveData =
      getLoadViewDetailsMoveFirestoreData(loadViewDetailsMove, forFieldValue);
  final nestedData =
      loadViewDetailsMoveData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      loadViewDetailsMove.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getLoadViewDetailsMoveFirestoreData(
  LoadViewDetailsMoveStruct? loadViewDetailsMove, [
  bool forFieldValue = false,
]) {
  if (loadViewDetailsMove == null) {
    return {};
  }
  final firestoreData = mapToFirestore(loadViewDetailsMove.toMap());

  // Add any Firestore field values
  loadViewDetailsMove.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getLoadViewDetailsMoveListFirestoreData(
  List<LoadViewDetailsMoveStruct>? loadViewDetailsMoves,
) =>
    loadViewDetailsMoves
        ?.map((e) => getLoadViewDetailsMoveFirestoreData(e, true))
        .toList() ??
    [];
