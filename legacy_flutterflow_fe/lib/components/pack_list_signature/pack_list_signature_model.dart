import '/backend/api_requests/api_calls.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'pack_list_signature_widget.dart' show PackListSignatureWidget;
import 'package:flutter/material.dart';
import 'package:signature/signature.dart';

class PackListSignatureModel extends FlutterFlowModel<PackListSignatureWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for receivedByText widget.
  FocusNode? receivedByTextFocusNode;
  TextEditingController? receivedByTextTextController;
  String? Function(BuildContext, String?)?
      receivedByTextTextControllerValidator;
  // State field(s) for Signature widget.
  SignatureController? signatureController;
  String uploadedSignatureUrl = '';
  // Stores action output result for [Backend Call - API (Upload Signature Will Call)] action in uploadButton widget.
  ApiCallResponse? apiUploadSignature;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    receivedByTextFocusNode?.dispose();
    receivedByTextTextController?.dispose();

    signatureController?.dispose();
  }
}
