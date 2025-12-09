/**
 * Test Database Connection
 * Chạy script này để kiểm tra kết nối database trước khi deploy
 * 
 * Usage:
 * node scripts/test_db_connection.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  };

  console.log('📋 Connection Config:');
  console.log(`   Host: ${config.host}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Port: ${config.port}`);
  console.log('');

  try {
    console.log('⏳ Connecting...');
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Connected successfully!\n');

    // Test query
    console.log('🔍 Testing query...');
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Query successful:', rows);
    console.log('');

    // Check tables
    console.log('📊 Checking tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    console.log('');

    // Check products count
    try {
      const [products] = await connection.query('SELECT COUNT(*) as count FROM SanPham');
      console.log(`📦 Products in database: ${products[0].count}`);
    } catch (err) {
      console.log('⚠️  Could not count products:', err.message);
    }

    await connection.end();
    console.log('\n✅ Database connection test PASSED!');
    console.log('🚀 Ready to deploy!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection FAILED!');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check .env file exists and has correct values');
    console.error('   2. Verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    console.error('   3. Make sure database server is accessible');
    console.error('   4. Check firewall/network settings');
    console.error('');
    
    process.exit(1);
  }
}

testConnection();
