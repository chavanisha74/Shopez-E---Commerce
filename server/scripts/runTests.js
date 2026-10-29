const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = require('../app');
const { connectDB, closeDB } = require('../config/db');

async function main() {
  console.log('[Runner] Connecting DB & Launching Server for Verification...');
  await connectDB();

  const server = app.listen(5000, async () => {
    console.log('[Runner] Test Server listening on http://localhost:5000');

    try {
      // Execute test suite logic
      require('./testSuite');
    } catch (err) {
      console.error('[Runner] Error running tests:', err);
      server.close();
      process.exit(1);
    }
  });
}

main();
