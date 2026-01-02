# Pukaist Engine — Minimal Web Embed Example

This snippet shows how to embed uploads + search in a webpage using the fetch-based TS client (`sdk/ts/pukaist-client.ts`). Adapt to your framework of choice.

```html
<!doctype html>
<html>
  <body>
    <h3>Upload to Pukaist Engine</h3>
    <input type="file" id="file" />
    <button id="upload">Upload</button>
    <pre id="out"></pre>

    <script type="module">
      import { PukaistClient } from "../sdk/ts/pukaist-client.ts";

      const client = new PukaistClient("http://localhost:8000", "dev-token");
      const out = document.getElementById("out");

      document.getElementById("upload").onclick = async () => {
        const file = document.getElementById("file").files[0];
        if (!file) return (out.textContent = "No file selected.");
        out.textContent = "Uploading...";
        try {
          const res = await client.upload(file, "example-theme");
          out.textContent = JSON.stringify(res, null, 2);
        } catch (err) {
          out.textContent = "Error: " + err;
        }
      };
    </script>
  </body>
</html>
```

Notes:
- Configure `baseUrl` and `apiKey` to match your deployment.
- For production, serve the TS client as built JS (via bundler) and handle errors gracefully.
- To surface map points, call `client.geojson()` and render points with your map library (Leaflet/Mapbox/etc.). For a ready-made embed of search + map overlays, see `docs/map-embed.html` (mounts `sdk/ts/map-widget.ts`).
