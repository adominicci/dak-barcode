import '/backend/api_requests/api_calls.dart';
import '/backend/schema/enums/enums.dart';
import '/backend/schema/structs/index.dart';
import '/components/scan_new_location/scan_new_location_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/actions/actions.dart' as action_blocks;
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/custom_functions.dart' as functions;
import 'dart:async';
import 'staging_widget.dart' show StagingWidget;
import 'package:flutter/material.dart';

class StagingModel extends FlutterFlowModel<StagingWidget> {
  ///  Local state fields for this page.

  String? department;

  ///  State fields for stateful widgets in this page.

  // State field(s) for scanText widget.
  FocusNode? scanTextFocusNode;
  TextEditingController? scanTextTextController;
  String? Function(BuildContext, String?)? scanTextTextControllerValidator;
  // Stores action output result for [Action Block - ScannedLabelAction] action in scanText widget.
  bool? scannedLabel;
  Completer<ApiCallResponse>? apiRequestCompleter2;
  Completer<ApiCallResponse>? apiRequestCompleter1;
  // State field(s) for fakeTextField widget.
  FocusNode? fakeTextFieldFocusNode;
  TextEditingController? fakeTextFieldTextController;
  String? Function(BuildContext, String?)? fakeTextFieldTextControllerValidator;
  // Stores action output result for [Action Block - ScannedLabelAction] action in locationButton widget.
  bool? scannedLabelLocation;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    scanTextFocusNode?.dispose();
    scanTextTextController?.dispose();

