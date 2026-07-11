import faiss
import json
import numpy as np
from pathlib import Path


class VectorService:

    INDEX_DIR = Path("app/vectordb")
    INDEX_DIR.mkdir(exist_ok=True)

    INDEX_PATH = INDEX_DIR / "index.faiss"
    METADATA_PATH = INDEX_DIR / "metadata.json"

    def add_embeddings(self, embeddings):

        embeddings_np = np.array(
            embeddings,
            dtype=np.float32
        )

        dimension = embeddings_np.shape[1]

        # Sync check: if metadata doesn't exist or is invalid, or if index size doesn't match metadata length,
        # we reset the index and metadata to keep them in sync.
        metadata_len = 0
        if self.METADATA_PATH.exists():
            try:
                with open(self.METADATA_PATH, "r", encoding="utf-8") as f:
                    metadata_len = len(json.load(f))
            except Exception:
                # If metadata is corrupted, delete it
                try:
                    self.METADATA_PATH.unlink()
                except Exception:
                    pass

        if self.INDEX_PATH.exists() and self.METADATA_PATH.exists():
            try:
                index = faiss.read_index(str(self.INDEX_PATH))
                if index.ntotal != metadata_len:
                    # Mismatch! Reset both.
                    index = faiss.IndexFlatIP(dimension)
                    try:
                        self.METADATA_PATH.unlink()
                    except Exception:
                        pass
            except Exception:
                index = faiss.IndexFlatIP(dimension)
        else:
            # If one is missing, delete the other and start fresh
            for path in (self.INDEX_PATH, self.METADATA_PATH):
                if path.exists():
                    try:
                        path.unlink()
                    except Exception:
                        pass
            index = faiss.IndexFlatIP(dimension)

        index.add(embeddings_np)

        faiss.write_index(
            index,
            str(self.INDEX_PATH)
        )

        return index.ntotal