import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db'; // Adjust the path if necessary

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    try {
      const user = await dbClient.usersCollection.findOne({ email });

      if (user) {
        res.status(400).json({ error: 'Already exist' });
        return;
      }

      const insertionInfo = await dbClient.usersCollection.insertOne({ email, password: sha1(password) });
      const userId = insertionInfo.insertedId.toString();

      userQueue.add({ userId });
      res.status(201).json({ email, id: userId });
    } catch (error) {
      console.error('Error during user creation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const { user } = req;
    res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
