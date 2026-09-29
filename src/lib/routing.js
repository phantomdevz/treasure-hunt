/**
 * Latin Square routing — assign a non-colliding circular route for team k.
 * Route_k[i] = sortedCheckpoints[(i + k) % N]
 *
 * With N checkpoints and N teams, no two teams occupy the same
 * checkpoint at the same step index. Works for any N — checkpoints
 * are fetched live from Firestore.
 */
export function assignRoute(teamIndex, checkpoints) {
  const sorted = [...checkpoints].sort((a, b) => a.order - b.order);
  const N = sorted.length;
  return sorted.map((_, i) => sorted[(i + teamIndex) % N].id);
}

/**
 * Returns the next k value ensuring no starting collision.
 * Wraps around modulo checkpoint count.
 */
export function nextTeamIndex(existingTeamCount, checkpointCount) {
  return existingTeamCount % checkpointCount;
}
