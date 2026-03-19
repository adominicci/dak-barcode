import 'package:flutter/material.dart';
import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/backend/schema/enums/enums.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'flutter_flow/flutter_flow_util.dart';

class FFAppState extends ChangeNotifier {
  static FFAppState _instance = FFAppState._internal();

  factory FFAppState() {
    return _instance;
  }

  FFAppState._internal();

  static void reset() {
    _instance = FFAppState._internal();
  }

  Future initializePersistedState() async {
    prefs = await SharedPreferences.getInstance();
    _safeInit(() {
      _loadDate = prefs.getString('ff_loadDate') ?? _loadDate;
    });
    _safeInit(() {
      _scannedText = prefs.getString('ff_scannedText') ?? _scannedText;
    });
    _safeInit(() {
      _LoadViewAllMenu = prefs
              .getStringList('ff_LoadViewAllMenu')
              ?.map((x) {
                try {
                  return LoadViewAllStruct.fromSerializableMap(jsonDecode(x));
                } catch (e) {
                  print("Can't decode persisted data type. Error: $e.");
                  return null;
                }
              })
              .withoutNulls
              .toList() ??
          _LoadViewAllMenu;
    });
    _safeInit(() {
      _currentDrop = prefs.getInt('ff_currentDrop') ?? _currentDrop;
    });
    _safeInit(() {
      _firstRecord = prefs.getInt('ff_firstRecord') ?? _firstRecord;
    });
    _safeInit(() {
      _lastRecord = prefs.getInt('ff_lastRecord') ?? _lastRecord;
    });
    _safeInit(() {
      _dropAreaID = prefs.getInt('ff_dropAreaID') ?? _dropAreaID;
    });
    _safeInit(() {
      _lpid = prefs.getInt('ff_lpid') ?? _lpid;
    });
    _safeInit(() {
      _scannedLabelPalletCount = prefs.getInt('ff_scannedLabelPalletCount') ??
          _scannedLabelPalletCount;
    });
    _safeInit(() {
      _palletid = prefs.getInt('ff_palletid') ?? _palletid;
    });
    _safeInit(() {
      _moveNewLocation =
          prefs.getBool('ff_moveNewLocation') ?? _moveNewLocation;
    });
    _safeInit(() {
      if (prefs.containsKey('ff_getAllDSAndPercentCountLabel')) {
        try {
          final serializedData =
              prefs.getString('ff_getAllDSAndPercentCountLabel') ?? '{}';
          _getAllDSAndPercentCountLabel =
              GetAllPercentAndLabelCountStruct.fromSerializableMap(
                  jsonDecode(serializedData));
        } catch (e) {
          print("Can't decode persisted data type. Error: $e.");
        }
      }
    });
    _safeInit(() {
      if (prefs.containsKey('ff_PalletPickView')) {
        try {
          final serializedData = prefs.getString('ff_PalletPickView') ?? '{}';
          _PalletPickView = PickPalletViewStruct.fromSerializableMap(
              jsonDecode(serializedData));
        } catch (e) {
          print("Can't decode persisted data type. Error: $e.");
        }
      }
    });
    _safeInit(() {
      if (prefs.containsKey('ff_SelectLabelsSingleStage')) {
        try {
          final serializedData =
              prefs.getString('ff_SelectLabelsSingleStage') ?? '{}';
          _SelectLabelsSingleStage =
              SelectLabelsSingleStageStruct.fromSerializableMap(
                  jsonDecode(serializedData));
        } catch (e) {
          print("Can't decode persisted data type. Error: $e.");
        }
      }
    });
    _safeInit(() {
      _category = prefs.containsKey('ff_category')
          ? deserializeEnum<Category>(prefs.getString('ff_category'))
          : _category;
    });
    _safeInit(() {
      if (prefs.containsKey('ff_pickPalletLoadScan')) {
        try {
          final serializedData =
              prefs.getString('ff_pickPalletLoadScan') ?? '{}';
          _pickPalletLoadScan = PickPalleLoadScanStruct.fromSerializableMap(
              jsonDecode(serializedData));
        } catch (e) {
          print("Can't decode persisted data type. Error: $e.");
        }
      }
    });
    _safeInit(() {
      _move = prefs.containsKey('ff_move')
          ? deserializeEnum<Move>(prefs.getString('ff_move'))
          : _move;
    });
    _safeInit(() {
      if (prefs.containsKey('ff_singleLabelScanLoad')) {
        try {
          final serializedData =
              prefs.getString('ff_singleLabelScanLoad') ?? '{}';
          _singleLabelScanLoad = SingleLabelScanLoadStruct.fromSerializableMap(
              jsonDecode(serializedData));
        } catch (e) {
          print("Can't decode persisted data type. Error: $e.");
        }
      }
    });
    _safeInit(() {
      _navigateDropsheetList =
          prefs.getBool('ff_navigateDropsheetList') ?? _navigateDropsheetList;
    });
    _safeInit(() {
      _wrapLocation = prefs.getBool('ff_wrapLocation') ?? _wrapLocation;
    });
    _safeInit(() {
      _rollLocation = prefs.getBool('ff_rollLocation') ?? _rollLocation;
    });
    _safeInit(() {
      _partLocation = prefs.getBool('ff_partLocation') ?? _partLocation;
    });
    _safeInit(() {
      _noImage = prefs.getString('ff_noImage') ?? _noImage;
    });
    _safeInit(() {
      _barcodeNumber = prefs.getString('ff_barcodeNumber') ?? _barcodeNumber;
    });
    _safeInit(() {
      _driverName = prefs.getString('ff_driverName') ?? _driverName;
    });
    _safeInit(() {
      _location = prefs.getString('ff_location') ?? _location;
    });
    _safeInit(() {
      _loadWeight = prefs.getDouble('ff_loadWeight') ?? _loadWeight;
    });
    _safeInit(() {
      _dropAreaAll = prefs
              .getStringList('ff_dropAreaAll')
              ?.map((x) {
                try {
                  return DropAreaAllStruct.fromSerializableMap(jsonDecode(x));
                } catch (e) {
                  print("Can't decode persisted data type. Error: $e.");
                  return null;
                }
              })
              .withoutNulls
              .toList() ??
          _dropAreaAll;
    });
  }

