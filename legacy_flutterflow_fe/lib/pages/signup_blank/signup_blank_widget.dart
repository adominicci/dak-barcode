import '/auth/firebase_auth/auth_util.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'signup_blank_model.dart';
export 'signup_blank_model.dart';

class SignupBlankWidget extends StatefulWidget {
  const SignupBlankWidget({super.key});

  static String routeName = 'SignupBlank';
  static String routePath = '/signupBlank';

  @override
  State<SignupBlankWidget> createState() => _SignupBlankWidgetState();
}

class _SignupBlankWidgetState extends State<SignupBlankWidget> {
  late SignupBlankModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => SignupBlankModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      GoRouter.of(context).prepareAuthEvent();
      final user = await authManager.signInAnonymously(context);
      if (user == null) {
        return;
      }

      context.goNamedAuth(LocationPageWidget.routeName, context.mounted);
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
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        body: SafeArea(
          top: true,
          child: InkWell(
            splashColor: Colors.transparent,
            focusColor: Colors.transparent,
            hoverColor: Colors.transparent,
            highlightColor: Colors.transparent,
            onTap: () async {
              // login anonymously
              GoRouter.of(context).prepareAuthEvent();
              final user = await authManager.signInAnonymously(context);
              if (user == null) {
                return;
              }

              context.goNamedAuth(
                  LocationPageWidget.routeName, context.mounted);
            },
            child: Column(
              mainAxisSize: MainAxisSize.max,
              children: [],
            ),
          ),
        ),
      ),
    );
  }
}
