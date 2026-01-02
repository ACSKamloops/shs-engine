import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { UploadStatusIndicator } from "../components/UploadStatusIndicator";
import { useUploadStore } from "../store/useUploadStore";
import { useEffect } from "react";

function UploadStatusDemo() {
  const addFiles = useUploadStore((s) => s.addFiles);
  const updateItem = useUploadStore((s) => s.updateItem);
  
  useEffect(() => {
    // Create mock files
    const file1 = new File(["test"], "document.pdf", { type: "application/pdf" });
    const file2 = new File(["test"], "report.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const file3 = new File(["test"], "scan.png", { type: "image/png" });
    
    // Add files to upload queue
    const ids = addFiles([file1, file2, file3]);
    
    // Simulate progress updates
    let progress1 = 0;
    let progress2 = 0;
    
    const interval = setInterval(() => {
      progress1 = Math.min(progress1 + 15, 100);
      progress2 = Math.min(progress2 + 10, 70);
      
      updateItem(ids[0], { 
        progress: progress1, 
        status: progress1 >= 100 ? "done" : "uploading" 
      });
      updateItem(ids[1], { 
        progress: progress2, 
        status: "uploading" 
      });
      updateItem(ids[2], { 
        status: "processing",
        progress: 100
      });
      
      if (progress1 >= 100 && progress2 >= 70) {
        clearInterval(interval);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [addFiles, updateItem]);

  return (
    <div className="relative min-h-screen bg-slate-800">
      <div className="p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Upload Status Indicator Demo</h2>
        <p className="text-slate-400">The indicator appears in the bottom-right corner showing upload progress.</p>
      </div>
      <UploadStatusIndicator />
    </div>
  );
}

const meta: Meta<typeof UploadStatusDemo> = {
  title: "Components/UploadStatusIndicator",
  component: UploadStatusDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof UploadStatusDemo>;

export const Default: Story = {};
