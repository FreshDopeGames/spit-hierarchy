Verify ads.txt is present and correct

Current state: `public/ads.txt` already exists with the exact AdSense snippet you provided:

```
google.com, pub-2518650700414992, DIRECT, f08c47fec0942fa0
```

This file is in the correct location (`public/ads.txt`) so it will be served at `https://spit-hierarchy.com/ads.txt`, which is what AdSense crawlers expect.

Plan:
1. Confirm the file content matches your snippet (already verified above).
2. Optionally verify the live/preview URL serves the file with `text/plain` content.
3. No code changes are required unless the content differs or the file is missing at runtime.

If you want, I can also add a trailing newline or check that the file is not being blocked by any route/service worker.