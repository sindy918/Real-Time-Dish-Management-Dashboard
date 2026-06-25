const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

async function ensureDatabaseExists() {
  const dbName = process.env.DB_NAME || 'dish_dashboard';
  console.log(`Checking if database "${dbName}" exists...`);

  // Connect to the default 'postgres' database first to check/create the target database
  const client = new Client({
    ...dbConfig,
    database: 'postgres',
  });

  try {
    await client.connect();
    
    // Check if database exists
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" not found. Creating it now...`);
      // CREATE DATABASE cannot be executed inside a transaction block, so we run it directly
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error('Error ensuring database exists:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function seed() {
  const dbName = process.env.DB_NAME || 'dish_dashboard';
  
  try {
    // 1. Ensure database exists
    await ensureDatabaseExists();

    // 2. Connect to the actual target database
    console.log(`Connecting to database "${dbName}" for seeding...`);
    const client = new Client({
      ...dbConfig,
      database: dbName,
    });
    await client.connect();

    // 3. Read and run schema.sql
    console.log('Applying schema from schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('Schema applied successfully.');

    // 4. Read dishes.json
    console.log('Loading seed data from dishes.json...');
    const dishesPath = path.join(__dirname, 'dishes.json');
    const dishes = JSON.parse(fs.readFileSync(dishesPath, 'utf8'));

    // 5. Insert dishes
    console.log(`Seeding ${dishes.length} dishes into the database...`);
    for (const dish of dishes) {
      const query = `
        INSERT INTO dishes (dish_id, dish_name, image_url, is_published)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (dish_id) DO UPDATE
        SET dish_name = EXCLUDED.dish_name,
            image_url = EXCLUDED.image_url,
            is_published = EXCLUDED.is_published;
      `;
      await client.query(query, [
        dish.dish_id,
        dish.dish_name,
        dish.image_url,
        dish.is_published,
      ]);
    }

    console.log('Seeding completed successfully!');
    await client.end();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
