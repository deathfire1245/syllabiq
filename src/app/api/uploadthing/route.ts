import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createRouteHandler } from "uploadthing/next";
import admin from "firebase-admin";

export const runtime = "nodejs";

console.log("🚀 UploadThing route.ts loaded");

// ================================
// 🔥 Firebase Admin Initialization
// ================================
if (!admin.apps.length) {
  try {
    console.log("🔧 Initializing Firebase Admin from ENV variable...");
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin initialized from ENV");
  } catch (e) {
    console.log("⚠️ ENV init failed. Falling back to local serviceAccountKey.json");
    try {
      const serviceAccount = require("../../../../serviceAccountKey.json");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin initialized from local file");
    } catch (err) {
      console.error("🔥 Firebase Admin initialization FAILED:", err);
    }
  }
} else {
  console.log("ℹ️ Firebase Admin already initialized");
}

// ================================
// 🔐 Helper: Verify Firebase ID Token
// ================================
const getUser = async (req: Request) => {
  const authHeader = req.headers.get("authorization");

  console.log("📥 Authorization Header:", authHeader);

  if (!authHeader?.startsWith("Bearer ")) {
    console.log("❌ No Bearer token found in header");
    return null;
  }

  const token = authHeader.split("Bearer ")[1];

  if (!token) {
    console.log("❌ Bearer token empty");
    return null;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Token verified. UID:", decodedToken.uid);
    return decodedToken;
  } catch (error) {
    console.error("🔥 Firebase token verification failed:", error);
    return null;
  }
};

const f = createUploadthing();

// ================================
// 📁 Upload Router
// ================================
export const ourFileRouter = {
  // 👤 Profile uploader
  profileUploader: f({
    image: { maxFileSize: "2MB" },
  })
    .middleware(async ({ req }) => {
      console.log("===== PROFILE UPLOAD START =====");

      const user = await getUser(req);

      if (!user) {
        console.log("❌ Profile upload unauthorized");
        throw new Error("Unauthorized: Please log in.");
      }

      console.log("✅ Profile upload authorized:", user.uid);
      console.log("===== PROFILE UPLOAD END =====");

      return { userId: user.uid };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("📸 Profile pic uploaded:", file.url);
      return { url: file.url, key: file.key, userId: metadata.userId };
    }),

  // 📚 Course PDF uploader (Admin + Teacher only)
  coursePdfUploader: f({
    pdf: { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      console.log("===== PDF UPLOAD START =====");

      const user = await getUser(req);

      if (!user) {
        console.log("❌ No valid Firebase token provided");
        throw new Error("Unauthorized: No valid Firebase token provided.");
      }

      console.log("🔎 Fetching Firestore doc for UID:", user.uid);

      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(user.uid)
        .get();

      console.log("📄 UserDoc exists:", userDoc.exists);

      if (!userDoc.exists) {
        console.log("❌ User profile not found in Firestore");
        throw new Error("Unauthorized: User profile not found.");
      }

      const role = userDoc.data()?.role;
      console.log("🎭 Role from Firestore:", role);

      if (role !== "admin" && role !== "teacher") {
        console.log("❌ Role validation failed");
        throw new Error(
          "Forbidden: Only admins or teachers can upload course PDFs."
        );
      }

      console.log("✅ PDF Middleware Passed");
      console.log("===== PDF UPLOAD END =====");

      return { userId: user.uid, role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("📘 Course PDF uploaded:", file.url);
      return {
        url: file.url,
        key: file.key,
        uploadedBy: metadata.userId,
        role: metadata.role,
        size: file.size,
      };
    }),

  // 🎬 Course Video uploader
  courseVideoUploader: f({
    video: { maxFileSize: "512MB" },
  })
    .middleware(async ({ req }) => {
      console.log("===== VIDEO UPLOAD START =====");

      try {
        const user = await getUser(req);

        if (!user) {
          console.log("❌ No valid Firebase token");
          throw new Error("Unauthorized: No valid Firebase token");
        }

        console.log("🔎 Fetching Firestore doc for UID:", user.uid);

        const userDoc = await admin
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get();

        console.log("📄 UserDoc exists:", userDoc.exists);

        if (!userDoc.exists) {
          console.log("❌ User document not found");
          throw new Error("User document not found in Firestore");
        }

        const role = userDoc.data()?.role;
        console.log("🎭 Role from Firestore:", role);

        if (!role) {
          console.log("❌ Role field missing");
          throw new Error("Role field missing in user document");
        }

        if (role !== "admin" && role !== "teacher") {
          console.log("❌ Role not authorized:", role);
          throw new Error(`Forbidden: Role is "${role}"`);
        }

        console.log("✅ Video Middleware Passed");
        console.log("===== VIDEO UPLOAD END =====");

        return { userId: user.uid, role };
      } catch (err) {
        console.error("🚨 UploadThing Video Middleware Error:", err);
        throw err;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("🎬 Course video uploaded:", file.url);
      return {
        url: file.url,
        key: file.key,
        uploadedBy: metadata.userId,
        role: metadata.role,
        size: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});