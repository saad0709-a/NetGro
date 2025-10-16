// EduConnect - LinkedIn-style Educational Social App
// Simplified JavaScript for compatibility

// Mock Data
var mockUsers = [
  {
    userId: "u-001",
    name: "Arjun Sharma",
    email: "arjun.sharma@example.com",
    bio: "Final year ECE student at Delhi Technological University. Passionate about IoT and embedded systems.",
    profileId: "p-001"
  },
  {
    userId: "u-002",
    name: "Priya Patel", 
    email: "priya.patel@example.com",
    bio: "Computer Science Engineering student at IIT Delhi. Interested in AI/ML and software development.",
    profileId: "p-002"
  },
  {
    userId: "u-003",
    name: "Rohit Kumar",
    email: "rohit.kumar@example.com", 
    bio: "Mechanical Engineering graduate from NIT Kurukshetra. Currently working as a Design Engineer.",
    profileId: "p-003"
  }
];

var mockProfiles = [
  {
    profileId: "p-001",
    userId: "u-001",
    headline: "ECE Student | IoT Enthusiast | Arduino Projects",
    location: "Delhi, India",
    pictureUrl: "https://via.placeholder.com/150/2196F3/FFFFFF?text=AS",
    contact: "+91-9876543210"
  },
  {
    profileId: "p-002",
    userId: "u-002", 
    headline: "CSE Student | AI/ML Researcher | Full Stack Developer",
    location: "New Delhi, India",
    pictureUrl: "https://via.placeholder.com/150/E91E63/FFFFFF?text=PP",
    contact: "priya.dev@gmail.com"
  },
  {
    profileId: "p-003",
    userId: "u-003",
    headline: "Design Engineer | CAD Expert | Manufacturing Specialist",
    location: "Gurgaon, Haryana", 
    pictureUrl: "https://via.placeholder.com/150/4CAF50/FFFFFF?text=RK",
    contact: "rohit.design@outlook.com"
  }
];

var mockPosts = [
  {
    postId: "post-001",
    authorId: "u-001",
    content: "Just completed my final year project on Solar-powered IoT Weather Monitoring System! The system uses ESP32 to collect weather data and uploads it to cloud dashboard. Excited to present it next week! #IoT #SolarEnergy #Engineering #FinalYear",
    attachments: ["https://via.placeholder.com/600x400/2196F3/FFFFFF?text=Solar+IoT+Project"],
    createdAt: "2025-10-15T14:30:00Z",
    likesCount: 12,
    commentsCount: 3,
    likedByUser: false
  },
  {
    postId: "post-002", 
    authorId: "u-002",
    content: "Thrilled to share that our AI research paper on 'Enhanced Image Recognition using Transfer Learning' has been accepted at ICML 2025! Thanks to my mentor Dr. Sharma and the amazing research team. Hard work pays off! #AI #MachineLearning #Research #IIT",
    attachments: [],
    createdAt: "2025-10-14T09:15:00Z",
    likesCount: 25,
    commentsCount: 7,
    likedByUser: true
  },
  {
    postId: "post-003",
    authorId: "u-003",
    content: "Sharing some insights from my experience in automotive design: The key to successful product development is balancing innovation with manufacturability. Always consider the production constraints early in the design phase. #DesignEngineering #Automotive #Manufacturing",
    attachments: [],
    createdAt: "2025-10-13T18:45:00Z", 
    likesCount: 8,
    commentsCount: 2,
    likedByUser: false
  }
];

var mockComments = [
  {
    commentId: "comm-001",
    postId: "post-001",
    authorId: "u-002",
    content: "Amazing project Arjun! The integration of solar power with IoT is brilliant. Would love to see the technical details. Good luck with your presentation!",
    createdAt: "2025-10-15T15:45:00Z"
  },
  {
    commentId: "comm-002",
    postId: "post-001",
    authorId: "u-003", 
    content: "Great work! Solar-powered systems are the future. Have you considered adding battery backup for cloudy days?",
    createdAt: "2025-10-15T16:20:00Z"
  }
];

