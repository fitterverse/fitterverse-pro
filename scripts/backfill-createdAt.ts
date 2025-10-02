import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";

// Use GOOGLE_APPLICATION_CREDENTIALS or direct cert path
const svcPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!svcPath || !fs.existsSync(svcPath)) {
  throw new Error("Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.");
}

initializeApp({
  credential: applicationDefault() // or: cert(require(svcPath))
});

const adminDb = getFirestore();

async function main() {
  const snap = await adminDb.collection("user_habits").get();
  const batch = adminDb.batch();

  snap.forEach((doc) => {
    const data = doc.data();
    if (!data.createdAt) {
      batch.update(doc.ref, { createdAt: FieldValue.serverTimestamp() });
    }
  });

  await batch.commit();
  console.log("Backfill done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
