(async () => {
  const src = chrome.runtime.getURL('contentMain.js');
  const contentScript = await import(src);
  contentScript.main();
})();