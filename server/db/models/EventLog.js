export async function logEvent(event) {
  global.eventStore = global.eventStore || [];
  global.eventStore.push({ eventId: event.id, type: event.type, created: event.created, processed: false });
}

export async function markProcessed(eventId) {
  const event = global.eventStore.find(e => e.eventId === eventId);
  if (event) event.processed = true;
}

export async function isProcessed(eventId) {
  return global.eventStore?.some(e => e.eventId === eventId && e.processed);
}
