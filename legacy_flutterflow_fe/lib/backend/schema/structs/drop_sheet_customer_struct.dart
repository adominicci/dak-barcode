// ignore_for_file: unnecessary_getters_setters

import 'package:cloud_firestore/cloud_firestore.dart';

import '/backend/schema/util/firestore_util.dart';

import '/flutter_flow/flutter_flow_util.dart';

class DropSheetCustomerStruct extends FFFirebaseStruct {
  DropSheetCustomerStruct({
    int? dropSheetCustID,
    int? fkDropSheetID,
    int? fkCustomerID,
    int? fkSiteMapID,
    int? dSSequence,
    String? signature,
    String? signatureTS,
    String? receivedBy,
    String? signaturePath,
    bool? emailSent,
    bool? dropDelivered,
    FirestoreUtilData firestoreUtilData = const FirestoreUtilData(),
  })  : _dropSheetCustID = dropSheetCustID,
        _fkDropSheetID = fkDropSheetID,
        _fkCustomerID = fkCustomerID,
        _fkSiteMapID = fkSiteMapID,
        _dSSequence = dSSequence,
        _signature = signature,
        _signatureTS = signatureTS,
        _receivedBy = receivedBy,
        _signaturePath = signaturePath,
        _emailSent = emailSent,
        _dropDelivered = dropDelivered,
        super(firestoreUtilData);

  // "DropSheetCustID" field.
  int? _dropSheetCustID;
  int get dropSheetCustID => _dropSheetCustID ?? 0;
  set dropSheetCustID(int? val) => _dropSheetCustID = val;

  void incrementDropSheetCustID(int amount) =>
      dropSheetCustID = dropSheetCustID + amount;

  bool hasDropSheetCustID() => _dropSheetCustID != null;

  // "fkDropSheetID" field.
  int? _fkDropSheetID;
  int get fkDropSheetID => _fkDropSheetID ?? 0;
  set fkDropSheetID(int? val) => _fkDropSheetID = val;

  void incrementFkDropSheetID(int amount) =>
      fkDropSheetID = fkDropSheetID + amount;

  bool hasFkDropSheetID() => _fkDropSheetID != null;

  // "fkCustomerID" field.
  int? _fkCustomerID;
  int get fkCustomerID => _fkCustomerID ?? 0;
  set fkCustomerID(int? val) => _fkCustomerID = val;

  void incrementFkCustomerID(int amount) =>
      fkCustomerID = fkCustomerID + amount;

  bool hasFkCustomerID() => _fkCustomerID != null;

  // "fkSiteMapID" field.
  int? _fkSiteMapID;
  int get fkSiteMapID => _fkSiteMapID ?? 0;
  set fkSiteMapID(int? val) => _fkSiteMapID = val;

  void incrementFkSiteMapID(int amount) => fkSiteMapID = fkSiteMapID + amount;

  bool hasFkSiteMapID() => _fkSiteMapID != null;

  // "DSSequence" field.
  int? _dSSequence;
  int get dSSequence => _dSSequence ?? 0;
  set dSSequence(int? val) => _dSSequence = val;

  void incrementDSSequence(int amount) => dSSequence = dSSequence + amount;

  bool hasDSSequence() => _dSSequence != null;

  // "Signature" field.
  String? _signature;
  String get signature => _signature ?? '';
  set signature(String? val) => _signature = val;

  bool hasSignature() => _signature != null;

  // "SignatureTS" field.
  String? _signatureTS;
  String get signatureTS => _signatureTS ?? '';
  set signatureTS(String? val) => _signatureTS = val;

  bool hasSignatureTS() => _signatureTS != null;

  // "ReceivedBy" field.
  String? _receivedBy;
  String get receivedBy => _receivedBy ?? '';
  set receivedBy(String? val) => _receivedBy = val;

  bool hasReceivedBy() => _receivedBy != null;

  // "Signature_Path" field.
  String? _signaturePath;
  String get signaturePath => _signaturePath ?? '';
  set signaturePath(String? val) => _signaturePath = val;

  bool hasSignaturePath() => _signaturePath != null;

  // "EmailSent" field.
  bool? _emailSent;
  bool get emailSent => _emailSent ?? false;
  set emailSent(bool? val) => _emailSent = val;

