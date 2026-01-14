import { createUploadthing, type FileRouter } from "uploadthing/next";

// Create UploadThing instance
const f = createUploadthing();

// -----------------------
// Define File Routes
// -----------------------
export const ourFileRouter = {
  // 👤 Profile pictures only
  profileUploader: f({
    image: { maxFileSize: "2MB" }, // limit to 2MB
  }).onUploadComplete(async ({ file }) => {
    console.log("Profile pic uploaded:", file.url);
    return { url: file.url, key: file.key };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// -----------------------
// Export route handler
// -----------------------
import { createRouteHandler } from "uploadthing/next";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
