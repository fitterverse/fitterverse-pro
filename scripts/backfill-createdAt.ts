import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

async function main() {
  const app = initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
  });
  const db = getFirestore(app);

  const snap = await db.collection("user_habits").get();
  let updated = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.createdAt) {
      await doc.ref.update({ createdAt: Timestamp.now() });
      updated++;
    }
  }

  console.log(`Backfill complete. Updated ${updated} docs.`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
