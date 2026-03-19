import '/backend/api_requests/api_calls.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'dart:async';
import 'loaders_widget.dart' show LoadersWidget;
import 'package:flutter/material.dart';

class LoadersModel extends FlutterFlowModel<LoadersWidget> {
  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  Completer<ApiCallResponse>? apiRequestCompleter;
  // State field(s) for insertLoaderTextField widget.
  FocusNode? insertLoaderTextFieldFocusNode;
  TextEditingController? insertLoaderTextFieldTextController;
  String? Function(BuildContext, String?)?
      insertLoaderTextFieldTextControllerValidator;
  String? _insertLoaderTextFieldTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return 'Insert Loader Name is required';
    }

    return null;
  }

  // Stores action output result for [Backend Call - API (Insert Loader)] action in insertLoaderButton widget.
  ApiCallResponse? insertLoader;

  @override
  void initState(BuildContext context) {
    insertLoaderTextFieldTextControllerValidator =
        _insertLoaderTextFieldTextControllerValidator;
  }

  @override
  void dispose() {
    insertLoaderTextFieldFocusNode?.dispose();
    insertLoaderTextFieldTextController?.dispose();
  }

  /// Additional helper methods.
  Future waitForApiRequestCompleted({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleter?.isCompleted ?? false;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }
}
