// src/utils/dashboardEvents.js

// Fungsi untuk trigger update dashboard
export const triggerDataUpdate = () => {
  document.dispatchEvent(new CustomEvent('dashboardDataUpdated'));
};

// Fungsi untuk subscribe ke update events
export const subscribeToDataUpdates = (callback) => {
  const handler = () => callback();
  document.addEventListener('dashboardDataUpdated', handler);
  return () => document.removeEventListener('dashboardDataUpdated', handler);
};