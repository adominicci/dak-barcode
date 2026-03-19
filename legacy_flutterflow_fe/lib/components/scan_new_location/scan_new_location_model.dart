import '/backend/api_requests/api_calls.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/actions/actions.dart' as action_blocks;
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/custom_functions.dart' as functions;
import 'scan_new_location_widget.dart' show ScanNewLocationWidget;
import 'package:flutter/material.dart';

class ScanNewLocationModel extends FlutterFlowModel<ScanNewLocationWidget> {
  ///  Local state fields for this component.

  String? scanLocation;

  String? parseCharacter;

  ///  State fields for stateful widgets in this component.

  // Stores action output result for [Backend Call - API (Select DropArea)] action in ScanNewLocation widget.
  ApiCallResponse? dropAreaAllAPI;
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
  Future stagingLocationAction(BuildContext context) async {
    int? dropArea;

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
      } else {
        // set new location true
        FFAppState().moveNewLocation = true;
        // close dialog
        Navigator.pop(context);
      }
    } else {
      if (FFAppState().DropArea.dropArea == '') {
        // let user know that it needs a location to proceed
        await showDialog(
          context: context,
          builder: (alertDialogContext) {
            return AlertDialog(
              title: Text('No Location'),
              content: Text('A location is required before staging items'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(alertDialogContext),
                  child: Text('Ok'),
                ),
              ],
            );
          },
        );
      } else {
        // move location true
        FFAppState().moveNewLocation = true;
        // close dialog
        Navigator.pop(context);
      }
    }
  }

  Future loadingLocationAction(BuildContext context) async {
    int? dropArea;

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
      if ((FFAppState().DropArea.dropArea != '') &&
          (FFAppState().DropArea.driverLocation == true)) {
        // set new location true
        FFAppState().moveNewLocation = true;
        // close dialog
        Navigator.pop(context);
      } else {
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
    } else {
      if ((FFAppState().DropArea.dropArea != '') &&
          (FFAppState().DropArea.driverLocation == true)) {
        // move location true
        FFAppState().moveNewLocation = true;
        // close dialog
        Navigator.pop(context);
      } else {
        // let user know that it needs a location to proceed
        await showDialog(
          context: context,
          builder: (alertDialogContext) {
            return AlertDialog(
              title: Text('No Location'),
              content: Text('A location is required before loading items'),
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
}
