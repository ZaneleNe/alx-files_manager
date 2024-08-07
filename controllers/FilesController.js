import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

class FilesController {
    static async postUpload(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, type, parentId = 0, isPublic = false, data } = req.body;

        if (!name) return res.status(400).json({ error: 'Missing name' });
        if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
        if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

        if (parentId) {
            const parentFile = await dbClient.db.collection('files').findOne({ _id: parentId });
            if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
            if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
        }

        let localPath;
        if (type !== 'folder') {
            localPath = path.join(process.env.FOLDER_PATH || '/tmp/files_manager', uuidv4());
            fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
        }

        const newFile = {
            userId,
            name,
            type,
            isPublic,
            parentId,
            localPath: type !== 'folder' ? localPath : undefined,
        };

        const result = await dbClient.db.collection('files').insertOne(newFile);
        res.status(201).json({ id: result.insertedId, ...newFile });
    }

    static async getIndex(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { parentId = 0, page = 0 } = req.query;
        const files = await dbClient.db.collection('files')
            .find({ userId, parentId })
            .skip(page * 20)
            .limit(20)
            .toArray();

        res.status(200).json(files);
    }

    static async getShow(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const fileId = req.params.id;
        const file = await dbClient.db.collection('files').findOne({ _id: fileId, userId });
        if (!file) return res.status(404).json({ error: 'Not found' });

        res.status(200).json(file);
    }

    static async putPublish(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const fileId = req.params.id;
        const file = await dbClient.db.collection('files').findOne({ _id: fileId, userId });
        if (!file) return res.status(404).json({ error: 'Not found' });

        await dbClient.db.collection('files').updateOne({ _id: fileId }, { $set: { isPublic: true } });
        const updatedFile = await dbClient.db.collection('files').findOne({ _id: fileId });
        res.status(200).json(updatedFile);
    }

    static async putUnpublish(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const fileId = req.params.id;
        const file = await dbClient.db.collection('files').findOne({ _id: fileId, userId });
        if (!file) return res.status(404).json({ error: 'Not found' });

        await dbClient.db.collection('files').updateOne({ _id: fileId }, { $set: { isPublic: false } });
        const updatedFile = await dbClient.db.collection('files').findOne({ _id: fileId });
        res.status(200).json(updatedFile);
    }

    static async getFile(req, res) {
        const token = req.headers['x-token'];
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const fileId = req.params.id;
        const file = await dbClient.db.collection('files').findOne({ _id: fileId });
        if (!file) return res.status(404).json({ error: 'Not found' });
        if (!file.isPublic && file.userId !== userId) return res.status(404).json({ error: 'Not found' });
        if (file.type === 'folder') return res.status(400).json({ error: "A folder doesn't have content" });

        const fileContent = fs.readFileSync(file.localPath);
        res.contentType(file.name);
        res.send(fileContent);
    }
}

export default FilesController;
