import type { Meta, StoryObj } from "@storybook/react";
import React, { useEffect } from "react";
import App from "../App";

const sampleDocs = {
  docs: [
    {
      id: 1,
      title: "Water rights correspondence (1912)",
      summary: "Letter describing water allocations near Pukaist reserve; mentions irrigation ditch.",
      theme: "Water",
      doc_type: "letter",
      created_at: 1333152000,
      lat: 50.45,
      lng: -121.33,
      relevant: true,
    },
    {
      id: 2,
      title: "Survey plan excerpt",
      summary: "Map note referencing boundary adjustment and nearby band office.",
      theme: "Land",
      doc_type: "map_note",
      created_at: 1262304000,
      lat: 50.67,
      lng: -120.33,
      status: "follow_up",
    },
  ],
};

const sampleArtifact = {
  metadata: { pages: 2, confidence: 0.9, source: "demo" },
  content_preview: "Sample OCR text from storybook stub",
  summary: "Demo artifact summary",
  insights: { parties: ["Demo"], actions: ["Review"] },
};

const meta: Meta<typeof App> = {
  title: "Demo/App Interactive",
  component: App,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      const FetchMock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        useEffect(() => {
          const apiBase = import.meta.env?.VITE_STORYBOOK_API_BASE as string | undefined;
          if (apiBase) return;
          const originalFetch = global.fetch;
          global.fetch = async (input: RequestInfo | URL) => {
            const url = typeof input === "string" ? input : input.toString();
            if (url.includes("/docs?")) {
              return new Response(JSON.stringify(sampleDocs), { status: 200, headers: { "Content-Type": "application/json" } });
            }
            const artifactMatch = url.match(/\/docs\/(\d+)\/artifact/);
            if (artifactMatch) {
              return new Response(JSON.stringify(sampleArtifact), { status: 200, headers: { "Content-Type": "application/json" } });
            }
            const docMatch = url.match(/\/docs\/(\d+)/);
            if (docMatch) {
              const id = Number(docMatch[1]);
              const doc = sampleDocs.docs.find((d) => d.id === id) || sampleDocs.docs[0];
              return new Response(JSON.stringify(doc), { status: 200, headers: { "Content-Type": "application/json" } });
            }
            return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
          };
          return () => {
            if (!apiBase) global.fetch = originalFetch;
          };
        }, []);
        return <>{children}</>;
      };
      return (
        <FetchMock>
          <Story />
        </FetchMock>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof App>;

export const InteractiveFlow: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const clickButtonByText = (text: string) => {
      const btn = Array.from(canvasElement.querySelectorAll("button")).find((el) =>
        el.textContent?.toLowerCase().includes(text.toLowerCase()),
      );
      if (btn) btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    };
    await sleep(300);
    clickButtonByText("Review mode");
    await sleep(200);
    clickButtonByText("Survey plan excerpt");
    await sleep(200);
    clickButtonByText("INSIGHTS");
  },
};