// Global State
var appState = {
  currentUser: null,
  currentPage: 'landing',
  feedPosts: []
};

// Utility Functions
var utils = {
  formatTimeAgo: function(dateString) {
    var date = new Date(dateString);
    var now = new Date();
    var diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + 'm ago';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + 'h ago';
    return Math.floor(diffInSeconds / 86400) + 'd ago';
  },
  
  escapeHtml: function(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  showToast: function(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span>' + utils.escapeHtml(message) + '</span><button onclick="this.parentElement.remove()" style="background: none; border: none; cursor: pointer; margin-left: auto;">✕</button>';
    
    container.appendChild(toast);
    
    setTimeout(function() {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  },
  
  showLoading: function() {
    document.getElementById('loading').classList.remove('hidden');
  },
  
  hideLoading: function() {
    document.getElementById('loading').classList.add('hidden');
  }
};

// Authentication
var auth = {
  handleLogin: function(event) {
    event.preventDefault();
    
    var formData = new FormData(event.target);
    var email = formData.get('email');
    
    // Find user by email
    var user = mockUsers.find(function(u) {
      return u.email === email;
    });
    
    if (user) {
      appState.currentUser = user;
      auth.updateUserUI(user);
      utils.showToast('Welcome back!', 'success');
      router.navigate('feed');
    } else {
      utils.showToast('User not found', 'error');
    }
  },
  
  handleRegister: function(event) {
    event.preventDefault();
    
    var formData = new FormData(event.target);
    var userData = {
      userId: 'u-' + Date.now(),
      name: formData.get('name'),
      email: formData.get('email'),
      bio: formData.get('bio') || '',
      profileId: 'p-' + Date.now()
    };
    
    // Check if email exists
    var existingUser = mockUsers.find(function(u) {
      return u.email === userData.email;
    });
    
    if (existingUser) {
      utils.showToast('Email already exists', 'error');
      return;
    }
    
    // Create new user and profile
    mockUsers.push(userData);
    
    var profile = {
      profileId: userData.profileId,
      userId: userData.userId,
      headline: 'Student',
      location: 'India',
      pictureUrl: 'https://via.placeholder.com/150/2196F3/FFFFFF?text=' + userData.name.split(' ').map(function(n) { return n[0]; }).join(''),
      contact: userData.email
    };
    
    mockProfiles.push(profile);
    
    appState.currentUser = userData;
    auth.updateUserUI(userData);
    utils.showToast('Account created successfully!', 'success');
    router.navigate('feed');
  },
  
  updateUserUI: function(user) {
    var profile = mockProfiles.find(function(p) {
      return p.userId === user.userId;
    });
    
    var elements = [
      'header-name', 'header-avatar', 'composer-avatar', 
      'comment-avatar', 'sidebar-name', 'sidebar-avatar'
    ];
    
    elements.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        if (el.tagName === 'IMG') {
          el.src = profile ? profile.pictureUrl : 'https://via.placeholder.com/150/2196F3/FFFFFF?text=U';
          el.alt = user.name;
        } else {
          el.textContent = user.name;
        }
      }
    });
    
    if (profile) {
      var sidebarHeadline = document.getElementById('sidebar-headline');
      if (sidebarHeadline) {
        sidebarHeadline.textContent = profile.headline;
      }
    }
  },
  
  logout: function() {
    appState.currentUser = null;
    appState.feedPosts = [];
    utils.showToast('Logged out successfully', 'info');
    router.navigate('landing');
  },
  
  isAuthenticated: function() {
    return appState.currentUser !== null;
  }
};

