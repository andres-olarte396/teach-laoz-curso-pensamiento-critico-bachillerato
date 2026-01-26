import { FastifyRequest, FastifyReply } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream';
import util from 'node:util';
import { v4 as uuidv4 } from 'uuid';

const pump = util.promisify(pipeline);

export class UploadController {
  async upload(req: FastifyRequest, reply: FastifyReply) {
    const data = await req.file();
    
    if (!data) {
      return reply.status(400).send({ message: 'No file uploaded' });
    }

    const fileExtension = path.extname(data.filename);
    const fileName = `${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, fileName);

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await pump(data.file, fs.createWriteStream(filePath));

    // Return URL relative to the API
    const url = `/api/uploads/${fileName}`;
    
    return reply.send({ url, filename: fileName, originalName: data.filename });
  }
}
