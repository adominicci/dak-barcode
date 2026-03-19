import '/backend/api_requests/api_calls.dart';
import '/backend/backend.dart';
import '/backend/schema/enums/enums.dart';
import '/backend/schema/structs/index.dart';
import '/components/scan_new_location/scan_new_location_widget.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/actions/actions.dart' as action_blocks;
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/custom_functions.dart' as functions;
import '/index.dart';
import 'dart:async';
import 'loading_widget.dart' show LoadingWidget;
import 'package:flutter/material.dart';

class LoadingModel extends FlutterFlowModel<LoadingWidget> {
  ///  Local state fields for this page.

  DepartmentStatusOnDropStruct? departmentStatusDrop;
  void updateDepartmentStatusDropStruct(
      Function(DepartmentStatusOnDropStruct) updateFn) {
    updateFn(departmentStatusDrop ??= DepartmentStatusOnDropStruct());
  }

  LoadViewDetailStruct? loadViewDetail;
  void updateLoadViewDetailStruct(Function(LoadViewDetailStruct) updateFn) {
    updateFn(loadViewDetail ??= LoadViewDetailStruct());
  }

  List<LoadViewUnionStruct> loadViewUnion = [];
  void addToLoadViewUnion(LoadViewUnionStruct item) => loadViewUnion.add(item);
  void removeFromLoadViewUnion(LoadViewUnionStruct item) =>
      loadViewUnion.remove(item);
  void removeAtIndexFromLoadViewUnion(int index) =>
      loadViewUnion.removeAt(index);
  void insertAtIndexInLoadViewUnion(int index, LoadViewUnionStruct item) =>
      loadViewUnion.insert(index, item);
  void updateLoadViewUnionAtIndex(
          int index, Function(LoadViewUnionStruct) updateFn) =>
      loadViewUnion[index] = updateFn(loadViewUnion[index]);

  bool showPage = false;

  int? totalDrops;

