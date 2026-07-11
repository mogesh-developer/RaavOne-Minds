from sentence_transformers import SentenceTransformer

class EmbeddingService:

    model = SentenceTransformer("all-MiniLM-L6-v2")

    @classmethod
    def generate_embeddings(cls, chunks):
        embeddings = cls.model.encode(
            chunks,
            normalize_embeddings=True
        )

        return embeddings