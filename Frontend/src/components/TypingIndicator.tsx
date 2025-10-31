import { Card } from "@/components/ui/card";

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <Card className="bg-card p-4 border-border">
        <div className="flex items-center space-x-2 typing-indicator">
          <span className="w-2 h-2 bg-primary rounded-full"></span>
          <span className="w-2 h-2 bg-primary rounded-full"></span>
          <span className="w-2 h-2 bg-primary rounded-full"></span>
        </div>
      </Card>
    </div>
  );
};

export default TypingIndicator;
