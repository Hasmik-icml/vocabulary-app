import express from 'express';
import { Request, Response } from "express";
import { PrismaClient, Vocabulary } from '@prisma/client';

const startServer = async () => {
    const prisma = new PrismaClient();
    // await prisma.$connect();
    console.log("11111");

    const app = express();
    const port = 3000;

    // Middleware
    app.use(express.json());
    app.use(express.static('src/public'));

    app.post('/api/create-new-words', async (req: Request, res: Response) => {
        const { newWord, translation, transcription } = req.body;
        const wordsRepo = prisma.vocabulary;
        console.log('newWord:', newWord);
        console.log('Type of newWord:', typeof newWord);

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
        const wordsRepo = prisma.vocabulary;
        const limit: number = 10;
        const words = await wordsRepo.findMany({
            take: limit,
        });
        const randomWords = words.sort(() => 0.5 - Math.random());
        res.json(randomWords);
    });

    // Check endpoint
    app.post('/api/check', async (req: Request, res: Response) => {
        const { checkListObject, translateTo } = req.body;
        const wordsRepo = prisma.vocabulary;
        console.log("checkListObject", checkListObject, translateTo);
        const wordIds = Object.keys(checkListObject).map(Number);

        const checkList = await wordsRepo.findMany({
            where: { id: { in: wordIds } }
        });

        const result = checkList.map(word => {
            const providedTranslation = checkListObject[word.id].translation;
            return {
                id: word.id,
                english: word.english,
                armenian: word.armenian,
                providedTranslation,
                match: translateTo === "Armenian" ? word.armenian.includes(providedTranslation) : word.english === providedTranslation,
            }
        });
        res.json(result);
    });

    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
};

startServer().catch(error => {
    console.error('Error starting server:', error);
});
