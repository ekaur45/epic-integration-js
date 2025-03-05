const { ObjectId } = require("mongodb");

class TokenResponseModel {
    constructor(obj) {
        this.accessToken = obj.access_token;
        this.tokenType = obj.token_type;
        this.expiresIn = obj.expires_in;
        this.scope = obj.scope;
        this.createdAt = new Date();
    }
}

module.exports = TokenResponseModel;
