import express from 'express';
import { Request, Response } from "express";
import bodyParser from 'body-parser';
import { PrismaClient, Words } from '@prisma/client';

const startServer = async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const app = express();
    const port = 3000;

    // Middleware
    app.use(express.json());
    app.use(express.static('src/public'));

    app.post('/api/create-new-words', async (req: Request, res: Response) => {
        const { newWord, translation } = req.body;
        const wordsRepo = prisma.words;

        const wordCreated: Words = await wordsRepo.create({
            data: {
                english: newWord,
                armenian: translation
            }
        });

        res.status(200).send({ wordCreated });
    });

    // Random words endpoint
    app.get('/api/words', async (req: Request, res: Response) => {
        const wordsRepo = prisma.words;
        const limit: number = 10;
        const words = await wordsRepo.findMany({
            take: limit,
        });
        const randomWords = words.sort(() => 0.5 - Math.random());
        console.log({ randomWords })
        res.json(randomWords);
    });

    // Check endpoint
    app.post('/api/check', (req, res) => {
        const { word, translation } = req.body;
        // Add your logic for checking here
        res.json({ word, translation, correct: true });
    });

    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
};

startServer().catch(error => {
    console.error('Error starting server:', error);
});
