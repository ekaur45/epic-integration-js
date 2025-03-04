const { Response } = require("express");
const ResponseModel = require("../models/dto/response.model.js");

const extendResponse = (req, res, next) => {
    res.InternalServerError = (Data, Message = "Internal Server Error") => {
        const response = new ResponseModel();
        response.status = 500;
        response.message = Message;
        response.data = Data;
        res.status(500).send(response);
    };

    res.NotFound = (Data, Message = "Not Found") => {
        const response = new ResponseModel();
        response.status = 404;
        response.message = Message;
        response.data = Data;
        res.status(404).send(response);
    };

    res.UnAuthorized = (Data, Message = "Unauthorized") => {
        const response = new ResponseModel();
        response.status = 401;
        response.message = Message;
        response.data = Data;
        res.status(401).send(response);
    };

    res.BadRequest = (Data, Message = "Bad Request") => {
        const response = new ResponseModel();
        response.status = 400;
        response.message = Message;
        response.data = Data;
        res.status(400).send(response);
    };

    res.Ok = (Data, Message = "Success") => {
        const response = new ResponseModel();
        response.status = 200;
        response.message = Message;
        response.data = Data;
        res.status(200).send(response);
    };

    next();
};

module.exports = extendResponse;
