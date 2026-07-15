// This file runs before any test files. Set env vars before app modules load.
process.env.MONGODB_URI = "mongodb://localhost:27017/ticketflow-test";
process.env.NEXTAUTH_SECRET = "test-secret-key-minimum-32-chars-long-xx";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.JWT_SECRET = "test-jwt-secret-key-minimum-32-chars-long-xx";
process.env.TICKET_HMAC_SECRET = "test-hmac-secret-key-minimum-16-chars";
