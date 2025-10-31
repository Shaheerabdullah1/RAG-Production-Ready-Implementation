import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Source {
  id: number;
  content: string;
  page: string | number;
  similarity: number;
  chunk_index: number;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const ChatMessage = ({ role, content, sources }: ChatMessageProps) => {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  const handleCitationClick = (sourceIndex: number) => {
    if (sources && sources[sourceIndex]) {
      setSelectedSource(sources[sourceIndex]);
    }
  };

  const renderContentWithCitations = (text: string) => {
    const citationRegex = /\[(\d+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const citationNum = parseInt(match[1]) - 1;
      parts.push(
        <button
          key={`citation-${match.index}`}
          onClick={() => handleCitationClick(citationNum)}
          className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded bg-primary text-primary-foreground hover:bg-primary/80 transition-colors mx-0.5"
        >
          {match[1]}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <>
      <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-4`}>
        <Card
          className={`max-w-[80%] p-4 ${
            role === "user"
              ? "bg-secondary text-secondary-foreground"
              : "bg-card text-card-foreground border-border"
          }`}
        >
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {role === "assistant" && sources
              ? renderContentWithCitations(content)
              : content}
          </div>
        </Card>
      </div>

      <Dialog open={!!selectedSource} onOpenChange={() => setSelectedSource(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary font-mono">
              Source Citation - Page {selectedSource?.page}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">
              Similarity: {selectedSource?.similarity?.toFixed(3)}
            </div>
            <div className="bg-secondary/50 p-4 rounded text-sm leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {selectedSource?.content}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatMessage;
