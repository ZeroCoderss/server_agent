self.onmessage = function (event) {
  // Handle the message sent to the worker
  const data = event.data;

  console.log("data", data);

  // you need define all work details here

  const result = data;

  // Post the result back to the main thread
  self.postMessage({ result });
};
