import Dexie from "dexie";

export class NexusHuntDB extends Dexie {
  constructor() {
    super("NexusHuntDB");
    this.version(1).stores({
      completionQueue: "++id, teamId, synced",
      missionPacks: "teamId",
      teamSessions: "teamId",
    });
  }
}

export const db = new NexusHuntDB();

// ── Completion queue ─────────────────────────

export async function queueCompletion(event) {
  await db.completionQueue.add({ ...event, synced: false });
}

export async function getUnsyncedEvents() {
  return db.completionQueue.where("synced").equals(0).toArray();
}

export async function markSynced(ids) {
  await db.completionQueue.bulkUpdate(
    ids.map((id) => ({ key: id, changes: { synced: true } }))
  );
}

// ── Mission packs ────────────────────────────

export async function saveMissionPack(pack) {
  await db.missionPacks.put(pack);
}

export async function getMissionPack(teamId) {
  return db.missionPacks.get(teamId);
}

// ── Team session (auth) ──────────────────────

export async function saveTeamSession(session) {
  await db.teamSessions.put(session);
}

export async function getTeamSession(teamId) {
  return db.teamSessions.get(teamId);
}

export async function clearTeamSession(teamId) {
  await db.teamSessions.delete(teamId);
}

export async function getActiveSession() {
  const all = await db.teamSessions.toArray();
  return all[0] || null;
}
