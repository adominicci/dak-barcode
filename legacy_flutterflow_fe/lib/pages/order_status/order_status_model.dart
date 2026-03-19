import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_data_table.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/form_field_controller.dart';
import 'order_status_widget.dart' show OrderStatusWidget;
import 'package:flutter/material.dart';

class OrderStatusModel extends FlutterFlowModel<OrderStatusWidget> {
  ///  Local state fields for this page.

  String? chipSelected;

  int? dropSheetCutID;

  bool showTable = false;

  ///  State fields for stateful widgets in this page.

  // State field(s) for dropsChoiceChips widget.
  FormFieldController<List<String>>? dropsChoiceChipsValueController;
  String? get dropsChoiceChipsValue =>
      dropsChoiceChipsValueController?.value?.firstOrNull;
  set dropsChoiceChipsValue(String? val) =>
      dropsChoiceChipsValueController?.value = val != null ? [val] : [];
  // State field(s) for ordersDataTable widget.
  final ordersDataTableController =
      FlutterFlowDataTableController<OrderStatusDropSheetStruct>();

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    ordersDataTableController.dispose();
  }

  /// Action blocks.
  Future getOrderStatusList(BuildContext context) async {
    ApiCallResponse? apiOrderStatus;

    // get order status
    apiOrderStatus = await GetOrderStatusInDropsheetCall.call(
      dropSheetID: FFAppState().dropSheetID,
      dropSheetCustID: dropSheetCutID,
      db: FFAppState().location,
    );

    if ((apiOrderStatus.succeeded ?? true)) {
      // set order status state
      FFAppState().OrderStatusDropSheet = ((apiOrderStatus.jsonBody ?? '')
              .toList()
              .map<OrderStatusDropSheetStruct?>(
                  OrderStatusDropSheetStruct.maybeFromMap)
              .toList() as Iterable<OrderStatusDropSheetStruct?>)
          .withoutNulls
          .toList()
          .cast<OrderStatusDropSheetStruct>();
    } else {
      // api error
      await showDialog(
        context: context,
        builder: (alertDialogContext) {
          return AlertDialog(
            content: Text((apiOrderStatus?.bodyText ?? '')),
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
  }
}
