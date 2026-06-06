const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '2542006',
  database: 'edu_forum',
});
