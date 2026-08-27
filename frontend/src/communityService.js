import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs
} from "firebase/firestore";

export const getScamType = (flags) => {
  if (!flags || flags.length === 0) return "Other Scam";
  if (flags.includes("KYC Scam")) return "KYC Fraud";
  if (flags.includes("OTP Request")) return "OTP Theft";
  if (flags.includes("Lottery Fraud")) return "Lottery Scam";
  if (flags.includes("Credential Theft")) return "Credential Theft";
  if (flags.includes("Account Threat")) return "Bank Impersonation";
  if (flags.includes("Tax Refund Scam")) return "Tax Scam";
  return "Other Scam";
};

export const saveScanToFirebase = async (scanData) => {
  try {
    if (scanData.risk_level === "danger" ||
        scanData.risk_level === "medium") {
      await addDoc(collection(db, "community_scams"), {
        risk_level: scanData.risk_level,
        risk_score: scanData.risk_score,
        flags: scanData.triggered_flags || [],
        message_preview: scanData.message
          ? scanData.message.substring(0, 80) + "..."
          : "Message scanned",
        scam_type: getScamType(scanData.triggered_flags || []),
        timestamp: serverTimestamp()
      });
    }
  } catch (err) {
    console.error("Firebase error:", err);
  }
};

export const listenToCommunityScams = (callback) => {
  const q = query(
    collection(db, "community_scams"),
    orderBy("timestamp", "desc"),
    limit(20)
  );
  return onSnapshot(q, (snapshot) => {
    const scams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    callback(scams);
  });
};

export const getCommunityStats = async () => {
  try {
    const snapshot = await getDocs(
      collection(db, "community_scams")
    );
    const docs = snapshot.docs.map(d => d.data());
    const typeCounts = {};
    docs.forEach(doc => {
      const type = doc.scam_type || "Other";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const today = new Date().toDateString();
    const todayCount = docs.filter(d => {
      if (!d.timestamp) return false;
      const date = d.timestamp.toDate ?
        d.timestamp.toDate() : new Date(d.timestamp);
      return date.toDateString() === today;
    }).length;
    return {
      total: snapshot.size,
      typeCounts,
      todayCount
    };
  } catch (err) {
    return { total: 0, typeCounts: {}, todayCount: 0 };
  }
};