  bool hasEmailSent() => _emailSent != null;

  // "DropDelivered" field.
  bool? _dropDelivered;
  bool get dropDelivered => _dropDelivered ?? false;
  set dropDelivered(bool? val) => _dropDelivered = val;

  bool hasDropDelivered() => _dropDelivered != null;

  static DropSheetCustomerStruct fromMap(Map<String, dynamic> data) =>
      DropSheetCustomerStruct(
        dropSheetCustID: castToType<int>(data['DropSheetCustID']),
        fkDropSheetID: castToType<int>(data['fkDropSheetID']),
        fkCustomerID: castToType<int>(data['fkCustomerID']),
        fkSiteMapID: castToType<int>(data['fkSiteMapID']),
        dSSequence: castToType<int>(data['DSSequence']),
        signature: data['Signature'] as String?,
        signatureTS: data['SignatureTS'] as String?,
        receivedBy: data['ReceivedBy'] as String?,
        signaturePath: data['Signature_Path'] as String?,
        emailSent: data['EmailSent'] as bool?,
        dropDelivered: data['DropDelivered'] as bool?,
      );

  static DropSheetCustomerStruct? maybeFromMap(dynamic data) => data is Map
      ? DropSheetCustomerStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'DropSheetCustID': _dropSheetCustID,
        'fkDropSheetID': _fkDropSheetID,
        'fkCustomerID': _fkCustomerID,
        'fkSiteMapID': _fkSiteMapID,
        'DSSequence': _dSSequence,
        'Signature': _signature,
        'SignatureTS': _signatureTS,
        'ReceivedBy': _receivedBy,
        'Signature_Path': _signaturePath,
        'EmailSent': _emailSent,
        'DropDelivered': _dropDelivered,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'DropSheetCustID': serializeParam(
          _dropSheetCustID,
          ParamType.int,
        ),
        'fkDropSheetID': serializeParam(
          _fkDropSheetID,
          ParamType.int,
        ),
        'fkCustomerID': serializeParam(
          _fkCustomerID,
          ParamType.int,
        ),
        'fkSiteMapID': serializeParam(
          _fkSiteMapID,
          ParamType.int,
        ),
        'DSSequence': serializeParam(
          _dSSequence,
          ParamType.int,
        ),
        'Signature': serializeParam(
          _signature,
          ParamType.String,
        ),
        'SignatureTS': serializeParam(
          _signatureTS,
          ParamType.String,
        ),
        'ReceivedBy': serializeParam(
          _receivedBy,
          ParamType.String,
        ),
        'Signature_Path': serializeParam(
          _signaturePath,
          ParamType.String,
        ),
        'EmailSent': serializeParam(
          _emailSent,
          ParamType.bool,
        ),
        'DropDelivered': serializeParam(
          _dropDelivered,
          ParamType.bool,
        ),
      }.withoutNulls;

  static DropSheetCustomerStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      DropSheetCustomerStruct(
        dropSheetCustID: deserializeParam(
          data['DropSheetCustID'],
          ParamType.int,
          false,
        ),
        fkDropSheetID: deserializeParam(
          data['fkDropSheetID'],
          ParamType.int,
          false,
        ),
        fkCustomerID: deserializeParam(
          data['fkCustomerID'],
          ParamType.int,
          false,
        ),
        fkSiteMapID: deserializeParam(
          data['fkSiteMapID'],
          ParamType.int,
          false,
        ),
        dSSequence: deserializeParam(
          data['DSSequence'],
          ParamType.int,
          false,
        ),
        signature: deserializeParam(
          data['Signature'],
          ParamType.String,
          false,
        ),
        signatureTS: deserializeParam(
          data['SignatureTS'],
          ParamType.String,
          false,
        ),
        receivedBy: deserializeParam(
          data['ReceivedBy'],
          ParamType.String,
          false,
        ),
        signaturePath: deserializeParam(
          data['Signature_Path'],
          ParamType.String,
          false,
        ),
        emailSent: deserializeParam(
          data['EmailSent'],
          ParamType.bool,
          false,
        ),
        dropDelivered: deserializeParam(
          data['DropDelivered'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'DropSheetCustomerStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is DropSheetCustomerStruct &&
        dropSheetCustID == other.dropSheetCustID &&
        fkDropSheetID == other.fkDropSheetID &&
        fkCustomerID == other.fkCustomerID &&
        fkSiteMapID == other.fkSiteMapID &&
        dSSequence == other.dSSequence &&
        signature == other.signature &&
        signatureTS == other.signatureTS &&
        receivedBy == other.receivedBy &&
        signaturePath == other.signaturePath &&
        emailSent == other.emailSent &&
        dropDelivered == other.dropDelivered;
  }

  @override
  int get hashCode => const ListEquality().hash([
        dropSheetCustID,
        fkDropSheetID,
        fkCustomerID,
        fkSiteMapID,
        dSSequence,
        signature,
        signatureTS,
        receivedBy,
        signaturePath,
        emailSent,
        dropDelivered
      ]);
}

DropSheetCustomerStruct createDropSheetCustomerStruct({
  int? dropSheetCustID,
  int? fkDropSheetID,
  int? fkCustomerID,
  int? fkSiteMapID,
  int? dSSequence,
  String? signature,
  String? signatureTS,
  String? receivedBy,
  String? signaturePath,
  bool? emailSent,
  bool? dropDelivered,
  Map<String, dynamic> fieldValues = const {},
  bool clearUnsetFields = true,
  bool create = false,
  bool delete = false,
}) =>
    DropSheetCustomerStruct(
      dropSheetCustID: dropSheetCustID,
      fkDropSheetID: fkDropSheetID,
      fkCustomerID: fkCustomerID,
      fkSiteMapID: fkSiteMapID,
      dSSequence: dSSequence,
      signature: signature,
      signatureTS: signatureTS,
      receivedBy: receivedBy,
      signaturePath: signaturePath,
      emailSent: emailSent,
      dropDelivered: dropDelivered,
      firestoreUtilData: FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
        delete: delete,
        fieldValues: fieldValues,
      ),
    );

