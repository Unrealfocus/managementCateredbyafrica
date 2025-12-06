const pgp = require('pg-promise')();

// Database configuration
const config = {
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Add SSL for production
if (process.env.NODE_ENV === 'production') {
  config.ssl = {
    rejectUnauthorized: false
  };
}

// Create database instance
const db = pgp(config);

// Test database connection
const testConnection = async () => {
  try {
    await db.one('SELECT NOW()');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = { db, testConnection };
