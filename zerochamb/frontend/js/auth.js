document.addEventListener('DOMContentLoaded', () => {
    // Form handling
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;

            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
                submitBtn.disabled = true;

                // Make API call
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password, remember })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect based on user role
                const redirectUrl = data.user.role === 'recruiter' 
                    ? '/dashboard/recruiter' 
                    : '/dashboard/jobseeker';
                    
                window.location.href = redirectUrl;

            } catch (error) {
                // Show error message
                showNotification('error', error.message);
                
                // Reset button state
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                submitBtn.disabled = false;
            }
        });
    }

    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }


    // Add these functions to your existing auth.js file

document.addEventListener('DOMContentLoaded', () => {
    // Existing login code...

    // Role selection handling
    const roleTabs = document.querySelectorAll('.role-tab');
    const companyField = document.querySelector('.company-field');
    let selectedRole = 'jobseeker';

    if (roleTabs.length > 0) {
        roleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active state
                roleTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update selected role
                selectedRole = tab.dataset.role;

                // Toggle company field
                if (selectedRole === 'recruiter') {
                    companyField.style.display = 'block';
                    document.getElementById('company').required = true;
                } else {
                    companyField.style.display = 'none';
                    document.getElementById('company').required = false;
                }
            });
        });
    }

    // Password validation
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        const requirements = {
            length: { regex: /.{8,}/, element: document.getElementById('length') },
            uppercase: { regex: /[A-Z]/, element: document.getElementById('uppercase') },
            lowercase: { regex: /[a-z]/, element: document.getElementById('lowercase') },
            number: { regex: /[0-9]/, element: document.getElementById('number') },
            special: { regex: /[!@#$%^&*]/, element: document.getElementById('special') }
        };

        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            
            // Check each requirement
            Object.keys(requirements).forEach(req => {
                const { regex, element } = requirements[req];
                if (regex.test(password)) {
                    element.classList.add('valid');
                } else {
                    element.classList.remove('valid');
                }
            });
        });

        // Confirm password validation
        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value === passwordInput.value) {
                confirmPasswordInput.setCustomValidity('');
            } else {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            }
        });
    }

    // Registration form handling
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate passwords match
            if (passwordInput.value !== confirmPasswordInput.value) {
                showNotification('error', 'Passwords do not match');
                return;
            }

            // Create user data
            const userData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: passwordInput.value,
                role: selectedRole,
                company: selectedRole === 'recruiter' ? document.getElementById('company').value : undefined
            };

            try {
                // Show loading state
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
                submitBtn.disabled = true;

                // Make API call
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                // Show success message
                showNotification('success', 'Account created successfully!');

                // Redirect to login page after short delay
                setTimeout(() => {
                    window.location.href = '/auth/login.html';
                }, 1500);

            } catch (error) {
                showNotification('error', error.message);
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
                submitBtn.disabled = false;
            }
        });
    }

// Add to your existing auth.js file

// Forgot Password Form Handling
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Make API call
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset email');
            }

            // Show success state
            forgotPasswordForm.style.display = 'none';
            const successState = document.createElement('div');
            successState.className = 'email-sent-state';
            successState.innerHTML = `
                <i class="fas fa-envelope-circle-check"></i>
                <h3>Reset Link Sent!</h3>
                <p>Check your email for instructions to reset your password</p>
                <div class="resend-timer">
                    Resend available in <span id="timer">60</span> seconds
                </div>
            `;
            forgotPasswordForm.parentNode.insertBefore(successState, forgotPasswordForm.nextSibling);

            // Start resend timer
            let timeLeft = 60;
            const timerElement = document.getElementById('timer');
            const timer = setInterval(() => {
                timeLeft--;
                timerElement.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    successState.querySelector('.resend-timer').innerHTML = `
                        <a href="#" class="resend-link">
                            <i class="fas fa-redo"></i> Resend Reset Link
                        </a>
                    `;
                }
            }, 1000);

        } catch (error) {
            showNotification('error', error.message);
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Link';
            submitBtn.disabled = false;
        }
    });
}

// Reset Password Form Handling
const resetPasswordForm = document.getElementById('resetPasswordForm');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const token = new URLSearchParams(window.location.search).get('token');

        if (password !== confirmPassword) {
            showNotification('error', 'Passwords do not match');
            return;
        }

        const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
            submitBtn.disabled = true;

            // Make API call
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            // Show success notification
            showNotification('success', 'Password reset successfully!');

            // Redirect to login page after short delay
            setTimeout(() => {
                window.location.href = '/auth/login.html';
            }, 1500);

        } catch (error) {
            showNotification('error', error.message);
            submitBtn.innerHTML = '<i class="fas fa-key"></i> Reset Password';
            submitBtn.disabled = false;
        }
    });
}

// Password toggle functionality (if not already present)
document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});



// Add or update this in your auth.js file
document.addEventListener('DOMContentLoaded', () => {
    // Role selection handling
    const handleRoleSelection = () => {
        const roleTabs = document.querySelectorAll('.role-tab');
        const companyField = document.querySelector('.company-field');
        const companyInput = document.getElementById('company');
        let selectedRole = 'jobseeker'; // Default role

        if (roleTabs.length && companyField) {
            roleTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    roleTabs.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    
                    // Update selected role
                    selectedRole = tab.dataset.role;
                    
                    // Toggle company field visibility
                    if (selectedRole === 'recruiter') {
                        companyField.classList.add('visible');
                        companyInput.required = true;
                        
                        // Focus on company input after animation
                        setTimeout(() => {
                            companyInput.focus();
                        }, 300);
                    } else {
                        companyField.classList.remove('visible');
                        companyInput.required = false;
                    }

                    // Add this for debugging
                    console.log('Role switched to:', selectedRole);
                });
            });
        }

        // Store selected role in form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                // Add hidden input for role if it doesn't exist
                let roleInput = registerForm.querySelector('input[name="role"]');
                if (!roleInput) {
                    roleInput = document.createElement('input');
                    roleInput.type = 'hidden';
                    roleInput.name = 'role';
                    registerForm.appendChild(roleInput);
                }
                roleInput.value = selectedRole;
            });
        }
    };


    
    // Initialize role selection
    handleRoleSelection();
});


    // Enhanced notification system with different types
    function showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} sliding-notification`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <p>${message}</p>
        `;

        document.body.appendChild(notification);

        // Trigger sliding animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});

    // Social login handlers
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Implement social login logic here
            console.log(`${button.textContent.trim()} clicked`);
        });
    });

    // Notification system
    function showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <p>${message}</p>
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Input animations
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });
});