DropSheetCustomerStruct? updateDropSheetCustomerStruct(
  DropSheetCustomerStruct? dropSheetCustomer, {
  bool clearUnsetFields = true,
  bool create = false,
}) =>
    dropSheetCustomer
      ?..firestoreUtilData = FirestoreUtilData(
        clearUnsetFields: clearUnsetFields,
        create: create,
      );

void addDropSheetCustomerStructData(
  Map<String, dynamic> firestoreData,
  DropSheetCustomerStruct? dropSheetCustomer,
  String fieldName, [
  bool forFieldValue = false,
]) {
  firestoreData.remove(fieldName);
  if (dropSheetCustomer == null) {
    return;
  }
  if (dropSheetCustomer.firestoreUtilData.delete) {
    firestoreData[fieldName] = FieldValue.delete();
    return;
  }
  final clearFields =
      !forFieldValue && dropSheetCustomer.firestoreUtilData.clearUnsetFields;
  if (clearFields) {
    firestoreData[fieldName] = <String, dynamic>{};
  }
  final dropSheetCustomerData =
      getDropSheetCustomerFirestoreData(dropSheetCustomer, forFieldValue);
  final nestedData =
      dropSheetCustomerData.map((k, v) => MapEntry('$fieldName.$k', v));

  final mergeFields = dropSheetCustomer.firestoreUtilData.create || clearFields;
  firestoreData
      .addAll(mergeFields ? mergeNestedFields(nestedData) : nestedData);
}

Map<String, dynamic> getDropSheetCustomerFirestoreData(
  DropSheetCustomerStruct? dropSheetCustomer, [
  bool forFieldValue = false,
]) {
  if (dropSheetCustomer == null) {
    return {};
  }
  final firestoreData = mapToFirestore(dropSheetCustomer.toMap());

  // Add any Firestore field values
  dropSheetCustomer.firestoreUtilData.fieldValues
      .forEach((k, v) => firestoreData[k] = v);

  return forFieldValue ? mergeNestedFields(firestoreData) : firestoreData;
}

List<Map<String, dynamic>> getDropSheetCustomerListFirestoreData(
  List<DropSheetCustomerStruct>? dropSheetCustomers,
) =>
    dropSheetCustomers
        ?.map((e) => getDropSheetCustomerFirestoreData(e, true))
        .toList() ??
    [];
