import { db } from "../lib/firebase";
import { collection, query, getDocs, limit, doc, getDoc } from "firebase/firestore";
import { Collection } from "../types";

export const getFeaturedCollections = async (): Promise<Collection[]> => {
  try {
    const q = query(collection(db, "collections"), limit(6));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
  } catch (error) {
    console.error("Error fetching featured collections:", error);
    return [];
  }
};

export const getCollectionDetails = async (collectionId: string) => {
  try {
    const collRef = doc(db, 'collections', collectionId);
    const collSnap = await getDoc(collRef);
    if (!collSnap.exists()) return null;
    
    return { id: collSnap.id, ...collSnap.data() } as Collection;
  } catch (error) {
    console.error("Error fetching collection details:", error);
    return null;
  }
};