// Feed Management
var feed = {
  loadFeed: function() {
    // Get posts with author info
    var enrichedPosts = mockPosts.map(function(post) {
      var author = mockUsers.find(function(u) {
        return u.userId === post.authorId;
      });
      var authorProfile = mockProfiles.find(function(p) {
        return p.userId === post.authorId;
      });
      
      return {
        postId: post.postId,
        authorId: post.authorId,
        content: post.content,
        attachments: post.attachments,
        createdAt: post.createdAt,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        likedByUser: post.likedByUser,
        author: {
          name: author.name,
          profile: authorProfile
        }
      };
    });
    
    appState.feedPosts = enrichedPosts;
    feed.renderFeed();
  },
  
  renderFeed: function() {
    var container = document.getElementById('feed-container');
    if (!container) return;
    
    if (appState.feedPosts.length === 0) {
      container.innerHTML = '<div class="empty-state"><h3>Welcome to EduConnect!</h3><p>Start connecting with fellow students and share your projects!</p></div>';
      return;
    }
    
    var feedHtml = '';
    appState.feedPosts.forEach(function(post) {
      feedHtml += feed.renderPostCard(post);
    });
    
    container.innerHTML = feedHtml;
  },
  
  renderPostCard: function(post) {
    var comments = mockComments.filter(function(c) {
      return c.postId === post.postId;
    }).slice(0, 2);
    
    var postHtml = '<article class="post-card card" data-post-id="' + post.postId + '">';
    postHtml += '<div class="card__body">';
    postHtml += '<div class="post-header">';
    postHtml += '<img src="' + (post.author.profile ? post.author.profile.pictureUrl : 'https://via.placeholder.com/40/2196F3/FFFFFF?text=U') + '" alt="' + utils.escapeHtml(post.author.name) + '" class="avatar">';
    postHtml += '<div class="post-author-info">';
    postHtml += '<h4 class="post-author-name">';
    postHtml += '<a href="#" onclick="router.navigate(\'profile\', \''+post.authorId+'\')">' + utils.escapeHtml(post.author.name) + '</a>';
    postHtml += '</h4>';
    postHtml += '<p class="post-author-headline">' + utils.escapeHtml(post.author.profile ? post.author.profile.headline : 'Student') + '</p>';
    postHtml += '</div>';
    postHtml += '<span class="post-timestamp">' + utils.formatTimeAgo(post.createdAt) + '</span>';
    postHtml += '</div>';
    postHtml += '<div class="post-content">' + utils.escapeHtml(post.content) + '</div>';
    
    if (post.attachments.length > 0) {
      postHtml += '<div class="post-attachment"><img src="' + post.attachments[0] + '" alt="Post attachment" loading="lazy"></div>';
    }
    
    postHtml += '<div class="post-actions">';
    postHtml += '<button class="post-action ' + (post.likedByUser ? 'liked' : '') + '" onclick="feed.toggleLike(\''+post.postId+'\')" aria-label="' + (post.likedByUser ? 'Unlike' : 'Like') + ' post">';
    postHtml += '<span>' + (post.likedByUser ? '❤️' : '🤍') + '</span>';
    postHtml += '<span class="like-count">' + post.likesCount + '</span>';
    postHtml += '</button>';
    postHtml += '<button class="post-action" onclick="router.navigate(\'post\', \''+post.postId+'\')" aria-label="View comments">';
    postHtml += '<span>💬</span><span>' + post.commentsCount + '</span>';
    postHtml += '</button>';
    postHtml += '<button class="post-action" onclick="utils.showToast(\'Sharing feature coming soon!\', \'info\')" aria-label="Share post">';
    postHtml += '<span>🔄</span><span>Share</span>';
    postHtml += '</button>';
    postHtml += '</div>';
    
    if (comments.length > 0) {
      postHtml += '<div class="post-comments-preview">';
      comments.forEach(function(comment) {
        var commentAuthor = mockUsers.find(function(u) {
          return u.userId === comment.authorId;
        });
        var commentProfile = mockProfiles.find(function(p) {
          return p.userId === comment.authorId;
        });
        
        postHtml += '<div class="comment-item">';
        postHtml += '<img src="' + (commentProfile ? commentProfile.pictureUrl : 'https://via.placeholder.com/32/2196F3/FFFFFF?text=U') + '" alt="' + utils.escapeHtml(commentAuthor ? commentAuthor.name : 'User') + '" class="avatar" style="width: 32px; height: 32px;">';
        postHtml += '<div class="comment-content">';
        postHtml += '<div class="comment-author">' + utils.escapeHtml(commentAuthor ? commentAuthor.name : 'User') + '</div>';
        postHtml += '<p class="comment-text">' + utils.escapeHtml(comment.content) + '</p>';
        postHtml += '</div></div>';
      });
      
      if (mockComments.filter(function(c) { return c.postId === post.postId; }).length > 2) {
        postHtml += '<button class="view-more-comments" onclick="router.navigate(\'post\', \''+post.postId+'\')">View all comments</button>';
      }
      postHtml += '</div>';
    }
    
    postHtml += '</div></article>';
    return postHtml;
  },
  
  createPost: function() {
    var contentEl = document.getElementById('post-content');
    var content = contentEl.value.trim();
    
    if (!content) {
      utils.showToast('Please write something before posting', 'error');
      return;
    }
    
    if (!appState.currentUser) {
      utils.showToast('Please login to post', 'error');
      return;
    }
    
    var newPost = {
      postId: 'post-' + Date.now(),
      authorId: appState.currentUser.userId,
      content: content,
      attachments: [],
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      likedByUser: false
    };
    
    mockPosts.unshift(newPost);
    contentEl.value = '';
    
    feed.loadFeed();
    utils.showToast('Post shared successfully!', 'success');
  },
  
  toggleLike: function(postId) {
    if (!auth.isAuthenticated()) {
      utils.showToast('Please login to like posts', 'error');
      return;
    }
    
    var post = mockPosts.find(function(p) {
      return p.postId === postId;
    });
    
    if (post) {
      if (post.likedByUser) {
        post.likesCount--;
        post.likedByUser = false;
      } else {
        post.likesCount++;
        post.likedByUser = true;
      }
      
      // Update UI
      var postCard = document.querySelector('[data-post-id="' + postId + '"]');
      if (postCard) {
        var likeBtn = postCard.querySelector('.post-action');
        var likeCount = likeBtn.querySelector('.like-count');
        
        if (post.likedByUser) {
          likeBtn.classList.add('liked');
          likeBtn.querySelector('span').textContent = '❤️';
        } else {
          likeBtn.classList.remove('liked');
          likeBtn.querySelector('span').textContent = '🤍';
        }
        
        likeCount.textContent = post.likesCount;
      }
      
      utils.showToast(post.likedByUser ? 'Liked!' : 'Unliked!', 'success');
    }
  },
  
  initComposer: function() {
    var contentEl = document.getElementById('post-content');
    var submitBtn = document.getElementById('post-submit-btn');
    
    if (contentEl && submitBtn) {
      contentEl.addEventListener('input', function() {
        submitBtn.disabled = contentEl.value.trim().length === 0;
      });
    }
  }
};

