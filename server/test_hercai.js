const { Hercai } = require('hercai');
const herc = new Hercai({});

async function test() {
  try {
    const response = await herc.chat.completions.create({ model: "v3", content: "Say hello in JSON { \"msg\": \"hello\" }" });
    console.log("Response:", response.reply);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
