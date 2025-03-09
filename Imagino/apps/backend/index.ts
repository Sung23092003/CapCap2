import { FalAiModel } from './models/FalAiModel';
import express from 'express';
import { TrainModel, GenerateImage, GenerateImagesFromPack } from './../../packages/commom/types';
import { prismaClient } from 'db';
import { S3Client } from 'bun';
import cors from "cors"

const USER_ID = "123"

const PORT = process.env.PORT || 8080;

const falAiModel = new FalAiModel();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/pre-signed-url", async (req, res) => {
    const key = `models/${Date.now()}_${Math.random()}.zip` 
    const url = S3Client.presign(key, {
        method: "PUT",
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
        endpoint: process.env.ENDPOINT,
        bucket: process.env.BUCKET_NAME,
        expiresIn: 60 * 5,
        type: "application/zip"
    })
    console.log(url)

    res.json({
        url,
        key
    })
})

app.post("/ai/training", async (req, res) => {
    const parsedBody = TrainModel.safeParse(req.body);
    const images = req.body.images;

    if (!parsedBody.success) {
        res.status(411).json({
            message: 'Input incorrect'
        })
        return
    }

    const { request_id, response_url } = await falAiModel.trainModel(parsedBody.data.zipUrl, parsedBody.data.name);

    const data = await prismaClient.model.create({
        data: {
            name: parsedBody.data.name,
            type: parsedBody.data.type,
            age: parsedBody.data.age,
            ethinicity: parsedBody.data.ethinicity,
            eyeColor: parsedBody.data.eyeColor,
            bald: parsedBody.data.bald,
            userId: USER_ID,
            zipUrl: parsedBody.data.zipUrl,
            falAiRequestId: request_id
        }
    })
    res.json({
        modelId: data.id
    })
})

app.post("/ai/generate", async (req, res) => {
    const parsedBody = GenerateImage.safeParse(req.body);

    if (!parsedBody.success) {
        res.status(411).json({
        })
        return;
    }

    const model = await prismaClient.model.findUnique({
        where: {
            id: parsedBody.data.modelId
        }
    })

    if (!model || !model.tensorPath) {
        res.status(411).json({
            message: "Model not found"
        })
        return;
    }

    const { request_id, response_url } = await falAiModel.generateImage(parsedBody.data.prompt, model?.tensorPath);

    const data = await prismaClient.outputImages.create({
        data: {
            prompt: parsedBody.data.prompt,
            userId: USER_ID,
            modelId: parsedBody.data.modelId,
            imageUrl: "",
            falAiRequestId: request_id
        }
    })

    res.json({
        imageId: data.id
    })
})

app.post("/pack/generate", async (req, res) => {

    const parsedBody = GenerateImagesFromPack.safeParse(req.body);
    if (!parsedBody.success) {
        res.status(411).json({
            message: "Input Incorrect"
        })
        return;
    }

    const prompts = await prismaClient.packPrompts.findMany({
        where: {
            packId: parsedBody.data.packId
        }
    })

let requestIds: {request_id: string}[] = await Promise.all(prompts.map((prompt)=> falAiModel.generateImage(prompt.prompt, parsedBody.data.modelId)));

    const images = await prismaClient.outputImages.createManyAndReturn({
        data: prompts.map((prompt, index) => ({
            prompt: prompt.prompt,
            userId: USER_ID,
            modelId: parsedBody.data.modelId,
            imageUrl: "",
            falAiRequestId: requestIds[index].request_id
        }))
    })

    res.json({
        imageIds: images.map((image) => image.id)
    })
})

app.get("/pack/bulk", async (req, res) => {
    const packs = await prismaClient.packs.findMany({})

    res.json({
        packs
    })
})

app.get("/image/bulk", async (req, res) => {
    const ids = req.query.ids as string[]
    const limit = req.query.limit as string ?? "10";
    const offset = req.query.offset as string ?? "0";

    const imagesDate = await prismaClient.outputImages.findMany({
        where: {
            id: { in: ids },
            userId: USER_ID
        },
        skip: parseInt(offset),
        take: parseInt(limit),
    })

    res.json({
        images: imagesDate
    })

})

app.post("/fal-ai/webhook/train", async (req, res) => {

    const requestId = req.body.request_id as string;

    await prismaClient.model.updateMany({
        where: {
            falAiRequestId: "requestId"
        },
        data: {
            trainingStatus: "Generated",
            tensorPath: req.body.tensor_path
        }
    })

    res.json({
        message: "Webhook received"
    })
})

app.post("/fal-ai/webhook/image", async (req, res) => {
    console.log(req.body);

    const requestId = req.body.request_id;

    await prismaClient.outputImages.updateMany({
        where: {
            falAiRequestId: requestId
        },
        data: {
            status: "Generated",
            imageUrl: req.body.image_url
        }
    })

    res.json({
        message: "Webhook received"
    })
})

app.listen(PORT, () => {
    console.log(`Server started on port  ${PORT}`);
});