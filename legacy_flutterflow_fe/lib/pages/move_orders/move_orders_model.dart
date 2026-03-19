import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_data_table.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/form_field_controller.dart';
import '/actions/actions.dart' as action_blocks;
import 'move_orders_widget.dart' show MoveOrdersWidget;
import 'package:flutter/material.dart';

class MoveOrdersModel extends FlutterFlowModel<MoveOrdersWidget> {
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
      FlutterFlowDataTableController<LoadViewDetailsMoveStruct>();

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    ordersDataTableController.dispose();
  }

  /// Action blocks.
  Future getOrderListAction01(BuildContext context) async {
    ApiCallResponse? apiOrderList;

    // get order status
    apiOrderList = await GetOrdersLoadedToMoveToNewLocationCall.call(
      dropsheetid: FFAppState().dropSheetID,
      customerdropsheetid: dropSheetCutID,
      db: FFAppState().location,
    );

    if ((apiOrderList.succeeded ?? true)) {
      // set order list for move
      FFAppState().loadViewDetailsMove = ((apiOrderList.jsonBody ?? '')
              .toList()
              .map<LoadViewDetailsMoveStruct?>(
                  LoadViewDetailsMoveStruct.maybeFromMap)
              .toList() as Iterable<LoadViewDetailsMoveStruct?>)
          .withoutNulls
          .toList()
          .cast<LoadViewDetailsMoveStruct>();
    } else {
      await action_blocks.a03ErrorMessage(
        context,
        status: (apiOrderList.statusCode ?? 200),
        message: (apiOrderList.bodyText ?? ''),
        routine: 'Getting orders loaded to move to new location',
      );
    }
  }

  Future movePalletAction02(
    BuildContext context, {
    String? palletNumber,
  }) async {
    ApiCallResponse? apiGetLPID;

    // get lpid of pallet
    apiGetLPID = await GetLPIDForPalletLoadCall.call(
      barcode: palletNumber,
      loadNumber: FFAppState().LoadViewAllMenu.firstOrNull?.loadNumber,
      isPallet: true,
      db: FFAppState().location,
    );

    if ((apiGetLPID.succeeded ?? true)) {
      // set lpid to update data
      FFAppState().lpid = GetLPIDForPalletLoadCall.lpid(
        (apiGetLPID.jsonBody ?? ''),
      )!;
      // update pallet location droparea
      await updatePalletAction03(
        context,
        palletNumber: palletNumber,
      );
    } else {
      await action_blocks.a03ErrorMessage(
        context,
        status: (apiGetLPID.statusCode ?? 200),
        message: (apiGetLPID.bodyText ?? ''),
        routine: 'Getting LPID pallet load',
      );
    }
  }

  Future updatePalletAction03(
    BuildContext context, {
    String? palletNumber,
  }) async {
    ApiCallResponse? apiPIckPallet;
    ApiCallResponse? apiUpdatePalletScan;

    // get lpid, barcode and scan status
    apiPIckPallet = await CheckPalletBelongsToLPIDCall.call(
      barcode: palletNumber,
      lpid: FFAppState().lpid,
      db: FFAppState().location,
    );

    if ((apiPIckPallet.succeeded ?? true)) {
      FFAppState().pickPalletLoadScan = PickPalleLoadScanStruct.maybeFromMap(
          (apiPIckPallet.jsonBody ?? ''))!;
      // update details,logistics,pallet tables as scanned
      apiUpdatePalletScan = await UpdatePalletLoadCall.call(
        droparea: FFAppState().DropArea.dropAreaID,
        palletid: FFAppState().pickPalletLoadScan.palletID,
        loader: FFAppState().Loader,
        lpid: FFAppState().pickPalletLoadScan.lpid,
        db: FFAppState().location,
      );

      if (!(apiPIckPallet.succeeded ?? true)) {
        await action_blocks.a03ErrorMessage(
          context,
          status: (apiUpdatePalletScan.statusCode ?? 200),
          message: (apiUpdatePalletScan.bodyText ?? ''),
          routine: 'Updating pallet load',
        );
        return;
      }
    } else {
      await action_blocks.a03ErrorMessage(
        context,
        status: (apiPIckPallet.statusCode ?? 200),
        message: (apiPIckPallet.bodyText ?? ''),
        routine: 'Checking pallet belongs to LPID',
      );
      return;
    }
  }

  Future updateSingleLabelScanAction04(
    BuildContext context, {
    int? lpid,
    int? labelNumber,
  }) async {
    ApiCallResponse? apiUpdateSingleLabel;

    // update single label and children
    apiUpdateSingleLabel = await UpdateSingleLabelLoadCall.call(
      location: FFAppState().DropArea.dropAreaID,
      loader: FFAppState().Loader,
      lpid: lpid,
      labelnumber: labelNumber,
      db: FFAppState().location,
    );

    if (!(apiUpdateSingleLabel.succeeded ?? true)) {
      await action_blocks.a03ErrorMessage(
        context,
        status: (apiUpdateSingleLabel.statusCode ?? 200),
        message: (apiUpdateSingleLabel.bodyText ?? ''),
        routine: 'Updating single label load',
      );
      return;
    }
  }
}
