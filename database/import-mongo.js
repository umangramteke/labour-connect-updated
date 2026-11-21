// Import MongoDB collections from JSON in database/backups/<backup_folder>
const path = require('path');
const backendNodeModules = path.resolve(__dirname, '../backend/node_modules');
module.paths.push(backendNodeModules);

require(path.join(backendNodeModules, 'dotenv')).config({ path: path.resolve(__dirname, '../backend/.env') });
const mongoose = require(path.join(backendNodeModules, 'mongoose'));
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/labour_connect';
const targetDir = process.argv[2];

if (!targetDir || !fs.existsSync(targetDir)) {
  console.error("Usage: node database/import-mongo.js <path_to_backup_folder>");
  process.exit(1);
}

async function importCollections() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB: ${MONGODB_URI}`);

  const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const colName = path.basename(file, '.json');
    const fullPath = path.join(targetDir, file);
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    const collection = mongoose.connection.db.collection(colName);
    await collection.deleteMany({});
    if (content.length > 0) {
      await collection.insertMany(content);
    }
    console.log(`  Restored ${colName} (${content.length} documents) from ${file}`);
  }

  console.log(`\nAll collections restored successfully!`);
  await mongoose.disconnect();
}

importCollections().catch(console.error);
