const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// تقديم ملفات الواجهة (Frontend)
app.use(express.static(path.join(__dirname)));

// مسار حفظ البيانات بالسيرفر (Database File)
const DB_FILE = path.join(__dirname, 'db.json');

function loadData() {
    if (fs.existsSync(DB_FILE)) {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
    return {
        tasks: [{ id: 1, text: "متابعة وتنبيه حجز تذاكر الأفلام فور نزولها" }],
        news: [{ id: 1, text: "متابعة نتائج المباريات والأهداف" }],
        interests: ["الذكاء الاصطناعي", "التسويق الرقمي", "تطوير الويب"]
    };
}

function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// جلب البيانات
app.get('/api/data', (req, res) => {
    res.json(loadData());
});

// تحديث البيانات
app.post('/api/data', (req, res) => {
    const { tasks, news, interests } = req.body;
    const currentData = loadData();
    const updated = {
        tasks: tasks || currentData.tasks,
        news: news || currentData.news,
        interests: interests || currentData.interests
    };
    saveData(updated);
    res.json({ success: true, data: updated });
});

// أتمتة الشات
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "الرسالة فارغة" });

    let data = loadData();
    let reply = "";
    const lower = message.toLowerCase();

    if (lower.includes('فيلم') || lower.includes('تذكرة') || lower.includes('حجز')) {
        data.tasks.push({ id: Date.now(), text: `حجز تذكرة: ${message}` });
        saveData(data);
        reply = `تم تسجيل مهمة الحجز بالسيرفر بنجاح! سيتم تنبيهك فور توفر التذكرة.`;
    } else if (lower.includes('ماتش') || lower.includes('مباراة') || lower.includes('تابع') || lower.includes('النتيجة')) {
        data.news.push({ id: Date.now(), text: `متابعة: ${message}` });
        saveData(data);
        reply = `تم إضافة المتابعة لقائمة المباريات والأخبار بنجاح! سأوافيك بالنتيجة فور انتهائها.`;
    } else {
        reply = `تم تسجيل طلبك في السيرفر بنجاح: "${message}"`;
    }

    res.json({ reply, data });
});

app.listen(PORT, () => console.log(`IRIS Server is running on port ${PORT}`));