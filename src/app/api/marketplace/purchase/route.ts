import { NextResponse } from "next/server";
import admin from "firebase-admin";

export const runtime = "nodejs";

// Firebase Admin Initialization
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (e) {
    try {
      const serviceAccount = require("../../../../../serviceAccountKey.json");
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (err) {
      console.error("Firebase Admin init failed:", err);
    }
  }
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const body = await req.json();
    const { productId, deliveryInfo } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    const db = admin.firestore();
    const productRef = db.collection("products").doc(productId);
    const userRef = db.collection("users").doc(decodedToken.uid);

    const result = await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      const userDoc = await transaction.get(userRef);

      if (!productDoc.exists) throw new Error("Product not found");
      if (!userDoc.exists) throw new Error("User profile not found");

      const product = productDoc.data()!;
      const user = userDoc.data()!;

      // Stock check
      if (product.stock !== null && product.stock <= 0) {
        throw new Error("Product is out of stock");
      }

      // Decrement stock if physical
      if (product.category === "physical" && product.stock !== null) {
        transaction.update(productRef, {
          stock: product.stock - 1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      const orderRef = db.collection("productOrders").doc();
      const orderPayload = {
        productId,
        productTitle: product.title,
        productCategory: product.category,
        fileUrl: product.fileUrl || "",
        buyerId: decodedToken.uid,
        buyerRole: user.role,
        amount: product.price,
        status: "PAID",
        deliveryInfo: deliveryInfo || {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.set(orderRef, orderPayload);
      return orderRef.id;
    });

    return NextResponse.json({ success: true, orderId: result });
  } catch (error: any) {
    console.error("Purchase API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