// Profile Management
var profile = {
  loadProfile: function(userId) {
    var user = mockUsers.find(function(u) {
      return u.userId === userId;
    });
    
    if (!user) {
      utils.showToast('User not found', 'error');
      return;
    }
    
    var userProfile = mockProfiles.find(function(p) {
      return p.userId === userId;
    });
    
    profile.renderProfile(user, userProfile);
  },
  
  renderProfile: function(user, userProfile) {
    var isOwnProfile = appState.currentPage === 'me';
    var prefix = isOwnProfile ? 'me-' : 'profile-';
    
    var elements = {
      avatar: document.getElementById(prefix + 'avatar'),
      name: document.getElementById(prefix + 'name'),
      headline: document.getElementById(prefix + 'headline'),
      location: document.getElementById(prefix + 'location'),
      contact: document.getElementById(prefix + 'contact'),
      bio: document.getElementById(prefix + 'bio')
    };
    
    if (elements.avatar && userProfile) elements.avatar.src = userProfile.pictureUrl;
    if (elements.name) elements.name.textContent = user.name;
    if (elements.headline && userProfile) elements.headline.textContent = userProfile.headline;
    if (elements.location && userProfile) elements.location.textContent = '📍 ' + userProfile.location;
    if (elements.contact && userProfile) elements.contact.textContent = '📧 ' + userProfile.contact;
    if (elements.bio) elements.bio.textContent = user.bio;
    
    // Render placeholder sections
    profile.renderEducation([], isOwnProfile);
    profile.renderExperience([], isOwnProfile);
    profile.renderSkills([], isOwnProfile);
  },
  
  renderEducation: function(educations, isEditable) {
    var container = document.getElementById(isEditable ? 'me-education' : 'profile-education');
    if (!container) return;
    
    container.innerHTML = '<p class="empty-text">No education information available.</p>';
  },
  
  renderExperience: function(experiences, isEditable) {
    var container = document.getElementById(isEditable ? 'me-experience' : 'profile-experience');
    if (!container) return;
    
    container.innerHTML = '<p class="empty-text">No work experience available.</p>';
  },
  
  renderSkills: function(skills, isEditable) {
    var container = document.getElementById(isEditable ? 'me-skills' : 'profile-skills');
    if (!container) return;
    
    container.innerHTML = '<p class="empty-text">No skills listed.</p>';
  },
  
  addEducation: function() {
    utils.showToast('Education form opening...', 'info');
  },
  
  addExperience: function() {
    utils.showToast('Experience form opening...', 'info');
  },
  
  addSkill: function() {
    utils.showToast('Skill form opening...', 'info');
  }
};

