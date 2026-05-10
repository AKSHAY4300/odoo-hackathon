// Basic interaction scripts for Traveloop client
// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

window.apiFetch = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('API Fetch Error:', error);
        return null;
    }
};

// Toast Notification System
window.showToast = (message, type = 'info') => {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

document.addEventListener('DOMContentLoaded', () => {

    // Smooth scrolling for navigation links
    const links = document.querySelectorAll('a[href^="#"]');
    for (const link of links) {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Optional sticky navbar background transition
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            }
        });
    }

    // Places Filtering Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const placeCards = document.querySelectorAll('#places-grid .place-card');

    if (filterBtns.length > 0 && placeCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active classes from all buttons
                filterBtns.forEach(b => {
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-outline');
                });
                
                // Add active class to clicked button
                btn.classList.remove('btn-outline');
                btn.classList.add('btn-primary');

                const filterValue = btn.getAttribute('data-filter');

                placeCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

    // Generic form submission handling
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            // Check if form is valid
            if (!form.checkValidity()) {
                e.preventDefault();
                showToast('Please fill in all required fields correctly.', 'error');
                return;
            }

            // Special handling for login
            if (form.classList.contains('auth-form')) {
                // Let the page-specific script handle this
                return;
            }

            // Special handling for booking
            if (form.id === 'booking-form') {
                showToast('Booking details saved. Proceeding to secure payment...', 'success');
                return;
            }

            // Special handling for payment
            if (form.id === 'payment-form') {
                // Payment success is already handled in payment.html by showing a modal
                showToast('Processing your payment securely...', 'info');
                return;
            }

            // For other forms (like Search or Newsletter if they exist)
            // showToast('Success! Processing your request.', 'success');
        });
    });

    // Handle generic button clicks for "mock" actions
    document.querySelectorAll('.btn-outline, .social-links a, .whatsapp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (href === '#' || !href) {
                e.preventDefault();
                showToast('This feature will be available soon!', 'warning');
            }
        });
    });

    // Intersection Observer for Reveal Animations
    const revealElements = () => {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Once animated, no need to observe anymore
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Elements to animate
        const targets = document.querySelectorAll('.section, .trip-card, .place-card, .feature-card, .booking-container, .payment-card, .details-content');
        targets.forEach(target => {
            target.classList.add('reveal');
            observer.observe(target);
        });
    };

    revealElements();
});
