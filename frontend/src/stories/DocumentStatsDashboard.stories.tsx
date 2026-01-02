import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { DocumentStatsDashboard } from "../features/stats/DocumentStatsDashboard";
import { useDocsStore } from "../store/useDocsStore";
import { useEffect } from "react";

function DocumentStatsDashboardDemo() {
  const setDocs = useDocsStore((s) => s.setDocs);

  useEffect(() => {
    // Add sample documents for demo
    setDocs([
      { id: 1, title: "Environmental Assessment.pdf", summary: "EIA report", theme: "claims", doc_type: "PDF", status: "reviewed", lat: 50.1, lng: -120.1 },
      { id: 2, title: "Archaeological Survey.docx", summary: "Survey results", theme: "consultation", doc_type: "DOCX", status: "follow_up", lat: 50.2, lng: -120.2 },
      { id: 3, title: "Community Notes.pdf", summary: "Meeting notes", theme: "consultation", doc_type: "PDF", status: "not_started" },
      { id: 4, title: "Land Use Plan.pdf", summary: "Planning doc", theme: "claims", doc_type: "PDF", status: "reviewed", lat: 50.3, lng: -120.3 },
      { id: 5, title: "Water Quality.xlsx", summary: "Testing data", theme: "default", doc_type: "XLSX", status: "not_started" },
      { id: 6, title: "Site Photos.jpg", summary: "Photo collection", theme: "claims", doc_type: "IMAGE", status: "reviewed", lat: 50.4, lng: -120.4 },
      { id: 7, title: "Treaty Documents.pdf", summary: "Historical treaties", theme: "consultation", doc_type: "PDF", status: "follow_up" },
      { id: 8, title: "Map Overlay.kmz", summary: "GIS data", theme: "default", doc_type: "KMZ", status: "reviewed", lat: 50.5, lng: -120.5 },
    ]);
  }, [setDocs]);

  return (
    <div className="p-6 bg-slate-900 text-white max-w-md">
      <h2 className="text-lg font-semibold mb-4">Document Stats Dashboard</h2>
      <DocumentStatsDashboard />
    </div>
  );
}

const meta: Meta<typeof DocumentStatsDashboardDemo> = {
  title: "Stats/DocumentStatsDashboard",
  component: DocumentStatsDashboardDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof DocumentStatsDashboardDemo>;

export const Default: Story = {};
