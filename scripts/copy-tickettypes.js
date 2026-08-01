// Copy all ticket types from a source event to a target event.
// Run with: mongosh "<connection-string>" tixmojo_30aug copy-tickettypes.js
// or paste directly into the mongosh shell (already connected to the DB).

const SOURCE_EVENT = ObjectId('6a6da7c37903f3738c2bf0b7');
const TARGET_EVENT = ObjectId('6a6de7c57903f3738c2dc004');

// Safety: don't run twice by accident.
const existing = db.tickettypes.countDocuments({ event: TARGET_EVENT });
if (existing > 0) {
  throw new Error(
    `Target event already has ${existing} ticket type(s). Aborting to avoid duplicates. ` +
    `Delete them first if you want a clean copy.`
  );
}

const source = db.tickettypes.find({ event: SOURCE_EVENT }).toArray();
if (source.length === 0) {
  throw new Error('No ticket types found for the source event. Nothing to copy.');
}

const now = new Date();

const copies = source.map((doc) => {
  // Fresh document: strip _id, __v; re-point to the target event.
  const { _id, __v, ...rest } = doc;

  return {
    ...rest,
    event: TARGET_EVENT,

    // Reset sales / inventory state so the new event starts fresh.
    capacity: {
      ...rest.capacity,
      sold: 0,
      remaining: rest.capacity && rest.capacity.isUnlimited ? rest.capacity.remaining : rest.capacity.total,
    },
    metrics: { views: 0, addedToCart: 0, purchased: 0, revenue: 0 },

    createdAt: now,
    updatedAt: now,
  };
});

const result = db.tickettypes.insertMany(copies);
print(`Inserted ${Object.keys(result.insertedIds).length} ticket type(s) for event ${TARGET_EVENT}.`);
Object.values(result.insertedIds).forEach((id, i) => print(`  ${copies[i].name}: ${id}`));
