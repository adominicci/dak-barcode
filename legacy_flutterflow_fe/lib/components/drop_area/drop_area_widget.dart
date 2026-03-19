import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'drop_area_model.dart';
export 'drop_area_model.dart';

class DropAreaWidget extends StatefulWidget {
  const DropAreaWidget({
    super.key,
    this.getLocation,
  });

  final Future Function()? getLocation;

  @override
  State<DropAreaWidget> createState() => _DropAreaWidgetState();
}

class _DropAreaWidgetState extends State<DropAreaWidget> {
  late DropAreaModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DropAreaModel());

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

    return Container(
      width: double.infinity,
      height: 850.0,
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).info,
        boxShadow: [
          BoxShadow(
            blurRadius: 5.0,
            color: Color(0x3B1D2429),
            offset: Offset(
              0.0,
              -3.0,
            ),
          )
        ],
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(0.0),
          bottomRight: Radius.circular(0.0),
          topLeft: Radius.circular(24.0),
          topRight: Radius.circular(24.0),
        ),
      ),
      child: Padding(
        padding: EdgeInsetsDirectional.fromSTEB(20.0, 5.0, 20.0, 20.0),
        child: Column(
          mainAxisSize: MainAxisSize.max,
          children: [
            Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: FlutterFlowTheme.of(context).secondaryBackground,
                  ),
                  child: Visibility(
                    visible: (_model.firstCharacter == null ||
                            _model.firstCharacter == '') &&
                        (FFAppState().location == 'Freeport'),
                    child: Text(
                      'Drop Area Starts With',
                      style: FlutterFlowTheme.of(context).bodyMedium.override(
                            font: GoogleFonts.roboto(
                              fontWeight: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .fontStyle,
                            ),
                            fontSize: 25.0,
                            letterSpacing: 0.0,
                            fontWeight: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .fontWeight,
                            fontStyle: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .fontStyle,
                          ),
                    ),
                  ),
                ),
                FlutterFlowIconButton(
                  borderColor: Colors.transparent,
                  borderRadius: 8.0,
                  buttonSize: 40.0,
                  icon: Icon(
                    Icons.close_rounded,
                    color: FlutterFlowTheme.of(context).secondaryText,
                    size: 24.0,
                  ),
                  onPressed: () async {
                    Navigator.pop(context);
                  },
                ),
              ],
            ),
            SizedBox(
              width: 200.0,
              child: Divider(
                thickness: 1.0,
                color: FlutterFlowTheme.of(context).alternate,
              ),
            ),
            if (((_model.firstCharacter == null ||
                        _model.firstCharacter == '') &&
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
                  padding: EdgeInsetsDirectional.fromSTEB(20.0, 0.0, 20.0, 0.0),
                  child: Builder(
                    builder: (context) {
                      final dropFirstCharacter = FFAppState()
                          .dropAreaAll
                          .map((e) => e.firstCharacter)
                          .toList()
                          .unique((e) => e)
                          .toList();

                      return GridView.builder(
                        padding: EdgeInsets.zero,
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 6,
                          crossAxisSpacing: 40.0,
                          mainAxisSpacing: 40.0,
                          childAspectRatio: 3.0,
                        ),
                        scrollDirection: Axis.vertical,
                        itemCount: dropFirstCharacter.length,
                        itemBuilder: (context, dropFirstCharacterIndex) {
                          final dropFirstCharacterItem =
                              dropFirstCharacter[dropFirstCharacterIndex];
                          return InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              _model.firstCharacter = dropFirstCharacterItem;
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
                                dropFirstCharacterItem,
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
                                      fontSize: 21.0,
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
            if (((_model.firstCharacter != null &&
                        _model.firstCharacter != '') &&
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
                  padding: EdgeInsetsDirectional.fromSTEB(20.0, 0.0, 20.0, 0.0),
                  child: Builder(
                    builder: (context) {
                      final dropArea = FFAppState()
                          .dropAreaAll
                          .where(
                              (e) => e.firstCharacter == _model.firstCharacter)
                          .toList();

                      return GridView.builder(
                        padding: EdgeInsets.zero,
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 6,
                          crossAxisSpacing: 40.0,
                          mainAxisSpacing: 40.0,
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
                              FFAppState().scannedText =
                                  dropAreaItem.dropAreaID.toString();
                              safeSetState(() {});
                              await widget.getLocation?.call();
                              _model.firstCharacter = null;
                              safeSetState(() {});
                              FFAppState().dropAreaAll = [];
                              safeSetState(() {});
                              Navigator.pop(context);
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
                                      fontSize: 21.0,
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
            Expanded(
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(20.0, 0.0, 20.0, 0.0),
                child: Builder(
                  builder: (context) {
                    final dropArea = FFAppState().dropAreaAll.toList();

                    return GridView.builder(
                      padding: EdgeInsets.zero,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 6,
                        crossAxisSpacing: 40.0,
                        mainAxisSpacing: 40.0,
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
                            FFAppState().scannedText =
                                dropAreaItem.dropAreaID.toString();
                            safeSetState(() {});
                            await widget.getLocation?.call();
                            FFAppState().dropAreaAll = [];
                            safeSetState(() {});
                            Navigator.pop(context);
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
                                    fontSize: 21.0,
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
