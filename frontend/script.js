async function evaluateIdea() {
    const title = document.getElementById('ideaTitle').value;
    const problem = document.getElementById('problemStatement').value;
    const beneficiary = document.getElementById('targetBeneficiary').value;

    if (!title || !problem || !beneficiary) {
        alert("الرجاء تعبئة جميع الخانات لو سمحت");
        return;
    }

    // إظهار شاشة التحميل وإخفاء النتائج القديمة
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');

    try {
        const response = await fetch('https://fbsu-app.onrender.com/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, problem, beneficiary })
        });

        const data = await response.json();

        if (data.error) {
            alert("خطأ: " + data.error);
        } else {
            displayResults(data);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ في الاتصال بالسيرفر");
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
}

function displayResults(data) {
    const resultsSection = document.getElementById('results');
    const scoresGrid = document.getElementById('scoresGrid');
   
    // تفريغ المحتوى القديم
    scoresGrid.innerHTML = '';
    resultsSection.classList.remove('hidden');

    // عرض الدرجات (الجزء القديم)
    const criteria = {
        "Innovation": "الابتكار",
        "Feasibility": "قابلية التنفيذ",
        "Market Potential": "احتياج السوق",
        "Impact": "الأثر المتوقع"
    };

    for (const [key, label] of Object.entries(criteria)) {
        const score = data[key] || 0;
        const scoreCard = document.createElement('div');
        scoreCard.className = 'score-card';
        scoreCard.innerHTML = `
            <h4>${label}</h4>
            <div class="score-value">${score}/10</div>
        `;
        scoresGrid.appendChild(scoreCard);
    }

    // عرض بيانات التطوير (الجزء الجديد والمهم)
    document.getElementById('improvementContent').innerText = data.improvement_tips || "سيظهر هنا مقترحات لتطوير فكرتك قريباً...";
    document.getElementById('techContent').innerText = data.tech_stack || "سيتم اقتراح أدوات برمجية مناسبة...";
    document.getElementById('visionContent').innerText = data.future_vision || "سيتم رسم رؤية لمستقبل المشروع...";

    // التمرير التلقائي للنتائج
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}
