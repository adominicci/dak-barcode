import 'package:collection/collection.dart';

enum Location {
  Roll,
  Wrap,
  Parts,
}

enum PalletScan {
  IsPallet,
  IsLabel,
  APIError,
  DoesNotBelong,
}

enum Category {
  Roll,
  Wrap,
  Parts,
}

enum Move {
  staging,
  Loading,
}

extension FFEnumExtensions<T extends Enum> on T {
  String serialize() => name;
}

extension FFEnumListExtensions<T extends Enum> on Iterable<T> {
  T? deserialize(String? value) =>
      firstWhereOrNull((e) => e.serialize() == value);
}

T? deserializeEnum<T>(String? value) {
  switch (T) {
    case (Location):
      return Location.values.deserialize(value) as T?;
    case (PalletScan):
      return PalletScan.values.deserialize(value) as T?;
    case (Category):
      return Category.values.deserialize(value) as T?;
    case (Move):
      return Move.values.deserialize(value) as T?;
    default:
      return null;
  }
}
