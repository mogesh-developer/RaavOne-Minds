import json
from pathlib import Path

class MetadataService:

    METADATA_DIR = Path("app/vectordb")
    METADATA_DIR.mkdir(exist_ok=True)

    METADATA_PATH = METADATA_DIR / "metadata.json"

    def save(self, chunks_data, document_name):

        # Load old metadata
        if self.METADATA_PATH.exists():
            with open(self.METADATA_PATH, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        else:
            metadata = []

        start_id = len(metadata)

        for chunk_number, item in enumerate(chunks_data):
            metadata.append({
                "id": start_id,
                "document": document_name,
                "page": item["page"],
                "chunk": chunk_number,
                "text": item["text"]
            })
            start_id += 1

        with open(self.METADATA_PATH, "w", encoding="utf-8") as f:
            json.dump(
                metadata,
                f,
                indent=4,
                ensure_ascii=False
            )

    def get_all_documents(self):
        if not self.METADATA_PATH.exists():
            return []
        try:
            with open(self.METADATA_PATH, "r", encoding="utf-8") as f:
                metadata = json.load(f)
            doc_stats = {}
            for item in metadata:
                doc_name = item.get("document")
                if not doc_name:
                    continue
                if doc_name not in doc_stats:
                    doc_stats[doc_name] = {
                        "name": doc_name,
                        "chunks": 0,
                        "pages": set()
                    }
                doc_stats[doc_name]["chunks"] += 1
                if "page" in item and item["page"] is not None:
                    doc_stats[doc_name]["pages"].add(item["page"])
            
            result = []
            for name, stats in doc_stats.items():
                result.append({
                    "name": name,
                    "chunks": stats["chunks"],
                    "pages": len(stats["pages"]) if stats["pages"] else 1
                })
            return result
        except Exception:
            return []