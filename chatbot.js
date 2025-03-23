<!DOCTYPE html>
<html lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>צ'אט עם ג'מיני</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            direction: rtl;
            text-align: right;
            margin: 0;
            padding: 0;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        #chat-box {
            height: 400px;
            overflow-y: auto;
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
            background: #fff;
        }
        #chat-box p {
            margin: 8px 0;
            padding: 6px 10px;
            border-radius: 5px;
            background: #f1f1f1;
        }
        #input-container {
            display: flex;
            align-items: center;
            padding: 8px;
            background: #fff;
        }
        #user-input {
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
            margin-left: 8px;
        }
        #send-btn, #record-btn {
            background: #28a745;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 16px;
            color: white;
            margin-left: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s;
        }
        #send-btn:hover, #record-btn:hover {
            background: #218838;
        }
    </style>
</head>
<body>
    <div id="chat-box">
        <p><strong>מערכת:</strong> הצ'אט נטען בהצלחה!</p>
    </div>
    <div id="input-container">
        <input type="text" id="user-input" placeholder="שאל אותי על סאונד...">
        <button id="send-btn" title="שלח">▶</button>
        <button id="record-btn" title="הקלט">🎤</button>
    </div>

    <script>
        const chatBox = document.getElementById("chat-box");
        const userInput = document.getElementById("user-input");
        const sendBtn = document.getElementById("send-btn");
        const recordBtn = document.getElementById("record-btn");

        // פונקציה לשליחת הודעה
        const API_KEY = "AIzaSyA-Y1xpQu986jdyC43_txYXFpieBuiOf0M";
        async function sendMessage(message) {
            if (!message) return;

            chatBox.innerHTML += `<p><strong>אתה:</strong> ${message}</p>`;
            chatBox.scrollTop = chatBox.scrollHeight;

            try {
                let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
                });

                let data = await response.json();
                let botMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠ שגיאה בתשובה.";
                chatBox.innerHTML += `<p dir="auto"><strong>ג'מיני:</strong> ${botMessage}</p>`;
                chatBox.scrollTop = chatBox.scrollHeight;
            } catch (error) {
                console.error("Error:", error);
                chatBox.innerHTML += `<p><strong>ג'מיני:</strong> ⚠ שגיאה בתקשורת.</p>`;
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }

        // שליחה עם כפתור
        sendBtn.addEventListener("click", () => sendMessage(userInput.value.trim()));
        
        // שליחה עם Enter
        userInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") sendMessage(userInput.value.trim());
        });

        // הקלטה קולית
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = "he-IL";
            recognition.continuous = false;
            recognition.interimResults = false;

            recordBtn.addEventListener("click", () => {
                navigator.permissions.query({ name: "microphone" }).then((result) => {
                    if (result.state === "granted") {
                        try {
                            recognition.start();
                            recordBtn.style.background = "#dc3545";
                            chatBox.innerHTML += `<p><strong>מערכת:</strong> הקלטה מתחילה...</p>`;
                            chatBox.scrollTop = chatBox.scrollHeight;
                        } catch (error) {
                            console.error("Recording error:", error);
                            chatBox.innerHTML += `<p><strong>מערכת:</strong> שגיאה בהקלטה: ${error.message}</p>`;
                            chatBox.scrollTop = chatBox.scrollHeight;
                        }
                    } else if (result.state === "prompt") {
                        navigator.mediaDevices.getUserMedia({ audio: true })
                            .then(() => {
                                recognition.start();
                                recordBtn.style.background = "#dc3545";
                                chatBox.innerHTML += `<p><strong>מערכת:</strong> הקלטה מתחילה...</p>`;
                                chatBox.scrollTop = chatBox.scrollHeight;
                            })
                            .catch((error) => {
                                console.error("Microphone permission error:", error);
                                chatBox.innerHTML += `<p><strong>מערכת:</strong> שגיאה: אין הרשאה למיקרופון. אנא אפשר גישה בהגדרות הדפדפן (Settings > Privacy and Security > Site Settings > Microphone).</p>`;
                                chatBox.scrollTop = chatBox.scrollHeight;
                            });
                    } else {
                        chatBox.innerHTML += `<p><strong>מערכת:</strong> שגיאה: גישה למיקרופון נחסמה. אנא אפשר גישה בהגדרות הדפדפן (Settings > Privacy and Security > Site Settings > Microphone).</p>`;
                        chatBox.scrollTop = chatBox.scrollHeight;
                    }
                });
            });

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                userInput.value = transcript;
                recordBtn.style.background = "#28a745";
                chatBox.innerHTML += `<p><strong>מערכת:</strong> הקלטה הסתיימה. תמליל: ${transcript}</p>`;
                chatBox.scrollTop = chatBox.scrollHeight;
            };

            recognition.onend = () => {
                recordBtn.style.background = "#28a745";
                chatBox.innerHTML += `<p><strong>מערכת:</strong> הקלטה הסתיימה.</p>`;
                chatBox.scrollTop = chatBox.scrollHeight;
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                chatBox.innerHTML += `<p><strong>מערכת:</strong> שגיאה בהקלטה: ${event.error}</p>`;
                chatBox.scrollTop = chatBox.scrollHeight;
                recordBtn.style.background = "#28a745";
            };
        } else {
            recordBtn.style.display = "none";
            chatBox.innerHTML += `<p><strong>מערכת:</strong> הקלטה קולית לא נתמכת בדפדפן זה.</p>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    </script>
</body>
</html>
