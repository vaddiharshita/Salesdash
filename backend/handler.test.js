const handler = require("./handler");
describe("login", () => {
    test("Request without username and with password", async () => {
        const event = {
            body: {
                username: "",
                password: "2885",
            },
        };
        const res = await handler.login(event);
        expect(res.body).toBe('{"status":"error","Message":"username missing"}');
    });
    test("Request with username and without password", async () => {
        const event = {
            body: {
                username: "honey@123.com",
                password: "",
            },
        };
        const res = await handler.login(event);
        expect(res.body).toBe('{"status":"error","Message":"password missing"}');
    });
});


