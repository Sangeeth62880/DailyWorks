document.addEventListener('DOMContentLoaded', function() {
    // Get all necessary elements
    const jobseekerTab = document.getElementById('jobseekerTab');
    const recruiterTab = document.getElementById('recruiterTab');
    const companyField = document.getElementById('companyField');
    const companyInput = document.getElementById('company');
    let currentRole = 'jobseeker'; // Default role

    // Function to switch roles
    function switchRole(role) {
        // Update tabs
        if (role === 'jobseeker') {
            jobseekerTab.classList.add('active');
            recruiterTab.classList.remove('active');
            companyField.style.display = 'none';
            companyInput.required = false;
        } else {
            recruiterTab.classList.add('active');
            jobseekerTab.classList.remove('active');
            companyField.style.display = 'block';
            companyInput.required = true;
        }
        
        currentRole = role;
        console.log('Role switched to:', role); // Debug log
    }

    // Add click event listeners
    if (jobseekerTab) {
        jobseekerTab.addEventListener('click', (e) => {
            e.preventDefault();
            switchRole('jobseeker');
        });
    }

    if (recruiterTab) {
        recruiterTab.addEventListener('click', (e) => {
            e.preventDefault();
            switchRole('recruiter');
        });
    }

    // Add role to form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            // Add hidden input for role
            let roleInput = document.querySelector('input[name="role"]');
            if (!roleInput) {
                roleInput = document.createElement('input');
                roleInput.type = 'hidden';
                roleInput.name = 'role';
                registerForm.appendChild(roleInput);
            }
            roleInput.value = currentRole;
        });

    }

    // Add this at the bottom of role-switcher.js for debugging
document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', function(e) {
        console.log('Tab clicked:', this.dataset.role);
        console.log('Event target:', e.target);
        console.log('Current role:', currentRole);
    });
});
});