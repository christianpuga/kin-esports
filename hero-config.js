// Hero Section Configuration
// Update these values to customize the hero section

const HERO_CONFIG = {
  // Main hero section
  title: "Welcome to KIN",
  description: "We push limits, break boundaries, and define the future of competitive gaming.",
  backgroundImage: "images/hero-bg.jpg", // Path to your hero background image
  
  // Currently playing / Next match
  currentMatch: {
    competitionName: "8 BIT Nation PRO Circuit",
    matchDetails: "Best of 5 • 28 October 2025",
    streamUrl: "https://www.twitch.tv/", // URL to watch the stream
    // If no current match, set to null and it will show the nextMatch
    isPlaying: true // Set to false if not currently playing
  },
  
  // Next upcoming match (if not currently playing)
  nextMatch: {
    competitionName: "PRO Circuit Championship",
    matchDetails: "Best of 5 • 15 November 2025",
    streamUrl: "https://www.twitch.tv/"
  },
  
  // Last match result
  lastMatch: {
    team1: {
      name: "KIN Esports",
      logo: "images/kin-logo.png", // Optional: path to team logo
      score: 2
    },
    team2: {
      name: "Team Assault",
      logo: null, // Optional: path to team logo
      score: 1
    }
  }
};

// Update hero section with config
function updateHeroSection() {
  // Update main content
  const heroTitle = document.querySelector('.hero-content h1');
  const heroDescription = document.querySelector('.hero-content p');
  const heroBackground = document.querySelector('.hero-background img');
  
  if (heroTitle) heroTitle.textContent = HERO_CONFIG.title;
  if (heroDescription) heroDescription.textContent = HERO_CONFIG.description;
  if (heroBackground) heroBackground.src = HERO_CONFIG.backgroundImage;
  
  // Update match info
  const matchInfoCard = document.querySelector('.match-info-card');
  if (matchInfoCard) {
    const competitionName = matchInfoCard.querySelector('.competition-name');
    const matchDate = matchInfoCard.querySelector('.match-date');
    const watchBtn = matchInfoCard.querySelector('.watch-btn');
    
    const matchToShow = HERO_CONFIG.currentMatch.isPlaying 
      ? HERO_CONFIG.currentMatch 
      : HERO_CONFIG.nextMatch;
    
    if (competitionName) competitionName.textContent = matchToShow.competitionName;
    if (matchDate) matchDate.textContent = matchToShow.matchDetails;
    if (watchBtn) watchBtn.onclick = () => window.open(matchToShow.streamUrl, '_blank');
    
    // Update heading if showing next match
    const heading = matchInfoCard.querySelector('h4');
    if (heading && !HERO_CONFIG.currentMatch.isPlaying) {
      heading.textContent = "Next match";
    }
  }
  
  // Update last match result
  const resultRows = document.querySelectorAll('.result-row');
  if (resultRows.length >= 2) {
    const team1Row = resultRows[0];
    const team2Row = resultRows[1];
    
    // Team 1
    const team1Name = team1Row.querySelector('.team-name');
    const team1Score = team1Row.querySelector('.score');
    if (team1Name) {
      if (HERO_CONFIG.lastMatch.team1.logo) {
        team1Name.innerHTML = `<img src="${HERO_CONFIG.lastMatch.team1.logo}" alt="${HERO_CONFIG.lastMatch.team1.name}" class="team-logo-small"> ${HERO_CONFIG.lastMatch.team1.name}`;
      } else {
        team1Name.innerHTML = HERO_CONFIG.lastMatch.team1.name;
      }
    }
    if (team1Score) team1Score.textContent = HERO_CONFIG.lastMatch.team1.score;
    
    // Team 2
    const team2Name = team2Row.querySelector('.team-name');
    const team2Score = team2Row.querySelector('.score');
    if (team2Name) {
      if (HERO_CONFIG.lastMatch.team2.logo) {
        team2Name.innerHTML = `<img src="${HERO_CONFIG.lastMatch.team2.logo}" alt="${HERO_CONFIG.lastMatch.team2.name}" class="team-logo-small"> ${HERO_CONFIG.lastMatch.team2.name}`;
      } else {
        team2Name.innerHTML = HERO_CONFIG.lastMatch.team2.name;
      }
    }
    if (team2Score) team2Score.textContent = HERO_CONFIG.lastMatch.team2.score;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  updateHeroSection();
});

