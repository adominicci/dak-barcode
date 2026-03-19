import '/backend/api_requests/api_calls.dart';
import '/backend/schema/enums/enums.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/custom_code/actions/index.dart' as actions;
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'scan_new_location_model.dart';
export 'scan_new_location_model.dart';

class ScanNewLocationWidget extends StatefulWidget {
  const ScanNewLocationWidget({
    super.key,
    required this.moveType,
  });

  final Move? moveType;

  @override
  State<ScanNewLocationWidget> createState() => _ScanNewLocationWidgetState();
}

class _ScanNewLocationWidgetState extends State<ScanNewLocationWidget> {
  late ScanNewLocationModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ScanNewLocationModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.dropAreaAllAPI = await SelectDropAreaCall.call(
        department: FFAppState().department,
        db: FFAppState().location,
      );

      if ((_model.dropAreaAllAPI?.succeeded ?? true)) {
        FFAppState().dropAreaAll = ((_model.dropAreaAllAPI?.jsonBody ?? '')
                .toList()
                .map<DropAreaAllStruct?>(DropAreaAllStruct.maybeFromMap)
                .toList() as Iterable<DropAreaAllStruct?>)
            .withoutNulls
            .toList()
            .cast<DropAreaAllStruct>();
        safeSetState(() {});
      }
    });

    _model.scanLocationTextTextController ??= TextEditingController();
    _model.scanLocationTextFocusNode ??= FocusNode();

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return Align(
      alignment: AlignmentDirectional(0.0, 0.0),
      child: Container(
        width: 900.0,
        height: 700.0,
        decoration: BoxDecoration(
          color: FlutterFlowTheme.of(context).secondaryBackground,
          borderRadius: BorderRadius.circular(12.0),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                FlutterFlowIconButton(
                  borderColor: Colors.transparent,
                  borderRadius: 30.0,
                  borderWidth: 2.0,
                  buttonSize: 50.0,
                  icon: Icon(
                    Icons.close_rounded,
                    color: FlutterFlowTheme.of(context).secondaryText,
                    size: 30.0,
                  ),
                  onPressed: () async {
                    Navigator.pop(context);
                  },
                ),
              ],
            ),
            Padding(
              padding: EdgeInsetsDirectional.fromSTEB(10.0, 10.0, 10.0, 0.0),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Expanded(
                    flex: 3,
                    child: TextFormField(
                      controller: _model.scanLocationTextTextController,
                      focusNode: _model.scanLocationTextFocusNode,
                      onFieldSubmitted: (_) async {
                        // Set scanText state to textinput
                        FFAppState().scannedText =
                            _model.scanLocationTextTextController.text;
                        safeSetState(() {});
                        // reset field
                        safeSetState(() {
                          _model.scanLocationTextTextController?.clear();
                        });
                        // goto previous textfield which is scantext, tricky
                        // this helps get back to scantext textinput
                        await actions.changeFocus(
                          context,
                        );
                        await Future.delayed(
                          Duration(
                            milliseconds: 500,
                          ),
                        );
                        if (widget.moveType == Move.Loading) {
                          // call loading location
                          await _model.loadingLocationAction(context);
                        } else {
                          // call staging location
                          await _model.stagingLocationAction(context);
                        }
                      },
                      autofocus: true,
                      textInputAction: TextInputAction.next,
                      obscureText: false,
                      decoration: InputDecoration(
                        labelStyle:
                            FlutterFlowTheme.of(context).labelMedium.override(
                                  font: GoogleFonts.roboto(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
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
                        hintText: 'Scan New Location',
                        hintStyle:
                            FlutterFlowTheme.of(context).labelMedium.override(
                                  font: GoogleFonts.roboto(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontStyle,
                                  ),
                                  fontSize: 18.0,
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
                            color: FlutterFlowTheme.of(context).alternate,
                            width: 2.0,
                          ),
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: FlutterFlowTheme.of(context).primary,
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
                      ),
                      style: FlutterFlowTheme.of(context).bodyMedium.override(
                            font: GoogleFonts.roboto(
                              fontWeight: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .fontStyle,
                            ),
                            fontSize: 24.0,
                            letterSpacing: 0.0,
                            fontWeight: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .fontWeight,
                            fontStyle: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .fontStyle,
                          ),
                      validator: _model.scanLocationTextTextControllerValidator
                          .asValidator(context),
                    ),
                  ),
                ].divide(SizedBox(width: 20.0)),
              ),
            ),
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Builder(
                  builder: (context) {
                    final dropArea = FFAppState().dropAreaAll.toList();

                    return GridView.builder(
                      padding: EdgeInsets.zero,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 6,
                        crossAxisSpacing: 20.0,
                        mainAxisSpacing: 20.0,
                        childAspectRatio: 3.0,
                      ),
                      scrollDirection: Axis.vertical,
                      itemCount: dropArea.length,
                      itemBuilder: (context, dropAreaIndex) {
                        final dropAreaItem = dropArea[dropAreaIndex];
                        return InkWell(
                          splashColor: Colors.transparent,
                          focusColor: Colors.transparent,
                          hoverColor: Colors.transparent,
                          highlightColor: Colors.transparent,
                          onTap: () async {
                            _model.scanLocationTextTextController?.text =
                                dropAreaItem.dropAreaID.toString();

                            // Set scanText state to textinput
                            FFAppState().scannedText =
                                _model.scanLocationTextTextController.text;
                            safeSetState(() {});
                            // reset field
                            safeSetState(() {
                              _model.scanLocationTextTextController?.clear();
                            });
                            // goto previous textfield which is scantext, tricky
                            // this helps get back to scantext textinput
                            await actions.changeFocus(
                              context,
                            );
                            await Future.delayed(
                              Duration(
                                milliseconds: 500,
                              ),
                            );
                            if (widget.moveType == Move.Loading) {
                              // call loading location
                              await _model.loadingLocationAction(context);
                            } else {
                              // call staging location
                              await _model.stagingLocationAction(context);
                            }
                          },
                          child: Container(
                            width: 50.0,
                            height: 50.0,
                            decoration: BoxDecoration(
                              color: FFAppState().location == 'Freeport'
                                  ? FlutterFlowTheme.of(context).freeport
                                  : FlutterFlowTheme.of(context).primary,
                              boxShadow: [
                                BoxShadow(
                                  blurRadius: 4.0,
                                  color: Color(0xFF95989C),
                                  offset: Offset(
                                    3.0,
                                    4.0,
                                  ),
                                )
                              ],
                              borderRadius: BorderRadius.circular(18.0),
                              shape: BoxShape.rectangle,
                            ),
                            alignment: AlignmentDirectional(0.0, 0.0),
                            child: AutoSizeText(
                              dropAreaItem.dropArea,
                              textAlign: TextAlign.center,
                              style: FlutterFlowTheme.of(context)
                                  .titleMedium
                                  .override(
                                    font: GoogleFonts.roboto(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .titleMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .titleMedium
                                          .fontStyle,
                                    ),
                                    fontSize: 18.0,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .fontStyle,
                                  ),
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ),
            if (((_model.parseCharacter == null ||
                        _model.parseCharacter == '') &&
                    (FFAppState().location == 'Freeport')) &&
                responsiveVisibility(
                  context: context,
                  phone: false,
                  tablet: false,
                  tabletLandscape: false,
                  desktop: false,
                ))
              Expanded(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Builder(
                    builder: (context) {
                      final dropArea = FFAppState()
                          .dropAreaAll
                          .map((e) => e.firstCharacter)
                          .toList()
                          .unique((e) => e)
                          .toList();

                      return GridView.builder(
                        padding: EdgeInsets.zero,
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 6,
                          crossAxisSpacing: 20.0,
                          mainAxisSpacing: 20.0,
                          childAspectRatio: 3.0,
                        ),
                        scrollDirection: Axis.vertical,
                        itemCount: dropArea.length,
                        itemBuilder: (context, dropAreaIndex) {
                          final dropAreaItem = dropArea[dropAreaIndex];
                          return InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              _model.parseCharacter = dropAreaItem;
                              safeSetState(() {});
                            },
                            child: Container(
                              width: 50.0,
                              height: 50.0,
                              decoration: BoxDecoration(
                                color: FFAppState().location == 'Freeport'
                                    ? FlutterFlowTheme.of(context).freeport
                                    : FlutterFlowTheme.of(context).primary,
                                boxShadow: [
                                  BoxShadow(
                                    blurRadius: 4.0,
                                    color: Color(0xFF95989C),
                                    offset: Offset(
                                      3.0,
                                      4.0,
                                    ),
                                  )
                                ],
                                borderRadius: BorderRadius.circular(18.0),
                                shape: BoxShape.rectangle,
                              ),
                              alignment: AlignmentDirectional(0.0, 0.0),
                              child: AutoSizeText(
                                dropAreaItem,
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .titleMedium
                                    .override(
                                      font: GoogleFonts.roboto(
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .titleMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .titleMedium
                                            .fontStyle,
                                      ),
                                      fontSize: 18.0,
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .titleMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .titleMedium
                                          .fontStyle,
                                    ),
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
              ),
            if (((_model.parseCharacter != null &&
                        _model.parseCharacter != '') &&
                    (FFAppState().location == 'Freeport')) &&
                responsiveVisibility(
                  context: context,
                  phone: false,
                  tablet: false,
                  tabletLandscape: false,
                  desktop: false,
                ))
              Expanded(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Builder(
                    builder: (context) {
                      final dropArea = FFAppState()
                          .dropAreaAll
                          .where(
                              (e) => e.firstCharacter == _model.parseCharacter)
                          .toList();

                      return GridView.builder(
                        padding: EdgeInsets.zero,
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 6,
                          crossAxisSpacing: 20.0,
                          mainAxisSpacing: 20.0,
                          childAspectRatio: 3.0,
                        ),
                        scrollDirection: Axis.vertical,
                        itemCount: dropArea.length,
                        itemBuilder: (context, dropAreaIndex) {
                          final dropAreaItem = dropArea[dropAreaIndex];
                          return InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              safeSetState(() {
                                _model.scanLocationTextTextController?.text =
                                    dropAreaItem.dropAreaID.toString();
                              });
                              // Set scanText state to textinput
                              FFAppState().scannedText =
                                  _model.scanLocationTextTextController.text;
                              safeSetState(() {});
                              // reset field
                              safeSetState(() {
                                _model.scanLocationTextTextController?.clear();
                              });
                              // goto previous textfield which is scantext, tricky
                              // this helps get back to scantext textinput
                              await actions.changeFocus(
                                context,
                              );
                              await Future.delayed(
                                Duration(
                                  milliseconds: 500,
                                ),
                              );
                              if (widget.moveType == Move.Loading) {
                                // call loading location
                                await _model.loadingLocationAction(context);
                              } else {
                                // call staging location
                                await _model.stagingLocationAction(context);
                              }
                            },
                            child: Container(
                              width: 50.0,
                              height: 50.0,
                              decoration: BoxDecoration(
                                color: FFAppState().location == 'Freeport'
                                    ? FlutterFlowTheme.of(context).freeport
                                    : FlutterFlowTheme.of(context).primary,
                                boxShadow: [
                                  BoxShadow(
                                    blurRadius: 4.0,
                                    color: Color(0xFF95989C),
                                    offset: Offset(
                                      3.0,
                                      4.0,
                                    ),
                                  )
                                ],
                                borderRadius: BorderRadius.circular(18.0),
                                shape: BoxShape.rectangle,
                              ),
                              alignment: AlignmentDirectional(0.0, 0.0),
                              child: AutoSizeText(
                                dropAreaItem.dropArea,
                                textAlign: TextAlign.center,
                                style: FlutterFlowTheme.of(context)
                                    .titleMedium
                                    .override(
                                      font: GoogleFonts.roboto(
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .titleMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .titleMedium
                                            .fontStyle,
                                      ),
                                      fontSize: 18.0,
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .titleMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .titleMedium
                                          .fontStyle,
                                    ),
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
