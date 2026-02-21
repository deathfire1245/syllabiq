import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createRouteHandler } from "uploadthing/next";
import admin from "firebase-admin";

export const runtime = "nodejs";

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.log("Firebase Admin SDK: Using local service account.");
    const serviceAccount = require("../../../../serviceAccountKey.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

// Helper: Verify Firebase ID Token
const getUser = async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split("Bearer ")[1];
  if (!token) return null;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return null;
  }
};

const f = createUploadthing();

export const ourFileRouter = {
  // 👤 Profile pictures (any authenticated user)
  profileUploader: f({
    image: { maxFileSize: "2MB" },
  })
    .middleware(async ({ req }) => {
      const user = await getUser(req);
      if (!user) throw new Error("Unauthorized: Please log in.");
      return { userId: user.uid };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile pic uploaded:", file.url);
      return { url: file.url, key: file.key, userId: metadata.userId };
    }),

  // 📚 Course PDF uploader (Admin + Teacher only)
  coursePdfUploader: f({
    pdf: { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      const user = await getUser(req);
      if (!user)
        throw new Error("Unauthorized: No valid Firebase token provided.");

      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(user.uid)
        .get();
      if (!userDoc.exists)
        throw new Error("Unauthorized: User profile not found.");

      const role = userDoc.data()?.role as "admin" | "teacher" | undefined;
      if (role !== "admin" && role !== "teacher")
        throw new Error(
          "Forbidden: Only admins or teachers can upload course PDFs."
        );

      return { userId: user.uid, role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Course PDF uploaded:", file.url);
      return {
        url: file.url,
        key: file.key,
        uploadedBy: metadata.userId,
        role: metadata.role,
        size: file.size,
      };
    }),

  // 🎬 Course Video uploader (Admin + Teacher only)
  courseVideoUploader: f({
    video: { maxFileSize: "512MB" }, // safe for 2GB tier, TS enum-safe
  })
    .middleware(async ({ req }) => {
      const user = await getUser(req);
      if (!user)
        throw new Error("Unauthorized: No valid Firebase token provided.");

      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(user.uid)
        .get();
      if (!userDoc.exists)
        throw new Error("Unauthorized: User profile not found.");

      const role = userDoc.data()?.role as "admin" | "teacher" | undefined;
      if (role !== "admin" && role !== "teacher")
        throw new Error(
          "Forbidden: Only admins or teachers can upload course videos."
        );

      return { userId: user.uid, role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Course video uploaded:", file.url);
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