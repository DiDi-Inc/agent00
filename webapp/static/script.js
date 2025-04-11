document.addEventListener('DOMContentLoaded', () => {
    // Core form and display elements
    const form = document.getElementById('research-form');
    const queryInput = document.getElementById('query-input');
    const resultsSection = document.getElementById('results-section');
    const loadingContainer = document.getElementById('loading-indicator');
    const errorContainer = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const errorDismiss = document.getElementById('error-dismiss');
    const submitButton = document.getElementById('submit-button');
    const copyReportButton = document.getElementById('copy-report-button');
    const fullscreenToggle = document.getElementById('fullscreen-toggle');

    // Results display elements
    const traceUrlElement = document.getElementById('trace-url');
    const summaryElement = document.getElementById('summary');
    const reportElement = document.getElementById('report');
    const verificationElement = document.getElementById('verification');
    const verificationCard = document.querySelector('.verification-card');
    const followUpList = document.getElementById('follow-up');
    
    // Loading stages elements
    const loadingStages = document.querySelectorAll('.loading-stages .stage');

    // Configure marked.js options
    marked.setOptions({
        gfm: true, // GitHub Flavored Markdown
        breaks: true, // Convert line breaks to <br>
        headerIds: true,
        smartLists: true
    });

    // Initialize application state
    let activeLoadingStage = 0;
    let loadingInterval = null;
    
    // Helper to update loading stages
    function updateLoadingStage() {
        // Reset all stages
        loadingStages.forEach(stage => {
            stage.classList.remove('active', 'completed');
        });
        
        // Mark completed stages
        for (let i = 0; i < activeLoadingStage; i++) {
            loadingStages[i].classList.add('completed');
        }
        
        // Mark active stage if we haven't completed all stages
        if (activeLoadingStage < loadingStages.length) {
            loadingStages[activeLoadingStage].classList.add('active');
            activeLoadingStage = (activeLoadingStage + 1) % loadingStages.length;
        }
    }

    // Main form submission handling
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const query = queryInput.value.trim();
        if (!query) return;

        // Reset UI state
        resultsSection.classList.add('hidden');
        errorContainer.classList.add('hidden');
        loadingContainer.classList.remove('hidden');
        submitButton.disabled = true;
        
        // Clear previous results & reset card states
        traceUrlElement.href = '#';
        summaryElement.textContent = '';
        reportElement.innerHTML = '';
        verificationElement.textContent = '';
        verificationElement.innerHTML = '';
        verificationCard.classList.remove('has-issues', 'no-issues');
        followUpList.innerHTML = '';
        copyReportButton.classList.remove('copied');
        copyReportButton.innerHTML = '<i class="fa-solid fa-copy"></i><span>Copy</span>';

        // Reset loading animation state and start animation
        activeLoadingStage = 0;
        updateLoadingStage();
        loadingInterval = setInterval(updateLoadingStage, 1500);

        // Ensure collapsible sections are expanded for new results
        document.querySelectorAll('.glass-card.collapsible').forEach(card => {
            card.classList.remove('collapsed');
        });

        try {
            const response = await fetch('/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query }),
            });

            if (!response.ok) {
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage += `\n${errorData.detail || JSON.stringify(errorData)}`;
                } catch (e) { /* Ignore parsing errors */ }
                throw new Error(errorMessage);
            }

            const results = await response.json();

            // Stop loading animation
            clearInterval(loadingInterval);
            
            // Populate trace URL
            if (results.trace_url) {
                traceUrlElement.href = results.trace_url;
                traceUrlElement.closest('.trace-info').classList.remove('hidden');
            } else {
                traceUrlElement.closest('.trace-info').classList.add('hidden');
            }

            // Populate summary
            summaryElement.textContent = results.summary || 'No summary data available.';

            // Render markdown report
            if (results.report) {
                reportElement.innerHTML = marked.parse(results.report);
                
                // Apply syntax highlighting to code blocks if Prism.js is available
                if (typeof Prism !== 'undefined') {
                    document.querySelectorAll('#report pre code').forEach((block) => {
                        Prism.highlightElement(block);
                    });
                }
            } else {
                reportElement.innerHTML = '<p><em>No detailed report available.</em></p>';
            }

            // Handle verification display and styling
            const issues = results.verification_issues;
            if (issues) {
                // Format verification issues with spacing and icons
                const formattedIssues = issues
                    .split('\n')
                    .filter(line => line.trim().length > 0)
                    .map(line => {
                        // Add warning icon to each issue
                        if (line.match(/^\d+\./)) {
                            return `<div class="issue-item"><i class="fa-solid fa-triangle-exclamation"></i> ${line}</div>`;
                        }
                        return line;
                    })
                    .join('');
                
                verificationElement.innerHTML = formattedIssues;
                verificationCard.classList.add('has-issues');
                verificationCard.classList.remove('no-issues');
            } else {
                verificationElement.innerHTML = '<div class="issue-item success"><i class="fa-solid fa-check-circle"></i> No verification issues identified.</div>';
                verificationCard.classList.add('no-issues');
                verificationCard.classList.remove('has-issues');
            }

            // Populate follow-up questions
            followUpList.innerHTML = '';
            if (results.follow_up_questions && results.follow_up_questions.length > 0) {
                results.follow_up_questions.forEach(q => {
                    const li = document.createElement('li');
                    li.textContent = q;
                    
                    // Add a "Ask this" button to easily ask follow-up questions
                    const askButton = document.createElement('button');
                    askButton.className = 'ask-button';
                    askButton.innerHTML = '<i class="fa-solid fa-reply"></i>';
                    askButton.title = 'Ask this question';
                    askButton.addEventListener('click', () => {
                        queryInput.value = q;
                        queryInput.focus();
                        // Scroll to the query form
                        document.querySelector('.query-form-container').scrollIntoView({ behavior: 'smooth' });
                    });
                    
                    li.appendChild(askButton);
                    followUpList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No follow-up questions suggested.';
                followUpList.appendChild(li);
            }

            // Show results
            loadingContainer.classList.add('hidden');
            resultsSection.classList.remove('hidden');

        } catch (error) {
            // Handle error state
            clearInterval(loadingInterval);
            console.error('Research request failed:', error);
            errorText.textContent = error.message;
            loadingContainer.classList.add('hidden');
            errorContainer.classList.remove('hidden');
        } finally {
            submitButton.disabled = false;
        }
    });

    // Error message dismissal
    if (errorDismiss) {
        errorDismiss.addEventListener('click', () => {
            errorContainer.classList.add('hidden');
        });
    }

    // Copy Report functionality
    copyReportButton.addEventListener('click', () => {
        // Extract text content from the rendered markdown, preserving structure
        const reportText = extractFormattedText(reportElement);
        
        navigator.clipboard.writeText(reportText).then(() => {
            copyReportButton.innerHTML = '<i class="fa-solid fa-check"></i><span>Copied!</span>';
            copyReportButton.classList.add('copied');
            
            setTimeout(() => {
                copyReportButton.innerHTML = '<i class="fa-solid fa-copy"></i><span>Copy</span>';
                copyReportButton.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy report:', err);
            alert('Failed to copy report to clipboard.');
        });
    });

    // Fullscreen toggle functionality
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
                fullscreenToggle.innerHTML = '<i class="fa-solid fa-compress"></i>';
                fullscreenToggle.title = 'Exit Fullscreen';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    fullscreenToggle.innerHTML = '<i class="fa-solid fa-expand"></i>';
                    fullscreenToggle.title = 'Toggle Fullscreen';
                }
            }
        });
    }

    // Collapsible section toggling
    document.querySelectorAll('.collapsible .card-header').forEach(header => {
        header.addEventListener('click', (e) => {
            // Don't toggle if a button inside the header was clicked
            if (e.target.closest('.card-actions')) return;
            
            const card = header.closest('.collapsible');
            card.classList.toggle('collapsed');
        });
    });

    // Also allow toggling via the specific toggle button
    document.querySelectorAll('.toggle-collapse-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the header click handler from firing
            const card = e.target.closest('.collapsible');
            if (card) {
                card.classList.toggle('collapsed');
            }
        });
    });

    // Helper function to extract text content with formatting
    function extractFormattedText(element) {
        let text = '';
        
        // Process all child nodes
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                
                // Handle different element types
                switch (tagName) {
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        text += '\n\n' + node.textContent + '\n';
                        break;
                    case 'p':
                        text += '\n' + node.textContent + '\n';
                        break;
                    case 'ul':
                    case 'ol':
                        text += '\n';
                        node.querySelectorAll('li').forEach(li => {
                            text += '\n• ' + li.textContent;
                        });
                        text += '\n';
                        break;
                    case 'li':
                        // Skip individual li processing as we handle them in ul/ol
                        break;
                    case 'blockquote':
                        text += '\n> ' + node.textContent + '\n';
                        break;
                    case 'pre':
                        text += '\n```\n' + node.textContent + '\n```\n';
                        break;
                    default:
                        text += node.textContent;
                }
            }
        });
        
        // Clean up multiple consecutive newlines
        return text.replace(/\n{3,}/g, '\n\n').trim();
    }
}); 