  void update(VoidCallback callback) {
    callback();
    notifyListeners();
  }

  late SharedPreferences prefs;

  String _loadDate = '';
  String get loadDate => _loadDate;
  set loadDate(String value) {
    _loadDate = value;
    prefs.setString('ff_loadDate', value);
  }

  List<SelectDropSheetMenuStruct> _selectDropSheetMenu = [];
  List<SelectDropSheetMenuStruct> get selectDropSheetMenu =>
      _selectDropSheetMenu;
  set selectDropSheetMenu(List<SelectDropSheetMenuStruct> value) {
    _selectDropSheetMenu = value;
  }

  void addToSelectDropSheetMenu(SelectDropSheetMenuStruct value) {
    selectDropSheetMenu.add(value);
  }

  void removeFromSelectDropSheetMenu(SelectDropSheetMenuStruct value) {
    selectDropSheetMenu.remove(value);
  }

  void removeAtIndexFromSelectDropSheetMenu(int index) {
    selectDropSheetMenu.removeAt(index);
  }

  void updateSelectDropSheetMenuAtIndex(
    int index,
    SelectDropSheetMenuStruct Function(SelectDropSheetMenuStruct) updateFn,
  ) {
    selectDropSheetMenu[index] = updateFn(_selectDropSheetMenu[index]);
  }

  void insertAtIndexInSelectDropSheetMenu(
      int index, SelectDropSheetMenuStruct value) {
    selectDropSheetMenu.insert(index, value);
  }

  int _dropSheetID = 0;
  int get dropSheetID => _dropSheetID;
  set dropSheetID(int value) {
    _dropSheetID = value;
  }

  String _scannedText = '';
  String get scannedText => _scannedText;
  set scannedText(String value) {
    _scannedText = value;
    prefs.setString('ff_scannedText', value);
  }

