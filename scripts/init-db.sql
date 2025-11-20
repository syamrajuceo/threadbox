-- Create database
CREATE DATABASE threadbox;

-- Create user
CREATE USER threadbox WITH PASSWORD '9TPr9W0rU5jNeQo27O9CsuGQ3';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE threadbox TO threadbox;

-- Connect to the new database and grant schema privileges
\c threadbox
GRANT ALL ON SCHEMA public TO threadbox;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO threadbox;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO threadbox;

