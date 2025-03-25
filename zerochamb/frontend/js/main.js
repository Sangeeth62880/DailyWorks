document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Animate counter numbers
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    counters.forEach(counter => {
        const animate = () => {
            const value = +counter.innerText.replace(/\+/g, '');
            const data = +counter.getAttribute('data-target');
            const time = data / speed;

            if (value < data) {
                counter.innerText = Math.ceil(value + time) + '+';
                setTimeout(animate, 1);
            }
        };

        counter.setAttribute('data-target', parseInt(counter.innerText));
        animate();
    });

    // Job cards hover effect
    const jobCards = document.querySelectorAll('.job-card');
    jobCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Search input animation
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });

    // Category cards animation
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('floating');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('floating');
        });
    });

    // Add current date to the footer
    const currentDate = new Date().getFullYear();
    document.querySelector('.footer').insertAdjacentHTML('beforeend', 
        `<div class="footer-bottom">
            <p>&copy; ${currentDate} DailyJobs. All rights reserved.</p>
        </div>`
    );

    // Add this to your existing main.js file

document.addEventListener('DOMContentLoaded', () => {
    // Existing code...

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-container')) {
            navLinks.classList.remove('active');
        }
    });

    // Navbar scroll effect with opacity
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        }
    });
});
});