  String _Loader = '';
  String get Loader => _Loader;
  set Loader(String value) {
    _Loader = value;
  }

  List<LoadViewAllStruct> _LoadViewAllMenu = [];
  List<LoadViewAllStruct> get LoadViewAllMenu => _LoadViewAllMenu;
  set LoadViewAllMenu(List<LoadViewAllStruct> value) {
    _LoadViewAllMenu = value;
    prefs.setStringList(
        'ff_LoadViewAllMenu', value.map((x) => x.serialize()).toList());
  }

  void addToLoadViewAllMenu(LoadViewAllStruct value) {
    LoadViewAllMenu.add(value);
    prefs.setStringList('ff_LoadViewAllMenu',
        _LoadViewAllMenu.map((x) => x.serialize()).toList());
  }

  void removeFromLoadViewAllMenu(LoadViewAllStruct value) {
    LoadViewAllMenu.remove(value);
    prefs.setStringList('ff_LoadViewAllMenu',
        _LoadViewAllMenu.map((x) => x.serialize()).toList());
  }

  void removeAtIndexFromLoadViewAllMenu(int index) {
    LoadViewAllMenu.removeAt(index);
    prefs.setStringList('ff_LoadViewAllMenu',
        _LoadViewAllMenu.map((x) => x.serialize()).toList());
  }

  void updateLoadViewAllMenuAtIndex(
    int index,
    LoadViewAllStruct Function(LoadViewAllStruct) updateFn,
  ) {
    LoadViewAllMenu[index] = updateFn(_LoadViewAllMenu[index]);
    prefs.setStringList('ff_LoadViewAllMenu',
        _LoadViewAllMenu.map((x) => x.serialize()).toList());
  }

  void insertAtIndexInLoadViewAllMenu(int index, LoadViewAllStruct value) {
    LoadViewAllMenu.insert(index, value);
    prefs.setStringList('ff_LoadViewAllMenu',
        _LoadViewAllMenu.map((x) => x.serialize()).toList());
  }

  List<OrderStatusDropSheetStruct> _OrderStatusDropSheet = [];
  List<OrderStatusDropSheetStruct> get OrderStatusDropSheet =>
      _OrderStatusDropSheet;
  set OrderStatusDropSheet(List<OrderStatusDropSheetStruct> value) {
    _OrderStatusDropSheet = value;
  }

  void addToOrderStatusDropSheet(OrderStatusDropSheetStruct value) {
    OrderStatusDropSheet.add(value);
  }

  void removeFromOrderStatusDropSheet(OrderStatusDropSheetStruct value) {
    OrderStatusDropSheet.remove(value);
  }

  void removeAtIndexFromOrderStatusDropSheet(int index) {
    OrderStatusDropSheet.removeAt(index);
  }

  void updateOrderStatusDropSheetAtIndex(
    int index,
    OrderStatusDropSheetStruct Function(OrderStatusDropSheetStruct) updateFn,
  ) {
    OrderStatusDropSheet[index] = updateFn(_OrderStatusDropSheet[index]);
  }

  void insertAtIndexInOrderStatusDropSheet(
      int index, OrderStatusDropSheetStruct value) {
    OrderStatusDropSheet.insert(index, value);
  }

  String _department = '';
  String get department => _department;
  set department(String value) {
    _department = value;
  }

  DropAreaStruct _DropArea =
      DropAreaStruct.fromSerializableMap(jsonDecode('{\"DropAreaID\":\"0\"}'));
  DropAreaStruct get DropArea => _DropArea;
  set DropArea(DropAreaStruct value) {
    _DropArea = value;
  }

  void updateDropAreaStruct(Function(DropAreaStruct) updateFn) {
    updateFn(_DropArea);
  }

  int _currentDrop = 1;
  int get currentDrop => _currentDrop;
  set currentDrop(int value) {
    _currentDrop = value;
    prefs.setInt('ff_currentDrop', value);
  }

