// Stands in for an older binary: the JS ships in the bundle, but asking for
// the native module throws. This is exactly what an OTA update lands on.
throw new Error("Cannot find native module 'ExpoAudio'");
