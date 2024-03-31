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
dotenv.config();  // dont forget to add .env file with OPENAI_API_KEY

const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.3,
});

const prompt = ChatPromptTemplate.fromTemplate(
  `This prompt will be utilized to scrutinize and identify any potential :
  instances of malpractice within the nursing home. It serves as a critical :
  safeguard for both patients and staff. The primary objective is to obtain a :
  comprehensive overview of the patient's condition and the interventions undertaken :
  during the appointment, thereby facilitating seamless communication and informed :
  decision-making among the care team. Please generate a detailed summary based on :
  the data collected from the appointment to address the user's inquiry within the specified context.
  {context}:
  Make the ouput more comprehensive
  Question: {input}`
);

const chain = await createStuffDocumentsChain({
  llm: model,
  prompt,
});

const loader = new DirectoryLoader(
  "Patientsresponse",{
    ".json": (path) => new JSONLoader(path, "/texts"),
    ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
    ".txt": (path) => new TextLoader(path),
    ".csv": (path) => new CSVLoader(path, "text"),
  }
);

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 20,
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
  input: "Give a comprehensive review on the patients opinion and see if there is a chance of mal practice in the nursing home.",
  context: splitDocs,});

console.log(response["answer"]);




