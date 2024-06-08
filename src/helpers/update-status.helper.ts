import { PrismaClient } from '@prisma/client';

type Status = {
    correct: number;
    incorrect: number;
};

export async function updateWordStatus(result: any) {
    const prisma = new PrismaClient();
    const wordsRepo = prisma.vocabulary;

    for (const checkedWord of result) {
        const word = await wordsRepo.findUnique({
            where: { id: checkedWord.id },
        });

        const status: Status = word?.status as Status || { correct: 0, incorrect: 0 };

        if (checkedWord.match) {
            status.correct += 1;
        } else {
            status.incorrect += 1;
        }

        await wordsRepo.update({
            where: { id: checkedWord.id},
            data: { status}
        });
    }
}