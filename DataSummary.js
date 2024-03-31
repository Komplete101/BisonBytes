import { ChatOpenAI } from "@langchain/openai";

import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";

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

const chain = await createStuffDocumentsChain({
  llm: model,
  prompt,
});

const loader = new DirectoryLoader{//path
   ".txt": (file path) => new TextLoader(file path),
};

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
})

const splitDocs = await splitter.splitDocuments(docs)

const embeddings = new OpenAIEmbeddings()

const vectorStore = await MemoryVectorStore.fromDocuments(
  splitDocs,
  embeddings
);

const retriever = vectorStore.asRetriever({k:2});

const retrievalChain = await createRetrievalChain({
  combineDocsChain: chain,
  retriever,
});

const response = await retrievalChain.invoke({
  input: "What is the summary of the appointment",
});

console.log(response);




