import type { Meta, StoryObj } from "@storybook/react";
import "../index.css";
import { DocsPanel } from "../features/workspace/DocsPanel";
import { useDocsStore } from "../store/useDocsStore";
import { useEffect } from "react";

function DocsPanelDemo() {
  const setDocs = useDocsStore((s) => s.setDocs);
  const setSelectedId = useDocsStore((s) => s.setSelectedId);

  useEffect(() => {
    // Add sample documents
    setDocs([
      { id: 1, title: "Environmental Assessment Report.pdf", summary: "Comprehensive environmental impact study for proposed development", theme: "claims", doc_type: "PDF", status: "reviewed", lat: 50.123, lng: -120.456 },
      { id: 2, title: "Archaeological Survey.docx", summary: "Survey of potential archaeological sites", theme: "consultation", doc_type: "DOCX", status: "follow_up", lat: 50.234, lng: -120.567 },
      { id: 3, title: "Community Consultation Notes.pdf", summary: "Meeting notes from community engagement session", theme: "consultation", doc_type: "PDF", status: "not_started" },
      { id: 4, title: "Land Use Plan 2024.pdf", summary: "Updated land use planning document", theme: "claims", doc_type: "PDF", status: "reviewed", lat: 50.345, lng: -120.678 },
      { id: 5, title: "Water Quality Report.xlsx", summary: "Water testing results from multiple sites", theme: "default", doc_type: "XLSX", status: "not_started" },
    ]);
    setSelectedId(2);
  }, [setDocs, setSelectedId]);

  return (
    <div className="p-6 bg-slate-900 text-white max-w-md h-[600px] overflow-hidden">
      <h2 className="text-lg font-semibold mb-4">Documents Panel</h2>
      <DocsPanel />
    </div>
  );
}

const meta: Meta<typeof DocsPanelDemo> = {
  title: "Workspace/DocsPanel",
  component: DocsPanelDemo,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof DocsPanelDemo>;

export const Default: Story = {};
