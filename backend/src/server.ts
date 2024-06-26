import express from 'express';
import cors from "cors";
import { Request, Response } from "express";
import { PrismaClient, Vocabulary } from '@prisma/client';
import { updateWordStatus } from './helpers/update-status.helper';

const startServer = async () => {
    const prisma = new PrismaClient();
    // await prisma.$connect();
    const app = express();
    const port = 3000;

    // Middleware
    app.use(express.json());
    app.use(cors({
        // origin: 'http://localhost:8080',  // Or your actual frontend origin
        // methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
        // allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    }));
    // app.use(express.static('src/public'));

    app.post('/api/create-new-words', async (req: Request, res: Response) => {
        const { newWord, translation, transcription } = req.body;
        const wordsRepo = prisma.vocabulary;

        const wordCreated: Vocabulary = await wordsRepo.create({
            data: {
                english: newWord.toLowerCase(),
                armenian: translation.map((tr: string) => tr.toLowerCase()),
                transcription: transcription.toLowerCase(),
            }
        });
        res.status(200).send({ wordCreated });
    });

    // Random words endpoint
    app.get('/api/words', async (req: Request, res: Response) => {
        const limit: number = 10;
        const randomWords = await prisma.$queryRaw`
        SELECT * FROM "Vocabulary"
        WHERE (status->>'correct')::int < "goal"
        ORDER BY RANDOM()
        LIMIT ${limit};
      `;
        console.log("111", randomWords);
        res.json(randomWords);
    });

    //  (status->>'incorrect')::int >= (status->>'correct')::int
    //         AND (status->>'correct')::int < "goal"
    // Check endpoint
    app.post('/api/check', async (req: Request, res: Response) => {
        const { checkListObject, translateTo } = req.body;
        const wordsRepo = prisma.vocabulary;
        console.log("checkListObject", checkListObject);
        const wordIds = Object.keys(checkListObject).map(Number);

        const checkList = await wordsRepo.findMany({
            where: { id: { in: wordIds } }
        });

        const result = checkList.map(word => {
            const providedTranslation = checkListObject[word.id].translation;
            console.log("word", word, { providedTranslation: providedTranslation });
            return {
                id: word.id,
                english: word.english,
                armenian: word.armenian,
                providedTranslation,
                match: translateTo === "Armenian" ? word.armenian.includes(providedTranslation) : word.english === providedTranslation,
            }
        });
        updateWordStatus(result);

        res.json(result);
    });

    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
};

startServer().catch(error => {
    console.error('Error starting server:', error);
});
