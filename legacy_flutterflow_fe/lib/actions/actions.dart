import '/backend/api_requests/api_calls.dart';
import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/components/error_message_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/actions/actions.dart' as action_blocks;
import 'package:flutter/material.dart';

Future a03ErrorMessage(
  BuildContext context, {
  required int? status,
  required String? message,
  String? routine,
}) async {
  await showModalBottomSheet(
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    enableDrag: false,
    context: context,
    builder: (context) {
      return Padding(
        padding: MediaQuery.viewInsetsOf(context),
        child: ErrorMessageWidget(
          status: status!,
          message: message!,
          routine: routine,
        ),
      );
    },
  );
}

Future getOrderStatus(BuildContext context) async {
  ApiCallResponse? apiOrderStatus;

  apiOrderStatus = await LoadViewAllFunctionForOrderStatusCall.call(
    dropSheetID: FFAppState().dropSheetID,
    db: FFAppState().location,
  );

  if ((apiOrderStatus.succeeded ?? true)) {
    FFAppState().LoadViewAllMenu = ((apiOrderStatus.jsonBody ?? '')
            .toList()
            .map<LoadViewAllStruct?>(LoadViewAllStruct.maybeFromMap)
            .toList() as Iterable<LoadViewAllStruct?>)
        .withoutNulls
        .toList()
        .cast<LoadViewAllStruct>();
  }
}

Future getDropArea(
  BuildContext context, {
  required int? scanText,
}) async {
  ApiCallResponse? apiDropArea;

  // get drop area/llocation
  apiDropArea = await GetDropAreaCall.call(
    dropareaid: scanText,
    db: FFAppState().location,
  );

  if ((apiDropArea.succeeded ?? true)) {
    // set droparea
    FFAppState().DropArea =
        DropAreaStruct.maybeFromMap((apiDropArea.jsonBody ?? ''))!;
  } else {
    await action_blocks.a03ErrorMessage(
      context,
      status: (apiDropArea.statusCode ?? 200),
      message: (apiDropArea.bodyText ?? ''),
      routine: 'Getting drop area',
    );
  }
}