  int _firstRecord = 0;
  int get firstRecord => _firstRecord;
  set firstRecord(int value) {
    _firstRecord = value;
    prefs.setInt('ff_firstRecord', value);
  }

  int _lastRecord = 0;
  int get lastRecord => _lastRecord;
  set lastRecord(int value) {
    _lastRecord = value;
    prefs.setInt('ff_lastRecord', value);
  }

  int _dropAreaID = 0;
  int get dropAreaID => _dropAreaID;
  set dropAreaID(int value) {
    _dropAreaID = value;
    prefs.setInt('ff_dropAreaID', value);
  }

  int _lpid = 0;
  int get lpid => _lpid;
  set lpid(int value) {
    _lpid = value;
    prefs.setInt('ff_lpid', value);
  }

  int _scannedLabelPalletCount = 0;
  int get scannedLabelPalletCount => _scannedLabelPalletCount;
  set scannedLabelPalletCount(int value) {
    _scannedLabelPalletCount = value;
    prefs.setInt('ff_scannedLabelPalletCount', value);
  }

  int _palletid = 0;
  int get palletid => _palletid;
  set palletid(int value) {
    _palletid = value;
    prefs.setInt('ff_palletid', value);
  }

  bool _moveNewLocation = false;
  bool get moveNewLocation => _moveNewLocation;
  set moveNewLocation(bool value) {
    _moveNewLocation = value;
    prefs.setBool('ff_moveNewLocation', value);
  }

  GetAllPercentAndLabelCountStruct _getAllDSAndPercentCountLabel =
      GetAllPercentAndLabelCountStruct();
  GetAllPercentAndLabelCountStruct get getAllDSAndPercentCountLabel =>
      _getAllDSAndPercentCountLabel;
  set getAllDSAndPercentCountLabel(GetAllPercentAndLabelCountStruct value) {
    _getAllDSAndPercentCountLabel = value;
    prefs.setString('ff_getAllDSAndPercentCountLabel', value.serialize());
  }

  void updateGetAllDSAndPercentCountLabelStruct(
      Function(GetAllPercentAndLabelCountStruct) updateFn) {
    updateFn(_getAllDSAndPercentCountLabel);
    prefs.setString('ff_getAllDSAndPercentCountLabel',
        _getAllDSAndPercentCountLabel.serialize());
  }

  PickPalletViewStruct _PalletPickView = PickPalletViewStruct();
  PickPalletViewStruct get PalletPickView => _PalletPickView;
  set PalletPickView(PickPalletViewStruct value) {
    _PalletPickView = value;
    prefs.setString('ff_PalletPickView', value.serialize());
  }

  void updatePalletPickViewStruct(Function(PickPalletViewStruct) updateFn) {
    updateFn(_PalletPickView);
    prefs.setString('ff_PalletPickView', _PalletPickView.serialize());
  }

  SelectLabelsSingleStageStruct _SelectLabelsSingleStage =
      SelectLabelsSingleStageStruct();
  SelectLabelsSingleStageStruct get SelectLabelsSingleStage =>
      _SelectLabelsSingleStage;
  set SelectLabelsSingleStage(SelectLabelsSingleStageStruct value) {
    _SelectLabelsSingleStage = value;
    prefs.setString('ff_SelectLabelsSingleStage', value.serialize());
  }

  void updateSelectLabelsSingleStageStruct(
      Function(SelectLabelsSingleStageStruct) updateFn) {
    updateFn(_SelectLabelsSingleStage);
    prefs.setString(
        'ff_SelectLabelsSingleStage', _SelectLabelsSingleStage.serialize());
  }

  Category? _category = Category.Roll;
  Category? get category => _category;
  set category(Category? value) {
    _category = value;
    value != null
        ? prefs.setString('ff_category', value.serialize())
        : prefs.remove('ff_category');
  }

  PickPalleLoadScanStruct _pickPalletLoadScan = PickPalleLoadScanStruct();
  PickPalleLoadScanStruct get pickPalletLoadScan => _pickPalletLoadScan;
  set pickPalletLoadScan(PickPalleLoadScanStruct value) {
    _pickPalletLoadScan = value;
    prefs.setString('ff_pickPalletLoadScan', value.serialize());
  }

