const { EntitySchema } = require("typeorm");

const AccessToken = new EntitySchema({
    name: "AccessToken",
    tableName: "access_token",
    columns: {
        _id: {
            type:  process.env.DB_TYPE === "mongodb" ? "objectId" : "uuid",
            primary: true,
            generated: true, // MongoDB will automatically generate `_id`
        },
        accessToken: {
            type: "string",
            nullable: false,
        },
        tokenType: {
            type: "string",
            nullable: false,
        },
        expiresIn: {
            type: "int",
            nullable: false,
        },
        scope: {
            type: "string",
            nullable: false,
        },
        createdAt: {
            type: "timestamp",
            createDate: true, // Automatically set timestamp
        },
    },
});

module.exports = AccessToken;
