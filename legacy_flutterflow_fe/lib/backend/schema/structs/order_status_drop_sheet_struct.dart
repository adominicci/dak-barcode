// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class OrderStatusDropSheetStruct extends FFFirebaseStruct {
  OrderStatusDropSheetStruct({
    int? dropSheetCustID,
    String? orderSONumber,
    String? customerName,
    int? fkDropSheetID,
    int? dSSequence,
    String? orderSlitterStatus,
    String? orderTrimStatus,
    String? orderWrapStatus,
    String? orderPartStatus,
    String? orderRollStatus,
    String? orderSoffitStatus,
    int? statusSort,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _dropSheetCustID = dropSheetCustID,
        _orderSONumber = orderSONumber,
        _customerName = customerName,
        _fkDropSheetID = fkDropSheetID,
        _dSSequence = dSSequence,
        _orderSlitterStatus = orderSlitterStatus,
        _orderTrimStatus = orderTrimStatus,
        _orderWrapStatus = orderWrapStatus,
        _orderPartStatus = orderPartStatus,
        _orderRollStatus = orderRollStatus,
        _orderSoffitStatus = orderSoffitStatus,
        _statusSort = statusSort,
        super(firestoreUtilData);

  // "DropSheetCustID" field.
  int? _dropSheetCustID;
  int get dropSheetCustID => _dropSheetCustID ?? 0;
  set dropSheetCustID(int? val) => _dropSheetCustID = val;

  void incrementDropSheetCustID(int amount) =>
      dropSheetCustID = dropSheetCustID + amount;

  bool hasDropSheetCustID() => _dropSheetCustID != null;

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

  // "fkDropSheetID" field.
  int? _fkDropSheetID;
  int get fkDropSheetID => _fkDropSheetID ?? 0;
  set fkDropSheetID(int? val) => _fkDropSheetID = val;

  void incrementFkDropSheetID(int amount) =>
      fkDropSheetID = fkDropSheetID + amount;

  bool hasFkDropSheetID() => _fkDropSheetID != null;

  // "DSSequence" field.
  int? _dSSequence;
  int get dSSequence => _dSSequence ?? 0;
  set dSSequence(int? val) => _dSSequence = val;

  void incrementDSSequence(int amount) => dSSequence = dSSequence + amount;

  bool hasDSSequence() => _dSSequence != null;

  // "OrderSlitterStatus" field.
  String? _orderSlitterStatus;
  String get orderSlitterStatus => _orderSlitterStatus ?? '';
  set orderSlitterStatus(String? val) => _orderSlitterStatus = val;

  bool hasOrderSlitterStatus() => _orderSlitterStatus != null;

  // "OrderTrimStatus" field.
  String? _orderTrimStatus;
  String get orderTrimStatus => _orderTrimStatus ?? '';
  set orderTrimStatus(String? val) => _orderTrimStatus = val;

  bool hasOrderTrimStatus() => _orderTrimStatus != null;

  // "OrderWrapStatus" field.
  String? _orderWrapStatus;
  String get orderWrapStatus => _orderWrapStatus ?? '';
  set orderWrapStatus(String? val) => _orderWrapStatus = val;

  bool hasOrderWrapStatus() => _orderWrapStatus != null;

  // "OrderPartStatus" field.
  String? _orderPartStatus;
  String get orderPartStatus => _orderPartStatus ?? '';
  set orderPartStatus(String? val) => _orderPartStatus = val;

  bool hasOrderPartStatus() => _orderPartStatus != null;

  // "OrderRollStatus" field.
  String? _orderRollStatus;
  String get orderRollStatus => _orderRollStatus ?? '';
  set orderRollStatus(String? val) => _orderRollStatus = val;

  bool hasOrderRollStatus() => _orderRollStatus != null;

  // "OrderSoffitStatus" field.
  String? _orderSoffitStatus;
  String get orderSoffitStatus => _orderSoffitStatus ?? '';
  set orderSoffitStatus(String? val) => _orderSoffitStatus = val;

  bool hasOrderSoffitStatus() => _orderSoffitStatus != null;

  // "StatusSort" field.
  int? _statusSort;
  int get statusSort => _statusSort ?? 0;
  set statusSort(int? val) => _statusSort = val;

  void incrementStatusSort(int amount) => statusSort = statusSort + amount;

  bool hasStatusSort() => _statusSort != null;

  static OrderStatusDropSheetStruct fromMap(Map<String, dynamic> data) =>
      OrderStatusDropSheetStruct(
        dropSheetCustID: castToType<int>(data['DropSheetCustID']),
        orderSONumber: data['OrderSONumber'] as String?,
        customerName: data['CustomerName'] as String?,
        fkDropSheetID: castToType<int>(data['fkDropSheetID']),
        dSSequence: castToType<int>(data['DSSequence']),
        orderSlitterStatus: data['OrderSlitterStatus'] as String?,
        orderTrimStatus: data['OrderTrimStatus'] as String?,
        orderWrapStatus: data['OrderWrapStatus'] as String?,
        orderPartStatus: data['OrderPartStatus'] as String?,
        orderRollStatus: data['OrderRollStatus'] as String?,
        orderSoffitStatus: data['OrderSoffitStatus'] as String?,
        statusSort: castToType<int>(data['StatusSort']),
      );

  static OrderStatusDropSheetStruct? maybeFromMap(dynamic data) => data is Map
      ? OrderStatusDropSheetStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'DropSheetCustID': _dropSheetCustID,
        'OrderSONumber': _orderSONumber,
        'CustomerName': _customerName,
        'fkDropSheetID': _fkDropSheetID,
        'DSSequence': _dSSequence,
        'OrderSlitterStatus': _orderSlitterStatus,
        'OrderTrimStatus': _orderTrimStatus,
        'OrderWrapStatus': _orderWrapStatus,
        'OrderPartStatus': _orderPartStatus,
        'OrderRollStatus': _orderRollStatus,
        'OrderSoffitStatus': _orderSoffitStatus,
        'StatusSort': _statusSort,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'DropSheetCustID': serializeParam(
          _dropSheetCustID,
          ParamType.int,
        ),
        'OrderSONumber': serializeParam(
          _orderSONumber,
          ParamType.String,
        ),
        'CustomerName': serializeParam(
          _customerName,
          ParamType.String,
        ),
        'fkDropSheetID': serializeParam(
          _fkDropSheetID,
          ParamType.int,
        ),
        'DSSequence': serializeParam(
          _dSSequence,
          ParamType.int,
        ),
        'OrderSlitterStatus': serializeParam(
          _orderSlitterStatus,
          ParamType.String,
        ),
        'OrderTrimStatus': serializeParam(
          _orderTrimStatus,
          ParamType.String,
        ),
        'OrderWrapStatus': serializeParam(
          _orderWrapStatus,
          ParamType.String,
        ),
        'OrderPartStatus': serializeParam(
          _orderPartStatus,
          ParamType.String,
        ),
        'OrderRollStatus': serializeParam(
          _orderRollStatus,
          ParamType.String,
        ),
        'OrderSoffitStatus': serializeParam(
          _orderSoffitStatus,
          ParamType.String,
        ),
        'StatusSort': serializeParam(
          _statusSort,
          ParamType.int,
        ),
      }.withoutNulls;

  static OrderStatusDropSheetStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      OrderStatusDropSheetStruct(
        dropSheetCustID: deserializeParam(
          data['DropSheetCustID'],
          ParamType.int,
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
        fkDropSheetID: deserializeParam(
          data['fkDropSheetID'],
          ParamType.int,
          false,
        ),
        dSSequence: deserializeParam(
          data['DSSequence'],
          ParamType.int,
          false,
        ),
        orderSlitterStatus: deserializeParam(
          data['OrderSlitterStatus'],
          ParamType.String,
          false,
        ),
        orderTrimStatus: deserializeParam(
          data['OrderTrimStatus'],
          ParamType.String,
          false,
        ),
        orderWrapStatus: deserializeParam(
          data['OrderWrapStatus'],
          ParamType.String,
          false,
        ),
        orderPartStatus: deserializeParam(
          data['OrderPartStatus'],
          ParamType.String,
          false,
        ),
        orderRollStatus: deserializeParam(
          data['OrderRollStatus'],
          ParamType.String,
          false,
        ),
        orderSoffitStatus: deserializeParam(
          data['OrderSoffitStatus'],
          ParamType.String,
          false,
        ),
        statusSort: deserializeParam(
          data['StatusSort'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'OrderStatusDropSheetStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is OrderStatusDropSheetStruct &&
        dropSheetCustID == other.dropSheetCustID &&
        orderSONumber == other.orderSONumber &&
        customerName == other.customerName &&
        fkDropSheetID == other.fkDropSheetID &&
        dSSequence == other.dSSequence &&
        orderSlitterStatus == other.orderSlitterStatus &&
        orderTrimStatus == other.orderTrimStatus &&
        orderWrapStatus == other.orderWrapStatus &&
        orderPartStatus == other.orderPartStatus &&
        orderRollStatus == other.orderRollStatus &&
        orderSoffitStatus == other.orderSoffitStatus &&
        statusSort == other.statusSort;
  }

  @override
  int get hashCode => const ListEquality().hash([
        dropSheetCustID,
        orderSONumber,
        customerName,
        fkDropSheetID,
        dSSequence,
        orderSlitterStatus,
        orderTrimStatus,
        orderWrapStatus,
        orderPartStatus,
        orderRollStatus,
        orderSoffitStatus,
        statusSort
      ]);
}

OrderStatusDropSheetStruct createOrderStatusDropSheetStruct({
  int? dropSheetCustID,
  String? orderSONumber,
  String? customerName,
  int? fkDropSheetID,
  int? dSSequence,
  String? orderSlitterStatus,
  String? orderTrimStatus,
  String? orderWrapStatus,
  String? orderPartStatus,
  String? orderRollStatus,
  String? orderSoffitStatus,
  int? statusSort,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    OrderStatusDropSheetStruct(
      dropSheetCustID: dropSheetCustID,
      orderSONumber: orderSONumber,
      customerName: customerName,
      fkDropSheetID: fkDropSheetID,
      dSSequence: dSSequence,
      orderSlitterStatus: orderSlitterStatus,
      orderTrimStatus: orderTrimStatus,
      orderWrapStatus: orderWrapStatus,
      orderPartStatus: orderPartStatus,
      orderRollStatus: orderRollStatus,
      orderSoffitStatus: orderSoffitStatus,
      statusSort: statusSort,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

OrderStatusDropSheetStruct? updateOrderStatusDropSheetStruct(
  OrderStatusDropSheetStruct? orderStatusDropSheet, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    orderStatusDropSheet
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addOrderStatusDropSheetStructData(
  Map<String, dynamic> firestoreData,
  OrderStatusDropSheetStruct? orderStatusDropSheet,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (orderStatusDropSheet == null) {
    return;
  }
  if (orderStatusDropSheet.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && orderStatusDropSheet.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final orderStatusDropSheetData =
      getOrderStatusDropSheetFirestoreData(orderStatusDropSheet, forFieldValue);
  final nestedData =
      orderStatusDropSheetData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields =
      orderStatusDropSheet.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getOrderStatusDropSheetFirestoreData(
  OrderStatusDropSheetStruct? orderStatusDropSheet, [
  bool forFieldValue = false,
]) {
  if (orderStatusDropSheet == null) {
    return {};
  }
  final firestoreData = mapToFirestore(orderStatusDropSheet.toMap());

  // Add any Firestore field values
  orderStatusDropSheet.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getOrderStatusDropSheetListFirestoreData(
  List<OrderStatusDropSheetStruct>? orderStatusDropSheets,
) =>
    orderStatusDropSheets
        ?.map((e) => getOrderStatusDropSheetFirestoreData(e, true))
        .toList() ??
    [];
