document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('research-form');
    const queryInput = document.getElementById('query-input');
    const resultsSection = document.getElementById('results-section');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const submitButton = document.getElementById('submit-button');
    const copyReportButton = document.getElementById('copy-report-button');

    // Result display elements
    const traceUrlElement = document.getElementById('trace-url');
    const summaryElement = document.getElementById('summary');
    const reportElement = document.getElementById('report'); // This is now a div
    const verificationElement = document.getElementById('verification');
    const followUpList = document.getElementById('follow-up');

    // Configure marked.js (optional: customize options here if needed)
    // marked.setOptions({ ... });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const query = queryInput.value.trim();
        if (!query) return;

        // Reset state
        resultsSection.classList.add('hidden'); // Hide results until ready
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
        loadingIndicator.classList.remove('hidden');
        submitButton.disabled = true;
        submitButton.innerHTML = '<div class="spinner spinner-button"></div> Processing...'; // Change button content

        // Clear previous results explicitly
        traceUrlElement.href = '#';
        traceUrlElement.textContent = 'View Execution Trace';
        summaryElement.textContent = '';
        reportElement.innerHTML = ''; // Clear previous markdown
        verificationElement.textContent = '';
        followUpList.innerHTML = '';
        copyReportButton.classList.remove('copied');
        copyReportButton.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';

        try {
            const response = await fetch('/research', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }),
            });

            if (!response.ok) {
                let errorText = `Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorText += ` - ${errorData.detail || JSON.stringify(errorData)}`;
                } catch (e) { /* Ignore if response is not JSON */ }
                throw new Error(errorText);
            }

            const results = await response.json();

            // Populate results
            if (results.trace_url) {
                traceUrlElement.href = results.trace_url;
                traceUrlElement.parentElement.parentElement.classList.remove('hidden'); // Show trace card
            } else {
                traceUrlElement.parentElement.parentElement.classList.add('hidden'); // Hide trace card
            }

            summaryElement.textContent = results.summary || 'No summary provided.';

            // Use marked.js to render the report markdown
            if (results.report) {
                reportElement.innerHTML = marked.parse(results.report);
            } else {
                reportElement.innerHTML = '<p><em>No report generated.</em></p>';
            }

            verificationElement.textContent = results.verification_issues || 'No verification issues identified.';
            // Optionally format verification issues if they contain markdown/newlines
            verificationElement.innerHTML = verificationElement.textContent.replace(/\n/g, '<br>');

            followUpList.innerHTML = ''; // Clear previous items
            if (results.follow_up_questions && results.follow_up_questions.length > 0) {
                results.follow_up_questions.forEach(q => {
                    const li = document.createElement('li');
                    li.textContent = q;
                    followUpList.appendChild(li);
                });
            } else {
                 const li = document.createElement('li');
                 li.textContent = 'No follow-up questions suggested.';
                 followUpList.appendChild(li);
            }

            resultsSection.classList.remove('hidden'); // Show results section now

        } catch (error) {
            console.error('Research request failed:', error);
            errorMessage.textContent = `Failed to get results: ${error.message}`;
            errorMessage.classList.remove('hidden');
        } finally {
            loadingIndicator.classList.add('hidden');
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fa-solid fa-rocket"></i> Analyze'; // Restore button text
        }
    });

    // Copy Report Button Functionality
    copyReportButton.addEventListener('click', () => {
        const reportText = reportElement.innerText; // Get text content of the rendered markdown
        navigator.clipboard.writeText(reportText).then(() => {
            // Success feedback
            copyReportButton.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            copyReportButton.classList.add('copied');
            setTimeout(() => {
                copyReportButton.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
                copyReportButton.classList.remove('copied');
            }, 2000); // Reset after 2 seconds
        }).catch(err => {
            console.error('Failed to copy report:', err);
            // Optional: Show error feedback to user
            alert('Failed to copy report to clipboard.');
        });
    });
}); 