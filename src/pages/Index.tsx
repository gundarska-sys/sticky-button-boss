import { StickyTimer } from "@/components/StickyTimer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <StickyTimer />
      
      {/* Demo content */}
      <div className="container mx-auto px-8 py-16">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-6 text-foreground">
            Timer Widget Demo
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Hover over the sticky timer on the right side of the screen to expand it. 
            Click START to begin tracking time, and use the BPM and STOP buttons when active.
          </p>
          
          <div className="grid gap-6 mt-12">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h2 className="text-xl font-semibold mb-3">Features</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Sticky to screen with smooth 100ms bouncy animation</li>
                <li>• Collapsed state shows active status and time</li>
                <li>• Expanded state reveals full controls</li>
                <li>• Color changes: Orange (idle) → Green (active)</li>
                <li>• Timer with START/STOP controls</li>
                <li>• BPM mode button when active</li>
                <li>• Meeting countdown notification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