// Post Details
var posts = {
  loadPostDetail: function(postId) {
    var post = mockPosts.find(function(p) {
      return p.postId === postId;
    });
    
    if (!post) {
      utils.showToast('Post not found', 'error');
      return;
    }
    
    var author = mockUsers.find(function(u) {
      return u.userId === post.authorId;
    });
    
    var authorProfile = mockProfiles.find(function(p) {
      return p.userId === post.authorId;
    });
    
    var enrichedPost = {
      postId: post.postId,
      authorId: post.authorId,
      content: post.content,
      attachments: post.attachments,
      createdAt: post.createdAt,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      likedByUser: post.likedByUser,
      author: {
        name: author.name,
        profile: authorProfile
      }
    };
    
    posts.renderPostDetail(enrichedPost);
    posts.renderComments(postId);
  },
  
  renderPostDetail: function(post) {
    var container = document.getElementById('post-detail-container');
    if (!container) return;
    
    var postDetailHtml = '<div class="card__body">';
    postDetailHtml += '<div class="post-header">';
    postDetailHtml += '<img src="' + (post.author.profile ? post.author.profile.pictureUrl : 'https://via.placeholder.com/40/2196F3/FFFFFF?text=U') + '" alt="' + utils.escapeHtml(post.author.name) + '" class="avatar">';
    postDetailHtml += '<div class="post-author-info">';
    postDetailHtml += '<h4 class="post-author-name">' + utils.escapeHtml(post.author.name) + '</h4>';
    postDetailHtml += '<p class="post-author-headline">' + utils.escapeHtml(post.author.profile ? post.author.profile.headline : 'Student') + '</p>';
    postDetailHtml += '</div>';
    postDetailHtml += '<span class="post-timestamp">' + utils.formatTimeAgo(post.createdAt) + '</span>';
    postDetailHtml += '</div>';
    postDetailHtml += '<div class="post-content">' + utils.escapeHtml(post.content) + '</div>';
    
    if (post.attachments.length > 0) {
      postDetailHtml += '<div class="post-attachment"><img src="' + post.attachments[0] + '" alt="Post attachment" loading="lazy"></div>';
    }
    
    postDetailHtml += '<div class="post-actions">';
    postDetailHtml += '<button class="post-action ' + (post.likedByUser ? 'liked' : '') + '" onclick="posts.toggleLike(\''+post.postId+'\')" aria-label="' + (post.likedByUser ? 'Unlike' : 'Like') + ' post">';
    postDetailHtml += '<span>' + (post.likedByUser ? '❤️' : '🤍') + '</span>';
    postDetailHtml += '<span class="like-count">' + post.likesCount + '</span>';
    postDetailHtml += '</button></div></div>';
    
    container.innerHTML = postDetailHtml;
  },
  
  renderComments: function(postId) {
    var container = document.getElementById('comments-list');
    if (!container) return;
    
    var comments = mockComments.filter(function(c) {
      return c.postId === postId;
    });
    
    if (comments.length === 0) {
      container.innerHTML = '<p class="empty-text">No comments yet. Be the first to comment!</p>';
      return;
    }
    
    var commentsHtml = '';
    comments.forEach(function(comment) {
      var author = mockUsers.find(function(u) {
        return u.userId === comment.authorId;
      });
      var authorProfile = mockProfiles.find(function(p) {
        return p.userId === comment.authorId;
      });
      
      commentsHtml += '<div class="comment-item">';
      commentsHtml += '<img src="' + (authorProfile ? authorProfile.pictureUrl : 'https://via.placeholder.com/40/2196F3/FFFFFF?text=U') + '" alt="' + utils.escapeHtml(author ? author.name : 'User') + '" class="avatar">';
      commentsHtml += '<div class="comment-content">';
      commentsHtml += '<div class="comment-author">' + utils.escapeHtml(author ? author.name : 'User') + ' • <span class="comment-timestamp">' + utils.formatTimeAgo(comment.createdAt) + '</span></div>';
      commentsHtml += '<p class="comment-text">' + utils.escapeHtml(comment.content) + '</p>';
      commentsHtml += '</div></div>';
    });
    
    container.innerHTML = commentsHtml;
  },
  
  addComment: function(event) {
    event.preventDefault();
    
    if (!auth.isAuthenticated()) {
      utils.showToast('Please login to comment', 'error');
      return;
    }
    
    var content = document.getElementById('comment-content').value.trim();
    if (!content) {
      utils.showToast('Please write a comment', 'error');
      return;
    }
    
    var newComment = {
      commentId: 'comm-' + Date.now(),
      postId: appState.currentPost,
      authorId: appState.currentUser.userId,
      content: content,
      createdAt: new Date().toISOString()
    };
    
    mockComments.push(newComment);
    document.getElementById('comment-content').value = '';
    
    posts.renderComments(appState.currentPost);
    utils.showToast('Comment added!', 'success');
  },
  
  toggleLike: function(postId) {
    return feed.toggleLike(postId);
  }
};

