const { MongoClient, Collection } = require("mongodb");
const logger = require("./logger");

/**
 * 
 * @param {*} collectionName 
 * @returns  {Collection}
 */
async function getCollection(collectionName) {
    const uri = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`; // Default URI as fallback
    const client = new MongoClient(uri); // Add options if needed
    
    try {
        await client.connect(); // Wait for connection
        const db = client.db(process.env.MONGO_DATABASE);
        return db.collection(collectionName);
    } catch (error) {
        logger.error('Failed to connect to MongoDB:', error)
        throw error;
    }
}
module.exports = {getCollection};