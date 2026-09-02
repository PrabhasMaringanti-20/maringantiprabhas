import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

/**
 * Which bundle is actually running.
 *
 * Two rounds were lost to not knowing whether a fix had reached the device —
 * identical symptoms could mean "the fix failed" or "the fix never arrived",
 * and those need opposite responses. This puts the answer on screen.
 */
export function buildStamp(): { label: string; detail: string } {
  // Updates.runtimeVersion is null outside a built app (and on web), so fall
  // back to the configured version rather than printing an empty label.
  const runtime = Updates.runtimeVersion || Constants.expoConfig?.version || '—';
  const channel = Updates.channel ?? 'embedded';

  if (Updates.isEmbeddedLaunch || !Updates.updateId) {
    return {
      label: `Build ${runtime} · bundled`,
      detail: `${channel} · no update downloaded yet`,
    };
  }

  // The first segment of the UUID is enough to tell two updates apart.
  const short = Updates.updateId.split('-')[0];
  const created = Updates.createdAt
    ? new Date(Updates.createdAt).toISOString().slice(0, 16).replace('T', ' ')
    : 'unknown time';

  return {
    label: `Build ${runtime} · ${short}`,
    detail: `${channel} · published ${created} UTC`,
  };
}
