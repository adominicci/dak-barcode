import '/auth/firebase_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/enums/enums.dart';
import '/backend/schema/structs/index.dart';
import '/components/loaders/loaders_widget.dart';
import '/components/pack_list_signature/pack_list_signature_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/actions/actions.dart' as action_blocks;
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';
import 'select_category_model.dart';
export 'select_category_model.dart';

/// select the category to then load
class SelectCategoryWidget extends StatefulWidget {
  const SelectCategoryWidget({
    super.key,
    required this.dropSheetID,
    required this.deliveryNumber,
    required this.percentCompleted,
    bool? willcall,
    bool? navigateList,
  })  : this.willcall = willcall ?? false,
        this.navigateList = navigateList ?? true;

  final int? dropSheetID;
  final String? deliveryNumber;
  final double? percentCompleted;
  final bool willcall;
  final bool navigateList;

  static String routeName = 'SelectCategory';
  static String routePath = '/selectCategory';

  @override
  State<SelectCategoryWidget> createState() => _SelectCategoryWidgetState();
}

class _SelectCategoryWidgetState extends State<SelectCategoryWidget> {
  late SelectCategoryModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => SelectCategoryModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.loadersDropsheetAPI =
          await LoaderAPIsGroup.getLoadersDropsheetCall.call(
        fkDropsheetId: widget.dropSheetID,
        jwt: currentJwtToken,
        db: FFAppState().location,
      );

