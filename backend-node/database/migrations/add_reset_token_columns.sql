-- Add password reset functionality columns to users table
-- Run this migration to add password reset support

-- The reset_token column already exists, add only the expiry column
ALTER TABLE users 
ADD COLUMN reset_token_expiry DATETIME NULL;

-- Create index for faster token lookup
CREATE INDEX idx_users_reset_token ON users(reset_token);

-- Create index for expiry cleanup
CREATE INDEX idx_users_reset_token_expiry ON users(reset_token_expiry);
