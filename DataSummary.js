import { ChatOpenAI } from "@langchain/openai";

import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  JSONLoader,
  JSONLinesLoader,
} from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";

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

const prompt = ChatPromptTemplate.fromTemplate(
  `Answer the user's question from the following context: 
  {context}
  Question: {input}`
);

const chain = await createStuffDocumentsChain({
  llm: model,
  prompt,
});

const loader = new DirectoryLoader(
  "C:\\BisonBytes\\DoctorsNotes",{
    ".json": (path) => new JSONLoader(path, "/texts"),
    ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
    ".txt": (path) => new TextLoader(path),
    ".csv": (path) => new CSVLoader(path, "text"),
  }
);

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

// const response = await chain.invoke({
//   question: "What is LCEL?",
//   context: splitDocs,
// });

const response = await retrievalChain.invoke({
  input: "What is the summary of the appointment",
});

console.log(response);




