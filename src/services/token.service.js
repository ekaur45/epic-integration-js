const axios = require('axios');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { AppDataSource } = require('../utils/ormconfig');
const AccessToken = require('../models/entities/access-token.entity');
const TokenResponseModel = require('../models/dto/token-response.model');

class TokenService {
    async generateToken() {
        let privateKey = require("fs").readFileSync(require("path").join(__dirname,"..","../keys/epic.pem")).toString("utf-8");        
        const tokenUrl = process.env.EPIC_TOKEN_URL;
        const header = {
            alg: "RS384",
            typ: "JWT",
            kid: process.env.EPIC_KID,
            jku: process.env.EPIC_JKU
        };

        const payload = {
            iss: process.env.EPIC_CLIENT_ID,
            sub: process.env.EPIC_CLIENT_ID,
            aud: tokenUrl,
            exp: Math.floor(Date.now() / 1000) + 200,
            jti: uuidv4()
        };

        const token = jwt.sign(payload, privateKey, {
            algorithm: "RS384",
            header: header
        });

        const formData = new URLSearchParams({
            client_assertion: token,
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            grant_type: 'client_credentials'
        });

        const result = await axios.post(tokenUrl, formData, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        const tokenModel = new TokenResponseModel(result.data);
        await AppDataSource.getRepository(AccessToken).create(tokenModel);
        return result.data;
    }

    async getAccessTokenFromDb() {
        let tokenModel = await AppDataSource.getRepository(AccessToken).findOne({ order: { createdAt: "DESC" } });

        if (!tokenModel || !tokenModel.accessToken) {
            await this.generateToken();
        }

        const createdAt = tokenModel?.createdAt.getTime();
        const expiresIn = 3600 * 1000;
        const currentTime = Date.now();
        const isExpired = currentTime > (createdAt ?? 99999 + expiresIn);

        // if (isExpired) {
        //     await this.generateToken();
        // }

        tokenModel = await AppDataSource.getRepository(AccessToken).findOne({ order: { createdAt: "DESC" } });
        return tokenModel?.accessToken;
    }

    async renewToken() {
        await this.getAccessTokenFromDb();
    }
}

module.exports = TokenService;
