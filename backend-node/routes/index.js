// all routes above...

app.post("/api/chat", async (req, res) => {
  // chatbot code here
});

// KEEP THIS BELOW
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});