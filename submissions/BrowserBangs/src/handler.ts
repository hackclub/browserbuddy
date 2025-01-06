async function redirect() {
  const url = location;
  const searchParams = new URLSearchParams(url.search);
  const query = searchParams.get("q") || searchParams.get("p");
  if (!query) return;

  const querySplit = query.split(" ");
  const bang = querySplit.find((q) => q.startsWith("!"))?.slice(1);
  if (!bang) return;

  const bangs: Bang[] = JSON.parse(
    (await chrome.storage.local.get("bangs")).bangs
  );
  const bangsMatch = bangs.find((b) => b.t === bang);
  if (!bangsMatch) return;

  const newUrl = bangsMatch.u.replace(
    /{{{s}}}/g,
    encodeURIComponent(query.replace(`!${bang}`, ""))
  );

  location.href = newUrl;
}

redirect();
