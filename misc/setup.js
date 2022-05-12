import dbService from '../services/db.service.js';

const run = async () => {
  console.log('Setting up database ...');
  const db = await dbService.init();

  console.log('Creating tables ...');
  await db.migrate({ migrationsPath: 'db/migrations' });

  console.log('Done!');
};

run();
