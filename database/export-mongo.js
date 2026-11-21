// Export all MongoDB collections to JSON in database/backups/
const path = require('path');
const backendNodeModules = path.resolve(__dirname, '../backend/node_modules');
module.paths.push(backendNodeModules);

require(path.join(backendNodeModules, 'dotenv')).config({ path: path.resolve(__dirname, '../backend/.env') });
const mongoose = require(path.join(backendNodeModules, 'mongoose'));
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/labour_connect';
const backupDir = path.resolve(__dirname, 'backups');

async function exportCollections() {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionDir = path.join(backupDir, `backup_${timestamp}`);
  fs.mkdirSync(sessionDir, { recursive: true });

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to MongoDB: ${MONGODB_URI}`);

  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const col of collections) {
    const data = await mongoose.connection.db.collection(col.name).find({}).toArray();
    const filePath = path.join(sessionDir, `${col.name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`  Exported ${col.name} (${data.length} documents) -> ${filePath}`);
  }

  console.log(`\nAll collections successfully backed up to:\n${sessionDir}`);
  await mongoose.disconnect();
}

exportCollections().catch(console.error);
