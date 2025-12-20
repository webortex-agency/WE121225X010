const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Assuming server.js exports the app
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken'); // If you have a utility, or inline

// Mock data from seeder
const adminCredentials = { email: 'admin@moviedist.com', password: 'Admin@123' };
const managerCredentials = { email: 'manager@moviedist.com', password: 'Manager@123', movie_id: 'MOV-2025-001' };
const wrongMovieCredentials = { email: 'manager@moviedist.com', password: 'Manager@123', movie_id: 'MOV-2025-999' };
const exhibitorCredentials = { email: 'exhibitor@moviedist.com', password: 'Exhibitor@123' };
const invalidCredentials = { email: 'invalid@test.com', password: 'wrong' };

describe('Authentication API', () => {
    beforeAll(async () => {
        // Connect to test DB if needed, or assume it's connected
        // await mongoose.connect(process.env.MONGO_URI_TEST);
    });

    afterAll(async () => {
        // await mongoose.connection.close();
    });

    describe('POST /api/auth/login', () => {
        test('Unit Test 1: Admin login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send(adminCredentials);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.role).toBe('admin');
        });

        test('Unit Test 2: Manager login with matching movie_id', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send(managerCredentials);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.role).toBe('manager');
            expect(res.body.user.assigned_movie_id).toBe('MOV-2025-001');
        });

        test('Unit Test 3: Manager login with wrong movie_id', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send(wrongMovieCredentials);

            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('error', 'You are not assigned to this movie');
        });

        test('Unit Test 4: Exhibitor login', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send(exhibitorCredentials);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.role).toBe('exhibitor');
        });

        test('Unit Test 6: Invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send(invalidCredentials);

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/refresh', () => {
        let token;

        beforeAll(async () => {
            // Get a valid token first
            const res = await request(app)
                .post('/api/auth/login')
                .send(adminCredentials);
            token = res.body.token;
        });

        test('Unit Test 5: Token refresh', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('token');
            expect(res.body.token).not.toBe(token); // New token issued
        });
    });
});