  void updatePickPalletLoadScanStruct(
      Function(PickPalleLoadScanStruct) updateFn) {
    updateFn(_pickPalletLoadScan);
    prefs.setString('ff_pickPalletLoadScan', _pickPalletLoadScan.serialize());
  }

  Move? _move = Move.staging;
  Move? get move => _move;
  set move(Move? value) {
    _move = value;
    value != null
        ? prefs.setString('ff_move', value.serialize())
        : prefs.remove('ff_move');
  }

  SingleLabelScanLoadStruct _singleLabelScanLoad = SingleLabelScanLoadStruct();
  SingleLabelScanLoadStruct get singleLabelScanLoad => _singleLabelScanLoad;
  set singleLabelScanLoad(SingleLabelScanLoadStruct value) {
    _singleLabelScanLoad = value;
    prefs.setString('ff_singleLabelScanLoad', value.serialize());
  }

  void updateSingleLabelScanLoadStruct(
      Function(SingleLabelScanLoadStruct) updateFn) {
    updateFn(_singleLabelScanLoad);
    prefs.setString('ff_singleLabelScanLoad', _singleLabelScanLoad.serialize());
  }

  List<LoadViewDetailsMoveStruct> _loadViewDetailsMove = [];
  List<LoadViewDetailsMoveStruct> get loadViewDetailsMove =>
      _loadViewDetailsMove;
  set loadViewDetailsMove(List<LoadViewDetailsMoveStruct> value) {
    _loadViewDetailsMove = value;
  }

  void addToLoadViewDetailsMove(LoadViewDetailsMoveStruct value) {
    loadViewDetailsMove.add(value);
  }

  void removeFromLoadViewDetailsMove(LoadViewDetailsMoveStruct value) {
    loadViewDetailsMove.remove(value);
  }

  void removeAtIndexFromLoadViewDetailsMove(int index) {
    loadViewDetailsMove.removeAt(index);
  }

  void updateLoadViewDetailsMoveAtIndex(
    int index,
    LoadViewDetailsMoveStruct Function(LoadViewDetailsMoveStruct) updateFn,
  ) {
    loadViewDetailsMove[index] = updateFn(_loadViewDetailsMove[index]);
  }

  void insertAtIndexInLoadViewDetailsMove(
      int index, LoadViewDetailsMoveStruct value) {
    loadViewDetailsMove.insert(index, value);
  }

  bool _navigateDropsheetList = false;
  bool get navigateDropsheetList => _navigateDropsheetList;
  set navigateDropsheetList(bool value) {
    _navigateDropsheetList = value;
    prefs.setBool('ff_navigateDropsheetList', value);
  }

  String _loadNumber = '';
  String get loadNumber => _loadNumber;
  set loadNumber(String value) {
    _loadNumber = value;
  }

  bool _wrapLocation = false;
  bool get wrapLocation => _wrapLocation;
  set wrapLocation(bool value) {
    _wrapLocation = value;
    prefs.setBool('ff_wrapLocation', value);
  }

  bool _rollLocation = false;
  bool get rollLocation => _rollLocation;
  set rollLocation(bool value) {
    _rollLocation = value;
    prefs.setBool('ff_rollLocation', value);
  }

  bool _partLocation = false;
  bool get partLocation => _partLocation;
  set partLocation(bool value) {
    _partLocation = value;
    prefs.setBool('ff_partLocation', value);
  }

  String _noImage =
      'https://aubimlokdfoobhczlyix.supabase.co/storage/v1/object/public/files/static/Image_not_available.png';
  String get noImage => _noImage;
  set noImage(String value) {
    _noImage = value;
    prefs.setString('ff_noImage', value);
  }

  String _barcodeNumber = '';
  String get barcodeNumber => _barcodeNumber;
  set barcodeNumber(String value) {
    _barcodeNumber = value;
    prefs.setString('ff_barcodeNumber', value);
  }

