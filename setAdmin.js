const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
});

const uid = "j7MQoPFUW4Ym7y0ZWSNnBbLO0dS2";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("✅ Admin claim set successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Error setting admin claim:", err);
    process.exit(1);
  });
