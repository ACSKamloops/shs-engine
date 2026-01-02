# OCR Quality Assurance Protocol

## Overview
Standard testing procedure for verifying OCR output quality on legal research documents.

## Testing Phases

### Phase 1: Automated Pattern Detection
Scan all `.txt` files for AI contamination patterns:

```bash
# Run from Evidence_Staging directory
for pattern in \
  "the text shows|the text contains|the document shows" \
  "I can see|I'll analyze|I'll transcribe|let me" \
  "this appears to be|this seems to be" \
  "to address the|here is the" \
  "the handwritten text|the cursive text" \
  "^### |^\*\*[A-Z]"; do
  echo "Pattern: $pattern"
  grep -l -i "$pattern" *.txt 2>/dev/null | wc -l
done
```

**Expected:** 0 matches for AI-generated patterns

---

### Phase 2: Deep Content Review
For each file, examine three sections:
- **First 500 chars** - Check for AI preambles
- **Middle section** - Check for analysis insertion
- **Last 300 chars** - Check for AI summaries

```bash
for f in *.txt; do
  echo "=== $f ==="
  echo "FIRST:"; head -c 500 "$f"
  echo "MIDDLE:"; sed -n '20,30p' "$f"
  echo "LAST:"; tail -c 300 "$f"
done
```

---

### Phase 3: Visual Verification
Convert PDFs to images and compare against OCR output:

```bash
# 1. Convert first page of each PDF to PNG
pdftoppm -png -r 150 -l 1 input.pdf output_prefix

# 2. View image and compare against OCR text
# 3. Verify verbatim match of header, body, and signature
```

**Checklist:**
- [ ] Header text matches exactly
- [ ] Body text is verbatim (not paraphrased)
- [ ] Spelling/punctuation preserved
- [ ] No AI-generated descriptions
- [ ] [illegible] used appropriately for unclear text

---

## Quality Criteria

| Criteria | Pass | Fail |
|----------|------|------|
| AI preambles | 0 | Any |
| Markdown formatting | 0 | ### or ** patterns |
| "I can see" phrases | 0 | Any |
| Visual match | Verbatim | Paraphrased |

---

## Sample Size
- **Minimum:** 5 random files per 100 processed
- **Visual verification:** At least 3 files per batch
