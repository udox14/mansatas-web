import { Database } from 'better-sqlite3';

// since this is local D1, wrangler creates a local sqlite file in .wrangler/state/v3/d1
// we can find it.
console.log("Checking D1 sqlite file...");
