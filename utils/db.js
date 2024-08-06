import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    this.client = null;
    this.db = null;
    this.usersCollection = null;
    this.filesCollection = null;
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(url, { useUnifiedTopology: true });
      this.db = this.client.db(DB_DATABASE);
      this.usersCollection = this.db.collection('users');
      this.filesCollection = this.db.collection('files');
      console.log('Connected successfully to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error.message);
      this.db = false;
    }
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    return this.usersCollection ? await this.usersCollection.countDocuments() : 0;
  }

  async nbFiles() {
    return this.filesCollection ? await this.filesCollection.countDocuments() : 0;
  }
}

const dbClient = new DBClient();
export default dbClient;
