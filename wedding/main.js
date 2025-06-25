
        // JavaScript for interactive functionality
        
        // Remove loading overlay after page loads
        window.addEventListener('load', function() {
            const loadingOverlay = document.getElementById('loading-overlay');
            // Fade out the loading overlay smoothly
            loadingOverlay.style.opacity = '0';
            // Remove it from DOM after animation completes
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        });
        
        // Navbar background change on scroll
        window.addEventListener('scroll', function() {
            const navbar = document.getElementById('navbar');
            // Add background when scrolled past 50px
            if (window.scrollY > 50) {
                navbar.classList.add('bg-white', 'shadow-lg');
                navbar.classList.remove('bg-transparent');
            } else {
                navbar.classList.add('bg-transparent');
                navbar.classList.remove('bg-white', 'shadow-lg');
            }
        });
        
        // Mobile menu toggle functionality
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuBtn.addEventListener('click', function() {
            // Toggle mobile menu visibility
            mobileMenu.classList.toggle('hidden');
            // Change hamburger icon to X when menu is open
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        });
        
        // Close mobile menu when clicking on a link
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        // Smooth scrolling for navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    // Scroll to target section with smooth behavior
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Form submission handling
        const rsvpForm = document.querySelector('#rsvp form');
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would typically send the form data to a server
            alert('Thank you for your RSVP! We will confirm receipt via email.');
            // Reset form after submission
            this.reset();
        });
        
        // Add animation classes to elements when they come into view
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add fade-in animation to elements as they enter viewport
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);
        
        // Observe all cards and major sections for animation
        const animatedElements = document.querySelectorAll('.card, section > div > div');
        animatedElements.forEach(el => {
            observer.observe(el);
        });
        
        // Add current year to copyright
        const currentYear = new Date().getFullYear();
        const copyrightElement = document.querySelector('footer p');
        if (copyrightElement) {
            copyrightElement.textContent = copyrightElement.textContent.replace('2024', currentYear);
        }
