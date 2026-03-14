'use client';

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";

import type { OurFileRouter } from "@/app/api/uploadthing/route";

/**
 * Custom fetch function for UploadThing.
 * Waits for Firebase Auth to initialize before sending the request.
 */
const customAuthFetcher = async (
  input: string | Request | URL,
  init?: RequestInit
): Promise<Response> => {
  const auth = getAuth();

  // Wait for Firebase Auth to finish initializing
  const user: User | null = await new Promise<User | null>((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
    } else {
      const unsubscribe = onAuthStateChanged(auth, (u) => {
        unsubscribe();
        resolve(u);
      });
    }
  });

  // If no user is logged in, proceed without a token.
  if (!user) {
    return fetch(input.toString(), init);
  }

  try {
    const token = await user.getIdToken();
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return fetch(input.toString(), { ...init, headers });
  } catch (e) {
    console.error("Error getting Firebase ID token:", e);
    return fetch(input.toString(), init);
  }
};

// Use `fetch` property instead of `fetcher` as per latest UploadThing types
export const UploadButton = generateUploadButton<OurFileRouter>({
  fetch: customAuthFetcher,
});

export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
  fetch: customAuthFetcher,
});

export type { OurFileRouter };