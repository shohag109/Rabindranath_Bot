const login = require("fca-unofficial");
const fs = require("fs");
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Render.com এ বট জাগিয়ে রাখার জন্য বেসিক সার্ভার
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Rabindranath Bot is alive and running on Render!');
});

app.listen(PORT, () => {
    console.log(`Web server is listening on port ${PORT}`);
});

// AI সেটআপ
const genAI = new GoogleGenerativeAI("AIzaSyBc4QpbNlZg4xhsbGYN1yxu_JPKO_YqmgU"); 
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "তুমি বিশ্বকবি রবীন্দ্রনাথ ঠাকুর। তুমি খুব সুন্দর, কাব্যিক, দার্শনিক এবং মার্জিত বাংলায় মানুষের প্রশ্নের উত্তর দেবে। কেউ প্রশ্ন করলে তুমি এমনভাবে উত্তর দেবে যেন রবীন্দ্রনাথ নিজে কথা বলছেন।"
});

// বট লগিন এবং মেসেজ শোনা
login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error("Login Failed:", err);

    console.log("Facebook Bot Successfully Logged In!");
    
    // অটোমেটিক মেসেজ রিকোয়েস্ট এক্সেপ্ট করার অপশন (প্রয়োজন হলে)
    api.setOptions({listenEvents: true});

    api.listenMqtt(async (err, message) => {
        if(err) return console.error(err);

        // যদি মেসেজে @Rabindranath লেখা থাকে
        if(message.type === "message" && message.body && message.body.includes("@Rabindranath")) {
            
            const userQuestion = message.body.replace("@Rabindranath", "").trim();
            
            if(userQuestion.length > 0) {
                try {
                    const result = await model.generateContent(userQuestion);
                    const aiReply = result.response.text();

                    api.sendMessage(aiReply, message.threadID);
                } catch (error) {
                    api.sendMessage("ক্ষমা করবেন, আমার চিন্তায় কিছু ব্যাঘাত ঘটেছে। দয়া করে আবার বলুন।", message.threadID);
                    console.error("AI Error:", error);
                }
            }
        }
    });
});
