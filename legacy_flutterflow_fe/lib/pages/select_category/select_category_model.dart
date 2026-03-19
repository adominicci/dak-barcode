import '/backend/api_requests/api_calls.dart';
import '/components/loaders/loaders_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/actions/actions.dart' as action_blocks;
import '/index.dart';
import 'package:flutter/material.dart';

class SelectCategoryModel extends FlutterFlowModel<SelectCategoryWidget> {
  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get Loaders Dropsheet)] action in SelectCategory widget.
  ApiCallResponse? loadersDropsheetAPI;
  // Stores action output result for [Backend Call - API (Get Will Call Signature)] action in signatureButton widget.
  ApiCallResponse? getWillCallSignature;
  // Stores action output result for [Backend Call - API (Loading Complete Email)] action in moveOrdersButton widget.
  ApiCallResponse? loadCompleteEmailAPI;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}

  /// Action blocks.
  Future gotoLoading(
    BuildContext context, {
    required int? locationID,
  }) async {
    ApiCallResponse? apiNumberOfDrops;
    ApiCallResponse? loaderDetailsAPI;

    // get all load details
    apiNumberOfDrops = await GetNumberOfDropsCall.call(
      dropSheetID: widget!.dropSheetID,
      locationID: locationID,
      db: FFAppState().location,
    );

    if ((apiNumberOfDrops.succeeded ?? true)) {
      // set how many drops in load
      FFAppState().currentDrop = GetNumberOfDropsCall.numberOfDrops(
        (apiNumberOfDrops.jsonBody ?? ''),
      )!;
      FFAppState().firstRecord = 1;
      FFAppState().lastRecord = GetNumberOfDropsCall.numberOfDrops(
        (apiNumberOfDrops.jsonBody ?? ''),
      )!;
      loaderDetailsAPI = await LoaderAPIsGroup.insertNewLoaderIDCall.call(
        fkDropSheetID: widget!.dropSheetID,
        department: FFAppState().category?.name,
        loaderName: FFAppState().Loader,
        fkLoaderID: FFAppState().LoaderID,
        startedAt: getCurrentTimestamp.toString(),
        db: FFAppState().location,
      );

      // navigate to loading and assign all records in parameter

      context.pushNamed(
        LoadingWidget.routeName,
        queryParameters: {
          'dropSheetID': serializeParam(
            widget!.dropSheetID,
            ParamType.int,
          ),
          'locationID': serializeParam(
            locationID,
            ParamType.int,
          ),
          'loaderID': serializeParam(
            getJsonField(
              (loaderDetailsAPI.jsonBody ?? ''),
              r'''$.loader_id''',
            ),
            ParamType.int,
          ),
        }.withoutNulls,
      );
    } else {
      await action_blocks.a03ErrorMessage(
        context,
        status: (apiNumberOfDrops.statusCode ?? 200),
        message: (apiNumberOfDrops.bodyText ?? ''),
        routine: 'Getting number of drops',
      );
      return;
    }
  }

  Future checkPercentLoadAction02(BuildContext context) async {
    if (widget!.percentCompleted! < 1.0) {
      // display drivers
      await showModalBottomSheet(
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        isDismissible: false,
        enableDrag: false,
        context: context,
        builder: (context) {
          return GestureDetector(
            onTap: () {
              FocusScope.of(context).unfocus();
              FocusManager.instance.primaryFocus?.unfocus();
            },
            child: Padding(
              padding: MediaQuery.viewInsetsOf(context),
              child: Container(
                height: MediaQuery.sizeOf(context).height * 0.4,
                child: LoadersWidget(),
              ),
            ),
          );
        },
      );
    }
  }
}
