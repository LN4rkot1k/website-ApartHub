const { Pool } = require('pg');

const pool = new Pool({
    user: 'db_project_admin',
    host: 'localhost',
    database: 'db_project',
    password: 'dbprojectadmin',
    port: 5432,
    max: 20
});

module.exports = pool;