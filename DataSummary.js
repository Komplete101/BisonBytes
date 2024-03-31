import fs from 'fs';
import OpenAI from "openai";

const openai = new OpenAI();

async function main(){
    const file = await openai.files.create({
        file: fs.createReadStream(""), //Will make a file upload
        purpose: "data_summary"
    });
    console.log(file)
}