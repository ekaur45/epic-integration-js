require("reflect-metadata");
const server = require("./app");

const PORT = process.env.PORT || 3000; // Provide a default port if not set in the environment

server.listen(PORT, () => {
    console.log(`Running at http://localhost:${PORT}`);
});
