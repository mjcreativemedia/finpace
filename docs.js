<script>
// Main Module for Finpace Features
document.addEventListener('DOMContentLoaded', function () {
    // FAQ Accordion Functionality
    const faqModule = (() => {
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach((question) => {
            // Generate a unique ID for each question
            const questionText = question.innerText.trim().toLowerCase().replace(/[\s\W-]+/g, '-');
            question.id = questionText;

            // Create and append link icon
            const icon = document.createElement('span');
            icon.className = 'header-link-icon';
            icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="iconify iconify--ic" style="width: 16px; height: 16px;" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M17 7h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c1.65 0 3 1.35 3 3s-1.35 3-3 3h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-9 5c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1zm2 3H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h3c.55 0 1-.45 1-1s-.45-1-1-1H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h3c.55 0 1-.45 1-1s-.45-1-1-1z"></path>
                </svg>`;

            question.appendChild(icon);

            question.addEventListener('click', function () {
                const answer = this.nextElementSibling;
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', !isExpanded);
                const faqIcon = this.querySelector('.faq-icon svg');
                faqIcon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
                answer.style.display = isExpanded ? 'none' : 'block';
                answer.style.height = isExpanded ? '0px' : `${answer.scrollHeight}px`;
            });

            question.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                const url = `${window.location.href.split('#')[0]}#${question.id}`;
                navigator.clipboard.writeText(url).then(() => {
                    showCopyNotification(); 
                });
            });

            question.addEventListener('mouseenter', () => icon.style.visibility = 'visible');
            question.addEventListener('mouseleave', () => icon.style.visibility = 'hidden');
        });

        function showCopyNotification() {
            const copyNotification = document.getElementById('copyNotification');
            copyNotification.style.display = 'block';
            setTimeout(() => copyNotification.style.display = 'none', 2000);
        }
    })();

    // Table of Contents and Header Links Functionality
    const tocModule = (() => {
        const toc = document.getElementById('toc');
        const headers = document.querySelectorAll('.article_content h2, .article_content h3');
        let isScrolling = false;
        let scrollTimeout;

        headers.forEach((header) => {
            const text = header.innerText.trim().toLowerCase().replace(/[\s\W-]+/g, '-');
            const tocItem = document.createElement('li');
            tocItem.className = header.tagName === 'H2' ? 'toc-h2' : 'toc-h3';
            const link = document.createElement('a');
            link.href = `#${text}`;
            link.innerText = header.innerText;
            header.id = text;
            tocItem.appendChild(link);
            toc.appendChild(tocItem);

            link.addEventListener('click', function (e) {
                e.preventDefault();
                isScrolling = true;
                header.scrollIntoView({ behavior: 'smooth', block: 'start' });

                if (scrollTimeout) clearTimeout(scrollTimeout);

                scrollTimeout = setTimeout(() => {
                    isScrolling = false;
                    updateActiveTOCItem();
                }, 500);
                updateActiveTOCItem();
            });

            header.style.cursor = 'pointer';
            header.style.display = 'block';
            const icon = document.createElement('span');
            icon.className = 'header-link-icon';
            icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="iconify iconify--ic" style="width: 16px; height: 16px;" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M17 7h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c1.65 0 3 1.35 3 3s-1.35 3-3 3h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-9 5c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1zm2 3H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h3c.55 0 1-.45 1-1s-.45-1-1-1H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h3c.55 0 1-.45 1-1s-.45-1-1-1z"></path>
                </svg>`;
            header.appendChild(icon);

            header.addEventListener('click', function () {
                const url = `${window.location.origin}${window.location.pathname}#${header.id}`;
                navigator.clipboard.writeText(url).then(() => {
                    document.getElementById('copyNotification').classList.add('show');
                    setTimeout(() => {
                        document.getElementById('copyNotification').classList.remove('show');
                    }, 2000);
                });
            });

            header.addEventListener('mouseenter', () => icon.style.visibility = 'visible');
            header.addEventListener('mouseleave', () => icon.style.visibility = 'hidden');
        });

        function updateActiveTOCItem() {
            if (isScrolling) return;
            let activeHeader = headers[0];
            headers.forEach(header => {
                if (header.getBoundingClientRect().top < window.innerHeight / 2) {
                    activeHeader = header;
                }
            });

            document.querySelectorAll('.toc-container ul li').forEach(item => {
                item.classList.remove('active');
            });

            toc.querySelector(`a[href="#${activeHeader.id}"]`).parentElement.classList.add('active');
        }

        document.addEventListener('scroll', updateActiveTOCItem);
    })();

    // Image Zoom Functionality
    const imageZoomModule = (() => {
        const richTextImages = document.querySelectorAll('.w-richtext img');
        const zoomOverlay = document.getElementById('zoomOverlay');
        const zoomedImage = document.getElementById('zoomedImage');

        richTextImages.forEach(image => {
            image.style.cursor = 'zoom-in';

            image.addEventListener('click', function () {
                zoomedImage.src = image.src;
                zoomOverlay.style.display = 'flex';
                zoomOverlay.style.cursor = 'zoom-out';
            });
        });

        zoomOverlay.addEventListener('click', function () {
            zoomOverlay.style.display = 'none';
            zoomOverlay.style.cursor = 'default';
        });
    })();
});

</script>