  int? custDropsheetid;

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get Loader Info)] action in Loading widget.
  ApiCallResponse? getLoaderAPI;
  // Stores action output result for [Backend Call - API (Loader Ending Time)] action in IconButton widget.
  ApiCallResponse? loaderEndingAPI;
  Completer<ApiCallResponse>? apiRequestCompleter3;
  Completer<ApiCallResponse>? apiRequestCompleter1;
  Completer<ApiCallResponse>? apiRequestCompleter2;
  // State field(s) for scanText widget.
  FocusNode? scanTextFocusNode;
  TextEditingController? scanTextTextController;
  String? Function(BuildContext, String?)? scanTextTextControllerValidator;
  // Stores action output result for [Action Block - ScanLabelAction04] action in scanText widget.
  bool? scanLabel;
  // Stores action output result for [Backend Call - API (Load View Details Sum Need Pick)] action in scanText widget.
  ApiCallResponse? apiNeedPIck;
  // State field(s) for fakeTextField widget.
  FocusNode? fakeTextFieldFocusNode;
  TextEditingController? fakeTextFieldTextController;
  String? Function(BuildContext, String?)? fakeTextFieldTextControllerValidator;

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
  Future getDropStatusAction03(BuildContext context) async {
    ApiCallResponse? apiDropStatus;

    // get department status
    apiDropStatus = await GetDepartmentStatusOnDropCall.call(
      custDropSheetID: loadViewDetail?.dropSheetCustID,
      db: FFAppState().location,
    );

    if ((apiDropStatus.succeeded ?? true)) {
      // set drop status page state
      departmentStatusDrop = DepartmentStatusOnDropStruct.maybeFromMap(
          (apiDropStatus.jsonBody ?? ''));
    } else {
      // api error
      await showDialog(
        context: context,
        builder: (alertDialogContext) {
          return AlertDialog(
            title: Text('API Error'),
            content: Text((apiDropStatus?.bodyText ?? '')),
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

  Future getLoadViewDetailAction01(BuildContext context) async {
    ApiCallResponse? apiLoadDetailSequence;

    // get main page data
    apiLoadDetailSequence = await LoadViewDetailsBySequenceCall.call(
      dropSheetID: widget!.dropSheetID,
      locationID: widget!.locationID,
      dSSequence: FFAppState().currentDrop,
      db: FFAppState().location,
    );

    if ((apiLoadDetailSequence.succeeded ?? true)) {
      // set page state load view detail
      loadViewDetail = LoadViewDetailStruct.maybeFromMap(
          (apiLoadDetailSequence.jsonBody ?? ''));
    } else {
      // api error
      await showDialog(
        context: context,
        builder: (alertDialogContext) {
          return AlertDialog(
            title: Text('API Error'),
            content: Text((apiLoadDetailSequence?.bodyText ?? '')),
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

  Future getLoadViewUnionAction02(BuildContext context) async {
    ApiCallResponse? apiLoadViewUnion;

    // get data for list load view union
    apiLoadViewUnion = await LoadLabelsUnionViewCall.call(
      loadNumber: loadViewDetail?.loadNumber,
      dSSequence: FFAppState().currentDrop,
      locationID: widget!.locationID,
      db: FFAppState().location,
    );

    if ((apiLoadViewUnion.succeeded ?? true)) {
      // set page state for load union
      loadViewUnion = ((apiLoadViewUnion.jsonBody ?? '')
              .toList()
              .map<LoadViewUnionStruct?>(LoadViewUnionStruct.maybeFromMap)
              .toList() as Iterable<LoadViewUnionStruct?>)
          .withoutNulls
          .toList()
          .cast<LoadViewUnionStruct>();
    } else {
      await showDialog(
        context: context,
        builder: (alertDialogContext) {
          return AlertDialog(
            content: Text((apiLoadViewUnion?.bodyText ?? '')),
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

  Future recordNavigationAction(
    BuildContext context, {
    int? currentDrop,
  }) async {
    // move to a record based on paramenter can be up or down
    FFAppState().currentDrop = FFAppState().currentDrop + currentDrop!;
  }

  Future<bool?> scanLabelAction04(BuildContext context) async {
    int? dropArea;
    bool? departmentDUESTOP;
    PalletScan? scanPalletAction;

    if (functions.isNumeric(FFAppState().scannedText) == true) {
      // Convert entered to an integer to get location from tbldroparea table
      dropArea = await actions.convertStringToInteger(
        FFAppState().scannedText,
      );
      // this action calls api to get tbldroparea table
      await action_blocks.getDropArea(
        context,
        scanText: dropArea,
      );
      if (!((FFAppState().DropArea.dropArea != '') &&
          (FFAppState().DropArea.driverLocation == true))) {
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
        // reset drop area only want driver areas
        FFAppState().DropArea = DropAreaStruct.fromSerializableMap(
            jsonDecode('{\"DropAreaID\":\"0\"}'));
      }
      return false;
    } else {
      if ((FFAppState().DropArea.hasDropArea() != null) &&
          (FFAppState().DropArea.driverLocation == true)) {
        // check dues and stop return true if so
        departmentDUESTOP = await departmentStatusAction05(context);
        if (departmentDUESTOP) {
          // alert department due or stop
          await showDialog(
            context: context,
            builder: (alertDialogContext) {
              return AlertDialog(
                title: Text('Not Completed'),
                content: Text('This drop is not completed!'),
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
        } else {
          // run scan pallet action
          scanPalletAction = await scanPalletAction06(context);
          if (scanPalletAction == PalletScan.IsPallet) {
          } else if (scanPalletAction == PalletScan.IsLabel) {
            // it wasn't pallet so process single labels
            await scanSingleLabelAction08(context);
          } else {
            return false;
          }

          if (FFAppState().category == Category.Roll) {
            // when roll reset location app state
            FFAppState().DropArea = DropAreaStruct.fromSerializableMap(
                jsonDecode('{\"DropAreaID\":\"0\"}'));
          }
          return true;
        }
      } else {
        // label is not valid
        await showDialog(
          context: context,
          builder: (alertDialogContext) {
            return AlertDialog(
              title: Text('No Match'),
              content: Text('Label is not valid!'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(alertDialogContext),
                  child: Text('OK'),
                ),
              ],
            );
          },
        );
        return false;
      }
    }
  }

  Future<bool> departmentStatusAction05(BuildContext context) async {
    if (FFAppState().category == Category.Wrap) {
      if ((departmentStatusDrop?.statusOnLoadSlit == 'DUE') ||
          (departmentStatusDrop?.statusOnLoadSlit == 'STOP') ||
          (departmentStatusDrop?.statusOnLoadTrim == 'DUE') ||
          (departmentStatusDrop?.statusOnLoadTrim == 'STOP') ||
          (departmentStatusDrop?.statusOnLoadWrap == 'DUE') ||
          (departmentStatusDrop?.statusOnLoadWrap == 'STOP')) {
        return true;
      }

      return false;
    } else if (FFAppState().category == Category.Roll) {
      if ((departmentStatusDrop?.statusOnLoadRoll == 'DUE') ||
          (departmentStatusDrop?.statusOnLoadRoll == 'STOP')) {
        return true;
      }

      return false;
    } else if (FFAppState().category == Category.Parts) {
      if ((departmentStatusDrop?.statusOnLoadPart == 'DUE') ||
          (departmentStatusDrop?.statusOnLoadPart == 'STOP') ||
          (departmentStatusDrop?.statusOnLoadSoffit == 'DUE') ||
          (departmentStatusDrop?.statusOnLoadSoffit == 'STOP')) {
        return true;
      }

      return false;
    } else {
      return true;
    }
  }

  Future<PalletScan?> scanPalletAction06(BuildContext context) async {
    ApiCallResponse? apiPalletLabelCount;
    ApiCallResponse? apiGetLPID;
    ApiCallResponse? apiPIckPallet;
    bool? apiUpdatePalletAction;
    bool? updateScanPalletActionMoved;

    // pallet label count
    apiPalletLabelCount = await CountPalletLabelsLoadingCall.call(
      palletLabel: FFAppState().scannedText,
      db: FFAppState().location,
    );

    if ((apiPalletLabelCount.succeeded ?? true)) {
      if (CountPalletLabelsLoadingCall.palletLabelCount(
            (apiPalletLabelCount.jsonBody ?? ''),
          ) ==
          0) {
        return PalletScan.IsLabel;
      }

      // get lpid of pallet
      apiGetLPID = await GetLPIDForPalletLoadCall.call(
        barcode: FFAppState().scannedText,
        loadNumber: FFAppState().loadNumber,
        isPallet: true,
        db: FFAppState().location,
      );

      if ((apiGetLPID.succeeded ?? true)) {
        // set lpid app state
        FFAppState().lpid = GetLPIDForPalletLoadCall.lpid(
          (apiGetLPID.jsonBody ?? ''),
        )!;
        if (FFAppState().lpid == 0) {
          // alert user label doesn't belong
          await showDialog(
            context: context,
            builder: (alertDialogContext) {
              return AlertDialog(
                title: Text('Not Found'),
                content: Text('Label doesn\'t belong to drop!'),
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
          // get lpid, barcode and scan status
          apiPIckPallet = await CheckPalletBelongsToLPIDCall.call(
            barcode: FFAppState().scannedText,
            lpid: FFAppState().lpid,
            db: FFAppState().location,
          );

          if ((apiPIckPallet.succeeded ?? true)) {
            // set scan pallet state
            FFAppState().pickPalletLoadScan =
                PickPalleLoadScanStruct.maybeFromMap(
                    (apiPIckPallet.jsonBody ?? ''))!;
            if (FFAppState().DropArea.dropAreaID > 0) {
              // update pallet,logistics and detail
              apiUpdatePalletAction = await updatePalletScanAction07(context);
              if (apiUpdatePalletAction) {
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
                          moveType: Move.Loading,
                        ),
                      ),
                    );
                  },
                );

                if (FFAppState().moveNewLocation == true) {
                  // scan pallet action with new location
                  updateScanPalletActionMoved =
                      await updatePalletScanAction07(context);
                  // set move location flag to false
                  FFAppState().moveNewLocation = false;
                  if (updateScanPalletActionMoved) {
                    return PalletScan.IsPallet;
                  }

                  return PalletScan.APIError;
                } else {
                  return PalletScan.DoesNotBelong;
                }
              } else {
                return PalletScan.DoesNotBelong;
              }
            }
          } else {
            await action_blocks.a03ErrorMessage(
              context,
              status: (apiPIckPallet.statusCode ?? 200),
              message: (apiPIckPallet.bodyText ?? ''),
              routine: 'Checking pallet belongs to LPID',
            );
            return PalletScan.APIError;
          }
        }
      } else {
        await action_blocks.a03ErrorMessage(
          context,
          status: (apiGetLPID.statusCode ?? 200),
          message: (apiGetLPID.bodyText ?? ''),
          routine: 'Getting LPID for pallet load',
        );
        return PalletScan.APIError;
      }
    } else {
      await action_blocks.a03ErrorMessage(
        context,
        status: (apiPalletLabelCount.statusCode ?? 200),
        message: (apiPalletLabelCount.bodyText ?? ''),
        routine: 'Counting pallet labels loading',
      );
      return PalletScan.APIError;
    }
  }

  Future<bool> updatePalletScanAction07(BuildContext context) async {
    ApiCallResponse? apiUpdatePalletScan;

    // update details,logistics,pallet tables as scanned
    apiUpdatePalletScan = await UpdatePalletLoadCall.call(
      droparea: FFAppState().DropArea.dropAreaID,
      palletid: FFAppState().pickPalletLoadScan.palletID,
      loader: FFAppState().Loader,
      lpid: FFAppState().pickPalletLoadScan.lpid,
      db: FFAppState().location,
    );

    if ((apiUpdatePalletScan.succeeded ?? true)) {
      return true;
    }

    await action_blocks.a03ErrorMessage(
      context,
      status: (apiUpdatePalletScan.statusCode ?? 200),
      message: (apiUpdatePalletScan.bodyText ?? ''),
      routine: 'Updating pallet loaded',
    );
    return false;
  }

  Future scanSingleLabelAction08(BuildContext context) async {
    ApiCallResponse? apiGetLPID;
    ApiCallResponse? apiGetSingleLabel;
    bool? updateSingleLabel;

    // get lpid number from scan
    apiGetLPID = await GetLPIDSingleLabelScanStoredProcedureCall.call(
      barcode: FFAppState().scannedText,
      loadnumber: FFAppState().loadNumber,
      pallet: false,
      db: FFAppState().location,
    );

    if ((apiGetLPID.succeeded ?? true)) {
      // set lpid app state
      FFAppState().lpid =
          LpidStruct.maybeFromMap((apiGetLPID.jsonBody ?? ''))!.lpid;
      if (FFAppState().lpid == 0) {
        // message label doesn't belong
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
        return;
      } else {
        apiGetSingleLabel = await GetLPIDSingleLabelScanCall.call(
          barcode: FFAppState().scannedText,
          lpid: FFAppState().lpid,
          db: FFAppState().location,
        );

        if ((apiGetSingleLabel.succeeded ?? true)) {
          // set record state
          FFAppState().singleLabelScanLoad =
              SingleLabelScanLoadStruct.maybeFromMap(
                  (apiGetSingleLabel.jsonBody ?? ''))!;
        } else {
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
          return;
        }

        if (FFAppState().DropArea.dropAreaID > 0) {
          // update single label and children
          await updateSingleLabelScanAction09(context);
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
                      moveType: Move.Loading,
                    ),
                  ),
                );
              },
            );

            if (FFAppState().moveNewLocation == true) {
              // update single label and children
              updateSingleLabel = await updateSingleLabelScanAction09(context);
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
            content: Text((apiGetLPID?.bodyText ?? '')),
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

  Future<bool?> updateSingleLabelScanAction09(BuildContext context) async {
    ApiCallResponse? apiUpdateSingleLabel;

    // update single label and children
    apiUpdateSingleLabel = await UpdateSingleLabelLoadCall.call(
      location: FFAppState().DropArea.dropAreaID,
      loader: FFAppState().Loader,
      lpid: FFAppState().lpid,
      labelnumber: FFAppState().singleLabelScanLoad.labelNumber,
      db: FFAppState().location,
    );

    if ((apiUpdateSingleLabel.succeeded ?? true)) {
      return true;
    }

    // api error
    await showDialog(
      context: context,
      builder: (alertDialogContext) {
        return AlertDialog(
          title: Text('API Error'),
          content: Text((apiUpdateSingleLabel?.bodyText ?? '')),
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

  /// Additional helper methods.
  Future waitForApiRequestCompleted3({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleter3?.isCompleted ?? false;
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
}
