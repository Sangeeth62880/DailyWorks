document.addEventListener('DOMContentLoaded', function() {
    const jobPostForm = document.getElementById('jobPostForm');
    const addQuestionBtn = document.getElementById('addQuestion');
    const screeningQuestions = document.getElementById('screeningQuestions');
    const saveDraftBtn = document.getElementById('saveDraft');
    const currentTime = document.getElementById('currentTime');

    let questionCounter = 0;
    let formDirty = false;
    let lastSavedData = null;

    // Update current time
    function updateCurrentTime() {
        const now = new Date();
        currentTime.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    }
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // Form validation rules
    const validationRules = {
        jobTitle: {
            required: true,
            minLength: 3,
            maxLength: 100
        },
        department: {
            required: true,
            minLength: 2,
            maxLength: 50
        },
        location: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        salaryMin: {
            type: 'number',
            min: 0
        },
        salaryMax: {
            type: 'number',
            min: 0,
            greaterThan: 'salaryMin'
        },
        description: {
            required: true,
            minLength: 100,
            maxLength: 5000
        },
        requirements: {
            required: true,
            minLength: 50,
            maxLength: 2000
        }
    };

    // Validate form data
    function validateForm(formData) {
        const errors = [];

        for (const [field, rules] of Object.entries(validationRules)) {
            const value = formData.get(field);

            if (rules.required && !value) {
                errors.push(`${field} is required`);
                continue;
            }

            if (value) {
                if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters`);
                }

                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${field} must not exceed ${rules.maxLength} characters`);
                }

                if (rules.type === 'number') {
                    const numValue = Number(value);
                    if (isNaN(numValue)) {
                        errors.push(`${field} must be a number`);
                    } else if (rules.min !== undefined && numValue < rules.min) {
                        errors.push(`${field} must be greater than ${rules.min}`);
                    }
                }

                if (rules.greaterThan) {
                    const compareValue = Number(formData.get(rules.greaterThan));
                    const currentValue = Number(value);
                    if (currentValue <= compareValue) {
                        errors.push(`${field} must be greater than ${rules.greaterThan}`);
                    }
                }
            }
        }

        return errors;
    }

    // Add Screening Question
    addQuestionBtn.addEventListener('click', () => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.dataset.questionId = questionCounter;
        questionItem.innerHTML = `
            <button type="button" class="remove-question">
                <i class="fas fa-times"></i>
            </button>
            <div class="form-group">
                <label for="question${questionCounter}">Question ${questionCounter + 1}</label>
                <input type="text" id="question${questionCounter}" 
                       name="screeningQuestions[${questionCounter}][question]" 
                       placeholder="Enter your question" required>
            </div>
            <div class="form-group">
                <label for="questionType${questionCounter}">Answer Type</label>
                <select id="questionType${questionCounter}" 
                        name="screeningQuestions[${questionCounter}][type]"
                        onchange="handleQuestionTypeChange(this, ${questionCounter})">
                    <option value="text">Text</option>
                    <option value="yesno">Yes/No</option>
                    <option value="multiple">Multiple Choice</option>
                </select>
            </div>
            <div id="optionsContainer${questionCounter}" class="options-container" style="display: none;">
                <div class="form-group">
                    <label>Options</label>
                    <div class="options-list">
                        <div class="option-item">
                            <input type="text" name="screeningQuestions[${questionCounter}][options][]" 
                                   placeholder="Enter an option">
                            <button type="button" class="btn btn-outline btn-sm add-option">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        screeningQuestions.appendChild(questionItem);
        questionCounter++;
        formDirty = true;

        // Remove Question Handler
        questionItem.querySelector('.remove-question').addEventListener('click', () => {
            questionItem.remove();
            formDirty = true;
        });
    });

    // Handle question type change
    window.handleQuestionTypeChange = function(select, questionId) {
        const optionsContainer = document.getElementById(`optionsContainer${questionId}`);
        if (select.value === 'multiple') {
            optionsContainer.style.display = 'block';
        } else {
            optionsContainer.style.display = 'none';
        }
        formDirty = true;
    };

    // Add option to multiple choice question
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-option')) {
            const optionsList = e.target.closest('.options-list');
            const questionId = e.target.closest('.question-item').dataset.questionId;
            const newOption = document.createElement('div');
            newOption.className = 'option-item';
            newOption.innerHTML = `
                <input type="text" name="screeningQuestions[${questionId}][options][]" 
                       placeholder="Enter an option">
                <button type="button" class="btn btn-outline btn-sm remove-option">
                    <i class="fas fa-minus"></i>
                </button>
            `;
            optionsList.appendChild(newOption);
            formDirty = true;
        }
    });

    // Remove option from multiple choice question
    document.addEventListener('click', (e) => {
        if (e.target.closest('.remove-option')) {
            e.target.closest('.option-item').remove();
            formDirty = true;
        }
    });

    // Auto-save draft every 5 minutes
    let autoSaveInterval = setInterval(async () => {
        if (formDirty) {
            await autoSaveDraft();
        }
    }, 5 * 60 * 1000);

    // Auto-save draft
    async function autoSaveDraft() {
        try {
            const formData = new FormData(jobPostForm);
            const currentData = JSON.stringify(Object.fromEntries(formData));

            if (currentData === lastSavedData) {
                return;
            }

            const response = await fetch('/api/jobs/draft', {
                method: 'POST',
                body: currentData,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to auto-save draft');

            lastSavedData = currentData;
            formDirty = false;
            showNotification('success', 'Draft auto-saved successfully', 2000);
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    // Save as Draft
    saveDraftBtn.addEventListener('click', async () => {
        try {
            const formData = new FormData(jobPostForm);
            formData.append('status', 'draft');

            const errors = validateForm(formData);
            if (errors.length > 0) {
                showNotification('error', errors.join('\n'));
                return;
            }

            const response = await fetch('/api/jobs', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(formData)),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to save draft');

            showNotification('success', 'Job post saved as draft');
            formDirty = false;
            setTimeout(() => {
                window.location.href = '/dashboard/recruiter/manage-jobs.html';
            }, 1500);
        } catch (error) {
            showNotification('error', 'Failed to save draft. Please try again.');
        }
    });

    // Form Submission
    jobPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData(jobPostForm);
            formData.append('status', 'published');

            const errors = validateForm(formData);
            if (errors.length > 0) {
                showNotification('error', errors.join('\n'));
                return;
            }

            const submitButton = jobPostForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

            const response = await fetch('/api/jobs', {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(formData)),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to post job');

            clearInterval(autoSaveInterval);
            showNotification('success', 'Job posted successfully');
            setTimeout(() => {
                window.location.href = '/dashboard/recruiter/manage-jobs.html';
            }, 1500);
        } catch (error) {
            showNotification('error', 'Failed to post job. Please try again.');
            const submitButton = jobPostForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Post Job';
        }
    });

    // Handle form changes
    jobPostForm.addEventListener('input', () => {
        formDirty = true;
    });

    // Warn user before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (formDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // Load draft if available
    async function loadDraft() {
        try {
            const response = await fetch('/api/jobs/draft');
            if (response.ok) {
                const draft = await response.json();
                if (draft) {
                    Object.entries(draft).forEach(([key, value]) => {
                        const input = jobPostForm.querySelector(`[name="${key}"]`);
                        if (input) {
                            input.value = value;
                        }
                    });
                    lastSavedData = JSON.stringify(draft);
                }
            }
        } catch (error) {
            console.error('Failed to load draft:', error);
        }
    }

    // Initialize
    loadDraft();
});

// Initialize text editor if available
if (typeof tinymce !== 'undefined') {
    tinymce.init({
        selector: '#description, #requirements',
        height: 300,
        menubar: false,
        plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
        ],
        toolbar: 'undo redo | formatselect | bold italic backcolor | \
                 alignleft aligncenter alignright alignjustify | \
                 bullist numlist outdent indent | removeformat | help'
    });
}