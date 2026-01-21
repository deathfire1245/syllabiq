const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
});

const uid = "cS553vhfl0gH7bESwTvXlpDOSz83";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("✅ Admin claim set successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Error setting admin claim:", err);
    process.exit(1);
  });
