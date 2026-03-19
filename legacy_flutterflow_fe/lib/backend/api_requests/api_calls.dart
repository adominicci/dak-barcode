import 'dart:convert';

import 'package:flutter/foundation.dart';

import '/flutter_flow/flutter_flow_util.dart';
import 'api_manager.dart';

export 'api_manager.dart' show ApiCallResponse;

const _kPrivateApiFunctionName = 'ffPrivateApiCall';

/// Start Loader APIs Group Code

class LoaderAPIsGroup {
  static String getBaseUrl({
    String? jwt = '',
    String? db = '',
  }) =>
      'https://dak-web-e661a0c35a99.herokuapp.com';
  static Map<String, String> headers = {
    'X-Db': '[db]',
    'Authorization': 'Bearer [jwt]',
  };
  static InsertNewLoaderIDCall insertNewLoaderIDCall = InsertNewLoaderIDCall();
  static LoaderEndingTimeCall loaderEndingTimeCall = LoaderEndingTimeCall();
  static GetLoaderInfoCall getLoaderInfoCall = GetLoaderInfoCall();
  static LoadingCompleteEmailCall loadingCompleteEmailCall =
      LoadingCompleteEmailCall();
  static GetLoadersDropsheetCall getLoadersDropsheetCall =
      GetLoadersDropsheetCall();
}

