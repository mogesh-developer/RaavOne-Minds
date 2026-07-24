import { marked } from 'marked';

// Configure marked options if needed
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function MarkdownRenderer({ text }) {
  const rawHtml = marked.parse(text || '');

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: rawHtml }}
    />
  );
}
