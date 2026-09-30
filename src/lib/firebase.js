import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";

// ── Firebase init ────────────────────────────

export const hasFirebaseConfig = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("your_api_key")
);

if (typeof window !== "undefined") {
  if (!hasFirebaseConfig) {
    console.warn(
      "[Route:404] Firebase credentials not configured. Please add your Firebase credentials to .env.local"
    );
  } else {
    console.log(
      "[Route:404] Loaded Firebase project:",
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      "| API Key prefix:",
      (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "").substring(0, 8) + "..."
    );
  }
}

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyPlaceholderKeyForDevelopmentOnly",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "placeholder.firebaseapp.com",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "placeholder-project",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "placeholder.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db  = getFirestore(app);
export const auth = getAuth(app);

// ── Admin Auth ───────────────────────────────

export async function adminSignIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function adminSignOut() {
  return firebaseSignOut(auth);
}

export function onAdminAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

// ── Checkpoints ──────────────────────────────

export function subscribeCheckpoints(cb) {
  const q = query(collection(db, "checkpoints"), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function getCheckpoints() {
  const q = query(collection(db, "checkpoints"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createCheckpoint(data) {
  return addDoc(collection(db, "checkpoints"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateCheckpoint(id, data) {
  return updateDoc(doc(db, "checkpoints", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCheckpoint(id) {
  return deleteDoc(doc(db, "checkpoints", id));
}

// ── Teams ────────────────────────────────────

export async function createTeam(teamData) {
  return setDoc(doc(db, "teams", teamData.id), {
    ...teamData,
    createdAt: serverTimestamp(),
  });
}

export async function getTeam(teamId) {
  const snap = await getDoc(doc(db, "teams", teamId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getTeams() {
  const snap = await getDocs(collection(db, "teams"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeTeams(cb) {
  return onSnapshot(collection(db, "teams"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function updateTeamProgress(teamId, currentCheckpointIndex, completedAt) {
  const updates = { currentCheckpointIndex };
  if (completedAt) updates.completedAt = completedAt;
  return updateDoc(doc(db, "teams", teamId), updates);
}

// Team PIN auth: find team by name, verify PIN hash
export async function teamLogin(teamName, pinHash) {
  const q = query(
    collection(db, "teams"),
    where("name", "==", teamName),
    where("pinHash", "==", pinHash)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

function cleanData(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanData);
  }
  if (obj !== null && typeof obj === "object" && !(obj instanceof Date)) {
    return Object.entries(obj).reduce((acc, [k, v]) => {
      if (v !== undefined) {
        acc[k] = cleanData(v);
      }
      return acc;
    }, {});
  }
  return obj;
}

// ── Mission Packs ────────────────────────────

export async function saveMissionPack(teamId, pack) {
  return setDoc(doc(db, "missionPacks", teamId), cleanData(pack));
}

export async function getMissionPackFromFirestore(teamId) {
  const snap = await getDoc(doc(db, "missionPacks", teamId));
  if (!snap.exists()) return null;
  return snap.data();
}

// ── Completion Events ────────────────────────

export async function pushCompletionEvents(events) {
  const promises = events.map((ev) =>
    addDoc(collection(db, "completionEvents"), {
      teamId: ev.teamId,
      stationId: ev.stationId,
      timestamp: ev.timestamp,
      createdAt: serverTimestamp(),
    })
  );
  return Promise.all(promises);
}

/** Real-time subscription to all completion events */
export function subscribeCompletionEvents(cb) {
  return onSnapshot(collection(db, "completionEvents"), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/** Fetch all mission packs (for route display) */
export async function getAllMissionPacks() {
  const snap = await getDocs(collection(db, "missionPacks"));
  return snap.docs.reduce((acc, d) => {
    acc[d.id] = d.data(); // keyed by teamId
    return acc;
  }, {});
}
