import faiss
import json
import numpy as np
import os
from sentence_transformers import SentenceTransformer

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

    def search(self, query: str, top_k: int = 5, document_name: str = None):
        index, metadata = self._load_db()
        if index is None or not metadata:
            return []

        query_embedding = self.model.encode([query])
        query_embedding = np.array(query_embedding).astype('float32')
        faiss.normalize_L2(query_embedding)
        
        # If filtering by document, retrieve more candidates from FAISS to allow for filtering
        search_k = top_k * 10 if document_name else top_k
        actual_top_k = min(search_k, index.ntotal)
        if actual_top_k <= 0:
            return []

        distances, indices = index.search(query_embedding, actual_top_k)
        results = []
        for score, idx in zip(distances[0], indices[0]):
            if idx != -1 and idx < len(metadata):
                
                item = metadata[idx]
                if document_name and item.get("document") != document_name:
                    continue
                
                item_copy = item.copy()
                item_copy["score"] = float(score)
                results.append(item_copy)
                
                if len(results) >= top_k:
                    break

        return results

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