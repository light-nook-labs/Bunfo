/**
 * Bunfo - Main JavaScript
 * Search functionality with debounce, lazy loading, interactions
 */

(function() {
    'use strict';

    // Debounce utility
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Search functionality
    function initSearch() {
        const searchInput = document.getElementById('searchInput');
        const novelsGrid = document.getElementById('novelsGrid');
        const emptyState = document.getElementById('emptyState');
        const novelCount = document.getElementById('novelCount');
        const paginationNav = document.getElementById('paginationNav');

        if (!searchInput || !window.novelsData) return;

        const allNovels = window.novelsData;
        const novelCards = Array.from(novelsGrid.querySelectorAll('.novel-card'));

        // Define performSearch first
        function doSearch(query, mode = 'text') {
            const lowerQuery = query.toLowerCase().trim();
            const isFiltering = lowerQuery.length > 0;

            // Hide pagination when filtering
            if (paginationNav) {
                paginationNav.style.display = isFiltering ? 'none' : '';
            }

            // Dispatch event to reveal all hidden cards when searching
            if (isFiltering) {
                window.dispatchEvent(new CustomEvent('revealAllCards'));
            }

            if (!isFiltering) {
                novelCards.forEach(card => card.style.display = '');
                emptyState.style.display = 'none';
                if (novelCount) novelCount.textContent = `共 ${allNovels.length} 本小说`;
                return;
            }

            let visibleCount = 0;

            novelCards.forEach((card) => {
                const novelId = card.dataset.id;
                const novel = allNovels.find(n => String(n.NovelID) === novelId);
                if (!novel) return;

                let match = false;
                if (mode === 'type') {
                    match = novel.TypeName.toLowerCase() === lowerQuery;
                } else {
                    match =
                        novel.NovelName.toLowerCase().includes(lowerQuery) ||
                        novel.TypeName.toLowerCase().includes(lowerQuery) ||
                        novel.Tags.some(t => t.Value.toLowerCase().includes(lowerQuery)) ||
                        (novel.Intro && novel.Intro.toLowerCase().includes(lowerQuery));
                }

                if (match) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
            if (novelCount) {
                if (mode === 'type') {
                    novelCount.textContent = `${query} 类型: ${visibleCount} 本`;
                } else {
                    novelCount.textContent = `找到 ${visibleCount} 本小说`;
                }
            }
        }

        const performSearch = debounce(doSearch, 200);

        // Event listeners
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value, 'text');
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                doSearch('', 'text');
                if (window.history.replaceState) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        });

        // Check URL params (after defining performSearch)
        const urlParams = new URLSearchParams(window.location.search);
        const typeFilter = urlParams.get('type');
        const searchQuery = urlParams.get('q');

        if (typeFilter) {
            searchInput.value = `类型:${typeFilter}`;
            // Use direct call for initial filter (not debounced)
            doSearch(typeFilter, 'type');
        } else if (searchQuery) {
            searchInput.value = searchQuery;
            doSearch(searchQuery, 'text');
        }
    }

    // Lazy loading for images
    function initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // Smooth scroll for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initSearch();
        initLazyLoading();
        initSmoothScroll();
        initLoadMore();
        initThemeToggle();
    }

    // Theme toggle functionality
    function initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Get saved theme or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Load more functionality for type pages
    function initLoadMore() {
        const novelsGrid = document.getElementById('novelsGrid');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const loadedCountEl = document.getElementById('loadedCount');
        const totalCountEl = document.getElementById('totalCount');
        const statsVisibleEl = document.getElementById('statsVisible');

        if (!novelsGrid || !loadMoreBtn) return;

        const allCards = Array.from(novelsGrid.querySelectorAll('.novel-card'));
        const pageSize = parseInt(novelsGrid.dataset.pageSize || '20');
        let currentlyShown = 0;

        function updateCounts() {
            const visibleCards = allCards.filter(card => card.style.display !== 'none');
            const visibleCount = visibleCards.filter(card => !card.classList.contains('hidden-by-loadmore')).length;
            if (loadedCountEl) loadedCountEl.textContent = visibleCount;
            if (statsVisibleEl) statsVisibleEl.textContent = visibleCount;
        }

        function showNextBatch() {
            const searchInput = document.getElementById('searchInput');
            const isSearching = searchInput && searchInput.value.trim().length > 0;

            // When searching, show all matching results
            if (isSearching) {
                allCards.forEach(card => {
                    if (card.style.display !== 'none') {
                        card.classList.remove('hidden-by-loadmore');
                    }
                });
                if (loadMoreContainer) loadMoreContainer.style.display = 'none';
                updateCounts();
                return;
            }

            // Normal load more behavior
            const hiddenCards = allCards.filter(card =>
                card.style.display !== 'none' && card.classList.contains('hidden-by-loadmore')
            );

            const toShow = hiddenCards.slice(0, pageSize);
            toShow.forEach(card => card.classList.remove('hidden-by-loadmore'));
            currentlyShown += toShow.length;

            // Check if all visible cards are now shown
            const remainingHidden = allCards.filter(card =>
                card.style.display !== 'none' && card.classList.contains('hidden-by-loadmore')
            ).length;

            if (remainingHidden === 0) {
                if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            }

            updateCounts();

            // Trigger lazy loading for newly visible images
            const newImages = toShow.flatMap(card =>
                Array.from(card.querySelectorAll('img[loading="lazy"]'))
            );
            if (newImages.length && 'IntersectionObserver' in window) {
                newImages.forEach(img => imageObserver.observe(img));
            }
        }

        // Initially hide cards beyond pageSize
        if (allCards.length > pageSize) {
            allCards.forEach((card, index) => {
                if (index >= pageSize) {
                    card.classList.add('hidden-by-loadmore');
                }
            });
            currentlyShown = pageSize;
        } else {
            // All cards fit within pageSize
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            currentlyShown = allCards.length;
        }

        updateCounts();

        loadMoreBtn.addEventListener('click', showNextBatch);

        // Reveal all when searching (handle via custom event from search)
        window.addEventListener('revealAllCards', () => {
            allCards.forEach(card => card.classList.remove('hidden-by-loadmore'));
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            updateCounts();
        });
    }
})();
