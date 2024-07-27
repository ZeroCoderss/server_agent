self.onmessage = function (event) {
  // Handle the message sent to the worker
  const data = event.data;

  console.log("data", data);

  for (let i = 0; i < 1e6; i++) {
    for (let j = 0; j < 100000; j++) {}
  }

  const result = data; // Example computation

  // Post the result back to the main thread
  self.postMessage({ result });
};
