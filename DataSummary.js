import { ChatOpenAI } from "@langchain/openai";

import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";


import * as dotenv from "dotenv";
dotenv.config();  // dont for get to add .env file with OPENAI_API_KEY

const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
});

const prompt = ChatPromptTemplate.fromTemplate({
    // This is the prompt that will be used to generate the response it will be made for a hospital visit summary on the doctors side 
    //The question will be what is the summary of the appointment
});

const chain = await



