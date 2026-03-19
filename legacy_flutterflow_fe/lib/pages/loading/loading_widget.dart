import '/backend/api_requests/api_calls.dart';
import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/components/loaders/loaders_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/actions/actions.dart' as action_blocks;
import '/custom_code/actions/index.dart' as actions;
import '/index.dart';
import 'dart:async';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'loading_model.dart';
export 'loading_model.dart';

class LoadingWidget extends StatefulWidget {
  const LoadingWidget({
    super.key,
    required this.dropSheetID,
    required this.locationID,
    this.loaderID,
  });

  final int? dropSheetID;
  final int? locationID;

  /// This is the primary key for the tblDropSheetLoader table.
  final int? loaderID;

  static String routeName = 'Loading';
  static String routePath = '/loading';

  @override
  State<LoadingWidget> createState() => _LoadingWidgetState();
}

class _LoadingWidgetState extends State<LoadingWidget> {
  late LoadingModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LoadingModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      // set display page flag

      safeSetState(() {});
      // call load view union labels
      await _model.getLoadViewUnionAction02(context);
      safeSetState(() {});
      // clear droparea and scantext app state
      FFAppState().scannedText = '';
      FFAppState().DropArea = DropAreaStruct.fromSerializableMap(
          jsonDecode('{\"DropAreaID\":\"0\"}'));
      FFAppState().moveNewLocation = false;
      safeSetState(() {});
      // set display page flag
      _model.showPage = true;
      safeSetState(() {});
      _model.getLoaderAPI = await LoaderAPIsGroup.getLoaderInfoCall.call(
        loaderId: widget.loaderID,
        db: FFAppState().location,
      );