  String _driverName = '';
  String get driverName => _driverName;
  set driverName(String value) {
    _driverName = value;
    prefs.setString('ff_driverName', value);
  }

  int _LoaderID = 0;
  int get LoaderID => _LoaderID;
  set LoaderID(int value) {
    _LoaderID = value;
  }

  LoaderInfoStruct _loaderInfo = LoaderInfoStruct();
  LoaderInfoStruct get loaderInfo => _loaderInfo;
  set loaderInfo(LoaderInfoStruct value) {
    _loaderInfo = value;
  }

  void updateLoaderInfoStruct(Function(LoaderInfoStruct) updateFn) {
    updateFn(_loaderInfo);
  }

  List<DropsheetLoadersStruct> _DropsheetLoaders = [];
  List<DropsheetLoadersStruct> get DropsheetLoaders => _DropsheetLoaders;
  set DropsheetLoaders(List<DropsheetLoadersStruct> value) {
    _DropsheetLoaders = value;
  }

  void addToDropsheetLoaders(DropsheetLoadersStruct value) {
    DropsheetLoaders.add(value);
  }

  void removeFromDropsheetLoaders(DropsheetLoadersStruct value) {
    DropsheetLoaders.remove(value);
  }

  void removeAtIndexFromDropsheetLoaders(int index) {
    DropsheetLoaders.removeAt(index);
  }

  void updateDropsheetLoadersAtIndex(
    int index,
    DropsheetLoadersStruct Function(DropsheetLoadersStruct) updateFn,
  ) {
    DropsheetLoaders[index] = updateFn(_DropsheetLoaders[index]);
  }

  void insertAtIndexInDropsheetLoaders(
      int index, DropsheetLoadersStruct value) {
    DropsheetLoaders.insert(index, value);
  }

  String _location = '';
  String get location => _location;
  set location(String value) {
    _location = value;
    prefs.setString('ff_location', value);
  }

  double _loadWeight = 0.0;
  double get loadWeight => _loadWeight;
  set loadWeight(double value) {
    _loadWeight = value;
    prefs.setDouble('ff_loadWeight', value);
  }

  List<DropAreaAllStruct> _dropAreaAll = [];
  List<DropAreaAllStruct> get dropAreaAll => _dropAreaAll;
  set dropAreaAll(List<DropAreaAllStruct> value) {
    _dropAreaAll = value;
    prefs.setStringList(
        'ff_dropAreaAll', value.map((x) => x.serialize()).toList());
  }

  void addToDropAreaAll(DropAreaAllStruct value) {
    dropAreaAll.add(value);
    prefs.setStringList(
        'ff_dropAreaAll', _dropAreaAll.map((x) => x.serialize()).toList());
  }

  void removeFromDropAreaAll(DropAreaAllStruct value) {
    dropAreaAll.remove(value);
    prefs.setStringList(
        'ff_dropAreaAll', _dropAreaAll.map((x) => x.serialize()).toList());
  }

  void removeAtIndexFromDropAreaAll(int index) {
    dropAreaAll.removeAt(index);
    prefs.setStringList(
        'ff_dropAreaAll', _dropAreaAll.map((x) => x.serialize()).toList());
  }

  void updateDropAreaAllAtIndex(
    int index,
    DropAreaAllStruct Function(DropAreaAllStruct) updateFn,
  ) {
    dropAreaAll[index] = updateFn(_dropAreaAll[index]);
    prefs.setStringList(
        'ff_dropAreaAll', _dropAreaAll.map((x) => x.serialize()).toList());
  }

  void insertAtIndexInDropAreaAll(int index, DropAreaAllStruct value) {
    dropAreaAll.insert(index, value);
    prefs.setStringList(
        'ff_dropAreaAll', _dropAreaAll.map((x) => x.serialize()).toList());
  }
}

void _safeInit(Function() initializeField) {
  try {
    initializeField();
  } catch (_) {}
}

Future _safeInitAsync(Function() initializeField) async {
  try {
    await initializeField();
  } catch (_) {}
}
