document.addEventListener('DOMContentLoaded', () => {
    // 🌟 SMOOTH SCROLL FOR NAV LINKS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 🌊 REVEAL ON SCROLL
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.glass-card, .text-content, .image-box').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        observer.observe(el);
    });

    // 🕵️ NAV HIGHLIGHT ON SCROLL
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.glass-nav');
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(10, 25, 47, 0.95)';
            nav.style.height = '70px';
        } else {
            nav.style.background = 'rgba(10, 25, 47, 0.7)';
            nav.style.height = '90px';
        }
    });
});