class InsertNewLoaderIDCall {
  Future<ApiCallResponse> call({
    int? fkDropSheetID,
    String? department = '',
    String? loaderName = '',
    int? fkLoaderID,
    String? startedAt = '',
    String? jwt = '',
    String? db = '',
  }) async {
    final baseUrl = LoaderAPIsGroup.getBaseUrl(
      jwt: jwt,
      db: db,
    );

    final ffApiRequestBody = '''
{
  "fkDropSheetID": "${fkDropSheetID}",
  "Department": "${escapeStringForJson(department)}",
  "loader_name": "${escapeStringForJson(loaderName)}",
  "fkLoaderID": "${fkLoaderID}",
  "started_at": "${escapeStringForJson(startedAt)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Insert New LoaderID ',
      apiUrl: '${baseUrl}/v1/logistics/dropsheet-loader-upsert',
      callType: ApiCallType.POST,
      headers: {
        'X-Db': '${db}',
        'Authorization': 'Bearer ${jwt}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class LoaderEndingTimeCall {
  Future<ApiCallResponse> call({
    int? loaderID,
    int? fkDropSheetID,
    int? fkLoaderID,
    String? department = '',
    String? loaderName = '',
    String? startedAt = '',
    String? endedAt = '',
    String? jwt = '',
    String? db = '',
  }) async {
    final baseUrl = LoaderAPIsGroup.getBaseUrl(
      jwt: jwt,
      db: db,
    );

    final ffApiRequestBody = '''
{
  "LoaderID": "${loaderID}",
  "fkDropSheetID": "${fkDropSheetID}",
  "fkLoaderID": "${fkLoaderID}",
  "Department": "${escapeStringForJson(department)}",
  "loader_name": "${escapeStringForJson(loaderName)}",
  "started_at": "${escapeStringForJson(startedAt)}",
  "ended_at": "${escapeStringForJson(endedAt)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Loader Ending Time',
      apiUrl: '${baseUrl}/v1/logistics/dropsheet-loader-upsert',
      callType: ApiCallType.POST,
      headers: {
        'X-Db': '${db}',
        'Authorization': 'Bearer ${jwt}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetLoaderInfoCall {
  Future<ApiCallResponse> call({
    int? loaderId,
    String? jwt = '',
    String? db = '',
  }) async {
    final baseUrl = LoaderAPIsGroup.getBaseUrl(
      jwt: jwt,
      db: db,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Get Loader Info',
      apiUrl: '${baseUrl}/v1/logistics/dropsheet-loader-select-single',
      callType: ApiCallType.GET,
      headers: {
        'X-Db': '${db}',
        'Authorization': 'Bearer ${jwt}',
      },
      params: {
        'loader_id': loaderId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class LoadingCompleteEmailCall {
  Future<ApiCallResponse> call({
    double? dropsheetId,
    String? type = 'loaded',
    String? sendEmailTo = '',
    String? jwt = '',
    String? db = '',
  }) async {
    final baseUrl = LoaderAPIsGroup.getBaseUrl(
      jwt: jwt,
      db: db,
    );

    final ffApiRequestBody = '''
{
  "dropsheet_id": ${dropsheetId},
  "type": "${escapeStringForJson(type)}",
  "send_email_to": "${escapeStringForJson(sendEmailTo)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Loading Complete Email',
      apiUrl: '${baseUrl}/v1/logistics/dropsheet-notify',
      callType: ApiCallType.POST,
      headers: {
        'X-Db': '${db}',
        'Authorization': 'Bearer ${jwt}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetLoadersDropsheetCall {
  Future<ApiCallResponse> call({
    int? fkDropsheetId,
    String? jwt = '',
    String? db = '',
  }) async {
    final baseUrl = LoaderAPIsGroup.getBaseUrl(
      jwt: jwt,
      db: db,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Get Loaders Dropsheet',
      apiUrl: '${baseUrl}/v1/logistics/dropsheet-loader-select',
      callType: ApiCallType.GET,
      headers: {
        'X-Db': '${db}',
        'Authorization': 'Bearer ${jwt}',
      },
      params: {
        'fk_dropsheet_id': fkDropsheetId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

/// End Loader APIs Group Code

class SelectDropSheetLoadingMenuCall {
  static Future<ApiCallResponse> call({
    String? dropSheetDate = '',
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Select DropSheet Loading Menu',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/select-loading-dropsheet?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'dropsSheetDate': dropSheetDate,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class CheckOnLoadStatusDSAllDepartmentsCall {
  static Future<ApiCallResponse> call({
    int? dropsheetID,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "DropSheetID": ${dropsheetID}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Check On Load Status DS All Departments',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/check-onload-statusDS-departments?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetDSAllPercentAndCountLabelCall {
  static Future<ApiCallResponse> call({
    int? dropSheetID,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "DropSheetID": ${dropSheetID}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Get DS All Percent And Count Label',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/get-percent-scanned-label-count?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetAllLoadersCall {
  static Future<ApiCallResponse> call({
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get All Loaders',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-loaders?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class LoadViewAllFunctionForOrderStatusCall {
  static Future<ApiCallResponse> call({
    int? dropSheetID,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Load View All Function for Order Status',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/loadview-all-get-orderstatus?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'DropSheetID': dropSheetID,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetOrderStatusInDropsheetCall {
  static Future<ApiCallResponse> call({
    int? dropSheetID,
    int? dropSheetCustID,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get Order Status In Dropsheet',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-orderstatus-in-dropsheet?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'DropSheetID': dropSheetID,
        'DropSheetCustID': dropSheetCustID,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetStagingPartsForTheDayCall {
  static Future<ApiCallResponse> call({
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get Staging Parts for the Day',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-staging-parts-for-day?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetDropAreaCall {
  static Future<ApiCallResponse> call({
    int? dropareaid,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get Drop Area',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-droparea?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'dropareaid': dropareaid,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class CheckIfScannedLabelIsAPalletCall {
  static Future<ApiCallResponse> call({
    String? scannedLabel = '',
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Check If Scanned Label is a Pallet',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/check-scanned-label-ispallet?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'scannedLabel': scannedLabel,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static int? scannedLabelPanelCount(dynamic response) =>
      castToType<int>(getJsonField(
        response,
        r'''$.ScannedLabelPanelCount''',
      ));
}

class GetLPIDValueCall {
  static Future<ApiCallResponse> call({
    String? barcode = '',
    bool? labelType,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "Barcode": "${barcode}",
  "LabelType": ${labelType}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Get LPID Value',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/get-lpid-value?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static int? lpidForPalletLabel(dynamic response) =>
      castToType<int>(getJsonField(
        response,
        r'''$.LPID''',
      ));
}

class GetVwPickPalletForStagingCall {
  static Future<ApiCallResponse> call({
    String? scannedlabel = '',
    int? lpid,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get vwPickPallet for Staging',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-pickpallet-staging?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'scannedlabel': scannedlabel,
        'lpid': lpid,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class UpdateLogisticsPackagesDetailForStagingCall {
  static Future<ApiCallResponse> call({
    int? palletid,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "PalletID": ${palletid}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Update Logistics Packages Detail for Staging',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/update-logistics-packages-detail-staging?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class UpdateLogisticsPalletForPalletsCall {
  static Future<ApiCallResponse> call({
    int? palletid,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "PalletID": ${palletid}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Update Logistics Pallet for Pallets',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/update-logistics-pallet-for-pallets?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class UpdateLogisticsPackagesForPalletCall {
  static Future<ApiCallResponse> call({
    int? lpid,
    int? locationid,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "lpid": ${lpid},
  "DropAreaID": ${locationid}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Update Logistics Packages for Pallet',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/update-logistics-packages-for-pallet?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class LoadViewDetailsBySequenceCall {
  static Future<ApiCallResponse> call({
    int? dropSheetID,
    int? locationID,
    int? dSSequence,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "DropSheetID": ${dropSheetID},
  "LocationID": ${locationID},
  "DSSequence": ${dSSequence}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Load View Details By Sequence',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/loadview-details-by-sequence?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static int? dropSequence(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$[:].DropSequence''',
      ));
  static String? loadNumber(dynamic response) =>
      castToType<String>(getJsonField(
        response,
        r'''$[:].LoadNumber''',
      ));
  static int? dropSheetCustID(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$[:].DropSheetCustID''',
      ));
  static String? customerName(dynamic response) =>
      castToType<String>(getJsonField(
        response,
        r'''$[:].CustomerName''',
      ));
  static String? totalCount(dynamic response) =>
      castToType<String>(getJsonField(
        response,
        r'''$[:].TotalCount''',
      ));
  static int? labelCount(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$[:].LabelCount''',
      ));
  static int? scanned(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$[:].Scanned''',
      ));
  static int? needPick(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$[:].NeedPick''',
      ));
}

class LoadLabelsUnionViewCall {
  static Future<ApiCallResponse> call({
    String? loadNumber = '',
    int? dSSequence,
    int? locationID,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "LoadNumber": "${loadNumber}",
  "DSSequence": ${dSSequence},
  "LocationID": ${locationID}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Load Labels Union View',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/load-labels-union-view?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetDepartmentStatusOnDropCall {
  static Future<ApiCallResponse> call({
    int? custDropSheetID,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get Department Status On Drop',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-department-status-ondrop?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'CustDropSheetID': custDropSheetID,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetNumberOfDropsCall {
  static Future<ApiCallResponse> call({
    int? dropSheetID,
    int? locationID,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get Number Of Drops',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-number-of-drops?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'DropSheetID': dropSheetID,
        'LocationID': locationID,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static int? numberOfDrops(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.NumberOfDrops''',
      ));
}

class GetLPIDStagingSingleLabelCall {
  static Future<ApiCallResponse> call({
    String? barcode = '',
    bool? pallet,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "Barcode": "${barcode}",
  "Pallet": ${pallet}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Get LPID Staging Single Label',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/get-lpid-staging-single-label?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static int? lpid(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$[:].LPID''',
      ));
}

class GetStagingRecordsSingleLabelsCall {
  static Future<ApiCallResponse> call({
    String? barcode = '',
    int? lpid,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get Staging Records Single Labels',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-staging-records-single-labels?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'Barcode': barcode,
        'LPID': lpid,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static String? partListID(dynamic response) =>
      castToType<String>(getJsonField(
        response,
        r'''$[:].PartListID''',
      ));
  static int? labelNumber(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$[:].LabelNumber''',
      ));
  static bool? picked(dynamic response) => castToType<bool>(getJsonField(
        response,
        r'''$[:].Picked''',
      ));
}

class UpdateLogisticsPackagesStagingCall {
  static Future<ApiCallResponse> call({
    int? lpid,
    int? labelNumber,
    int? location,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "LPID": ${lpid},
  "LabelNumber": ${labelNumber},
  "Location": ${location}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Update Logistics Packages Staging',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/update-logistics-packages-detail-staging-multiple?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetTrailersCall {
  static Future<ApiCallResponse> call({
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get Trailers',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-trailers?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class UpdateTrailerInDropsheetCall {
  static Future<ApiCallResponse> call({
    int? trailerid,
    int? dropsheetid,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "TrailerID": ${trailerid},
  "dropsheetid": ${dropsheetid}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Update Trailer in Dropsheet',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/update-trailer-dropsheet?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class CountPalletLabelsLoadingCall {
  static Future<ApiCallResponse> call({
    String? palletLabel = '',
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Count Pallet Labels Loading',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/count-pallet-labels-loading?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'palletLabel': palletLabel,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static int? palletLabelCount(dynamic response) =>
      castToType<int>(getJsonField(
        response,
        r'''$.PalletLabelCount''',
      ));
}

class GetLPIDForPalletLoadCall {
  static Future<ApiCallResponse> call({
    String? barcode = '',
    String? loadNumber = '',
    bool? isPallet = true,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "Barcode": "${barcode}",
  "LoadNumber": "${loadNumber}",
  "Pallet": ${isPallet}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Get LPID for Pallet Load',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/get-lpid-pallet-load?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static int? lpid(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$[:].LPID''',
      ));
}

class CheckPalletBelongsToLPIDCall {
  static Future<ApiCallResponse> call({
    String? barcode = '',
    int? lpid,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Check Pallet Belongs to LPID',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/check-pallet-belongs-lpid?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'Barcode': barcode,
        'LPID': lpid,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class UpdatePalletLoadCall {
  static Future<ApiCallResponse> call({
    int? droparea,
    int? palletid,
    String? loader = '',
    int? lpid,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "DropArea": ${droparea},
  "PalletID": ${palletid},
  "Loader": "${loader}",
  "LPIDNumber": ${lpid}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Update Pallet Load',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/update-pallet-load?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetLPIDSingleLabelScanStoredProcedureCall {
  static Future<ApiCallResponse> call({
    String? barcode = '',
    String? loadnumber = '',
    bool? pallet,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "Barcode": "${barcode}",
  "LoadNumber": "${loadnumber}",
  "IsPallet": ${pallet}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Get LPID Single Label Scan Stored Procedure',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/get-lpid-label-scan-sp?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static int? lpid(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.LPID''',
      ));
}

class GetLPIDSingleLabelScanCall {
  static Future<ApiCallResponse> call({
    String? barcode = '',
    int? lpid,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get LPID Single Label Scan',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-lpid-single-label-scan?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'Barcode': barcode,
        'LPID': lpid,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class UpdateSingleLabelLoadCall {
  static Future<ApiCallResponse> call({
    int? location,
    String? loader = '',
    int? lpid,
    int? labelnumber,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "Location": ${location},
  "Loader": "${loader}",
  "LPID": ${lpid},
  "LabelNumber": ${labelnumber}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Update Single Label Load',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/update-single-label-load?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class LoadViewDetailsSumNeedPickCall {
  static Future<ApiCallResponse> call({
    int? dropSheetID,
    int? locationID,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Load View Details Sum Need Pick',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/loadview-details-sum-need-pick?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'DropSheetID': dropSheetID,
        'LocationID': locationID,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static int? needPick(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.NeedPick''',
      ));
}

class GetDropsheetForWillCallOrdersCall {
  static Future<ApiCallResponse> call({
    String? loadnumber = '',
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get Dropsheet for Will Call Orders',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-dropsheet-willcall-orders?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'LoadNumber': loadnumber,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static int? dropSheetID(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.DropSheetID''',
      ));
}

class UploadSignatureWillCallCall {
  static Future<ApiCallResponse> call({
    int? dropSheetID,
    String? signaturePath = '',
    String? receivedBy = '',
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "DropSheetID": ${dropSheetID},
  "Signature_Path": "${signaturePath}",
  "ReceivedBy": "${receivedBy}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Upload Signature Will Call',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/upload-signature-will-call?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetOrdersLoadedToMoveToNewLocationCall {
  static Future<ApiCallResponse> call({
    int? dropsheetid,
    int? customerdropsheetid,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "DropSheetID": ${dropsheetid},
  "CustomerDropSheetID": ${customerdropsheetid}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Get Orders Loaded to Move to New Location',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/get-orders-loaded-move-new-location?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class LoadViewDetailSequenceAllCall {
  static Future<ApiCallResponse> call({
    int? dropsheetid,
    int? locationid,
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "DropSheetID": ${dropsheetid},
  "LocationID": ${locationid}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Load View Detail Sequence All',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/loadview-detail-sequence-all?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class CategoryListCall {
  static Future<ApiCallResponse> call({
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Category List',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/category-list?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class SelectDropAreaCall {
  static Future<ApiCallResponse> call({
    String? department = '',
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "Department": "${escapeStringForJson(department)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Select DropArea',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/select-drop-area?db=${db}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class SelectDropsheetLoadingMenuNewCall {
  static Future<ApiCallResponse> call({
    String? dropSheetDate = '',
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Select Dropsheet Loading Menu New',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/select-loading-dropsheet?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'dropSheetDate': dropSheetDate,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetWillCallSignatureCall {
  static Future<ApiCallResponse> call({
    int? dropSheetID,
    String? db = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get Will Call Signature',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-signature-will-call?db=${db}',
      callType: ApiCallType.GET,
      headers: {},
      params: {
        'DropSheetID': dropSheetID,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class InsertLoaderCall {
  static Future<ApiCallResponse> call({
    String? loader = '',
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "Loader": "${escapeStringForJson(loader)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Insert Loader',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-update/insert-loader?db=${db}',
      callType: ApiCallType.POST,
      headers: {},
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetStagingPartsForTheDayRollCall {
  static Future<ApiCallResponse> call({
    String? orderSoNumber,
    String? db = '',
  }) async {
    orderSoNumber ??= null;

    return ApiManager.instance.makeApiCall(
      callName: 'Get Staging Parts for the Day Roll',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/barcode-get/get-staging-parts-for-day-roll?db=${db}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization':
            'Bearer ZmNjZDcwZmJlNmUwZDA3NDE5ZTg3YTg3YWIzMTNiMmY6MTgwNDZlYmI0YTQzZDNjYWUwZjA1YmNlZjE4M2NmY2I=',
      },
      params: {
        'order_so_number': orderSoNumber,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class UpdatePickedByLoaderCall {
  static Future<ApiCallResponse> call({
    int? dropsheetId,
    String? pickedBy = '',
    String? db = '',
  }) async {
    final ffApiRequestBody = '''
{
  "dropsheet_id": ${dropsheetId},
  "picked_by": "${escapeStringForJson(pickedBy)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Update Picked By Loader',
      apiUrl:
          'https://dst-customer-portal-bfe4c7fdc773.herokuapp.com/api/dropsheet/update-picked-by?db=${db}',
      callType: ApiCallType.POST,
      headers: {},
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class ApiPagingParams {
  int nextPageNumber = 0;
  int numItems = 0;
  dynamic lastResponse;

  ApiPagingParams({
    required this.nextPageNumber,
    required this.numItems,
    required this.lastResponse,
  });

  @override
  String toString() =>
      'PagingParams(nextPageNumber: $nextPageNumber, numItems: $numItems, lastResponse: $lastResponse,)';
}

String _toEncodable(dynamic item) {
  if (item is DocumentReference) {
    return item.path;
  }
  return item;
}

String _serializeList(List? list) {
  list ??= <String>[];
  try {
    return json.encode(list, toEncodable: _toEncodable);
  } catch (_) {
    if (kDebugMode) {
      print("List serialization failed. Returning empty list.");
    }
    return '[]';
  }
}

String _serializeJson(dynamic jsonVar, [bool isList = false]) {
  jsonVar ??= (isList ? [] : {});
  try {
    return json.encode(jsonVar, toEncodable: _toEncodable);
  } catch (_) {
    if (kDebugMode) {
      print("Json serialization failed. Returning empty json.");
    }
    return isList ? '[]' : '{}';
  }
}

String? escapeStringForJson(String? input) {
  if (input == null) {
    return null;
  }
  return input
      .replaceAll('\\', '\\\\')
      .replaceAll('"', '\\"')
      .replaceAll('\n', '\\n')
      .replaceAll('\t', '\\t');
}
