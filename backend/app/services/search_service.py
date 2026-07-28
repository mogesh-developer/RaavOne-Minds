import faiss
import json
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SearchService:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.index_path = "app/vectordb/index.faiss"
        self.metadata_path = "app/vectordb/metadata.json"

    def _load_db(self):
        index = None
        metadata = []
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                index = faiss.read_index(self.index_path)
                with open(self.metadata_path, "r", encoding="utf-8") as file:
                    metadata = json.load(file)
            except Exception as e:
                # Log or handle error gracefully
                pass
        return index, metadata

    def _keyword_search(self, query: str, metadata: list, document_name: str = None):
        filtered_items = []
        for idx, items in enumerate(metadata):
            if document_name and items.get("document") != document_name:
                continue
            text = items.get("text", "")
            if text.strip():
                filtered_items.append({
                    "index": idx,
                    "item": items,
                    "text": text
                })
        if not filtered_items:
            return {}
        texts = [entry["text"] for entry in filtered_items]
        try:
            vectorizer = TfidfVectorizer(
                lowercase=True,
                stop_words="english",
                ngram_range=(1, 2)
            )
            tfidf_matrix = vectorizer.fit_transform(texts)
            query_vector = vectorizer.transform([query])
            scores = cosine_similarity(query_vector, tfidf_matrix)[0]

            keyword_scores = {}
            for entry, score in zip(filtered_items, scores):
                keyword_scores[entry["index"]] = float(score)
            return keyword_scores

        except Exception as e:
            print("keyword search failed:", e)
            return {}

    def _semantic_search(self, query: str, index, metadata: list, document_name: str = None, candidate_k: int = 30):
        if index is None or not metadata:
            return {}
        query_embedding = self.model.encode([query])
        query_embedding = np.array(query_embedding).astype("float32")
        faiss.normalize_L2(query_embedding)

        actual_k = min(candidate_k, index.ntotal)
        if actual_k <= 0:
            return {}
        distances, indices = index.search(query_embedding, actual_k)
        semantic_scores = {}

        for score, idx in zip(distances[0], indices[0]):
            if idx == -1 or idx >= len(metadata):
                continue
            item = metadata[idx]

            if document_name and item.get("document") != document_name:
                continue
            semantic_scores[idx] = float(score)
        return semantic_scores

    def search(self, query: str, top_k: int = 5, document_name: str = None, semantic_weight: float = 0.55, keyword_weight: float = 0.45):
        index, metadata = self._load_db()
        if index is None or not metadata:
            return []
        semantic_scores = self._semantic_search(query=query, index=index, metadata=metadata, document_name=document_name, candidate_k=30)
        keyword_scores = self._keyword_search(query=query, metadata=metadata, document_name=document_name)
        candidate_indices = set(semantic_scores.keys()) | set(keyword_scores.keys())

        if not candidate_indices:
            return []
        results = []
        for idx in candidate_indices:
            if idx >= len(metadata):
                continue
            sem_score = semantic_scores.get(idx, 0.0)
            key_score = keyword_scores.get(idx, 0.0)

            final_score = (
                sem_score * semantic_weight
                + key_score * keyword_weight
            )
            item_copy = metadata[idx].copy()
            item_copy["score"] = float(final_score)
            item_copy["semantic_score"] = float(sem_score)
            item_copy["keyword_score"] = float(key_score)
            results.append(item_copy)
        results.sort(key=lambda item: item["score"], reverse=True)
        return results[:top_k]

    def get_document_preview_chunks(self, document_name: str = None, count: int = 5):
        _, metadata = self._load_db()
        if not metadata:
            return []

        chunks = []
        for item in metadata:
            if document_name and document_name != "all" and item.get("document") != document_name:
                continue
            chunks.append(item.get("text", ""))
            if len(chunks) >= count:
                break
        return chunks