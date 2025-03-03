import express from 'express';
import { TrainModel, GenerateImage, GenerateImagesFromPack } from './../../packages/commom/types';
import { prismaClient } from 'db';

const PORT = process.env.PORT || 8080;

const app = express();

app.post("/ai/training", (req, res) => {

})

app.post("/ai/generate", (req, res) => {

})

app.post("/pack/generate", (req, res) => {

})

app.get("/pack/bulk", (req, res) => {

})

app.get("/image", (req, res) => {

})

app.listen(PORT, () => {
    console.log(`Server started on port  ${PORT}`);
});