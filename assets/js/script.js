// Global variables
let player;
const allPlaylists = {
    tab1: videos,
    tab2: MySQL_Database,
    tab3: CRUD,
    tab4: php_and_MySQL,
    tab5: videos5,
    tab6: CodeIgniter,
    tab7: videos7,
    tab8: videos8,
    tab9: videos9,
    tab10: videos10
};

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const elements = {
        videoTitle: document.getElementById('videoTitle'),
        playlist: document.getElementById('playlist'),
        prevBtn: document.getElementById('prevBtn'),
        nextBtn: document.getElementById('nextBtn'),
        searchInput: document.getElementById('searchInput'),
        videoCounter: document.getElementById('videoCounter'),
        tabContainer: document.getElementById('playlistTabs'),
        clearSearchBtn: document.getElementById('clearSearch'),
        metaText: document.querySelector('.meta-text')
    };

    // Player state
    const state = {
        currentVideos: [],
        filteredVideos: [],
        currentIndex: 0,
        lastPlayedIndex: null,
        activeTab: 'tab1'
    };

    // Initialize YouTube Player
    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('player', {
            height: '360',
            width: '640',
            playerVars: {
                'autoplay': 0,
                'controls': 1,
                'rel': 0,
                'modestbranding': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    };

    function onPlayerReady(event) {
        console.log('YouTube player is ready');
    }

    function onPlayerStateChange(event) {
        console.log('Player state changed:', event.data);
    }

    // Initialize playlist tabs
    function initTabs() {
        elements.tabContainer.innerHTML = '';
        
        Object.keys(allPlaylists).forEach((tabKey, index) => {
            const playlistData = allPlaylists[tabKey];
            const tabItem = document.createElement('li');
            tabItem.className = 'nav-item';
            
            const tabLink = document.createElement('a');
            tabLink.className = `nav-link ${index === 0 ? 'active' : ''}`;
            tabLink.href = '#';
            tabLink.dataset.tab = tabKey;
            tabLink.textContent = playlistData.listName || `Playlist ${index + 1}`;
            
            tabLink.addEventListener('click', function(e) {
                e.preventDefault();
                switchTab(tabKey);
            });
            
            tabItem.appendChild(tabLink);
            elements.tabContainer.appendChild(tabItem);
        });
    }

    // Switch between tabs
    function switchTab(tabKey) {
        // Update active tab
        document.querySelectorAll('.playlist-tabs .nav-link').forEach(t => t.classList.remove('active'));
        document.querySelector(`.playlist-tabs .nav-link[data-tab="${tabKey}"]`).classList.add('active');
        
        // Update state with new tab's videos
        state.activeTab = tabKey;
        state.currentVideos = [...allPlaylists[tabKey].items || []];
        state.filteredVideos = [...state.currentVideos];
        state.currentIndex = 0;
        state.lastPlayedIndex = null;
        
        renderPlaylist();
    }

    // Render playlist items
    function renderPlaylist() {
        elements.playlist.innerHTML = '';
        const totalVideos = state.filteredVideos.length;
        elements.videoCounter.textContent = totalVideos > 0 
            ? `${state.currentIndex + 1}/${totalVideos}` 
            : "0/0";
        
        state.filteredVideos.forEach((video, index) => {
            const isActive = (index === state.lastPlayedIndex);
            const position = index + 1;
            const li = document.createElement('li');
            li.className = `list-group-item ${isActive ? 'active' : ''}`;
            
            li.innerHTML = `
                <div class="d-flex w-100" style="gap: 8px;">
                    <div class="video-action-icon">
                        <i class="fas ${isActive ? 'fa-play text-danger' : 'fa-stop text-secondary'}"></i>
                    </div>
                    <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" 
                         class="video-thumbnail" 
                         alt="${video.title}"
                         onerror="this.src='https://i.ytimg.com/vi/${video.id}/mqdefault.jpg'">
                    <div class="video-info">
                        <div class="video-title" title="${video.title}">
                            <span class="video-number">${position}.</span>
                            ${video.title}
                        </div>
                        <div class="video-description" title="${video.description}">${video.description}</div>
                        ${video.author ? `<div class="video-author" title="Author: ${video.author}">Author: ${video.author}</div>` : ''}
                    </div>
                </div>
            `;
            
            li.addEventListener('click', () => {
                state.lastPlayedIndex = index;
                playVideo(index, true);
            });
            
            elements.playlist.appendChild(li);
        });
    }

    // Play video manually (no auto-play)
    function playVideo(index, isFiltered = false) {
        const targetVideos = isFiltered ? state.filteredVideos : state.currentVideos;
        
        if (index >= 0 && index < targetVideos.length) {
            state.currentIndex = index;
            const video = targetVideos[index];
            const position = index + 1;
            const activeTabName = allPlaylists[state.activeTab].listName || `প্লেলিস্ট ${Object.keys(allPlaylists).indexOf(state.activeTab) + 1}`;
            const authorName = video.author || '';
            
            if (player) {
                player.loadVideoById(video.id);
            }
            
            // Update meta bar
            elements.metaText.innerHTML = `
                <span class="tab-name">${activeTabName}</span>
                ${authorName ? `<span class="author-name"> / ${authorName}</span>` : ''}
            `;
            
            // Update main title
            elements.videoTitle.textContent = `${position}. ${video.title}`;
            renderPlaylist();
        }
    }

    // Clear search function
    function clearSearch() {
        elements.searchInput.value = '';
        state.filteredVideos = [...state.currentVideos];
        state.lastPlayedIndex = null;
        renderPlaylist();
    }

    // Search videos by title, description or author
    function searchVideos(searchTerm) {
        return state.currentVideos.filter(video => {
            const searchFields = [
                video.title?.toLowerCase() || '',
                video.description?.toLowerCase() || '',
                video.author?.toLowerCase() || ''
            ];
            return searchFields.some(field => field.includes(searchTerm));
        });
    }

    // Event listeners
    elements.prevBtn.addEventListener('click', () => {
        const prevIndex = (state.lastPlayedIndex !== null) ? state.lastPlayedIndex - 1 : state.currentIndex - 1;
        state.lastPlayedIndex = prevIndex < 0 ? state.filteredVideos.length - 1 : prevIndex;
        playVideo(state.lastPlayedIndex, true);
    });

    elements.nextBtn.addEventListener('click', () => {
        const nextIndex = (state.lastPlayedIndex !== null) ? state.lastPlayedIndex + 1 : state.currentIndex + 1;
        state.lastPlayedIndex = nextIndex >= state.filteredVideos.length ? 0 : nextIndex;
        playVideo(state.lastPlayedIndex, true);
    });

    elements.searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        state.filteredVideos = searchTerm ? searchVideos(searchTerm) : [...state.currentVideos];
        state.lastPlayedIndex = null;
        renderPlaylist();
    });

    elements.clearSearchBtn.addEventListener('click', clearSearch);

    // Initialize the app
    initTabs();
    switchTab(state.activeTab);
});