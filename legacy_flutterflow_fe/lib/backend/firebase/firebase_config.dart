import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

Future initFirebase() async {
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: FirebaseOptions(
            apiKey: "AIzaSyCNNjz1iDdp4Ho-K0aB4PygcFi2LrnAyPo",
            authDomain: "test-project-bh295q.firebaseapp.com",
            projectId: "test-project-bh295q",
            storageBucket: "test-project-bh295q.appspot.com",
            messagingSenderId: "86859415476",
            appId: "1:86859415476:web:bce59fb54c6e2f0fb23ce1"));
  } else {
    await Firebase.initializeApp();
  }
}
