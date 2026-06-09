/**
 * safeStorage — localStorage wrapper that never throws.
 * All read errors return the defaultValue.
 * All write errors fail silently.
 */

export function storageGet(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// Typed helpers for common app keys
export const getUser    = ()      => storageGet("nw_user", {});
export const saveUser   = (data)  => storageSet("nw_user", data);
export const clearUser  = ()      => storageRemove("nw_user");

export const getSelectedTrack  = ()     => storageGet("nw_selected_track", null);
export const saveSelectedTrack = (id)   => storageSet("nw_selected_track", id);

export const getMilestones  = (trackId)       => storageGet(`nw_milestones_${trackId}`, null);
export const saveMilestones = (trackId, done) => storageSet(`nw_milestones_${trackId}`, done);