      if ((_model.loadersDropsheetAPI?.succeeded ?? true)) {
        FFAppState().DropsheetLoaders =
            ((_model.loadersDropsheetAPI?.jsonBody ?? '')
                    .toList()
                    .map<DropsheetLoadersStruct?>(
                        DropsheetLoadersStruct.maybeFromMap)
                    .toList() as Iterable<DropsheetLoadersStruct?>)
                .withoutNulls
                .toList()
                .cast<DropsheetLoadersStruct>();
        FFAppState().update(() {});
      }
      safeSetState(() {});
    });

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
                children: [
                  FlutterFlowIconButton(
                    borderColor: Colors.transparent,
                    borderRadius: 20.0,
                    borderWidth: 1.0,
                    buttonSize: 50.0,
                    icon: Icon(
                      Icons.chevron_left,
                      color: FlutterFlowTheme.of(context).secondaryBackground,
                      size: 35.0,
                    ),
                    onPressed: () async {
                      // update dropsheet id again
                      FFAppState().dropSheetID = widget.dropSheetID!;
                      safeSetState(() {});
                      if (FFAppState().navigateDropsheetList == true) {
                        // Navigate to drop list

                        context.pushNamed(DropSheetListWidget.routeName);
                      } else if ((widget.willcall == true) &&
                          (widget.navigateList == true)) {
                        // else go back to drop list
                        context.safePop();
                      } else {
                        // if true then navigate to the home page

                        context.pushNamed(HomePageWidget.routeName);
                      }

                      // reset navigate state to false
                      FFAppState().navigateDropsheetList = false;
                      safeSetState(() {});
                    },
                  ),
                  Text(
                    'Select Category',
                    style: FlutterFlowTheme.of(context).headlineMedium.override(
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
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                FutureBuilder<ApiCallResponse>(
                  future: CheckOnLoadStatusDSAllDepartmentsCall.call(
                    dropsheetID: widget.dropSheetID,
                    db: FFAppState().location,
                  ),
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
                    final mainContainerCheckOnLoadStatusDSAllDepartmentsResponse =
                        snapshot.data!;

                    return Container(
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.sizeOf(context).width * 0.9,
                      ),
                      decoration: BoxDecoration(
                        color: FlutterFlowTheme.of(context).secondaryBackground,
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
                            50.0, 0.0, 50.0, 0.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 10.0, 0.0, 0.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  Expanded(
                                    flex: 2,
                                    child: Text(
                                      'Slit',
                                      textAlign: TextAlign.center,
                                      style: FlutterFlowTheme.of(context)
                                          .titleLarge
                                          .override(
                                            font: GoogleFonts.roboto(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontStyle,
                                            ),
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .titleLarge
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
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
                                      style: FlutterFlowTheme.of(context)
                                          .titleLarge
                                          .override(
                                            font: GoogleFonts.roboto(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontStyle,
                                            ),
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .titleLarge
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
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
                                      style: FlutterFlowTheme.of(context)
                                          .titleLarge
                                          .override(
                                            font: GoogleFonts.roboto(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontStyle,
                                            ),
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .titleLarge
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
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
                                      style: FlutterFlowTheme.of(context)
                                          .titleLarge
                                          .override(
                                            font: GoogleFonts.roboto(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontStyle,
                                            ),
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .titleLarge
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
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
                                      style: FlutterFlowTheme.of(context)
                                          .titleLarge
                                          .override(
                                            font: GoogleFonts.roboto(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontStyle,
                                            ),
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .titleLarge
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
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
                                      style: FlutterFlowTheme.of(context)
                                          .titleLarge
                                          .override(
                                            font: GoogleFonts.roboto(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontStyle,
                                            ),
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .titleLarge
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .titleLarge
                                                    .fontStyle,
                                          ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 10.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  Expanded(
                                    flex: 2,
                                    child: Container(
                                      height: 50.0,
                                      decoration: BoxDecoration(
                                        color: valueOrDefault<Color>(
                                          (CheckOnLoadDepartmentStatusStruct
                                                              .maybeFromMap(
                                                                  mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                      .jsonBody)
                                                          ?.statusOnLoadSlitDS ==
                                                      'DONE') ||
                                                  (CheckOnLoadDepartmentStatusStruct
                                                                  .maybeFromMap(
                                                                      mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                          .jsonBody)
                                                              ?.statusOnLoadSlitDS !=
                                                          null &&
                                                      CheckOnLoadDepartmentStatusStruct
                                                                  .maybeFromMap(
                                                                      mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                          .jsonBody)
                                                              ?.statusOnLoadSlitDS !=
                                                          '')
                                              ? Color(0xFF0AC247)
                                              : Color(0xFFF60101),
                                          FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                        ),
                                        borderRadius: BorderRadius.only(
                                          bottomLeft: Radius.circular(8.0),
                                          bottomRight: Radius.circular(0.0),
                                          topLeft: Radius.circular(8.0),
                                          topRight: Radius.circular(0.0),
                                        ),
                                      ),
                                      alignment: AlignmentDirectional(0.0, 0.0),
                                      child: Text(
                                        CheckOnLoadDepartmentStatusStruct
                                                .maybeFromMap(
                                                    mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                        .jsonBody)!
                                            .statusOnLoadSlitDS,
                                        textAlign: TextAlign.center,
                                        style: FlutterFlowTheme.of(context)
                                            .titleLarge
                                            .override(
                                              font: GoogleFonts.roboto(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
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
                                      height: 50.0,
                                      decoration: BoxDecoration(
                                        color: valueOrDefault<Color>(
                                          (CheckOnLoadDepartmentStatusStruct
                                                              .maybeFromMap(
                                                                  mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                      .jsonBody)
                                                          ?.statusOnLoadTrimDS ==
                                                      'DONE') ||
                                                  (CheckOnLoadDepartmentStatusStruct
                                                              .maybeFromMap(
                                                                  mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                      .jsonBody)
                                                          ?.statusOnLoadTrimDS ==
                                                      'NA')
                                              ? Color(0xFF0AC247)
                                              : Color(0xFFF60101),
                                          FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                        ),
                                      ),
                                      alignment: AlignmentDirectional(0.0, 0.0),
                                      child: Text(
                                        CheckOnLoadDepartmentStatusStruct
                                                .maybeFromMap(
                                                    mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                        .jsonBody)!
                                            .statusOnLoadTrimDS,
                                        textAlign: TextAlign.center,
                                        style: FlutterFlowTheme.of(context)
                                            .titleLarge
                                            .override(
                                              font: GoogleFonts.roboto(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
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
                                      height: 50.0,
                                      decoration: BoxDecoration(
                                        color: valueOrDefault<Color>(
                                          (CheckOnLoadDepartmentStatusStruct
                                                              .maybeFromMap(
                                                                  mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                      .jsonBody)
                                                          ?.statusOnLoadWrapDS ==
                                                      'DONE') ||
                                                  (CheckOnLoadDepartmentStatusStruct
                                                              .maybeFromMap(
                                                                  mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                      .jsonBody)
                                                          ?.statusOnLoadWrapDS ==
                                                      'NA')
                                              ? Color(0xFF0AC247)
                                              : Color(0xFFF60101),
                                          FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                        ),
                                      ),
                                      alignment: AlignmentDirectional(0.0, 0.0),
                                      child: Text(
                                        CheckOnLoadDepartmentStatusStruct
                                                .maybeFromMap(
                                                    mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                        .jsonBody)!
                                            .statusOnLoadWrapDS,
                                        textAlign: TextAlign.center,
                                        style: FlutterFlowTheme.of(context)
                                            .titleLarge
                                            .override(
                                              font: GoogleFonts.roboto(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
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
                                      height: 50.0,
                                      decoration: BoxDecoration(
                                        color: valueOrDefault<Color>(
                                          (CheckOnLoadDepartmentStatusStruct
                                                              .maybeFromMap(
                                                                  mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                      .jsonBody)
                                                          ?.statusOnLoadRollDS ==
                                                      'DONE') ||
                                                  (CheckOnLoadDepartmentStatusStruct
                                                              .maybeFromMap(
                                                                  mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                      .jsonBody)
                                                          ?.statusOnLoadRollDS ==
                                                      'NA')
                                              ? Color(0xFF0AC247)
                                              : Color(0xFFF60101),
                                          FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                        ),
                                      ),
                                      alignment: AlignmentDirectional(0.0, 0.0),
                                      child: Text(
                                        CheckOnLoadDepartmentStatusStruct
                                                .maybeFromMap(
                                                    mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                        .jsonBody)!
                                            .statusOnLoadRollDS,
                                        textAlign: TextAlign.center,
                                        style: FlutterFlowTheme.of(context)
                                            .titleLarge
                                            .override(
                                              font: GoogleFonts.roboto(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
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
                                      height: 50.0,
                                      decoration: BoxDecoration(
                                        color: valueOrDefault<Color>(
                                          (CheckOnLoadDepartmentStatusStruct
                                                                  .maybeFromMap(
                                                                      mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                          .jsonBody)
                                                              ?.statusOnLoadPartDS !=
                                                          null &&
                                                      CheckOnLoadDepartmentStatusStruct
                                                                  .maybeFromMap(
                                                                      mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                          .jsonBody)
                                                              ?.statusOnLoadPartDS !=
                                                          '') ||
                                                  (CheckOnLoadDepartmentStatusStruct
                                                              .maybeFromMap(
                                                                  mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                      .jsonBody)
                                                          ?.statusOnLoadPartDS ==
                                                      'NA')
                                              ? Color(0xFF0AC247)
                                              : Color(0xFFF60101),
                                          FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                        ),
                                      ),
                                      alignment: AlignmentDirectional(0.0, 0.0),
                                      child: Text(
                                        CheckOnLoadDepartmentStatusStruct
                                                .maybeFromMap(
                                                    mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                        .jsonBody)!
                                            .statusOnLoadPartDS,
                                        textAlign: TextAlign.center,
                                        style: FlutterFlowTheme.of(context)
                                            .titleLarge
                                            .override(
                                              font: GoogleFonts.roboto(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
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
                                      height: 50.0,
                                      decoration: BoxDecoration(
                                        color: valueOrDefault<Color>(
                                          (CheckOnLoadDepartmentStatusStruct
                                                                  .maybeFromMap(
                                                                      mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                          .jsonBody)
                                                              ?.statusOnLoadSoffitDS !=
                                                          null &&
                                                      CheckOnLoadDepartmentStatusStruct
                                                                  .maybeFromMap(
                                                                      mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                          .jsonBody)
                                                              ?.statusOnLoadSoffitDS !=
                                                          '') ||
                                                  (CheckOnLoadDepartmentStatusStruct
                                                              .maybeFromMap(
                                                                  mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                                      .jsonBody)
                                                          ?.statusOnLoadSoffitDS ==
                                                      'NA')
                                              ? Color(0xFF0AC247)
                                              : Color(0xFFF60101),
                                          FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                        ),
                                        borderRadius: BorderRadius.only(
                                          bottomLeft: Radius.circular(0.0),
                                          bottomRight: Radius.circular(8.0),
                                          topLeft: Radius.circular(0.0),
                                          topRight: Radius.circular(8.0),
                                        ),
                                      ),
                                      alignment: AlignmentDirectional(0.0, 0.0),
                                      child: Text(
                                        CheckOnLoadDepartmentStatusStruct
                                                .maybeFromMap(
                                                    mainContainerCheckOnLoadStatusDSAllDepartmentsResponse
                                                        .jsonBody)!
                                            .statusOnLoadSoffitDS,
                                        textAlign: TextAlign.center,
                                        style: FlutterFlowTheme.of(context)
                                            .titleLarge
                                            .override(
                                              font: GoogleFonts.roboto(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleLarge
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleLarge
                                                      .fontStyle,
                                              lineHeight: 1.0,
                                            ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ].divide(SizedBox(height: 5.0)),
                        ),
                      ),
                    );
                  },
                ),
                Row(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Text(
                      FFAppState().driverName,
                      style:
                          FlutterFlowTheme.of(context).headlineMedium.override(
                                font: GoogleFonts.roboto(
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontStyle,
                                ),
                                fontSize: 40.0,
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
                      'Delivery #${widget.deliveryNumber}',
                      style:
                          FlutterFlowTheme.of(context).headlineMedium.override(
                                font: GoogleFonts.roboto(
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontStyle,
                                ),
                                fontSize: 40.0,
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
                      style:
                          FlutterFlowTheme.of(context).headlineMedium.override(
                                font: GoogleFonts.roboto(
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .fontStyle,
                                ),
                                fontSize: 40.0,
                                letterSpacing: 0.0,
                                fontWeight: FlutterFlowTheme.of(context)
                                    .headlineMedium
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .headlineMedium
                                    .fontStyle,
                              ),
                    ),
                  ].divide(SizedBox(width: 30.0)),
                ),
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(50.0, 0.0, 50.0, 0.0),
                  child: FutureBuilder<ApiCallResponse>(
                    future: GetDSAllPercentAndCountLabelCall.call(
                      dropSheetID: widget.dropSheetID,
                      db: FFAppState().location,
                    ),
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
                      final departmentColumnGetDSAllPercentAndCountLabelResponse =
                          snapshot.data!;

                      return Column(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          if (GetAllPercentAndLabelCountStruct.maybeFromMap(
                                      departmentColumnGetDSAllPercentAndCountLabelResponse
                                          .jsonBody)!
                                  .wrapHasLabels >
                              0)
                            Row(
                              mainAxisSize: MainAxisSize.max,
                              mainAxisAlignment: MainAxisAlignment.start,
                              children: [
                                FFButtonWidget(
                                  onPressed: () async {
                                    // see if load is complete
                                    await _model
                                        .checkPercentLoadAction02(context);
                                    // set category state
                                    FFAppState().category = Category.Wrap;
                                    safeSetState(() {});
                                    // goto loading and send wrap
                                    await _model.gotoLoading(
                                      context,
                                      locationID: 2,
                                    );
                                    safeSetState(() {});
                                  },
                                  text: 'Wrap',
                                  options: FFButtonOptions(
                                    width: 500.0,
                                    height: 80.0,
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        24.0, 0.0, 24.0, 0.0),
                                    iconPadding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
                                    color: FFAppState().location == 'Freeport'
                                        ? FlutterFlowTheme.of(context).freeport
                                        : FlutterFlowTheme.of(context).primary,
                                    textStyle: FlutterFlowTheme.of(context)
                                        .displayMedium
                                        .override(
                                          font: GoogleFonts.roboto(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
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
                                LinearPercentIndicator(
                                  percent: GetAllPercentAndLabelCountStruct
                                          .maybeFromMap(
                                              departmentColumnGetDSAllPercentAndCountLabelResponse
                                                  .jsonBody)!
                                      .wrapScannedPercent,
                                  width: 400.0,
                                  lineHeight: 80.0,
                                  animation: true,
                                  animateFromLastPercent: true,
                                  progressColor: Color(0xFF0AC247),
                                  backgroundColor:
                                      FlutterFlowTheme.of(context).accent4,
                                  center: Text(
                                    formatNumber(
                                      GetAllPercentAndLabelCountStruct.maybeFromMap(
                                              departmentColumnGetDSAllPercentAndCountLabelResponse
                                                  .jsonBody)!
                                          .wrapScannedPercent,
                                      formatType: FormatType.percent,
                                    ),
                                    style: FlutterFlowTheme.of(context)
                                        .displayMedium
                                        .override(
                                          font: GoogleFonts.roboto(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                  barRadius: Radius.circular(8.0),
                                  padding: EdgeInsets.zero,
                                ),
                              ].divide(SizedBox(width: 50.0)),
                            ),
                          if (GetAllPercentAndLabelCountStruct.maybeFromMap(
                                      departmentColumnGetDSAllPercentAndCountLabelResponse
                                          .jsonBody)!
                                  .partHasLabels >
                              0)
                            Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                FFButtonWidget(
                                  onPressed: () async {
                                    // check percent load
                                    await _model
                                        .checkPercentLoadAction02(context);
                                    // set category state
                                    FFAppState().category = Category.Parts;
                                    safeSetState(() {});
                                    // goto loading and send wrap
                                    await _model.gotoLoading(
                                      context,
                                      locationID: 3,
                                    );
                                    safeSetState(() {});
                                  },
                                  text: 'Parts',
                                  options: FFButtonOptions(
                                    width: 500.0,
                                    height: 80.0,
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        24.0, 0.0, 24.0, 0.0),
                                    iconPadding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
                                    color: FFAppState().location == 'Freeport'
                                        ? FlutterFlowTheme.of(context).freeport
                                        : FlutterFlowTheme.of(context).primary,
                                    textStyle: FlutterFlowTheme.of(context)
                                        .displayMedium
                                        .override(
                                          font: GoogleFonts.roboto(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
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
                                LinearPercentIndicator(
                                  percent: GetAllPercentAndLabelCountStruct
                                          .maybeFromMap(
                                              departmentColumnGetDSAllPercentAndCountLabelResponse
                                                  .jsonBody)!
                                      .partcannedPercent,
                                  width: 400.0,
                                  lineHeight: 80.0,
                                  animation: true,
                                  animateFromLastPercent: true,
                                  progressColor: Color(0xFF0AC247),
                                  backgroundColor:
                                      FlutterFlowTheme.of(context).accent4,
                                  center: Text(
                                    formatNumber(
                                      GetAllPercentAndLabelCountStruct.maybeFromMap(
                                              departmentColumnGetDSAllPercentAndCountLabelResponse
                                                  .jsonBody)!
                                          .partcannedPercent,
                                      formatType: FormatType.percent,
                                    ),
                                    style: FlutterFlowTheme.of(context)
                                        .displayMedium
                                        .override(
                                          font: GoogleFonts.roboto(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                  barRadius: Radius.circular(8.0),
                                  padding: EdgeInsets.zero,
                                ),
                              ].divide(SizedBox(width: 50.0)),
                            ),
                          if (GetAllPercentAndLabelCountStruct.maybeFromMap(
                                      departmentColumnGetDSAllPercentAndCountLabelResponse
                                          .jsonBody)!
                                  .rollHasLabels >
                              0)
                            Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                FFButtonWidget(
                                  onPressed: () async {
                                    // check percent load
                                    await _model
                                        .checkPercentLoadAction02(context);
                                    // set category state
                                    FFAppState().category = Category.Roll;
                                    safeSetState(() {});
                                    // goto loading and send wrap
                                    await _model.gotoLoading(
                                      context,
                                      locationID: 1,
                                    );
                                    safeSetState(() {});
                                  },
                                  text: 'Roll',
                                  options: FFButtonOptions(
                                    width: 500.0,
                                    height: 80.0,
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        24.0, 0.0, 24.0, 0.0),
                                    iconPadding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
                                    color: FFAppState().location == 'Freeport'
                                        ? FlutterFlowTheme.of(context).freeport
                                        : FlutterFlowTheme.of(context).primary,
                                    textStyle: FlutterFlowTheme.of(context)
                                        .displayMedium
                                        .override(
                                          font: GoogleFonts.roboto(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
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
                                LinearPercentIndicator(
                                  percent: GetAllPercentAndLabelCountStruct
                                          .maybeFromMap(
                                              departmentColumnGetDSAllPercentAndCountLabelResponse
                                                  .jsonBody)!
                                      .rollScannedPercent,
                                  width: 400.0,
                                  lineHeight: 80.0,
                                  animation: true,
                                  animateFromLastPercent: true,
                                  progressColor: Color(0xFF0AC247),
                                  backgroundColor:
                                      FlutterFlowTheme.of(context).accent4,
                                  center: Text(
                                    formatNumber(
                                      GetAllPercentAndLabelCountStruct.maybeFromMap(
                                              departmentColumnGetDSAllPercentAndCountLabelResponse
                                                  .jsonBody)!
                                          .rollScannedPercent,
                                      formatType: FormatType.percent,
                                    ),
                                    style: FlutterFlowTheme.of(context)
                                        .displayMedium
                                        .override(
                                          font: GoogleFonts.roboto(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .displayMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .displayMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                  barRadius: Radius.circular(8.0),
                                  padding: EdgeInsets.zero,
                                ),
                              ].divide(SizedBox(width: 50.0)),
                            ),
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              FutureBuilder<ApiCallResponse>(
                                future:
                                    CheckOnLoadStatusDSAllDepartmentsCall.call(
                                  dropsheetID: widget.dropSheetID,
                                  db: FFAppState().location,
                                ),
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
                                  final loadersContainerCheckOnLoadStatusDSAllDepartmentsResponse =
                                      snapshot.data!;

                                  return Container(
                                    constraints: BoxConstraints(
                                      maxWidth:
                                          MediaQuery.sizeOf(context).width *
                                              0.9,
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
                                          50.0, 0.0, 50.0, 0.0),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.max,
                                        children: [
                                          Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    0.0, 10.0, 0.0, 0.0),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.max,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              children: [
                                                Expanded(
                                                  flex: 2,
                                                  child: Text(
                                                    'Wrap',
                                                    textAlign: TextAlign.center,
                                                    style: FlutterFlowTheme.of(
                                                            context)
                                                        .titleLarge
                                                        .override(
                                                          font: GoogleFonts
                                                              .roboto(
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
                                                          font: GoogleFonts
                                                              .roboto(
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
                                                          font: GoogleFonts
                                                              .roboto(
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
                                          Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    0.0, 0.0, 0.0, 10.0),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.max,
                                              mainAxisAlignment:
                                                  MainAxisAlignment.start,
                                              children: [
                                                Expanded(
                                                  flex: 2,
                                                  child: Container(
                                                    height: 50.0,
                                                    decoration: BoxDecoration(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              8.0),
                                                      border: Border.all(
                                                        color:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .primary,
                                                      ),
                                                    ),
                                                    alignment:
                                                        AlignmentDirectional(
                                                            0.0, 0.0),
                                                    child: Builder(
                                                      builder: (context) {
                                                        final wrapLoaders =
                                                            FFAppState()
                                                                .DropsheetLoaders
                                                                .where((e) =>
                                                                    e.department ==
                                                                    'Wrap')
                                                                .toList()
                                                                .unique((e) => e
                                                                    .loaderName)
                                                                .toList();

                                                        return ListView.builder(
                                                          padding:
                                                              EdgeInsets.zero,
                                                          shrinkWrap: true,
                                                          scrollDirection:
                                                              Axis.vertical,
                                                          itemCount: wrapLoaders
                                                              .length,
                                                          itemBuilder: (context,
                                                              wrapLoadersIndex) {
                                                            final wrapLoadersItem =
                                                                wrapLoaders[
                                                                    wrapLoadersIndex];
                                                            return Text(
                                                              wrapLoadersItem
                                                                  .loaderName,
                                                              textAlign:
                                                                  TextAlign
                                                                      .center,
                                                              style: FlutterFlowTheme
                                                                      .of(context)
                                                                  .bodyMedium
                                                                  .override(
                                                                    font: GoogleFonts
                                                                        .roboto(
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontStyle,
                                                                    ),
                                                                    letterSpacing:
                                                                        0.0,
                                                                    fontWeight: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontWeight,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontStyle,
                                                                  ),
                                                            );
                                                          },
                                                        );
                                                      },
                                                    ),
                                                  ),
                                                ),
                                                Expanded(
                                                  flex: 2,
                                                  child: Container(
                                                    height: 50.0,
                                                    decoration: BoxDecoration(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              8.0),
                                                      border: Border.all(
                                                        color:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .primary,
                                                      ),
                                                    ),
                                                    alignment:
                                                        AlignmentDirectional(
                                                            0.0, 0.0),
                                                    child: Builder(
                                                      builder: (context) {
                                                        final rollLoaders =
                                                            FFAppState()
                                                                .DropsheetLoaders
                                                                .where((e) =>
                                                                    e.department ==
                                                                    'Roll')
                                                                .toList()
                                                                .unique((e) => e
                                                                    .loaderName)
                                                                .toList();

                                                        return ListView.builder(
                                                          padding:
                                                              EdgeInsets.zero,
                                                          shrinkWrap: true,
                                                          scrollDirection:
                                                              Axis.vertical,
                                                          itemCount: rollLoaders
                                                              .length,
                                                          itemBuilder: (context,
                                                              rollLoadersIndex) {
                                                            final rollLoadersItem =
                                                                rollLoaders[
                                                                    rollLoadersIndex];
                                                            return Text(
                                                              rollLoadersItem
                                                                  .loaderName,
                                                              textAlign:
                                                                  TextAlign
                                                                      .center,
                                                              style: FlutterFlowTheme
                                                                      .of(context)
                                                                  .bodyMedium
                                                                  .override(
                                                                    font: GoogleFonts
                                                                        .roboto(
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontStyle,
                                                                    ),
                                                                    letterSpacing:
                                                                        0.0,
                                                                    fontWeight: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontWeight,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontStyle,
                                                                  ),
                                                            );
                                                          },
                                                        );
                                                      },
                                                    ),
                                                  ),
                                                ),
                                                Expanded(
                                                  flex: 2,
                                                  child: Padding(
                                                    padding:
                                                        EdgeInsets.all(8.0),
                                                    child: Container(
                                                      height: 50.0,
                                                      decoration: BoxDecoration(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(8.0),
                                                        border: Border.all(
                                                          color: FlutterFlowTheme
                                                                  .of(context)
                                                              .primary,
                                                        ),
                                                      ),
                                                      alignment:
                                                          AlignmentDirectional(
                                                              0.0, 0.0),
                                                      child: Builder(
                                                        builder: (context) {
                                                          final partsLoaders =
                                                              FFAppState()
                                                                  .DropsheetLoaders
                                                                  .where((e) =>
                                                                      e.department ==
                                                                      'Parts')
                                                                  .toList()
                                                                  .unique((e) =>
                                                                      e.loaderName)
                                                                  .toList();

                                                          return ListView
                                                              .builder(
                                                            padding:
                                                                EdgeInsets.zero,
                                                            shrinkWrap: true,
                                                            scrollDirection:
                                                                Axis.vertical,
                                                            itemCount:
                                                                partsLoaders
                                                                    .length,
                                                            itemBuilder: (context,
                                                                partsLoadersIndex) {
                                                              final partsLoadersItem =
                                                                  partsLoaders[
                                                                      partsLoadersIndex];
                                                              return Text(
                                                                partsLoadersItem
                                                                    .loaderName,
                                                                textAlign:
                                                                    TextAlign
                                                                        .center,
                                                                style: FlutterFlowTheme.of(
                                                                        context)
                                                                    .bodyMedium
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .roboto(
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontStyle,
                                                                      ),
                                                                      letterSpacing:
                                                                          0.0,
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .fontStyle,
                                                                    ),
                                                              );
                                                            },
                                                          );
                                                        },
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ].divide(SizedBox(height: 5.0)),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ].divide(SizedBox(width: 50.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 0.0, 0.0, 30.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    FFButtonWidget(
                                      onPressed: () async {
                                        // set navigate to dropsheet list to true
                                        FFAppState().navigateDropsheetList =
                                            true;
                                        safeSetState(() {});
                                        await action_blocks
                                            .getOrderStatus(context);

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
                                      text: 'Order Status',
                                      icon: Icon(
                                        Icons.timer,
                                        size: 40.0,
                                      ),
                                      options: FFButtonOptions(
                                        height: 80.0,
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            24.0, 0.0, 24.0, 0.0),
                                        iconPadding: EdgeInsets.all(12.0),
                                        color:
                                            FFAppState().location == 'Freeport'
                                                ? FlutterFlowTheme.of(context)
                                                    .freeport
                                                : FlutterFlowTheme.of(context)
                                                    .primary,
                                        textStyle: FlutterFlowTheme.of(context)
                                            .titleSmall
                                            .override(
                                              font: GoogleFonts.roboto(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontStyle,
                                              ),
                                              color: Colors.white,
                                              fontSize: 32.0,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleSmall
                                                      .fontStyle,
                                            ),
                                        elevation: 3.0,
                                        borderSide: BorderSide(
                                          color: Colors.transparent,
                                          width: 1.0,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(8.0),
                                      ),
                                    ),
                                    FFButtonWidget(
                                      onPressed: () async {
                                        // set navigate to dropsheet list to true
                                        FFAppState().navigateDropsheetList =
                                            true;
                                        safeSetState(() {});
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
                                                  FocusScope.of(context)
                                                      .unfocus();
                                                  FocusManager
                                                      .instance.primaryFocus
                                                      ?.unfocus();
                                                },
                                                child: Padding(
                                                  padding:
                                                      MediaQuery.viewInsetsOf(
                                                          context),
                                                  child: LoadersWidget(),
                                                ),
                                              );
                                            },
                                          ).then(
                                              (value) => safeSetState(() {}));
                                        }
                                        // get order status
                                        await action_blocks
                                            .getOrderStatus(context);
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
                                      text: 'Dropsheet',
                                      icon: FaIcon(
                                        FontAwesomeIcons.listAlt,
                                        size: 40.0,
                                      ),
                                      options: FFButtonOptions(
                                        height: 80.0,
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            24.0, 0.0, 24.0, 0.0),
                                        iconPadding: EdgeInsets.all(12.0),
                                        color:
                                            FFAppState().location == 'Freeport'
                                                ? FlutterFlowTheme.of(context)
                                                    .freeport
                                                : FlutterFlowTheme.of(context)
                                                    .primary,
                                        textStyle: FlutterFlowTheme.of(context)
                                            .titleSmall
                                            .override(
                                              font: GoogleFonts.roboto(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontStyle,
                                              ),
                                              color: Colors.white,
                                              fontSize: 32.0,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleSmall
                                                      .fontStyle,
                                            ),
                                        elevation: 3.0,
                                        borderSide: BorderSide(
                                          color: Colors.transparent,
                                          width: 1.0,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(8.0),
                                      ),
                                    ),
                                    if (widget.willcall == true)
                                      FFButtonWidget(
                                        onPressed: () async {
                                          var _shouldSetState = false;
                                          _model.getWillCallSignature =
                                              await GetWillCallSignatureCall
                                                  .call(
                                            dropSheetID: widget.dropSheetID,
                                            db: FFAppState().location,
                                          );

                                          _shouldSetState = true;
                                          if ((_model.getWillCallSignature
                                                  ?.succeeded ??
                                              true)) {
                                            await showModalBottomSheet(
                                              isScrollControlled: true,
                                              backgroundColor:
                                                  Colors.transparent,
                                              isDismissible: false,
                                              enableDrag: false,
                                              context: context,
                                              builder: (context) {
                                                return GestureDetector(
                                                  onTap: () {
                                                    FocusScope.of(context)
                                                        .unfocus();
                                                    FocusManager
                                                        .instance.primaryFocus
                                                        ?.unfocus();
                                                  },
                                                  child: Padding(
                                                    padding:
                                                        MediaQuery.viewInsetsOf(
                                                            context),
                                                    child:
                                                        PackListSignatureWidget(
                                                      dropSheetID:
                                                          widget.dropSheetID!,
                                                      customerDropsheetId:
                                                          DropSheetCustomerStruct
                                                              .maybeFromMap((_model
                                                                      .getWillCallSignature
                                                                      ?.jsonBody ??
                                                                  '')),
                                                    ),
                                                  ),
                                                );
                                              },
                                            ).then(
                                                (value) => safeSetState(() {}));
                                          } else {
                                            await action_blocks.a03ErrorMessage(
                                              context,
                                              status: (_model
                                                      .getWillCallSignature
                                                      ?.statusCode ??
                                                  200),
                                              message: (_model
                                                      .getWillCallSignature
                                                      ?.bodyText ??
                                                  ''),
                                              routine:
                                                  'Getting will call signature',
                                            );
                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          }

                                          if (_shouldSetState)
                                            safeSetState(() {});
                                        },
                                        text: 'Signature',
                                        icon: FaIcon(
                                          FontAwesomeIcons.signature,
                                          size: 40.0,
                                        ),
                                        options: FFButtonOptions(
                                          height: 80.0,
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  24.0, 0.0, 24.0, 0.0),
                                          iconPadding: EdgeInsets.all(12.0),
                                          color: FFAppState().location ==
                                                  'Freeport'
                                              ? FlutterFlowTheme.of(context)
                                                  .freeport
                                              : FlutterFlowTheme.of(context)
                                                  .primary,
                                          textStyle: FlutterFlowTheme.of(
                                                  context)
                                              .titleSmall
                                              .override(
                                                font: GoogleFonts.roboto(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .titleSmall
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .titleSmall
                                                          .fontStyle,
                                                ),
                                                color: Colors.white,
                                                fontSize: 32.0,
                                                letterSpacing: 0.0,
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontStyle,
                                              ),
                                          elevation: 3.0,
                                          borderSide: BorderSide(
                                            color: Colors.transparent,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(8.0),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 0.0, 0.0, 30.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    if (widget.percentCompleted == 1.0)
                                      FFButtonWidget(
                                        onPressed: () async {
                                          var _shouldSetState = false;
                                          var confirmDialogResponse =
                                              await showDialog<bool>(
                                                    context: context,
                                                    builder:
                                                        (alertDialogContext) {
                                                      return AlertDialog(
                                                        title: Text(
                                                            'Complete Loading'),
                                                        content: Text(
                                                            'Are you sure you want to complete this load.  If you complete the load it will also send the email to the customer'),
                                                        actions: [
                                                          TextButton(
                                                            onPressed: () =>
                                                                Navigator.pop(
                                                                    alertDialogContext,
                                                                    false),
                                                            child:
                                                                Text('Cancel'),
                                                          ),
                                                          TextButton(
                                                            onPressed: () =>
                                                                Navigator.pop(
                                                                    alertDialogContext,
                                                                    true),
                                                            child:
                                                                Text('Confirm'),
                                                          ),
                                                        ],
                                                      );
                                                    },
                                                  ) ??
                                                  false;
                                          if (confirmDialogResponse) {
                                            _model.loadCompleteEmailAPI =
                                                await LoaderAPIsGroup
                                                    .loadingCompleteEmailCall
                                                    .call(
                                              dropsheetId: widget.dropSheetID
                                                  ?.toDouble(),
                                              type: 'loaded',
                                              jwt: currentJwtToken,
                                              db: FFAppState().location,
                                            );

                                            _shouldSetState = true;
                                            Navigator.pop(context);
                                          } else {
                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          }

                                          if (_shouldSetState)
                                            safeSetState(() {});
                                        },
                                        text: 'Complete Load',
                                        icon: Icon(
                                          Icons.done,
                                          size: 40.0,
                                        ),
                                        options: FFButtonOptions(
                                          height: 80.0,
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  24.0, 0.0, 24.0, 0.0),
                                          iconPadding: EdgeInsets.all(12.0),
                                          iconColor:
                                              GetAllPercentAndLabelCountStruct
                                                              .maybeFromMap(
                                                                  departmentColumnGetDSAllPercentAndCountLabelResponse
                                                                      .jsonBody)
                                                          ?.allLoaded ==
                                                      true
                                                  ? FlutterFlowTheme.of(context)
                                                      .success
                                                  : FlutterFlowTheme.of(context)
                                                      .error,
                                          color: FFAppState().location ==
                                                  'Freeport'
                                              ? FlutterFlowTheme.of(context)
                                                  .freeport
                                              : FlutterFlowTheme.of(context)
                                                  .primary,
                                          textStyle: FlutterFlowTheme.of(
                                                  context)
                                              .titleSmall
                                              .override(
                                                font: GoogleFonts.roboto(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .titleSmall
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .titleSmall
                                                          .fontStyle,
                                                ),
                                                color: Colors.white,
                                                fontSize: 32.0,
                                                letterSpacing: 0.0,
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .titleSmall
                                                        .fontStyle,
                                              ),
                                          elevation: 3.0,
                                          borderSide: BorderSide(
                                            color: GetAllPercentAndLabelCountStruct
                                                            .maybeFromMap(
                                                                departmentColumnGetDSAllPercentAndCountLabelResponse
                                                                    .jsonBody)
                                                        ?.allLoaded ==
                                                    true
                                                ? FlutterFlowTheme.of(context)
                                                    .success
                                                : FlutterFlowTheme.of(context)
                                                    .error,
                                            width: 5.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(8.0),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ].divide(SizedBox(height: 30.0)),
                      );
                    },
                  ),
                ),
              ]
                  .divide(SizedBox(height: 30.0))
                  .addToStart(SizedBox(height: 30.0)),
            ),
          ),
        ),
      ),
    );
  }
}
