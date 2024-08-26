<script>
//test
// Constants
const TOGGLE_DURATION = 300; // Duration in milliseconds for FAQ toggling
const COPY_NOTIFICATION_TIMEOUT = 2000; // Duration for how long the copy notification is shown
const ACTIVE_SCROLL_DELAY = 500; // Delay to reset scroll flag after scrolling

// Utility Functions
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function createElement(tag, className = '', attributes = {}) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    for (let attr in attributes) {
        element.setAttribute(attr, attributes[attr]);
    }
    return element;
}

function showCopyNotification() {
    const copyNotification = document.getElementById('copyNotification');
    if (!copyNotification) return;
    copyNotification.style.display = 'block';
    setTimeout(() => {
        copyNotification.style.display = 'none';
    }, COPY_NOTIFICATION_TIMEOUT);
}

function generateId(text) {
    return text.trim().toLowerCase().replace(/[\s\W-]+/g, '-');
}

function createIcon(svgPath, width = 16, height = 16) {
    return createElement('span', 'header-link-icon', {
        innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="iconify iconify--ic" style="width: ${width}px; height: ${height}px;" viewBox="0 0 24 24"><path fill="currentColor" d="${svgPath}"></path></svg>`
    });
}

// Main Initialization
document.addEventListener('DOMContentLoaded', function () {
    initializeTableOfContents();
    initializeFAQAccordion();
    initializeHeaderLinks();
    initializeImageZoom();
});

// TOC Initialization
function initializeTableOfContents() {
    const toc = document.getElementById('toc');
    if (!toc) return;

    const headers = document.querySelectorAll('.article_content h2, .article_content h3');
    const tocItems = [];
    let isScrolling = false;

    headers.forEach(header => {
        const headerId = generateId(header.innerText);
        const tocItem = createTOCItem(header, headerId);
        toc.appendChild(tocItem);
        tocItems.push({ header, tocItem });
    });

    function createTOCItem(header, headerId) {
        const tocItem = createElement('li', header.tagName === 'H2' ? 'toc-h2' : 'toc-h3');
        const link = createElement('a', '', { href: `#${headerId}` });
        link.innerText = header.innerText;

        tocItem.appendChild(link);
        header.id = headerId;

        link.addEventListener('click', function (e) {
            e.preventDefault();
            isScrolling = true;
            header.scrollIntoView({ behavior: 'smooth', block: 'start' });

            setTimeout(() => {
                isScrolling = false;
                updateActiveTOCItem();
            }, ACTIVE_SCROLL_DELAY);

            updateActiveTOCItem();
        });

        return tocItem;
    }

    const debouncedScrollHandler = debounce(updateActiveTOCItem, 100);
    document.addEventListener('scroll', debouncedScrollHandler);

    function updateActiveTOCItem() {
        if (isScrolling) return;

        let activeHeader = headers[0];
        const bottomOfPage = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2;

        headers.forEach(header => {
            if (header.getBoundingClientRect().top < window.innerHeight / 2) {
                activeHeader = header;
            }
        });

        tocItems.forEach(({ header, tocItem }) => {
            tocItem.classList.toggle('active', header === activeHeader);
        });

        if (bottomOfPage) {
            tocItems.forEach(({ tocItem }) => tocItem.classList.remove('active'));
            tocItems[tocItems.length - 1].tocItem.classList.add('active');
        }
    }
}

// FAQ Accordion Initialization
function initializeFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (!faqQuestions.length) return;

    faqQuestions.forEach(question => {
        const questionId = generateId(question.innerText);
        question.id = questionId;

        const icon = createIcon('M17 7h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c1.65 0 3 1.35 3 3s-1.35 3-3 3h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-9 5c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1zm2 3H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h3c.55 0 1-.45 1-1s-.45-1-1-1H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h3c.55 0 1-.45 1-1s-.45-1-1-1z');
        question.appendChild(icon);

        question.addEventListener('click', () => toggleFAQAnswer(question, icon));
        question.addEventListener('contextmenu', (e) => handleRightClickToCopy(e, questionId));
        question.addEventListener('mouseenter', () => icon.style.visibility = 'visible');
        question.addEventListener('mouseleave', () => icon.style.visibility = 'hidden');
    });

    function toggleFAQAnswer(question, icon) {
        const answer = question.nextElementSibling;
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        question.setAttribute('aria-expanded', !isExpanded);

        icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
        answer.style.height = isExpanded ? '0px' : `${answer.scrollHeight}px`;
        answer.style.display = isExpanded ? 'none' : 'block';
        answer.setAttribute('hidden', isExpanded ? 'true' : 'false');
    }

    function handleRightClickToCopy(e, questionId) {
        e.preventDefault();
        const url = `${window.location.href.split('#')[0]}#${questionId}`;
        navigator.clipboard.writeText(url).then(showCopyNotification);
    }
}

// Header Links Initialization
function initializeHeaderLinks() {
    const headers = document.querySelectorAll('.article_content h2, .article_content h3');
    if (!headers.length) return;

    headers.forEach(header => {
        const headerId = generateId(header.innerText);
        header.id = headerId;

        const icon = createIcon('M17 7h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c1.65 0 3 1.35 3 3s-1.35 3-3 3h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-9 5c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1zm2 3H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h3c.55 0 1-.45 1-1s-.45-1-1-1H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h3c.55 0 1-.45 1-1s-.45-1-1-1z');
        header.appendChild(icon);

        header.addEventListener('click', () => handleClickToCopy(headerId));
        header.addEventListener('mouseenter', () => icon.style.visibility = 'visible');
        header.addEventListener('mouseleave', () => icon.style.visibility = 'hidden');
    });

    function handleClickToCopy(headerId) {
        const url = `${window.location.origin}${window.location.pathname}#${headerId}`;
        navigator.clipboard.writeText(url).then(showCopyNotification);
    }
}

// Image Zoom Initialization
function initializeImageZoom() {
    const richTextImages = document.querySelectorAll('.w-richtext img');
    const zoomOverlay = document.getElementById('zoomOverlay');
    const zoomedImage = document.getElementById('zoomedImage');

    if (!richTextImages.length || !zoomOverlay || !zoomedImage) return;

    richTextImages.forEach(image => {
        image.style.cursor = 'zoom-in';
        image.addEventListener('click', () => showZoomOverlay(image.src));
    });

    zoomOverlay.addEventListener('click', hideZoomOverlay);

    function showZoomOverlay(imageSrc) {
        zoomedImage.src = imageSrc;
        zoomOverlay.style.display = 'flex';
        zoomOverlay.style.cursor = 'zoom-out';
    }

    function hideZoomOverlay() {
        zoomOverlay.style.display = 'none';
        zoomOverlay.style.cursor = 'default';
    }
}

</script>
