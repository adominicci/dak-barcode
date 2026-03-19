import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_data_table.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/actions/actions.dart' as action_blocks;
import '/index.dart';
import 'drop_sheet_list_widget.dart' show DropSheetListWidget;
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class DropSheetListModel extends FlutterFlowModel<DropSheetListWidget> {
  ///  State fields for stateful widgets in this page.

  // State field(s) for loadDateTextField widget.
  FocusNode? loadDateTextFieldFocusNode;
  TextEditingController? loadDateTextFieldTextController;
  String? Function(BuildContext, String?)?
      loadDateTextFieldTextControllerValidator;
  DateTime? datePicked;
  // State field(s) for PaginatedDataTable widget.
  final paginatedDataTableController =
      FlutterFlowDataTableController<SelectDropSheetMenuStruct>();
  // State field(s) for Checkbox widget.
  Map<SelectDropSheetMenuStruct, bool> checkboxValueMap = {};
  List<SelectDropSheetMenuStruct> get checkboxCheckedItems =>
      checkboxValueMap.entries.where((e) => e.value).map((e) => e.key).toList();

  // Stores action output result for [Backend Call - API (Update Picked By Loader)] action in Button widget.
  ApiCallResponse? updatePickedByAPI;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    loadDateTextFieldFocusNode?.dispose();
    loadDateTextFieldTextController?.dispose();

    paginatedDataTableController.dispose();
  }

  /// Action blocks.
  Future getLoadDetails(BuildContext context) async {
    ApiCallResponse? apiLoadDetails;

    apiLoadDetails = await SelectDropsheetLoadingMenuNewCall.call(
      dropSheetDate: FFAppState().loadDate,
      db: FFAppState().location,
    );

    if ((apiLoadDetails.succeeded ?? true)) {
      FFAppState().selectDropSheetMenu = ((apiLoadDetails.jsonBody ?? '')
              .toList()
              .map<SelectDropSheetMenuStruct?>(
                  SelectDropSheetMenuStruct.maybeFromMap)
              .toList() as Iterable<SelectDropSheetMenuStruct?>)
          .withoutNulls
          .toList()
          .cast<SelectDropSheetMenuStruct>();
    } else {
      await action_blocks.a03ErrorMessage(
        context,
        status: (apiLoadDetails.statusCode ?? 200),
        message: (apiLoadDetails.bodyText ?? ''),
        routine: 'Getting load details',
      );
    }
  }
}
