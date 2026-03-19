import '/backend/api_requests/api_calls.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/actions/actions.dart' as action_blocks;
import '/index.dart';
import 'scan_pack_list_widget.dart' show ScanPackListWidget;
import 'package:flutter/material.dart';

class ScanPackListModel extends FlutterFlowModel<ScanPackListWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for scanLocationText widget.
  FocusNode? scanLocationTextFocusNode;
  TextEditingController? scanLocationTextTextController;
  String? Function(BuildContext, String?)?
      scanLocationTextTextControllerValidator;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    scanLocationTextFocusNode?.dispose();
    scanLocationTextTextController?.dispose();
  }

  /// Action blocks.
  Future scanPackListAction(BuildContext context) async {
    ApiCallResponse? apiWillCall;

    // search for dropsheet for will calls
    apiWillCall = await GetDropsheetForWillCallOrdersCall.call(
      loadnumber: FFAppState().scannedText,
      db: FFAppState().location,
    );

    if ((apiWillCall.succeeded ?? true)) {
      if (GetDropsheetForWillCallOrdersCall.dropSheetID(
            (apiWillCall.jsonBody ?? ''),
          ) !=
          null) {
        FFAppState().loadNumber = FFAppState().scannedText;
        FFAppState().driverName = 'WILL CALL';
        // navigate to select category

        context.pushNamed(
          SelectCategoryWidget.routeName,
          queryParameters: {
            'dropSheetID': serializeParam(
              GetDropsheetForWillCallOrdersCall.dropSheetID(
                (apiWillCall.jsonBody ?? ''),
              ),
              ParamType.int,
            ),
            'deliveryNumber': serializeParam(
              FFAppState().scannedText,
              ParamType.String,
            ),
            'willcall': serializeParam(
              true,
              ParamType.bool,
            ),
            'percentCompleted': serializeParam(
              FFAppConstants.percentCompleted,
              ParamType.double,
            ),
          }.withoutNulls,
        );

        // hide popup
        Navigator.pop(context);
      } else {
        // alert dropsheet not found
        await showDialog(
          context: context,
          builder: (alertDialogContext) {
            return AlertDialog(
              title: Text('Not Found'),
              content: Text(
                  'Load number ${FFAppState().scannedText}is not a will call order!'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(alertDialogContext),
                  child: Text('Ok'),
                ),
              ],
            );
          },
        );
      }
    } else {
      // api error
      await showDialog(
        context: context,
        builder: (alertDialogContext) {
          return AlertDialog(
            title: Text('API error'),
            content: Text((apiWillCall?.bodyText ?? '')),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(alertDialogContext),
                child: Text('Ok'),
              ),
            ],
          );
        },
      );
      await action_blocks.a03ErrorMessage(
        context,
        status: (apiWillCall.statusCode ?? 200),
        message: (apiWillCall.bodyText ?? ''),
        routine: 'Getting dropsheet for will call orders',
      );
      return;
    }
  }
}
