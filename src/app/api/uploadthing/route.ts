
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createRouteHandler } from "uploadthing/next";
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// This ensures it's initialized only once in a serverless environment.
if (!admin.apps.length) {
    try {
        // In a deployed environment, use environment variables for security.
        // It's assumed FIREBASE_SERVICE_ACCOUNT_KEY is set in your hosting environment.
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        // For local development, fall back to the serviceAccountKey.json file at the project root.
        console.log('Firebase Admin SDK: Initializing with local service account file.');
        const serviceAccount = require('../../../../serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
}


const f = createUploadthing();

// Helper function to get user from request via Firebase ID Token
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


// -----------------------
// Define File Routes
// -----------------------
export const ourFileRouter = {

  // 👤 Profile pictures (for any authenticated user)
  profileUploader: f({
    image: { maxFileSize: "2MB" },
  })
    .middleware(async ({ req }) => {
      const user = await getUser(req);

      if (!user) {
        throw new Error("Unauthorized");
      }

      return { userId: user.uid };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile pic uploaded:", file.url);
      return { url: file.url, key: file.key, userId: metadata.userId };
    }),

  // 📚 Course PDF uploader (Admin + Teacher only)
  coursePdfUploader: f({
    pdf: { maxFileSize: "20MB" }, // Keep reasonable for 2GB free tier
  })
    .middleware(async ({ req }) => {
      const user = await getUser(req);

      if (!user) {
        throw new Error("Unauthorized: No user token provided.");
      }

      // Role check via Firestore document lookup for consistency with your security rules.
      const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        throw new Error("Unauthorized: User profile not found.");
      }
      
      const role = userDoc.data()?.role;

      if (role !== "admin" && role !== "teacher") {
        throw new Error("Forbidden: Only admins or teachers can upload course files.");
      }

      return { userId: user.uid, role: role as string };
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

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// -----------------------
// Export route handler
// -----------------------
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
