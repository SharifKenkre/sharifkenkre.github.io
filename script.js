
    // Smooth scroll to projects from hero button
    document.getElementById('scrollProjects').addEventListener('click', function () {
      const projectsSection = document.getElementById('projects');
      if (!projectsSection) return;
      projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // IntersectionObserver for reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
      }
    );

    document.querySelectorAll('.reveal').forEach((el, index) => {
      el.style.transitionDelay = (index * 40) + 'ms';
      observer.observe(el);
    });

    // Contact form fake submit
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');

      if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
        status.textContent = 'Please fill in all fields.';
        status.classList.remove('text-emerald-400');
        status.classList.add('text-rose-400');
        return;
      }

      status.textContent = 'Message ready! Connect this form to your email or backend when you deploy.';
      status.classList.remove('text-rose-400');
      status.classList.add('text-emerald-400');

      form.classList.add('animate-pulse');
      setTimeout(() => {
        form.classList.remove('animate-pulse');
      }, 500);
    });

    // Dynamic year in footer
    document.getElementById('year').textContent = new Date().getFullYear();