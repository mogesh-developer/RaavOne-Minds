from typing import List
class ChunkService:
    @staticmethod
    def chunk_text(
        text:str,
        chunk_size:int=800,
        overlap:int=200
    ) -> list[str]:
        # clean up text
        chunks=[]
        start=0
        while start<len(text):
            end=start+chunk_size
            chunk=text[start:end]
            chunks.append(chunk)
            start+=chunk_size -overlap
        return chunks