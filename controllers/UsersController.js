import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    // Check for missing email
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check for missing password
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if user already exists
      const existingUser = await dbClient.usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash password and create new user
      const hashedPassword = sha1(password);
      const result = await dbClient.usersCollection.insertOne({ email, password: hashedPassword });

      // Get the new user's ID
      const userId = result.insertedId.toString();

      // Optionally add user to queue for processing
      userQueue.add({ userId });

      // Return newly created user
      res.status(201).json({ email, id: userId });
    } catch (error) {
      console.error('Error handling user request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const { user } = req;

    res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
