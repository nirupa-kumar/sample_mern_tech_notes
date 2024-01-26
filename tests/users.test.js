const mongoose = require('mongoose');
const request = require('supertest');
const server = require('../server')

require("dotenv").config();
/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.DATABASE_URI);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});

describe("User flow: Happy path", () => {
    it("POST -> should create a new user", async () => {
        let res = await request(server).post("/users").send({
            "username": "Will",
            "password": "!Wd12345",
            "roles": ["Employee"],
            "active": false
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toContain("New user Will created")

        //delete user to clean up
        //get id of new User created
        res = await request(server).get("/users");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        const user = res.body.find(({ username }) => username === "Will")

        //delete user
        res = await request(server).delete("/users").send({
            "_id": user._id
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toContain("deleted")

    });

    it("GETALL -> should return all users", async () => {
        const res = await request(server).get("/users");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("PATCH -> should update user", async () => {
        let res = await request(server).patch("/users").send({
            "_id": "65b29e9afd6e6b9eb3d49de6",
            "username": "Hank",
            "roles": [
                "Employee"
            ],
            "active": false,
            "__v": 0
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Hank updated")
        // Get user record to verify update successful
        const getByIdRes = await request(server).get("/users").send({
            "_id":"65b29e9afd6e6b9eb3d49de6"
        })
        expect(getByIdRes.statusCode).toBe(200);
        expect(getByIdRes.body.active).toBeFalsy()
        // Reset user record
        res = await request(server).patch("/users").send({
            "_id": "65b29e9afd6e6b9eb3d49de6",
            "username": "Hank",
            "roles": [
                "Employee"
            ],
            "active": true,
            "__v": 0
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Hank updated")
        // Get user record to verify reset successful
        const verify = await request(server).get("/users").send({
            "_id":"65b29e9afd6e6b9eb3d49de6"
        })
        expect(verify.statusCode).toBe(200);
        expect(verify.body.active).toBeTruthy();
    });

    it("DELETE -> should delete user", async () => {
        //create new user
        let res = await request(server).post("/users").send({
            "username": "Bill",
            "password": "!Wd12345",
            "roles": ["Employee"],
            "active": false
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toContain("New user Bill created")

        //get id of new User created
        res = await request(server).get("/users");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        const user = res.body.find(({ username }) => username === "Bill")

        //delete user
        res = await request(server).delete("/users").send({
            "_id": user._id
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toContain("deleted")
    });


});
