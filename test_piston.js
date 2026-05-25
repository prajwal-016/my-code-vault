// use native fetch

async function run() {
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: "python",
        version: "*",
        files: [{ content: "print(1)" }]
      })
    });
    const result = await response.json();
    console.log(result);
  } catch (e) {
    console.error(e);
  }
}

run();
