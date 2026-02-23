'use client';

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { getAuth } from "firebase/auth";

import type { OurFileRouter } from "@/app/api/uploadthing/route";

/**
 * This is a custom fetcher function that intercepts UploadThing's upload requests.
 * Its purpose is to get the current Firebase user's ID token and inject it into
 * the 'Authorization' header, so the server-side middleware can validate the user.
 * @param url The original URL for the upload request.
 * @param opts The original fetch options.
 * @returns A new fetch promise with the added Authorization header.
 */
const customAuthFetcher = async (url: string, opts?: any) => {
  const auth = getAuth();
  const user = auth.currentUser;

  // If no user is logged in, proceed without a token.
  // The server middleware is expected to reject this request.
  if (!user) {
    return fetch(url, opts);
  }

  try {
    // Get the Firebase ID token for the current user.
    const token = await user.getIdToken();

    // Create new headers and add the Authorization token.
    const headers = new Headers(opts?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    // Return a new fetch call with the updated headers.
    return fetch(url, {
      ...opts,
      headers,
    });
  } catch (e) {
    console.error("Error getting Firebase ID token:", e);
    // If there's an error getting the token, proceed without it.
    return fetch(url, opts);
  }
};


// We re-generate the UploadButton and UploadDropzone components,
// this time providing our custom fetcher logic. Any component in your app
// that imports these will now automatically handle Firebase auth for uploads.
export const UploadButton = generateUploadButton<OurFileRouter>({
  fetcher: customAuthFetcher,
});

export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
  fetcher: customAuthFetcher,
});

export type { OurFileRouter };
