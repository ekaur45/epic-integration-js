const { Router } = require("express");
const epicRouter = require("./epic.router");

const apiRouter = Router();

apiRouter.get('/get-status', (req, res) => {
    res.send("Working....");
});

apiRouter.use('/epic', epicRouter);

module.exports = apiRouter;
