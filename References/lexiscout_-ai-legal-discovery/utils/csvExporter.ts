
import { Task } from "../types";

export const generateCSV = (tasks: Task[]): string => {
  // Define headers
  const headers = [
    "Record ID",
    "Source",
    "Status",
    "Relevance Score",
    "Record Type",
    "Relevance Level",
    "Is Relevant?",
    "Is Privileged?",
    "Issue Tags",
    "Legal Opinion",
    "Timestamp",
    "JSON Content (Preview)"
  ];

  // Helper to escape CSV fields
  const escape = (field: string | number | undefined | boolean): string => {
    if (field === undefined || field === null) return "";
    const stringValue = String(field);
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const rows = tasks.map(task => {
    const tags = task.issueTags ? task.issueTags.join("; ") : "";
    const contentPreview = task.content ? task.content.replace(/\n/g, ' ') : "";

    return [
      task.id,
      task.path,
      task.status,
      task.relevanceScore,
      task.recordType,
      task.relevanceLevel,
      task.isRelevant,
      task.isPrivileged,
      tags,
      task.legalOpinion,
      task.timestamp,
      contentPreview
    ].map(escape).join(",");
  });

  return [headers.join(","), ...rows].join("\n");
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateJSON = (tasks: Task[]): string => {
    return JSON.stringify(tasks.map(t => ({
        control_number: t.id,
        filename: t.path,
        raw_data: t.jsonContent,
        review_metadata: {
            relevant: t.isRelevant,
            privileged: t.isPrivileged,
            classification: t.recordType,
            relevance_score: t.relevanceScore,
            hot_document: t.relevanceLevel === 'Hot',
            legal_opinion: t.legalOpinion,
            issue_codes: t.issueTags
        }
    })), null, 2);
};

export const downloadJSON = (jsonContent: string, filename: string) => {
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};