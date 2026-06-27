import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";

export const updateEngagementScore = async (userId: string, points: number) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    fanEngagementScore: increment(points),
  });
};