    fakeTextFieldFocusNode?.dispose();
    fakeTextFieldTextController?.dispose();
  }

  /// Action blocks.
  Future<PalletScan?> palletScanAction(BuildContext context) async {
    ApiCallResponse? apiScanLabelPanelCount;
    ApiCallResponse? apiLPIDPanel;
    ApiCallResponse? apiPalletPIckView;
    bool? scanParallelAction;
    bool? scanPalletActionMoved;

    // check if scanned label is a pallet
    apiScanLabelPanelCount = await CheckIfScannedLabelIsAPalletCall.call(
      scannedLabel: FFAppState().scannedText,
      db: FFAppState().location,
    );

    if ((apiScanLabelPanelCount.succeeded ?? true)) {
      // get label count if pallet
      FFAppState().scannedLabelPalletCount = getJsonField(
        (apiScanLabelPanelCount.jsonBody ?? ''),
        r'''$[:].ScannedLabelPanelCount''',
      );
      if (FFAppState().scannedLabelPalletCount > 0) {
        // get the lpid the primary record for tbllogisticspackages
        apiLPIDPanel = await GetLPIDValueCall.call(
          barcode: FFAppState().scannedText,
          labelType: true,
          db: FFAppState().location,
        );

        if ((apiLPIDPanel.succeeded ?? true)) {
          // set lpid
          FFAppState().lpid = GetLPIDValueCall.lpidForPalletLabel(
            (apiLPIDPanel.jsonBody ?? ''),
          )!;
          if (FFAppState().lpid == 0) {
            // this label doesn't belong to drop
            await showDialog(
              context: context,
              builder: (alertDialogContext) {
                return AlertDialog(
                  title: Text('Not Found'),
                  content: Text('Label doesn\'t belong to this drop!'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(alertDialogContext),
                      child: Text('Ok'),
                    ),
                  ],
                );
              },
            );
            return PalletScan.DoesNotBelong;
          } else {
            // get lpid and palletid to update tables
            apiPalletPIckView = await GetVwPickPalletForStagingCall.call(
              scannedlabel: FFAppState().scannedText,
              lpid: FFAppState().lpid,
              db: FFAppState().location,
            );

            if ((apiPalletPIckView.succeeded ?? true)) {
              // set app state for pallet view
              FFAppState().PalletPickView = PickPalletViewStruct.maybeFromMap(
                  (apiPalletPIckView.jsonBody ?? ''))!;
              if (FFAppState().DropArea.dropAreaID > 0) {
                // call parallel actions to update scans
                scanParallelAction = await palletScanParallelAction(context);
                if (scanParallelAction!) {
                  return PalletScan.IsPallet;
                }

                return PalletScan.APIError;
              } else {
                if (FFAppState().moveNewLocation == false) {
                  // call new location component
                  await showModalBottomSheet(
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
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
                          child: ScanNewLocationWidget(
                            moveType: Move.staging,
                          ),
                        ),
                      );
                    },
                  );

                  if (FFAppState().moveNewLocation == true) {
                    // scan pallet action with new location
                    scanPalletActionMoved =
                        await palletScanParallelAction(context);
                    // set move location flag to false
                    FFAppState().moveNewLocation = false;
                    if (scanPalletActionMoved!) {
                      return PalletScan.IsPallet;
                    }

                    return PalletScan.DoesNotBelong;
                  } else {
                    return PalletScan.DoesNotBelong;
                  }
                } else {
                  return PalletScan.DoesNotBelong;
                }
              }
            } else {
              await showDialog(
                context: context,
                builder: (alertDialogContext) {
                  return AlertDialog(
                    title: Text('Error'),
                    content: Text((apiPalletPIckView?.bodyText ?? '')),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(alertDialogContext),
                        child: Text('Ok'),
                      ),
                    ],
                  );
                },
              );
              return PalletScan.APIError;
            }
          }
        } else {
          // api error message
          await showDialog(
            context: context,
            builder: (alertDialogContext) {
              return AlertDialog(
                title: Text('Error'),
                content: Text((apiLPIDPanel?.bodyText ?? '')),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(alertDialogContext),
                    child: Text('Ok'),
                  ),
                ],
              );
            },
          );
          return PalletScan.APIError;
        }
      } else {
        return PalletScan.IsLabel;
      }
    } else {
      return PalletScan.APIError;
    }
  }

  Future<bool?> scannedLabelAction(BuildContext context) async {
    int? dropArea;
    PalletScan? palletScanResult;

    if (functions.isNumeric(FFAppState().scannedText) == true) {
      // Convert entered to an integer to get location from tbldroparea table
      dropArea = await actions.convertStringToInteger(
        FFAppState().scannedText,
      );
      FFAppState().barcodeNumber = '';
      // this action calls api to get tbldroparea table
      await action_blocks.getDropArea(
        context,
        scanText: dropArea,
      );
      if (FFAppState().DropArea.dropArea == '') {
        // alert invalid location
        await showDialog(
          context: context,
          builder: (alertDialogContext) {
            return AlertDialog(
              title: Text('Invalid Location'),
              content: Text('Location is not valid. '),
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
      return false;
    } else {
      FFAppState().barcodeNumber = FFAppState().scannedText;
      // if is a pallet it will update all labels in that panel in tblLogisticsPackagesDetail and tblLogisticsPallet tables.
      //
      // Also if an API call fails in the action block it will return true so it stops all execution. Will know if it completed when a snack bar displays.
      // check if is pallet scanned
      palletScanResult = await palletScanAction(context);
      if (palletScanResult == PalletScan.IsPallet) {
      } else if (palletScanResult == PalletScan.IsLabel) {
        // stage single label
        await stageSingleLabelAction(context);
      } else {
        return false;
      }

      if (FFAppState().department == 'Roll') {
        // reset location if category is roll
        FFAppState().DropArea = DropAreaStruct.fromSerializableMap(
            jsonDecode('{\"DropAreaID\":\"0\"}'));
      }
      return true;
    }
  }

  Future<bool?> palletScanParallelAction(BuildContext context) async {
    ApiCallResponse? apiUpdateLogisticsDetails;
    ApiCallResponse? apiUpdatePallet;
    ApiCallResponse? apiUpdatePackagesPallet;

    // set pallet id in app state
    FFAppState().palletid = FFAppState().PalletPickView.palletID;
    await Future.wait([
      Future(() async {
        // update pack details to picked
        apiUpdateLogisticsDetails =
            await UpdateLogisticsPackagesDetailForStagingCall.call(
          palletid: FFAppState().palletid,
          db: FFAppState().location,
        );

        if (!(apiUpdateLogisticsDetails?.succeeded ?? true)) {
          // api error message
          await showDialog(
            context: context,
            builder: (alertDialogContext) {
              return AlertDialog(
                title: Text('Error'),
                content: Text((apiUpdateLogisticsDetails?.bodyText ?? '')),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(alertDialogContext),
                    child: Text('Ok'),
                  ),
                ],
              );
            },
          );
          return false;
        }
      }),
      Future(() async {
        // update pallet table picked
        apiUpdatePallet = await UpdateLogisticsPalletForPalletsCall.call(
          palletid: FFAppState().palletid,
          db: FFAppState().location,
        );

        if (!(apiUpdatePallet?.succeeded ?? true)) {
          // api error message
          await showDialog(
            context: context,
            builder: (alertDialogContext) {
              return AlertDialog(
                title: Text('Error'),
                content: Text((apiUpdatePallet?.bodyText ?? '')),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(alertDialogContext),
                    child: Text('Ok'),
                  ),
                ],
              );
            },
          );
          return false;
        }
      }),
      Future(() async {
        // update location in logistics packages
        apiUpdatePackagesPallet =
            await UpdateLogisticsPackagesForPalletCall.call(
          lpid: FFAppState().lpid,
          locationid: FFAppState().DropArea.dropAreaID,
          db: FFAppState().location,
        );

        if (!(apiUpdatePackagesPallet?.succeeded ?? true)) {
          // api error message
          await showDialog(
            context: context,
            builder: (alertDialogContext) {
              return AlertDialog(
                title: Text('Error'),
                content: Text((apiUpdatePackagesPallet?.bodyText ?? '')),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(alertDialogContext),
                    child: Text('Ok'),
                  ),
                ],
              );
            },
          );
          return false;
        }
      }),
    ]);
    return true;
  }

  Future stageSingleLabelAction(BuildContext context) async {
    ApiCallResponse? apiGetLPIDSingle;

    // get LPID
    apiGetLPIDSingle = await GetLPIDStagingSingleLabelCall.call(
      barcode: FFAppState().scannedText,
      pallet: false,
      db: FFAppState().location,
    );

    if ((apiGetLPIDSingle.succeeded ?? true)) {
      // set variable LPID
      FFAppState().lpid = GetLPIDStagingSingleLabelCall.lpid(
        (apiGetLPIDSingle.jsonBody ?? ''),
      )!;
      if (FFAppState().lpid == 0) {
        // message doesn't belong
        await showDialog(
          context: context,
          builder: (alertDialogContext) {
            return AlertDialog(
              title: Text('Not Found'),
              content: Text('Label doesn\'t exist!'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(alertDialogContext),
                  child: Text('Ok'),
                ),
              ],
            );
          },
        );
        return;
      } else {
        // get records and set app state from api call
        await stageGetLabelsSingleAction(context);
        if (FFAppState().DropArea.dropAreaID > 0) {
          // run update on labels
          await stageSingleUpdateAction(context);
          if (FFAppState().department == 'Roll') {
            // reset droparea to none
            FFAppState().DropArea = DropAreaStruct.fromSerializableMap(
                jsonDecode('{\"DropAreaID\":\"0\"}'));
          }
          return;
        } else {
          if (FFAppState().moveNewLocation == false) {
            // call new location component
            await showModalBottomSheet(
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
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
                    child: ScanNewLocationWidget(
                      moveType: Move.staging,
                    ),
                  ),
                );
              },
            );

            if (FFAppState().moveNewLocation == true) {
              // scan pallet action with new location
              await stageSingleUpdateAction(context);
              // set move location flag to false
              FFAppState().moveNewLocation = false;
            } else {
              return;
            }

            return;
          } else {
            return;
          }
        }
      }
    } else {
      // api error
      await showDialog(
        context: context,
        builder: (alertDialogContext) {
          return AlertDialog(
            title: Text('API Error'),
            content: Text((apiGetLPIDSingle?.bodyText ?? '')),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(alertDialogContext),
                child: Text('Ok'),
              ),
            ],
          );
        },
      );
      return;
    }
  }

  Future stageGetLabelsSingleAction(BuildContext context) async {
    ApiCallResponse? apiGetStagingRecordsSingle;

    // get record that will process all labels with same number and LPID
    apiGetStagingRecordsSingle = await GetStagingRecordsSingleLabelsCall.call(
      barcode: FFAppState().scannedText,
      lpid: FFAppState().lpid,
      db: FFAppState().location,
    );

    if ((apiGetStagingRecordsSingle.succeeded ?? true)) {
      // set state for api result
      FFAppState().SelectLabelsSingleStage =
          SelectLabelsSingleStageStruct.maybeFromMap(
              (apiGetStagingRecordsSingle.jsonBody ?? ''))!;
    } else {
      await showDialog(
        context: context,
        builder: (alertDialogContext) {
          return AlertDialog(
            title: Text('API Error'),
            content: Text((apiGetStagingRecordsSingle?.bodyText ?? '')),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(alertDialogContext),
                child: Text('Ok'),
              ),
            ],
          );
        },
      );
      return;
    }
  }

  Future stageSingleUpdateAction(BuildContext context) async {
    ApiCallResponse? apiUpdateLabelsStaging;

    // update labels as staged
    apiUpdateLabelsStaging = await UpdateLogisticsPackagesStagingCall.call(
      lpid: FFAppState().lpid,
      labelNumber: FFAppState().SelectLabelsSingleStage.labelNumber,
      location: FFAppState().DropArea.dropAreaID,
      db: FFAppState().location,
    );

    if (!(apiUpdateLabelsStaging.succeeded ?? true)) {
      // api error alert
      await showDialog(
        context: context,
        builder: (alertDialogContext) {
          return AlertDialog(
            title: Text('API Error'),
            content: Text((apiUpdateLabelsStaging?.bodyText ?? '')),
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

  /// Additional helper methods.
  Future waitForApiRequestCompleted2({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleter2?.isCompleted ?? false;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }

  Future waitForApiRequestCompleted1({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleter1?.isCompleted ?? false;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }
}
