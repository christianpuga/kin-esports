// Twitch Live Tracker
// Configure your streams here - add Twitch usernames or URLs
const STREAMS = [
  'https://www.twitch.tv/ssxh_',  // 
  'https://www.twitch.tv/minwoorm',  // Minwoorm
];

class TwitchTracker {
  constructor() {
    this.streams = [];
    this.init();
  }

  init() {
    // Load configured streams
    this.loadStreams();
    // Only update once on initial load, no auto-refresh
    // renderStreams() will be called after updateAllStreams() completes
    this.updateAllStreams();
  }

  loadStreams() {
    // Convert configured URLs to stream objects
    this.streams = STREAMS.map(url => {
      const username = this.extractUsername(url);
      return {
        username: username.toLowerCase(),
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        avatar: this.getAvatarUrl(username),
        url: `https://www.twitch.tv/${username}`,
        isLive: false, // Will be true when API is configured
        viewerCount: 0, // Will be updated when API is configured
        title: username
      };
    });
  }

  extractUsername(url) {
    // Extract username from various Twitch URL formats
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/i);
    if (match) {
      return match[1];
    }
    // If no URL pattern, assume it's just the username
    return url.replace(/[^a-zA-Z0-9_]/g, '');
  }

  getAvatarUrl(username) {
    // Get avatar from Twitch CDN
    // This is a fallback - in production you'd fetch from Twitch API
    return `https://static-cdn.jtvnw.net/jtv_user_pictures/${username.toLowerCase()}-profile_image-70x70.png`;
  }

  async fetchUserInfo(username) {
    // Try to fetch user info from Twitch API via proxy to get avatar and display name
    try {
      const response = await fetch(`https://twitch-proxy.freecodecamp.rocks/helix/users?login=${username}`, {
        headers: {
          'Client-ID': 'kimne78kx3ncx6brgo4m6ho3723f6vn'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const user = data.data[0];
          return {
            avatar: user.profile_image_url || user.avatar_url || null,
            displayName: user.display_name || user.login,
            login: user.login
          };
        }
      }
    } catch (e) {
      console.log(`Could not fetch user info for ${username}`);
    }
    return null;
  }

  async fetchAvatar(username) {
    // Fallback: Try decapi.me
    try {
      const response = await fetch(`https://decapi.me/twitch/avatar/${username}`);
      if (response.ok) {
        const avatarUrl = await response.text();
        if (avatarUrl && !avatarUrl.includes('error') && avatarUrl.trim().startsWith('http')) {
          return avatarUrl.trim();
        }
      }
    } catch (e) {
      console.log(`Could not fetch avatar from decapi for ${username}`);
    }
    
    // Final fallback: Use Twitch CDN pattern
    return this.getAvatarUrl(username);
  }

  async fetchStreamInfo(username) {
    // Use public Twitch API proxy to get live status
    try {
      // Using a public proxy service - replace with your own backend if needed
      const response = await fetch(`https://twitch-proxy.freecodecamp.rocks/helix/streams?user_login=${username}`, {
        headers: {
          'Client-ID': 'kimne78kx3ncx6brgo4m6ho3723f6vn'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          return data.data[0];
        }
      }
    } catch (e) {
      console.log(`Could not fetch stream info for ${username}`);
    }
    
    // Fallback: Try alternative method using decapi
    try {
      const response = await fetch(`https://decapi.me/twitch/viewercount/${username}`);
      if (response.ok) {
        const viewerCount = await response.text();
        const count = parseInt(viewerCount.trim());
        if (!isNaN(count) && count > 0) {
          return { viewer_count: count, is_live: true };
        }
      }
    } catch (e) {
      console.log(`Alternative API also failed for ${username}`);
    }
    
    return null;
  }

  async updateAllStreams() {
    // Update avatars and stream info for all streams
    for (const stream of this.streams) {
      // Fetch user info first to get avatar and display name
      const userInfo = await this.fetchUserInfo(stream.username);
      if (userInfo) {
        // Use avatar from user info if available
        stream.avatar = userInfo.avatar || await this.fetchAvatar(stream.username);
        // Use display name from user info (proper capitalization)
        stream.displayName = userInfo.displayName || stream.displayName;
      } else {
        // Fallback: try to fetch avatar from alternative sources
        stream.avatar = await this.fetchAvatar(stream.username);
      }
      
      // Fetch live status and viewer count
      try {
        const streamInfo = await this.fetchStreamInfo(stream.username);
        stream.isLive = !!streamInfo;
        stream.viewerCount = streamInfo ? (streamInfo.viewer_count || 0) : 0;
        
        // Update display name to show actual stream title if live
        if (streamInfo && streamInfo.title) {
          stream.title = streamInfo.title;
        }
      } catch (error) {
        console.error(`Error updating stream ${stream.username}:`, error);
        stream.isLive = false;
        stream.viewerCount = 0;
      }
    }
    this.renderStreams();
  }

  formatViewerCount(count) {
    if (count >= 1000) {
      // Format as "1k+", "2.5k", etc.
      const k = (count / 1000);
      if (k >= 1 && k < 2) {
        return '1k+';
      }
      return `${k.toFixed(1)}k`;
    }
    return count.toString();
  }

  renderStreams() {
    const liveBox = document.querySelector('.live-box');
    const hoverLives = document.querySelector('.hover-lives');
    
    if (this.streams.length === 0) {
      if (liveBox) {
        liveBox.style.display = 'none';
      }
      if (hoverLives) {
        hoverLives.innerHTML = '';
      }
      return;
    }

    const liveStreams = this.streams.filter(s => s.isLive);
    const allStreams = this.streams;

    // Update main live box with first live stream or first stream
    if (liveBox && allStreams.length > 0) {
      const mainStream = liveStreams[0] || allStreams[0];
      liveBox.style.display = 'flex';
      liveBox.onclick = () => window.open(mainStream.url, '_blank');
      // Prioritize live streams in main box
      const mainStreamTitle = mainStream.isLive && mainStream.title !== mainStream.displayName 
        ? mainStream.title 
        : mainStream.displayName;
      
      liveBox.innerHTML = `
        <img src="${mainStream.avatar}" alt="${mainStream.displayName}" class="live-logo" onerror="this.src='https://via.placeholder.com/40'">
        <div class="live-info">
          <span class="match-title">${mainStreamTitle}</span>
          <div class="live-status">
            ${mainStream.isLive ? '<span class="dot"></span><span class="live-text">Live now</span>' : '<span style="color: #aaa;">Offline</span>'}
            ${mainStream.isLive ? `<span class="viewers">${this.formatViewerCount(mainStream.viewerCount)} viewers</span>` : ''}
          </div>
        </div>
        <span class="arrow">›</span>
      `;
    }

    // Update hover list with remaining streams
    if (hoverLives && allStreams.length > 1) {
      const otherStreams = allStreams.slice(1);
      hoverLives.innerHTML = otherStreams.map((stream, index) => `
        <div class="hover-item" data-stream-index="${index}" style="cursor: pointer; width: 100%;">
          <img src="${stream.avatar}" alt="${stream.displayName}" class="live-logo" onerror="this.src='https://via.placeholder.com/40'">
          <div class="live-info">
            <span class="match-title">${stream.displayName}</span>
            <div class="live-status">
              ${stream.isLive ? '<span class="dot"></span><span class="live-text">Live now</span>' : '<span style="color: #aaa;">Offline</span>'}
              ${stream.isLive ? `<span class="viewers">${this.formatViewerCount(stream.viewerCount)} viewers</span>` : ''}
            </div>
          </div>
          <span class="arrow">›</span>
        </div>
      `).join('');
      
      // Add click handlers to hover items - make entire item clickable
      hoverLives.querySelectorAll('.hover-item').forEach((item, index) => {
        const stream = otherStreams[index];
        if (stream) {
          // Make the entire item clickable
          item.style.cursor = 'pointer';
          item.onclick = (e) => {
            e.stopPropagation();
            window.open(stream.url, '_blank');
          };
          
          // Also make child elements clickable but prevent double-firing
          item.querySelectorAll('*').forEach(child => {
            child.style.pointerEvents = 'none';
          });
        }
      });
    }
  }
}

// Initialize tracker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.twitchTracker = new TwitchTracker();
  // Data will be loaded once in init(), no need to call updateAllStreams again
});
