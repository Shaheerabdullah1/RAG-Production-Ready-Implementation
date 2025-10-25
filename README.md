# RAG - Production Grade Implementation

This repository contains a production-grade implementation of Retrieval-Augmented Generation (RAG).  
It demonstrates how to process documents, apply multiple chunking strategies, enrich with NER, and analyze the trade-offs for building reliable RAG pipelines.

---

## Features Implemented (Part 1 – Preprocessing and Chunking)

### Document Loading
- PDF loading with PyMuPDF (`fitz`)
- Text preprocessing with cleaning and statistics (character, word, sentence, token counts)

### Chunking Strategies
Implemented and compared five chunking methods:

1. **Fixed-size chunking**  
   Simple splitting by token or word count.

2. **Semantic chunking**  
   Sentence embeddings with cosine similarity to group semantically coherent sentences.

3. **Recursive chunking**  
   Recursively splits text by section, newline, and then sentence-level fallback.

4. **Structure-based chunking**  
   Chapter and section-aware splitting using document structure.

5. **LLM-based chunking**  
   Using GPT models to adaptively decide split points based on semantic coherence.

### Named Entity Recognition (NER)
- Implemented using Hugging Face BERT-NER (`dslim/bert-base-NER`)
- Stable extraction of entities such as persons, organizations, and locations
- Example:  
  - "George Bush" → `PER`  
  - "Pakistan" → `LOC`  
  - "GOOGLE" → `ORG`

### Chunking Analysis and Visualization
- Comparative metrics:
  - Average chunk size
  - Number of chunks
  - Size variance
- Visualizations:
  - Bar plots for average size, number of chunks, and variance
  - Box plots for chunk size distribution

---

## Performance Summary

- **Structure-based chunking**  
  Produced the largest chunks, fewer in number, but with very high variance.  
  Best for capturing entire sections or chapters, less balanced for downstream models.

- **Semantic chunking**  
  Produced very small chunks and the highest number of chunks.  
  Preserves fine-grained context, but risks over-fragmentation.

- **Fixed-size chunking**  
  Produced consistent, moderate chunks with low variance.  
  Predictable sizing, but ignores semantic boundaries.

- **Recursive chunking**  
  A balanced approach with moderate variance and a reasonable number of chunks.  
  Good compromise between context and consistency.

- **LLM-based chunking**  
  Produced a moderate number of chunks with moderate variance.  
  Required the highest computational time.

---

## Getting Started

### Clone the repository
```bash
git clone https://github.com/<your-username>/RAG-Production-Grade.git
cd RAG-Production-Grade
  