// Connections
var connections = {
  loadConnections: function() {
    if (!auth.isAuthenticated()) return;
    
    connections.renderConnections([]);
    connections.renderPendingRequests([]);
    connections.updateStats(0, 0);
  },
  
  renderConnections: function(connectionsList) {
    var container = document.getElementById('connections-list');
    if (!container) return;
    
    container.innerHTML = '<p class="empty-text">No connections yet. Start networking!</p>';
  },
  
  renderPendingRequests: function(requests) {
    var container = document.getElementById('pending-requests');
    if (!container) return;
    
    container.innerHTML = '<p class="empty-text">No pending requests.</p>';
  },
  
  updateStats: function(connectionsCount, pendingCount) {
    var connectionsCountEl = document.getElementById('connections-count');
    var pendingCountEl = document.getElementById('pending-count');
    
    if (connectionsCountEl) connectionsCountEl.textContent = connectionsCount;
    if (pendingCountEl) pendingCountEl.textContent = pendingCount;
  },
  
  sendRequest: function(userId) {
    if (!auth.isAuthenticated()) {
      utils.showToast('Please login to connect', 'error');
      return;
    }
    
    utils.showToast('Connection request sent!', 'success');
  },
  
  filterConnections: function(query) {
    // Placeholder for search functionality
  }
};