      FFAppState().loaderInfo =
          LoaderInfoStruct.maybeFromMap((_model.getLoaderAPI?.jsonBody ?? ''))!;
      safeSetState(() {});
    });

    _model.scanTextTextController ??= TextEditingController();
    _model.scanTextFocusNode ??= FocusNode();

    _model.fakeTextFieldTextController ??= TextEditingController();
    _model.fakeTextFieldFocusNode ??= FocusNode();
    _model.fakeTextFieldFocusNode!.addListener(
      () async {
        safeSetState(() {
          _model.fakeTextFieldTextController?.clear();
        });
      },
    );
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return FutureBuilder<ApiCallResponse>(
      future: (_model.apiRequestCompleter3 ??= Completer<ApiCallResponse>()
            ..complete(LoadViewDetailSequenceAllCall.call(
              dropsheetid: widget.dropSheetID,
              locationid: widget.locationID,
              db: FFAppState().location,
            )))
          .future,
      builder: (context, snapshot) {
        // Customize what your widget looks like when it's loading.
        if (!snapshot.hasData) {
          return Scaffold(
            backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
            body: Center(
              child: SizedBox(
                width: 50.0,
                height: 50.0,
                child: SpinKitChasingDots(
                  color: FlutterFlowTheme.of(context).primary,
                  size: 50.0,
                ),
              ),
            ),
          );
        }
        final loadingLoadViewDetailSequenceAllResponse = snapshot.data!;

        return GestureDetector(
          onTap: () {
            FocusScope.of(context).unfocus();
            FocusManager.instance.primaryFocus?.unfocus();
          },
          child: Scaffold(
            key: scaffoldKey,
            backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
            appBar: PreferredSize(
              preferredSize: Size.fromHeight(70.0),
              child: AppBar(
                backgroundColor: FFAppState().location == 'Freeport'
                    ? FlutterFlowTheme.of(context).freeport
                    : FlutterFlowTheme.of(context).primary,
                automaticallyImplyLeading: false,
                title: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 15.0, 0.0, 0.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      FlutterFlowIconButton(
                        borderColor: Colors.transparent,
                        borderRadius: 20.0,
                        borderWidth: 1.0,
                        buttonSize: 50.0,
                        icon: Icon(
                          Icons.chevron_left,
                          color:
                              FlutterFlowTheme.of(context).secondaryBackground,
                          size: 35.0,
                        ),
                        onPressed: () async {
                          FFAppState().currentDrop = 1;
                          safeSetState(() {});
                          _model.loaderEndingAPI =
                              await LoaderAPIsGroup.loaderEndingTimeCall.call(
                            loaderID: FFAppState().loaderInfo.loaderID,
                            fkDropSheetID:
                                FFAppState().loaderInfo.fkDropSheetID,
                            fkLoaderID: FFAppState().loaderInfo.fkLoaderID,
                            department: FFAppState().loaderInfo.department,
                            loaderName: FFAppState().loaderInfo.loaderName,
                            startedAt: FFAppState().loaderInfo.startedAt,
                            endedAt: getCurrentTimestamp.toString(),
                            db: FFAppState().location,
                          );

                          context.safePop();

                          safeSetState(() {});
                        },
                      ),
                      Text(
                        'Loading ${FFAppState().category?.name} ${FFAppState().Loader} ${FFAppState().DropArea.dropArea}',
                        style: FlutterFlowTheme.of(context)
                            .headlineMedium
                            .override(
                              font: GoogleFonts.roboto(
                                fontWeight: FlutterFlowTheme.of(context)
                                    .headlineMedium
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .headlineMedium
                                    .fontStyle,
                              ),
                              color: Colors.white,
                              fontSize: 28.0,
                              letterSpacing: 0.0,
                              fontWeight: FlutterFlowTheme.of(context)
                                  .headlineMedium
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .headlineMedium
                                  .fontStyle,
                            ),
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Text(
                            FFAppState().driverName,
                            style: FlutterFlowTheme.of(context)
                                .headlineMedium
                                .override(
                                  font: GoogleFonts.roboto(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .headlineMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .headlineMedium
                                        .fontStyle,
                                  ),
                                  color: Colors.white,
                                  fontSize: 28.0,
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontStyle,
                                ),
                          ),
                          Text(
                            '-',
                            style: FlutterFlowTheme.of(context)
                                .headlineMedium
                                .override(
                                  font: GoogleFonts.roboto(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .headlineMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .headlineMedium
                                        .fontStyle,
                                  ),
                                  color: Colors.white,
                                  fontSize: 28.0,
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontStyle,
                                ),
                          ),
                          Text(
                            '${FFAppState().loadWeight.toString()} lbs',
                            style: FlutterFlowTheme.of(context)
                                .headlineMedium
                                .override(
                                  font: GoogleFonts.roboto(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .headlineMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .headlineMedium
                                        .fontStyle,
                                  ),
                                  color: Colors.white,
                                  fontSize: 28.0,
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontStyle,
                                ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                20.0, 0.0, 0.0, 0.0),
                            child: InkWell(
                              splashColor: Colors.transparent,
                              focusColor: Colors.transparent,
                              hoverColor: Colors.transparent,
                              highlightColor: Colors.transparent,
                              onTap: () async {
                                // refresh Loading
                                safeSetState(
                                    () => _model.apiRequestCompleter3 = null);
                                await _model.waitForApiRequestCompleted3();
                                // refresh MainContainer
                                safeSetState(
                                    () => _model.apiRequestCompleter1 = null);
                                await _model.waitForApiRequestCompleted1();
                                // refresh loadLabelsUnionListView
                                safeSetState(
                                    () => _model.apiRequestCompleter2 = null);
                                await _model.waitForApiRequestCompleted2();
                                safeSetState(() {});
                              },
                              child: Icon(
                                Icons.refresh_sharp,
                                color: FlutterFlowTheme.of(context)
                                    .secondaryBackground,
                                size: 24.0,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ].divide(SizedBox(width: 30.0)),
                  ),
                ),
                actions: [],
                centerTitle: false,
                elevation: 2.0,
              ),
            ),
            body: SafeArea(
              top: true,
              child: Visibility(
                visible: _model.showPage,
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(50.0, 0.0, 50.0, 0.0),
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Text(
                            valueOrDefault<String>(
                              ((loadingLoadViewDetailSequenceAllResponse
                                              .jsonBody
                                              .toList()
                                              .map<LoadViewDetailSequenceAllStruct?>(
                                                  LoadViewDetailSequenceAllStruct
                                                      .maybeFromMap)
                                              .toList()
                                          as Iterable<
                                              LoadViewDetailSequenceAllStruct?>)
                                      .withoutNulls
                                      .elementAtOrNull(
                                          FFAppState().currentDrop - 1))
                                  ?.totalCount,
                              'NA',
                            ),
                            style: FlutterFlowTheme.of(context)
                                .displayMedium
                                .override(
                                  font: GoogleFonts.roboto(
                                    fontWeight: FontWeight.bold,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .displayMedium
                                        .fontStyle,
                                  ),
                                  fontSize: 48.0,
                                  letterSpacing: 0.0,
                                  fontWeight: FontWeight.bold,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .displayMedium
                                      .fontStyle,
                                ),
                          ),
                          Expanded(
                            flex: 2,
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  8.0, 0.0, 8.0, 0.0),
                              child: TextFormField(
                                controller: _model.scanTextTextController,
                                focusNode: _model.scanTextFocusNode,
                                onFieldSubmitted: (_) async {
                                  var _shouldSetState = false;
                                  // Set scanText state to textinput
                                  FFAppState().scannedText =
                                      _model.scanTextTextController.text;
                                  safeSetState(() {});
                                  safeSetState(() {
                                    _model.scanTextTextController?.clear();
                                  });
                                  await actions.changeFocus(
                                    context,
                                  );
                                  // start scanning process....
                                  _model.scanLabel =
                                      await _model.scanLabelAction04(context);
                                  _shouldSetState = true;
                                  if (_model.scanLabel!) {
                                    await Future.wait([
                                      Future(() async {
                                        // refresh main view
                                        safeSetState(() =>
                                            _model.apiRequestCompleter3 = null);
                                      }),
                                      Future(() async {
                                        // refresh label details
                                        safeSetState(() =>
                                            _model.apiRequestCompleter2 = null);
                                      }),
                                      Future(() async {
                                        // refresh department status
                                        safeSetState(() =>
                                            _model.apiRequestCompleter1 = null);
                                        await _model
                                            .waitForApiRequestCompleted1();
                                      }),
                                    ]);
                                    // refresh load union (subform)
                                    await _model
                                        .getLoadViewUnionAction02(context);
                                    // check if category is done scanning
                                    _model.apiNeedPIck =
                                        await LoadViewDetailsSumNeedPickCall
                                            .call(
                                      dropSheetID: widget.dropSheetID,
                                      locationID: widget.locationID,
                                      db: FFAppState().location,
                                    );

                                    _shouldSetState = true;
                                    if ((_model.apiNeedPIck?.succeeded ??
                                        true)) {
                                      if (LoadViewDetailsSumNeedPickCall
                                              .needPick(
                                            (_model.apiNeedPIck?.jsonBody ??
                                                ''),
                                          ) ==
                                          0) {
                                        // alert user he's finished
                                        await showDialog(
                                          context: context,
                                          builder: (alertDialogContext) {
                                            return AlertDialog(
                                              title: Text('Finished'),
                                              content: Text(
                                                  'All labels for ${FFAppState().category?.name} are scanned. Navigating back.'),
                                              actions: [
                                                TextButton(
                                                  onPressed: () =>
                                                      Navigator.pop(
                                                          alertDialogContext),
                                                  child: Text('Ok'),
                                                ),
                                              ],
                                            );
                                          },
                                        );
                                        // go back to select category page
                                        context.safePop();
                                        if (_shouldSetState)
                                          safeSetState(() {});
                                        return;
                                      } else {
                                        if ((_model.loadViewDetail?.needPick ==
                                                0) &&
                                            (FFAppState().currentDrop > 1)) {
                                          // go to next record
                                          await _model.recordNavigationAction(
                                            context,
                                            currentDrop: -1,
                                          );
                                          safeSetState(() {});
                                        } else {
                                          if (_shouldSetState)
                                            safeSetState(() {});
                                          return;
                                        }

                                        if (_shouldSetState)
                                          safeSetState(() {});
                                        return;
                                      }
                                    } else {
                                      await action_blocks.a03ErrorMessage(
                                        context,
                                        status:
                                            (_model.apiNeedPIck?.statusCode ??
                                                200),
                                        message:
                                            (_model.apiNeedPIck?.bodyText ??
                                                ''),
                                        routine:
                                            'Getting loadview details that need pick',
                                      );
                                      if (_shouldSetState) safeSetState(() {});
                                      return;
                                    }
                                  } else {
                                    if (_shouldSetState) safeSetState(() {});
                                    return;
                                  }

                                  if (_shouldSetState) safeSetState(() {});
                                },
                                autofocus: true,
                                textInputAction: TextInputAction.next,
                                obscureText: false,
                                decoration: InputDecoration(
                                  labelStyle: FlutterFlowTheme.of(context)
                                      .labelMedium
                                      .override(
                                        font: GoogleFonts.roboto(
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontStyle,
                                        ),
                                        fontSize: 24.0,
                                        letterSpacing: 0.0,
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontStyle,
                                      ),
                                  hintText: FFAppState().DropArea.hasDropArea()
                                      ? 'Scan Barcode'
                                      : 'Scan Location',
                                  hintStyle: FlutterFlowTheme.of(context)
                                      .labelMedium
                                      .override(
                                        font: GoogleFonts.roboto(
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontStyle,
                                        ),
                                        fontSize: 20.0,
                                        letterSpacing: 0.0,
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontStyle,
                                      ),
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                      color: FlutterFlowTheme.of(context)
                                          .alternate,
                                      width: 2.0,
                                    ),
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                      color:
                                          FlutterFlowTheme.of(context).primary,
                                      width: 2.0,
                                    ),
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  errorBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                      color: FlutterFlowTheme.of(context).error,
                                      width: 2.0,
                                    ),
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  focusedErrorBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                      color: FlutterFlowTheme.of(context).error,
                                      width: 2.0,
                                    ),
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  filled: true,
                                  fillColor: FlutterFlowTheme.of(context).info,
                                ),
                                style: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .override(
                                      font: GoogleFonts.roboto(
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                      fontSize: 26.0,
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                                validator: _model
                                    .scanTextTextControllerValidator
                                    .asValidator(context),
                              ),
                            ),
                          ),
                          Container(
                            width: 30.0,
                            decoration: BoxDecoration(),
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  8.0, 0.0, 8.0, 0.0),
                              child: Container(
                                width: MediaQuery.sizeOf(context).width * 0.03,
                                child: TextFormField(
                                  controller:
                                      _model.fakeTextFieldTextController,
                                  focusNode: _model.fakeTextFieldFocusNode,
                                  autofocus: true,
                                  obscureText: false,
                                  decoration: InputDecoration(
                                    labelStyle: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .override(
                                          font: GoogleFonts.roboto(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontStyle,
                                        ),
                                    hintStyle: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .override(
                                          font: GoogleFonts.roboto(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontStyle,
                                        ),
                                    enabledBorder: InputBorder.none,
                                    focusedBorder: InputBorder.none,
                                    errorBorder: InputBorder.none,
                                    focusedErrorBorder: InputBorder.none,
                                  ),
                                  style: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .override(
                                        font: GoogleFonts.roboto(
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontStyle,
                                        ),
                                        letterSpacing: 0.0,
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                  validator: _model
                                      .fakeTextFieldTextControllerValidator
                                      .asValidator(context),
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            flex: 2,
                            child: FutureBuilder<ApiCallResponse>(
                              future: (_model.apiRequestCompleter1 ??=
                                      Completer<ApiCallResponse>()
                                        ..complete(
                                            GetDepartmentStatusOnDropCall.call(
                                          custDropSheetID: ((loadingLoadViewDetailSequenceAllResponse
                                                          .jsonBody
                                                          .toList()
                                                          .map<LoadViewDetailSequenceAllStruct?>(
                                                              LoadViewDetailSequenceAllStruct
                                                                  .maybeFromMap)
                                                          .toList()
                                                      as Iterable<
                                                          LoadViewDetailSequenceAllStruct?>)
                                                  .withoutNulls
                                                  .elementAtOrNull(
                                                      FFAppState().currentDrop -
                                                          1))
                                              ?.dropSheetCustID,
                                          db: FFAppState().location,
                                        )))
                                  .future,
                              builder: (context, snapshot) {
                                // Customize what your widget looks like when it's loading.
                                if (!snapshot.hasData) {
                                  return Center(
                                    child: SizedBox(
                                      width: 50.0,
                                      height: 50.0,
                                      child: SpinKitChasingDots(
                                        color: FlutterFlowTheme.of(context)
                                            .primary,
                                        size: 50.0,
                                      ),
                                    ),
                                  );
                                }
                                final mainContainerGetDepartmentStatusOnDropResponse =
                                    snapshot.data!;

                                return Container(
                                  height: 90.0,
                                  constraints: BoxConstraints(
                                    maxWidth:
                                        MediaQuery.sizeOf(context).width * 0.9,
                                  ),
                                  decoration: BoxDecoration(
                                    color: FlutterFlowTheme.of(context)
                                        .secondaryBackground,
                                    boxShadow: [
                                      BoxShadow(
                                        blurRadius: 4.0,
                                        color: Color(0x33000000),
                                        offset: Offset(
                                          0.0,
                                          2.0,
                                        ),
                                      )
                                    ],
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  child: Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        20.0, 0.0, 20.0, 0.0),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.max,
                                      children: [
                                        Padding(
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 5.0, 0.0, 0.0),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.max,
                                            mainAxisAlignment:
                                                MainAxisAlignment.start,
                                            children: [
                                              Expanded(
                                                flex: 2,
                                                child: Text(
                                                  'Slit',
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                      ),
                                                ),
                                              ),
                                              Expanded(
                                                flex: 2,
                                                child: Text(
                                                  'Trim',
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                      ),
                                                ),
                                              ),
                                              Expanded(
                                                flex: 2,
                                                child: Text(
                                                  'Wrap',
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                      ),
                                                ),
                                              ),
                                              Expanded(
                                                flex: 2,
                                                child: Text(
                                                  'Roll',
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                      ),
                                                ),
                                              ),
                                              Expanded(
                                                flex: 2,
                                                child: Text(
                                                  'Parts',
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                      ),
                                                ),
                                              ),
                                              Expanded(
                                                flex: 2,
                                                child: Text(
                                                  'Soffit',
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                      ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Row(
                                          mainAxisSize: MainAxisSize.max,
                                          mainAxisAlignment:
                                              MainAxisAlignment.start,
                                          children: [
                                            Expanded(
                                              flex: 2,
                                              child: Container(
                                                height: 40.0,
                                                decoration: BoxDecoration(
                                                  color: valueOrDefault<Color>(
                                                    (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadSlit ==
                                                                'DONE') ||
                                                            (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadSlit ==
                                                                'NA')
                                                        ? Color(0xFF0AC247)
                                                        : Color(0xFFF60101),
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
                                                  ),
                                                  borderRadius:
                                                      BorderRadius.only(
                                                    bottomLeft:
                                                        Radius.circular(8.0),
                                                    bottomRight:
                                                        Radius.circular(0.0),
                                                    topLeft:
                                                        Radius.circular(8.0),
                                                    topRight:
                                                        Radius.circular(0.0),
                                                  ),
                                                ),
                                                alignment: AlignmentDirectional(
                                                    0.0, 0.0),
                                                child: Text(
                                                  valueOrDefault<String>(
                                                    DepartmentStatusOnDropStruct
                                                            .maybeFromMap(
                                                                mainContainerGetDepartmentStatusOnDropResponse
                                                                    .jsonBody)
                                                        ?.statusOnLoadSlit,
                                                    'ND',
                                                  ),
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                        lineHeight: 1.0,
                                                      ),
                                                ),
                                              ),
                                            ),
                                            Expanded(
                                              flex: 2,
                                              child: Container(
                                                height: 40.0,
                                                decoration: BoxDecoration(
                                                  color: valueOrDefault<Color>(
                                                    (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadTrim ==
                                                                'DONE') ||
                                                            (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadTrim ==
                                                                'NA')
                                                        ? Color(0xFF0AC247)
                                                        : Color(0xFFF60101),
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
                                                  ),
                                                ),
                                                alignment: AlignmentDirectional(
                                                    0.0, 0.0),
                                                child: Text(
                                                  valueOrDefault<String>(
                                                    DepartmentStatusOnDropStruct
                                                            .maybeFromMap(
                                                                mainContainerGetDepartmentStatusOnDropResponse
                                                                    .jsonBody)
                                                        ?.statusOnLoadTrim,
                                                    'ND',
                                                  ),
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                        lineHeight: 1.0,
                                                      ),
                                                ),
                                              ),
                                            ),
                                            Expanded(
                                              flex: 2,
                                              child: Container(
                                                height: 40.0,
                                                decoration: BoxDecoration(
                                                  color: valueOrDefault<Color>(
                                                    (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadWrap ==
                                                                'DONE') ||
                                                            (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadWrap ==
                                                                'NA')
                                                        ? Color(0xFF0AC247)
                                                        : Color(0xFFF60101),
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
                                                  ),
                                                ),
                                                alignment: AlignmentDirectional(
                                                    0.0, 0.0),
                                                child: Text(
                                                  valueOrDefault<String>(
                                                    DepartmentStatusOnDropStruct
                                                            .maybeFromMap(
                                                                mainContainerGetDepartmentStatusOnDropResponse
                                                                    .jsonBody)
                                                        ?.statusOnLoadWrap,
                                                    'ND',
                                                  ),
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                        lineHeight: 1.0,
                                                      ),
                                                ),
                                              ),
                                            ),
                                            Expanded(
                                              flex: 2,
                                              child: Container(
                                                height: 40.0,
                                                decoration: BoxDecoration(
                                                  color: valueOrDefault<Color>(
                                                    (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadRoll ==
                                                                'DONE') ||
                                                            (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadRoll ==
                                                                'NA')
                                                        ? Color(0xFF0AC247)
                                                        : Color(0xFFF60101),
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
                                                  ),
                                                ),
                                                alignment: AlignmentDirectional(
                                                    0.0, 0.0),
                                                child: Text(
                                                  valueOrDefault<String>(
                                                    DepartmentStatusOnDropStruct
                                                            .maybeFromMap(
                                                                mainContainerGetDepartmentStatusOnDropResponse
                                                                    .jsonBody)
                                                        ?.statusOnLoadRoll,
                                                    'ND',
                                                  ),
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                        lineHeight: 1.0,
                                                      ),
                                                ),
                                              ),
                                            ),
                                            Expanded(
                                              flex: 2,
                                              child: Container(
                                                height: 40.0,
                                                decoration: BoxDecoration(
                                                  color: valueOrDefault<Color>(
                                                    (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadPart ==
                                                                'DONE') ||
                                                            (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadPart ==
                                                                'NA')
                                                        ? Color(0xFF0AC247)
                                                        : Color(0xFFF60101),
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
                                                  ),
                                                ),
                                                alignment: AlignmentDirectional(
                                                    0.0, 0.0),
                                                child: Text(
                                                  valueOrDefault<String>(
                                                    DepartmentStatusOnDropStruct
                                                            .maybeFromMap(
                                                                mainContainerGetDepartmentStatusOnDropResponse
                                                                    .jsonBody)
                                                        ?.statusOnLoadPart,
                                                    'ND',
                                                  ),
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                        lineHeight: 1.0,
                                                      ),
                                                ),
                                              ),
                                            ),
                                            Expanded(
                                              flex: 2,
                                              child: Container(
                                                height: 40.0,
                                                decoration: BoxDecoration(
                                                  color: valueOrDefault<Color>(
                                                    (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadSoffit ==
                                                                'DONE') ||
                                                            (DepartmentStatusOnDropStruct.maybeFromMap(
                                                                        mainContainerGetDepartmentStatusOnDropResponse
                                                                            .jsonBody)
                                                                    ?.statusOnLoadSoffit ==
                                                                'NA')
                                                        ? Color(0xFF0AC247)
                                                        : Color(0xFFF60101),
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
                                                  ),
                                                  borderRadius:
                                                      BorderRadius.only(
                                                    bottomLeft:
                                                        Radius.circular(0.0),
                                                    bottomRight:
                                                        Radius.circular(8.0),
                                                    topLeft:
                                                        Radius.circular(0.0),
                                                    topRight:
                                                        Radius.circular(8.0),
                                                  ),
                                                ),
                                                alignment: AlignmentDirectional(
                                                    0.0, 0.0),
                                                child: Text(
                                                  valueOrDefault<String>(
                                                    DepartmentStatusOnDropStruct
                                                            .maybeFromMap(
                                                                mainContainerGetDepartmentStatusOnDropResponse
                                                                    .jsonBody)
                                                        ?.statusOnLoadSoffit,
                                                    'ND',
                                                  ),
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .titleLarge
                                                      .override(
                                                        font:
                                                            GoogleFonts.roboto(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .titleLarge
                                                                  .fontStyle,
                                                        ),
                                                        fontSize: 18.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleLarge
                                                                .fontStyle,
                                                        lineHeight: 1.0,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ]
                                          .divide(SizedBox(height: 10.0))
                                          .addToEnd(SizedBox(height: 10.0)),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ].divide(SizedBox(width: 20.0)),
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          FFAppState().loadNumber,
                          style: FlutterFlowTheme.of(context)
                              .headlineLarge
                              .override(
                                font: GoogleFonts.roboto(
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .headlineLarge
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .headlineLarge
                                      .fontStyle,
                                ),
                                fontSize: 28.0,
                                letterSpacing: 0.0,
                                fontWeight: FlutterFlowTheme.of(context)
                                    .headlineLarge
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .headlineLarge
                                    .fontStyle,
                              ),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          valueOrDefault<String>(
                            ((loadingLoadViewDetailSequenceAllResponse.jsonBody
                                            .toList()
                                            .map<LoadViewDetailSequenceAllStruct?>(
                                                LoadViewDetailSequenceAllStruct
                                                    .maybeFromMap)
                                            .toList()
                                        as Iterable<
                                            LoadViewDetailSequenceAllStruct?>)
                                    .withoutNulls
                                    .elementAtOrNull(
                                        FFAppState().currentDrop - 1))
                                ?.customerName,
                            'NA',
                          ),
                          style: FlutterFlowTheme.of(context)
                              .headlineLarge
                              .override(
                                font: GoogleFonts.roboto(
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .headlineLarge
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .headlineLarge
                                      .fontStyle,
                                ),
                                fontSize: 28.0,
                                letterSpacing: 0.0,
                                fontWeight: FlutterFlowTheme.of(context)
                                    .headlineLarge
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .headlineLarge
                                    .fontStyle,
                              ),
                        ),
                      ].divide(SizedBox(width: 30.0)),
                    ),
                    Expanded(
                      child: Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(
                            60.0, 0.0, 60.0, 0.0),
                        child: FutureBuilder<ApiCallResponse>(
                          future: (_model.apiRequestCompleter2 ??=
                                  Completer<ApiCallResponse>()
                                    ..complete(LoadLabelsUnionViewCall.call(
                                      loadNumber: FFAppState().loadNumber,
                                      dSSequence: FFAppState().currentDrop,
                                      locationID: widget.locationID,
                                      db: FFAppState().location,
                                    )))
                              .future,
                          builder: (context, snapshot) {
                            // Customize what your widget looks like when it's loading.
                            if (!snapshot.hasData) {
                              return Center(
                                child: SizedBox(
                                  width: 50.0,
                                  height: 50.0,
                                  child: SpinKitChasingDots(
                                    color: FlutterFlowTheme.of(context).primary,
                                    size: 50.0,
                                  ),
                                ),
                              );
                            }
                            final loadLabelsUnionListViewLoadLabelsUnionViewResponse =
                                snapshot.data!;

                            return Builder(
                              builder: (context) {
                                final dropLabelsDetails =
                                    (loadLabelsUnionListViewLoadLabelsUnionViewResponse
                                                    .jsonBody
                                                    .toList()
                                                    .map<LoadViewUnionStruct?>(
                                                        LoadViewUnionStruct
                                                            .maybeFromMap)
                                                    .toList()
                                                as Iterable<
                                                    LoadViewUnionStruct?>)
                                            .withoutNulls
                                            .toList() ??
                                        [];

                                return GridView.builder(
                                  padding: EdgeInsets.zero,
                                  gridDelegate:
                                      SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 3,
                                    crossAxisSpacing: 10.0,
                                    mainAxisSpacing: 10.0,
                                    childAspectRatio: 6.0,
                                  ),
                                  scrollDirection: Axis.vertical,
                                  itemCount: dropLabelsDetails.length,
                                  itemBuilder:
                                      (context, dropLabelsDetailsIndex) {
                                    final dropLabelsDetailsItem =
                                        dropLabelsDetails[
                                            dropLabelsDetailsIndex];
                                    return Container(
                                      width: 100.0,
                                      height: 0.0,
                                      decoration: BoxDecoration(
                                        color:
                                            FFAppState().location == 'Freeport'
                                                ? FlutterFlowTheme.of(context)
                                                    .freeport
                                                : FlutterFlowTheme.of(context)
                                                    .primary,
                                        boxShadow: [
                                          BoxShadow(
                                            blurRadius: 2.0,
                                            color: Color(0x33000000),
                                            offset: Offset(
                                              0.0,
                                              1.0,
                                            ),
                                          )
                                        ],
                                        borderRadius:
                                            BorderRadius.circular(8.0),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.max,
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Expanded(
                                            child: Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(8.0, 0.0, 8.0, 0.0),
                                              child: AutoSizeText(
                                                valueOrDefault<String>(
                                                  dropLabelsDetailsItem
                                                      .firstOfPartListID,
                                                  'NA',
                                                ).maybeHandleOverflow(
                                                  maxChars: 45,
                                                  replacement: '…',
                                                ),
                                                minFontSize: 14.0,
                                                style: FlutterFlowTheme.of(
                                                        context)
                                                    .titleMedium
                                                    .override(
                                                      font: GoogleFonts.roboto(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .titleMedium
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .info,
                                                      fontSize: 22.0,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .titleMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .titleMedium
                                                              .fontStyle,
                                                    ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                );
                              },
                            );
                          },
                        ),
                      ),
                    ),
                    Container(
                      height: 150.0,
                      decoration: BoxDecoration(),
                      child: Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(
                            20.0, 0.0, 20.0, 50.0),
                        child: Row(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            FFButtonWidget(
                              onPressed: () async {
                                if (FFAppState().Loader == '') {
                                  // show loaders
                                  await showModalBottomSheet(
                                    isScrollControlled: true,
                                    backgroundColor: Colors.transparent,
                                    enableDrag: false,
                                    context: context,
                                    builder: (context) {
                                      return GestureDetector(
                                        onTap: () {
                                          FocusScope.of(context).unfocus();
                                          FocusManager.instance.primaryFocus
                                              ?.unfocus();
                                        },
                                        child: Padding(
                                          padding:
                                              MediaQuery.viewInsetsOf(context),
                                          child: LoadersWidget(),
                                        ),
                                      );
                                    },
                                  ).then((value) => safeSetState(() {}));
                                }
                                // get order status
                                await action_blocks.getOrderStatus(context);
                                // go to move

                                context.pushNamed(
                                  MoveOrdersWidget.routeName,
                                  queryParameters: {
                                    'dropList': serializeParam(
                                      LoadViewAllStruct(),
                                      ParamType.DataStruct,
                                    ),
                                  }.withoutNulls,
                                );
                              },
                              text: 'DS',
                              icon: FaIcon(
                                FontAwesomeIcons.listAlt,
                                size: 24.0,
                              ),
                              options: FFButtonOptions(
                                height: 100.0,
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    20.0, 0.0, 20.0, 0.0),
                                iconPadding: EdgeInsets.all(12.0),
                                color: FFAppState().location == 'Freeport'
                                    ? FlutterFlowTheme.of(context).freeport
                                    : FlutterFlowTheme.of(context).primary,
                                textStyle: FlutterFlowTheme.of(context)
                                    .titleSmall
                                    .override(
                                      font: GoogleFonts.roboto(
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .titleSmall
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .titleSmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      fontSize: 32.0,
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .titleSmall
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .titleSmall
                                          .fontStyle,
                                    ),
                                elevation: 3.0,
                                borderSide: BorderSide(
                                  color: Colors.transparent,
                                  width: 1.0,
                                ),
                                borderRadius: BorderRadius.circular(10.0),
                              ),
                            ),
                            Container(
                              width: 150.0,
                              height: 150.0,
                              decoration: BoxDecoration(
                                color: FFAppState().currentDrop !=
                                        FFAppState().lastRecord
                                    ? FlutterFlowTheme.of(context).primary
                                    : FlutterFlowTheme.of(context)
                                        .primaryBackground,
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                              child: Visibility(
                                visible: FFAppState().currentDrop !=
                                    FFAppState().lastRecord,
                                child: FlutterFlowIconButton(
                                  borderRadius: 20.0,
                                  borderWidth: 1.0,
                                  buttonSize: 80.0,
                                  fillColor: FFAppState().location == 'Freeport'
                                      ? FlutterFlowTheme.of(context).freeport
                                      : FlutterFlowTheme.of(context).primary,
                                  icon: Icon(
                                    Icons.arrow_back_ios,
                                    color: FlutterFlowTheme.of(context).info,
                                    size: 46.0,
                                  ),
                                  onPressed: () async {
                                    // goto previous record
                                    await _model.recordNavigationAction(
                                      context,
                                      currentDrop: 1,
                                    );
                                    safeSetState(() {});
                                    await Future.wait([
                                      Future(() async {
                                        // refresh label details
                                        safeSetState(() =>
                                            _model.apiRequestCompleter2 = null);
                                      }),
                                      Future(() async {
                                        // refresh departments
                                        safeSetState(() =>
                                            _model.apiRequestCompleter1 = null);
                                      }),
                                    ]);
                                  },
                                ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 20.0, 0.0),
                              child: Text(
                                'Labels ${valueOrDefault<String>(
                                  ((loadingLoadViewDetailSequenceAllResponse
                                                  .jsonBody
                                                  .toList()
                                                  .map<LoadViewDetailSequenceAllStruct?>(
                                                      LoadViewDetailSequenceAllStruct
                                                          .maybeFromMap)
                                                  .toList()
                                              as Iterable<
                                                  LoadViewDetailSequenceAllStruct?>)
                                          .withoutNulls
                                          .elementAtOrNull(
                                              FFAppState().currentDrop - 1))
                                      ?.labelCount
                                      .toString(),
                                  'NA',
                                )}',
                                style: FlutterFlowTheme.of(context)
                                    .displayMedium
                                    .override(
                                      font: GoogleFonts.roboto(
                                        fontWeight: FontWeight.bold,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .displayMedium
                                            .fontStyle,
                                      ),
                                      fontSize: 48.0,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.bold,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .displayMedium
                                          .fontStyle,
                                    ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 20.0, 0.0),
                              child: Text(
                                'Scanned ${valueOrDefault<String>(
                                  ((loadingLoadViewDetailSequenceAllResponse
                                                  .jsonBody
                                                  .toList()
                                                  .map<LoadViewDetailSequenceAllStruct?>(
                                                      LoadViewDetailSequenceAllStruct
                                                          .maybeFromMap)
                                                  .toList()
                                              as Iterable<
                                                  LoadViewDetailSequenceAllStruct?>)
                                          .withoutNulls
                                          .elementAtOrNull(
                                              FFAppState().currentDrop - 1))
                                      ?.scanned
                                      .toString(),
                                  'NA',
                                )}',
                                style: FlutterFlowTheme.of(context)
                                    .displayMedium
                                    .override(
                                      font: GoogleFonts.roboto(
                                        fontWeight: FontWeight.bold,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .displayMedium
                                            .fontStyle,
                                      ),
                                      fontSize: 48.0,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.bold,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .displayMedium
                                          .fontStyle,
                                    ),
                              ),
                            ),
                            Text(
                              'Left ${valueOrDefault<String>(
                                ((loadingLoadViewDetailSequenceAllResponse
                                                .jsonBody
                                                .toList()
                                                .map<LoadViewDetailSequenceAllStruct?>(
                                                    LoadViewDetailSequenceAllStruct
                                                        .maybeFromMap)
                                                .toList()
                                            as Iterable<
                                                LoadViewDetailSequenceAllStruct?>)
                                        .withoutNulls
                                        .elementAtOrNull(
                                            FFAppState().currentDrop - 1))
                                    ?.needPick
                                    .toString(),
                                'NA',
                              )}',
                              style: FlutterFlowTheme.of(context)
                                  .displayMedium
                                  .override(
                                    font: GoogleFonts.roboto(
                                      fontWeight: FontWeight.bold,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .displayMedium
                                          .fontStyle,
                                    ),
                                    fontSize: 48.0,
                                    letterSpacing: 0.0,
                                    fontWeight: FontWeight.bold,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .displayMedium
                                        .fontStyle,
                                  ),
                            ),
                            Container(
                              width: 150.0,
                              height: 150.0,
                              decoration: BoxDecoration(
                                color: FFAppState().currentDrop !=
                                        FFAppState().firstRecord
                                    ? FlutterFlowTheme.of(context).primary
                                    : FlutterFlowTheme.of(context)
                                        .primaryBackground,
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                              child: Visibility(
                                visible: FFAppState().currentDrop !=
                                    FFAppState().firstRecord,
                                child: FlutterFlowIconButton(
                                  borderColor: Colors.transparent,
                                  borderRadius: 20.0,
                                  borderWidth: 1.0,
                                  buttonSize: 80.0,
                                  fillColor: FFAppState().location == 'Freeport'
                                      ? FlutterFlowTheme.of(context).freeport
                                      : FlutterFlowTheme.of(context).primary,
                                  icon: Icon(
                                    Icons.arrow_forward_ios_rounded,
                                    color: FlutterFlowTheme.of(context).info,
                                    size: 46.0,
                                  ),
                                  onPressed: () async {
                                    // goto next record
                                    await _model.recordNavigationAction(
                                      context,
                                      currentDrop: -1,
                                    );
                                    safeSetState(() {});
                                    // get custdropsheetid
                                    _model.custDropsheetid =
                                        ((loadingLoadViewDetailSequenceAllResponse
                                                        .jsonBody
                                                        .toList()
                                                        .map<LoadViewDetailSequenceAllStruct?>(
                                                            LoadViewDetailSequenceAllStruct
                                                                .maybeFromMap)
                                                        .toList()
                                                    as Iterable<
                                                        LoadViewDetailSequenceAllStruct?>)
                                                .withoutNulls
                                                .elementAtOrNull(
                                                    FFAppState().currentDrop -
                                                        1))
                                            ?.dropSheetCustID;
                                    safeSetState(() {});
                                    await Future.wait([
                                      Future(() async {
                                        // refresh label details
                                        safeSetState(() =>
                                            _model.apiRequestCompleter2 = null);
                                      }),
                                      Future(() async {
                                        // refresh departments
                                        safeSetState(() =>
                                            _model.apiRequestCompleter1 = null);
                                      }),
                                    ]);
                                  },
                                ),
                              ),
                            ),
                            FFButtonWidget(
                              onPressed: () async {
                                await action_blocks.getOrderStatus(context);

                                context.pushNamed(
                                  OrderStatusWidget.routeName,
                                  queryParameters: {
                                    'dropList': serializeParam(
                                      LoadViewAllStruct(),
                                      ParamType.DataStruct,
                                    ),
                                  }.withoutNulls,
                                );
                              },
                              text: 'OS',
                              icon: Icon(
                                Icons.timer,
                                size: 40.0,
                              ),
                              options: FFButtonOptions(
                                height: 80.0,
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    24.0, 0.0, 24.0, 0.0),
                                iconPadding: EdgeInsets.all(12.0),
                                color: FlutterFlowTheme.of(context).primary,
                                textStyle: FlutterFlowTheme.of(context)
                                    .titleSmall
                                    .override(
                                      font: GoogleFonts.roboto(
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .titleSmall
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .titleSmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      fontSize: 32.0,
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .titleSmall
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .titleSmall
                                          .fontStyle,
                                    ),
                                elevation: 3.0,
                                borderSide: BorderSide(
                                  color: Colors.transparent,
                                  width: 1.0,
                                ),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ]
                      .divide(SizedBox(height: 10.0))
                      .addToStart(SizedBox(height: 30.0)),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
