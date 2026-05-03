document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('evaluationForm');
    const resultsSection = document.getElementById('resultsSection');
    const loadingState = document.getElementById('loadingState');
    const feedbackContainer = document.getElementById('feedbackContainer');
    const submitBtn = document.getElementById('submitBtn');
    
    let radarChartInstance = null;
    // Initialize Empty Chart
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    Chart.defaults.color = '#8892b0';
    Chart.defaults.font.family = 'Outfit, sans-serif';
    const initChart = (data) => {
        if (radarChartInstance) {
            radarChartInstance.destroy();
        }
        radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    'Innovation', 
                    'Feasibility (Tabuk)', 
                    'Human Impact', 
                    'Beneficiary Value', 
                    'SDG Alignment'
                ],
                datasets: [{
                    label: 'Evaluation Score',
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
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#e6f1ff',
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        },
                        ticks: {
                            min: 0,
                            max: 5,
                            stepSize: 1,
                            display: false // Hide numbers on the axis to keep it clean
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
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
                                return `Score: ${context.raw} / 5`;
                            }
                        }
                    }
                }
            }
        });
    };
    // Initialize with zeros
    initChart([0,0,0,0,0]);
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
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-fbsu-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
        `;
        try {
            const response = await fetch('/api/evaluate', {
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
            const scores = [
                data.scores.innovation || 0,
                data.scores.feasibility || 0,
                data.scores.human_impact || 0,
                data.scores.beneficiary_value || 0,
                data.scores.sdg_alignment || 0
            ];
            // Update Chart
            initChart(scores);
            // Update Feedback text
            feedbackContainer.innerHTML = `
                <div class="bg-fbsu-card/80 border border-fbsu-gold/20 rounded-xl p-4 mb-4">
                    <h3 class="text-fbsu-gold font-semibold text-sm mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Market Context & Weaknesses
                    </h3>
                    <p class="text-sm text-fbsu-light/90 leading-relaxed">${data.feedback.weaknesses || 'N/A'}</p>
                </div>
                
                <div class="bg-fbsu-card/80 border border-fbsu-green/20 rounded-xl p-4 mb-4">
                    <h3 class="text-fbsu-green font-semibold text-sm mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        Human Impact Analysis
                    </h3>
                    <p class="text-sm text-fbsu-light/90 leading-relaxed">${data.feedback.human_impact_analysis || 'N/A'}</p>
                </div>
                <div class="bg-fbsu-card/80 border border-blue-400/20 rounded-xl p-4">
                    <h3 class="text-blue-400 font-semibold text-sm mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><circle cx="12" cy="12" r="10"/></svg>
                        SDG Alignment
                    </h3>
                    <p class="text-sm text-fbsu-light/90 leading-relaxed">${data.feedback.sdg_alignment_analysis || 'N/A'}</p>
                </div>
            `;
        } catch (error) {
            console.error('Error:', error);
            feedbackContainer.innerHTML = `
                <div class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-center text-sm">
                    An error occurred while evaluating the idea. Please ensure the backend is running and API keys are set.
                </div>
            `;
        } finally {
            // Restore UI State
            loadingState.classList.add('opacity-0', 'pointer-events-none');
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span>Evaluate Impact</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            `;
        }
    });
});