// Router
var router = {
  navigate: function(page, param) {
    // Hide all pages
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.add('hidden');
    }
    
    // Update app state
    appState.currentPage = page;
    
    // Show/hide header based on page
    var header = document.getElementById('app-header');
    if (page === 'landing' || page === 'auth') {
      header.classList.add('hidden');
    } else {
      header.classList.remove('hidden');
    }
    
    // Route to appropriate page
    switch (page) {
      case 'landing':
        router.showLanding();
        break;
      case 'auth':
        router.showAuth(param);
        break;
      case 'feed':
        router.showFeed();
        break;
      case 'profile':
        router.showProfile(param);
        break;
      case 'me':
        router.showMe();
        break;
      case 'post':
        router.showPost(param);
        break;
      case 'connections':
        router.showConnections();
        break;
      default:
        router.navigate('landing');
    }
  },
  
  showLanding: function() {
    document.getElementById('landing-page').classList.remove('hidden');
  },
  
  showAuth: function(mode) {
    mode = mode || 'login';
    document.getElementById('auth-page').classList.remove('hidden');
    
    var loginForm = document.getElementById('login-form');
    var registerForm = document.getElementById('register-form');
    
    if (mode === 'register') {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
    } else {
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    }
  },
  
  showFeed: function() {
    if (!auth.isAuthenticated()) {
      router.navigate('landing');
      return;
    }
    
    document.getElementById('feed-page').classList.remove('hidden');
    feed.initComposer();
    feed.loadFeed();
  },
  
  showProfile: function(userId) {
    if (!userId) {
      router.navigate('feed');
      return;
    }
    
    document.getElementById('profile-page').classList.remove('hidden');
    profile.loadProfile(userId);
  },
  
  showMe: function() {
    if (!auth.isAuthenticated()) {
      router.navigate('landing');
      return;
    }
    
    document.getElementById('me-page').classList.remove('hidden');
    profile.loadProfile(appState.currentUser.userId);
  },
  
  showPost: function(postId) {
    if (!postId) {
      router.navigate('feed');
      return;
    }
    
    document.getElementById('post-page').classList.remove('hidden');
    appState.currentPost = postId;
    posts.loadPostDetail(postId);
  },
  
  showConnections: function() {
    if (!auth.isAuthenticated()) {
      router.navigate('landing');
      return;
    }
    
    document.getElementById('connections-page').classList.remove('hidden');
    connections.loadConnections();
  },
  
  goBack: function() {
    router.navigate('feed');
  }
};

// Global Functions
window.router = router;
window.auth = auth;
window.feed = feed;
window.profile = profile;
window.posts = posts;
window.connections = connections;
window.utils = utils;

// Profile dropdown toggle
window.toggleProfileMenu = function() {
  var dropdown = document.getElementById('profile-dropdown');
  dropdown.classList.toggle('hidden');
};

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  var dropdown = document.getElementById('profile-dropdown');
  var profileBtn = document.querySelector('.profile-btn');
  
  if (dropdown && !dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

// Modal functions
window.closeModal = function(event) {
  if (!event || event.target === event.currentTarget) {
    document.getElementById('modal-container').classList.add('hidden');
  }
};

// Simulate upload functions
window.simulateImageUpload = function() {
  utils.showToast('Image upload feature coming soon!', 'info');
};

window.simulateAvatarUpload = function() {
  utils.showToast('Avatar upload feature coming soon!', 'info');
};

// App Initialization
document.addEventListener('DOMContentLoaded', function() {
  // Initialize router
  router.navigate('landing');
  
  // Handle keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.getElementById('profile-dropdown').classList.add('hidden');
    }
  });
  
  console.log('EduConnect app initialized successfully!');
});
