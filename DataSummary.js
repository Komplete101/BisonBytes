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
    temperature: 0.0,
});

const prompt = ChatPromptTemplate.fromTemplate(
  `Given the paramount importance of maintaining comprehensive records in our nursing home environment, we require a :
  detailed summary of the recent appointment with one of our patients. This summary should encapsulate :
  all pertinent data gathered during the appointment, including the patient's current health status, vital signs, medication review, assessment findings, treatment :
  adjustments, and recommendations for ongoing care. The aim is to have a thorough overview of the patient's condition and the actions :
  taken during the appointment, facilitating seamless communication and informed decision-making among the care team. Please generate the complete summary based:
   on the data collected from the appointment.Answer the user's question from the following context: 
  {context}:
  Make the ouput more comprehensive
  Question: {input}`
);

const chain = await createStuffDocumentsChain({
  llm: model,
  prompt,
});

const loader = new DirectoryLoader(
  "DoctorsNotes",{
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
  input: "Give a comprehensive review on the patietns condition and all of her previous appointments be comprehensive in your response.",
  context: splitDocs,});

console.log(response["answer"]);




