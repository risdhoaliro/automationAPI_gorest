require('dotenv').config();

const request = require("supertest")(process.env.BASE_URL);
const expect = require("chai").expect;
const { use } = require('chai');
const { createUSER , userOne , updateUser , sameData , deleteUser } = require("../data/userAPI");
const AUTH = process.env.AUTH_TOKEN;

let createdUserId;

    describe("POST /public/v2/users", function () {
    it("Create user", async function () {
    const response = await request.post("/public/v2/users").set({ Authorization: AUTH }).send({
    name: createUSER.name,
    email: createUSER.email,
    gender: createUSER.gender,
    status: createUSER.status,
    });

    //-- respomse status
    expect(response.status).to.eql(201);
    //-- response data body
    console.log(response.body);

});
    it("Create user using same Data (Negative Case)", async function () {
        const response = await request
            .post("/public/v2/users")
            .set({ Authorization: AUTH })
            .send({
            name: createUSER.name,
            email: createUSER.email,
            gender: createUSER.gender,
            status: createUSER.status,
            });

        //-- response data body
        console.log(response.body);

        //-- respomse status
        if (response.statusCode > 422) {
            console.log("API response failed with status code:", response.statusCode);
            expect(response.statusCode).to.be.lessThan(422);
            } else {
            console.log("API response successful with status code:", response.statusCode);
            expect(response.statusCode).to.equal(422);
            }
    
        const userEmail = "testtoday@mail.com";
        const emailTakenMessage = response.body.find(
            (error) => error.field === "email" && error.message === "has already been taken"
        );

        if (emailTakenMessage) {
            console.log(`Email "${userEmail}" has already been taken.`);
        } else {
            console.log(`Email "${userEmail}" does not have a 'has already been taken' message.`);
        }
        });
    });

    console.log("\n");

    describe("GET /public/v2/users", function () {
    it("All User Detail", async function () {
    const response = await request.get("/public/v2/users").set({ Authorization: AUTH })
    
    //-- response data body
    console.log(response.body);

    //-- respomse status
    if (response.statusCode > 200) {
        console.log("API response failed with status code:", response.statusCode);
        expect(response.statusCode).to.be.lessThan(200);
        } else {
        console.log("API response successful with status code:", response.statusCode);
        expect(response.statusCode).to.equal(200);
        }

    // Validate each object in the array
    const expectedProperties = ['id', 'name', 'email', 'gender', 'status'];

        response.body.forEach((user) => {
    expect(user).to.be.an('object');
        expectedProperties.forEach((prop) => {
    expect(user).to.have.property(prop);
        });
    }); 

    });

    console.log("\n");

    it("My User Detail", async function () {
        this.timeout(5000)
        const response = await request.get("/public/v2/users").set({ Authorization: AUTH }).send({
        name: createUSER.name,
        email: createUSER.email,
        gender: createUSER.gender,
        status: createUSER.status,
    });
    
    //-- response data body
    console.log(response.body);
    // Save Variable ID 
    createdUserId = response.body[0].id;
    console.log("createdUserId:", createdUserId);

    //-- respomse status
    if (response.statusCode > 200) {
        console.log("API response failed with status code:", response.statusCode);
        expect(response.statusCode).to.be.lessThan(200);
        } else {
        console.log("API response successful with status code:", response.statusCode);
        expect(response.statusCode).to.equal(200);
        }

    // Validate each object in the array
    const expectedProperties = ['id', 'name', 'email', 'gender', 'status'];

        response.body.forEach((user) => {
    expect(user).to.be.an('object');
        expectedProperties.forEach((prop) => {
    expect(user).to.have.property(prop);
        });
    });    

    //-- Periksa apakah status ada atau tidak
    const userActive = "active"; 
    const statusExists = response.body.some((user) => user.status === userActive); 

    if (statusExists) {
    console.log(`Status "${userActive}" is in the response.`);
    response.body.forEach((user) => {
        if (user.status === "active") {
            const userName = user.name;
            console.log(`User "${userName}" is active.`);
        }
    });
    } else {
    console.log(`Status "${userActive}" not found in response.`);
    response.body.forEach((user) => {
        if (user.status === "inactive") {
            const userName = user.name;
            console.log(`User "${userName}" is inactive.`);
        }
    });
}   
    });

    it("Check user details using empty data (Negative Case)", async function () {
        this.timeout(5000)
        const response = await request.get("/public/v2/users").set({ Authorization: AUTH }).send({
            name: userOne.name,
            email: userOne.email,
            gender: userOne.gender,
            status: userOne.status,
        });
        
        console.log(response.body);

        //-- respomse status
        if (response.statusCode > 200) {
        console.log("API response failed with status code:", response.statusCode);
        expect(response.statusCode).to.be.lessThan(200);
        } else {
        console.log("API response successful with status code:", response.statusCode);
        expect(response.statusCode).to.equal(200);
        }

        // Memeriksa apakah data ada atau tidak
        if (Array.isArray(response.body) && response.body.length > 0) {
        console.log("Data exists in the response.");
        } else {
        console.log("Data does not exist in the response.");
        }
    });

    describe("PUT /public/v2/users", function () {
    it("Update Data User Name & Email", async function () {
    this.timeout(5000)
    const response = await request.put(`/public/v2/users/${createdUserId}`).set({ Authorization: AUTH }).send({
        name: updateUser.name,
        email: updateUser.email,
        gender: updateUser.gender,
        status: updateUser.status,
    });
    
    // -- respomse status
    if (response.statusCode > 200) {
        console.log("API response failed with status code:", response.statusCode);
        expect(response.statusCode).to.be.lessThan(200);
        } else {
        console.log("API response successful with status code:", response.statusCode);
        expect(response.statusCode).to.equal(200);
        }

    //-- response data body
    console.log(response.body);
    console.log("createdUserId:", createdUserId);

    setTimeout(function() {
        const oldName = createUSER.name;
        const updatedName = updateUser.name;
        const responseContent = response.body;
        
        if (Array.isArray(responseContent)) {
            // Handle the case where responseContent is an array
            expect(responseContent).to.be.an('array');
    
        let nameUpdated = false;
            responseContent.forEach((user) => {
                if (user.name === updatedName) {
                    nameUpdated = true;
                    console.log(`Name "${updatedName}" has been successfully updated.`);
                } else if (user.name === oldName) {
                    nameUpdated = false;
                }
            });
    
        expect(nameUpdated).to.be.true;
        } else if (typeof responseContent === 'object' && responseContent !== null) {
            expect(responseContent).to.have.property('name').equal(updatedName);
            console.log(`Name "${updatedName}" has been successfully updated.`);
        } else {
            console.error("Unexpected response format.");
        }
    }, 1000);       
});

    it("Update Data With Same Data ", async function () {

    const response = await request.put(`/public/v2/users/${createdUserId}`).set({ Authorization: AUTH }).send({
        email: sameData.email,
    });
    
    // -- respomse status
    if (response.statusCode > 200) {
        console.log("API response failed with status code:", response.statusCode);
        expect(response.statusCode).to.be.lessThan(200);
        } else {
        console.log("API response successful with status code:", response.statusCode);
        expect(response.statusCode).to.equal(200);
        }

    //-- response data body
    console.log(response.body);
    console.log("createdUserId:", createdUserId);

    setTimeout(async () => {
        const emailMessage = "has already been taken";
        const emailMessages = response.body.map((error) => error.message);
            if (emailMessages.includes(emailMessage)) {
            console.log(`Email "${emailMessage}" is in the response.`);
            } else {
            console.log(`Validation error: "${emailMessage}" not found in response.`);
            }
            done();
        }, 2000); 
    });
});

describe("Delete /public/v2/users", function () {
    it("Delete User", async function () {

    const response = await request.delete(`/public/v2/users/${createdUserId}`).set({ Authorization: AUTH }).send({
        name: deleteUser.name,
        email: deleteUser.email,
        gender: deleteUser.gender,
        status: deleteUser.status,
    });
    
    // -- respomse status
    if (response.statusCode > 204) {
        console.log("API response failed with status code:", response.statusCode);
        expect(response.statusCode).to.be.lessThan(204);
        } else {
        console.log("API response successful with status code:", response.statusCode);
        expect(response.statusCode).to.equal(204);
        }

    //-- response data body
    console.log(response.body);

    setTimeout(async () => {
        const dataMessage = "has already been taken";
        const dataMessages = response.body.map((error) => error.message);
            if (dataMessages.includes(dataMessage)) {
            console.log(`Email "${dataMessage}" is in the response.`);
            } else {
            console.log(`Validation error: "${dataMessage}" not found in response.`);
            }
            done();
        }, 2000); 
    });

    it("Check user data whether it still exists or not", async function () {

        const response = await request.delete(`/public/v2/users/${createdUserId}`).set({ Authorization: AUTH }).send({
            name: deleteUser.name,
            email: deleteUser.email,
            gender: deleteUser.gender,
            status: deleteUser.status,
        });
        
        // -- respomse status
        if (response.statusCode > 404) {
            console.log("API response failed with status code:", response.statusCode);
            expect(response.statusCode).to.be.lessThan(404);
            } else {
            console.log("API response successful with status code:", response.statusCode);
            expect(response.statusCode).to.equal(404);
            }
    
        //-- response data body
        console.log(response.body);

        setTimeout(async () => {
            const dataMessage = "has already been taken";
            const dataMessages = response.body.map((error) => error.message);
                if (dataMessages.includes(dataMessage)) {
                console.log(`Email "${dataMessage}" is in the response.`);
                } else {
                console.log(`Validation error: "${dataMessage}" not found in response.`);
                }
                done();
            }, 2000); 
        });
    });
});