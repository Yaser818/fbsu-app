document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('evaluationForm');
    const resultsSection = document.getElementById('resultsSection');
    const loadingState = document.getElementById('loadingState');
    const feedbackContainer = document.getElementById('feedbackContainer');
    const submitBtn = document.getElementById('submitBtn');
    
    // Language State
    let currentLang = 'en';

    // Chart Configuration
    let radarChartInstance = null;
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    Chart.defaults.color = '#8892b0';

    const getChartLabels = () => {
        if (currentLang === 'en') {
            return ['Innovation', 'Feasibility (Tabuk)', 'Human Impact', 'Beneficiary Value', 'SDG Alignment'];
        } else {
            return ['الابتكار', 'الجدوى (تبوك)', 'الأثر البشري', 'قيمة المستفيد', 'أهداف التنمية المستدامة'];
        }
    };

    const initChart = (data) => {
        if (radarChartInstance) {
            radarChartInstance.destroy();
        }

        Chart.defaults.font.family = currentLang === 'en' ? 'Outfit, sans-serif' : 'Tajawal, sans-serif';

        radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: getChartLabels(),
                datasets: [{
                    label: currentLang === 'en' ? 'Evaluation Score' : 'درجة التقييم',
                    data: data || [0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(0, 180, 104, 0.2)',
                    borderColor: '#00b468',
                    pointBackgroundColor: '#d4af37',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#d4af37',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: {
                            color: '#e6f1ff',
                            font: { size: 12, weight: '500' }
                        },
                        ticks: { min: 0, max: 5, stepSize: 1, display: false }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(10, 25, 47, 0.9)',
                        titleColor: '#00b468',
                        bodyColor: '#e6f1ff',
                        borderColor: 'rgba(0, 180, 104, 0.3)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return currentLang === 'en' ? `Score: ${context.raw} / 5` : `الدرجة: ${context.raw} / 5`;
                            }
                        }
                    }
                }
            }
        });
    };

    // Initialize with zeros
    let lastScores = [0,0,0,0,0];
    initChart(lastScores);

    // Language Toggle Logic
    const langToggle = document.getElementById('langToggle');
    const langText = document.getElementById('langText');
    const langIcon = document.getElementById('langIcon');

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'ar' : 'en';
        
        document.documentElement.lang = currentLang;
        document.documentElement.dir = currentLang === 'en' ? 'ltr' : 'rtl';
        
        if (currentLang === 'ar') {
            document.documentElement.classList.remove('font-en');
            document.documentElement.classList.add('font-ar');
            langText.textContent = 'English';
            langIcon.textContent = 'EN';
            langIcon.classList.remove('text-fbsu-green');
            langIcon.classList.add('text-fbsu-gold');
        } else {
            document.documentElement.classList.remove('font-ar');
            document.documentElement.classList.add('font-en');
            langText.textContent = 'العربية';
            langIcon.textContent = 'ع';
            langIcon.classList.remove('text-fbsu-gold');
            langIcon.classList.add('text-fbsu-green');
        }
        
        // Update all standard text elements
        document.querySelectorAll('[data-en]').forEach(el => {
            el.textContent = el.getAttribute(`data-${currentLang}`);
        });
        
        // Update placeholders
        document.querySelectorAll('[data-placeholder-en]').forEach(el => {
            el.placeholder = el.getAttribute(`data-placeholder-${currentLang}`);
        });

        // Re-render chart with correct language labels
        initChart(lastScores);

        // If feedback exists, translate headers
        const weakHeader = document.getElementById('weakHeader');
        const impactHeader = document.getElementById('impactHeader');
        const sdgHeader = document.getElementById('sdgHeader');
        if(weakHeader) weakHeader.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 rtl:ml-2 rtl:mr-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${currentLang === 'en' ? 'Market Context & Weaknesses' : 'سياق السوق ونقاط الضعف'}`;
        if(impactHeader) impactHeader.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 rtl:ml-2 rtl:mr-0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${currentLang === 'en' ? 'Human Impact Analysis' : 'تحليل الأثر البشري'}`;
        if(sdgHeader) sdgHeader.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 rtl:ml-2 rtl:mr-0"><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><circle cx="12" cy="12" r="10"/></svg> ${currentLang === 'en' ? 'SDG Alignment' : 'مواءمة أهداف التنمية المستدامة'}`;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const requestData = {
            idea: formData.get('idea'),
            problem: formData.get('problem'),
            beneficiary: formData.get('beneficiary')
        };

        // UI State: Loading
        resultsSection.classList.remove('opacity-50', 'blur-[2px]', 'pointer-events-none');
        loadingState.classList.remove('opacity-0', 'pointer-events-none');
        submitBtn.disabled = true;
        
        const loadingText = currentLang === 'en' ? 'Processing...' : 'جاري المعالجة...';
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 rtl:mr-0 rtl:ml-3 h-5 w-5 text-fbsu-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>${loadingText}</span>
        `;

        try {
            // Using your exact Render URL endpoint
            const response = await fetch('https://fbsu-app.onrender.com/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Extract scores
            lastScores = [
                data.scores.innovation || 0,
                data.scores.feasibility || 0,
                data.scores.human_impact || 0,
                data.scores.beneficiary_value || 0,
                data.scores.sdg_alignment || 0
            ];

            // Update Chart
            initChart(lastScores);

            // Update Feedback text dynamically
            const weakTitle = currentLang === 'en' ? 'Market Context & Weaknesses' : 'سياق السوق ونقاط الضعف';
            const impactTitle = currentLang === 'en' ? 'Human Impact Analysis' : 'تحليل الأثر البشري';
            const sdgTitle = currentLang === 'en' ? 'SDG Alignment' : 'مواءمة أهداف التنمية المستدامة';

            feedbackContainer.innerHTML = `
                <div class="bg-fbsu-card/80 border border-fbsu-gold/20 rounded-xl p-4 mb-4">
                    <h3 id="weakHeader" class="text-fbsu-gold font-semibold text-sm mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 rtl:ml-2 rtl:mr-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        ${weakTitle}
                    </h3>
                    <p class="text-sm text-fbsu-light/90 leading-relaxed">${data.feedback.weaknesses || 'N/A'}</p>
                </div>
                
                <div class="bg-fbsu-card/80 border border-fbsu-green/20 rounded-xl p-4 mb-4">
                    <h3 id="impactHeader" class="text-fbsu-green font-semibold text-sm mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 rtl:ml-2 rtl:mr-0"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        ${impactTitle}
                    </h3>
                    <p class="text-sm text-fbsu-light/90 leading-relaxed">${data.feedback.human_impact_analysis || 'N/A'}</p>
                </div>

                <div class="bg-fbsu-card/80 border border-blue-400/20 rounded-xl p-4">
                    <h3 id="sdgHeader" class="text-blue-400 font-semibold text-sm mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 rtl:ml-2 rtl:mr-0"><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><circle cx="12" cy="12" r="10"/></svg>
                        ${sdgTitle}
                    </h3>
                    <p class="text-sm text-fbsu-light/90 leading-relaxed">${data.feedback.sdg_alignment_analysis || 'N/A'}</p>
                </div>
            `;

        } catch (error) {
            console.error('Error:', error);
            const errorText = currentLang === 'en' ? 'An error occurred while evaluating the idea. Please try again.' : 'حدث خطأ أثناء تقييم الفكرة. يرجى المحاولة مرة أخرى.';
            feedbackContainer.innerHTML = `
                <div class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-center text-sm">
                    ${errorText}
                </div>
            `;
        } finally {
            // Restore UI State
            loadingState.classList.add('opacity-0', 'pointer-events-none');
            submitBtn.disabled = false;
            const btnText = currentLang === 'en' ? 'Evaluate Impact' : 'تقييم الأثر';
            submitBtn.innerHTML = `
                <span id="submitText" data-en="Evaluate Impact" data-ar="تقييم الأثر">${btnText}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            `;
        }
    });
});
