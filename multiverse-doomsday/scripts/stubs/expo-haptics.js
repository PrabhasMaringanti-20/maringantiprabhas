// Records haptic pulses so the fallback tick can be observed in Node.
const calls = { selection: 0, impact: 0 };
module.exports = {
  __calls: calls,
  selectionAsync: () => { calls.selection += 1; return Promise.resolve(); },
  impactAsync: () => { calls.impact += 1; return Promise.resolve(); },
  notificationAsync: () => Promise.resolve(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'ok', Error: 'err', Warning: 'warn' },
};
