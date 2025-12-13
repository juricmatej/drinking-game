// Global state management
let currentUser = null;
let currentSession = null;
let currentChallenge = null;
let currentGroupId = null;

// Sample data storage (in production, this would be a backend database)
let users = [
    { username: 'demo', totalPoints: 0, completedChallenges: 0, friends: [], friendRequests: [], sentRequests: [] }
];

let groups = [
    {
        id: 1,
        name: 'Nocturnal Crew',
        description: 'Weekend party group',
        owner: 'demo',
        members: ['demo'],
        requests: []
    }
];

let sessions = [
    {
        id: 1,
        name: 'Friday Night @ Club XYZ',
        location: 'Club XYZ',
        date: '2025-12-12',
        active: true,
        players: []
    },
    {
        id: 2,
        name: 'Saturday Party @ Disco 90',
        location: 'Disco 90',
        date: '2025-12-13',
        active: true,
        players: []
    }
];

let challenges = [
    { id: 1, title: 'Buy a drink for someone in a red jacket', description: 'Find someone in red and buy them a drink', points: 50, type: 'photo', completed: false },
    { id: 2, title: 'Selfie with the DJ', description: 'Take a selfie with the DJ', points: 100, type: 'photo', completed: false },
    { id: 3, title: 'Toast with a stranger', description: 'Find a stranger and toast together', points: 30, type: 'user_confirm', completed: false },
    { id: 4, title: 'Scan QR code at the bar', description: 'Find the QR code at the main bar', points: 20, type: 'qr', completed: false },
    { id: 5, title: 'Dance in front of the stage', description: 'Show off your dance moves', points: 40, type: 'photo', completed: false },
    { id: 6, title: 'Make a song request to the DJ', description: 'Suggest a song to the DJ', points: 25, type: 'user_confirm', completed: false },
    { id: 7, title: 'Meet 3 new people', description: 'Introduce yourself to three new people', points: 75, type: 'user_confirm', completed: false },
    { id: 8, title: 'Photo with the bartender', description: 'Take a photo with the bartender', points: 35, type: 'photo', completed: false }
];

// Utility functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    // Update content based on screen
    if (screenId === 'mainMenu') {
        updateMainMenu();
    } else if (screenId === 'sessionScreen') {
        loadSessions();
    } else if (screenId === 'groupsScreen') {
        loadMyGroups();
    } else if (screenId === 'friendsScreen') {
        loadFriends();
    } else if (screenId === 'leaderboardScreen') {
        loadGlobalLeaderboard();
    } else if (screenId === 'profileScreen') {
        loadProfile();
    }
}

function switchTab(tabName) {
    document.querySelectorAll('#gameScreen .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('#gameScreen .tab-content').forEach(content => {
        content.classList.remove('active');
    });

    event.target.classList.add('active');
    if (tabName === 'challenges') {
        document.getElementById('challengesTab').classList.add('active');
    } else if (tabName === 'live-leaderboard') {
        document.getElementById('liveLeaderboardTab').classList.add('active');
        updateLiveLeaderboard();
    }
}

function switchGroupTab(tabName) {
    document.querySelectorAll('#groupsScreen .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('#groupsScreen .tab-content').forEach(content => {
        content.classList.remove('active');
    });

    event.target.classList.add('active');
    if (tabName === 'my-groups') {
        document.getElementById('myGroupsTab').classList.add('active');
        loadMyGroups();
    } else if (tabName === 'search-groups') {
        document.getElementById('searchGroupsTab').classList.add('active');
    } else if (tabName === 'requests') {
        document.getElementById('requestsTab').classList.add('active');
        loadGroupRequests();
    }
}

function switchFriendTab(tabName) {
    document.querySelectorAll('#friendsScreen .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('#friendsScreen .tab-content').forEach(content => {
        content.classList.remove('active');
    });

    event.target.classList.add('active');
    if (tabName === 'friends-list') {
        document.getElementById('friendsListTab').classList.add('active');
        loadFriends();
    } else if (tabName === 'friend-requests') {
        document.getElementById('friendRequestsTab').classList.add('active');
        loadFriendRequests();
    } else if (tabName === 'find-friends') {
        document.getElementById('findFriendsTab').classList.add('active');
    }
}

// Login/Logout
function login() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) {
        alert('Please enter a username');
        return;
    }

    let user = users.find(u => u.username === username);
    if (!user) {
        user = {
            username: username,
            totalPoints: 0,
            completedChallenges: 0,
            friends: [],
            friendRequests: [],
            sentRequests: []
        };
        users.push(user);
    }

    currentUser = user;
    showScreen('mainMenu');
}

function logout() {
    currentUser = null;
    currentSession = null;
    showScreen('loginScreen');
    document.getElementById('usernameInput').value = '';
}

function updateMainMenu() {
    document.getElementById('usernameText').textContent = currentUser.username;
}

// Sessions
function loadSessions() {
    const sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '';

    if (sessions.length === 0) {
        sessionsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎯</div><p>No active sessions available</p></div>';
        return;
    }

    sessions.forEach(session => {
        const card = document.createElement('div');
        card.className = 'session-card';
        card.innerHTML = `
            <h3>${session.name}</h3>
            <p>📍 ${session.location}</p>
            <p>📅 ${session.date}</p>
            <p>👥 ${session.players.length} players</p>
        `;
        card.onclick = () => joinSession(session);
        sessionsList.appendChild(card);
    });
}

function joinSession(session) {
    currentSession = session;

    if (!session.players.find(p => p.username === currentUser.username)) {
        session.players.push({
            username: currentUser.username,
            points: 0,
            challenges: JSON.parse(JSON.stringify(challenges))
        });
    }

    document.getElementById('sessionName').textContent = session.name;
    loadChallenges();
    showScreen('gameScreen');
}

function loadChallenges() {
    const player = currentSession.players.find(p => p.username === currentUser.username);
    const challengesList = document.getElementById('challengesList');
    challengesList.innerHTML = '';

    document.getElementById('userPoints').textContent = player.points;

    player.challenges.forEach(challenge => {
        const card = document.createElement('div');
        card.className = `challenge-card ${challenge.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="challenge-info">
                <h4>${challenge.completed ? '✅ ' : ''}${challenge.title}</h4>
                <p>${challenge.description}</p>
            </div>
            <div class="challenge-points">${challenge.points} pts</div>
        `;
        if (!challenge.completed) {
            card.onclick = () => openChallengeModal(challenge);
        }
        challengesList.appendChild(card);
    });
}

function updateLiveLeaderboard() {
    const leaderboard = document.getElementById('liveLeaderboard');
    leaderboard.innerHTML = '';

    const sortedPlayers = [...currentSession.players].sort((a, b) => b.points - a.points);

    if (sortedPlayers.length === 0) {
        leaderboard.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>No players yet</p></div>';
        return;
    }

    sortedPlayers.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';

        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';

        item.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
            <div class="leaderboard-name">${player.username}</div>
            <div class="leaderboard-points">${player.points}</div>
        `;
        leaderboard.appendChild(item);
    });
}

// Challenge Modal
function openChallengeModal(challenge) {
    currentChallenge = challenge;

    document.getElementById('challengeTitle').textContent = challenge.title;
    document.getElementById('challengeDescription').textContent = challenge.description;
    document.getElementById('challengePoints').textContent = challenge.points;

    // Hide all completion methods
    document.getElementById('photoUpload').style.display = 'none';
    document.getElementById('qrScan').style.display = 'none';
    document.getElementById('userConfirm').style.display = 'none';

    // Show appropriate completion method
    if (challenge.type === 'photo') {
        document.getElementById('photoUpload').style.display = 'block';
    } else if (challenge.type === 'qr') {
        document.getElementById('qrScan').style.display = 'block';
    } else if (challenge.type === 'user_confirm') {
        document.getElementById('userConfirm').style.display = 'block';
    }

    document.getElementById('challengeModal').classList.add('active');
}

function closeChallengeModal() {
    document.getElementById('challengeModal').classList.remove('active');
    currentChallenge = null;
}

function completeChallenge() {
    const player = currentSession.players.find(p => p.username === currentUser.username);
    const challenge = player.challenges.find(c => c.id === currentChallenge.id);

    // In a real app, you would validate the completion (check photo, QR code, etc.)
    challenge.completed = true;
    player.points += challenge.points;

    currentUser.totalPoints += challenge.points;
    currentUser.completedChallenges++;

    closeChallengeModal();
    loadChallenges();

    alert(`Congratulations! You earned ${challenge.points} points! 🎉`);
}

// Groups
function loadMyGroups() {
    const myGroupsList = document.getElementById('myGroupsList');
    myGroupsList.innerHTML = '';

    const userGroups = groups.filter(g => g.members.includes(currentUser.username));

    if (userGroups.length === 0) {
        myGroupsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p>You are not a member of any group</p></div>';
        return;
    }

    userGroups.forEach(group => {
        const card = document.createElement('div');
        card.className = 'group-card';
        card.innerHTML = `
            <h4>${group.name}</h4>
            <p>${group.description}</p>
            <p>👥 ${group.members.length} members</p>
            <p>👑 Owner: ${group.owner}</p>
        `;
        card.onclick = () => openGroupDetail(group.id);
        myGroupsList.appendChild(card);
    });
}

function searchGroups() {
    const searchTerm = document.getElementById('groupSearchInput').value.toLowerCase().trim();
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    if (!searchTerm) {
        searchResults.innerHTML = '<div class="empty-state"><p>Enter a search term</p></div>';
        return;
    }

    const results = groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm) ||
        g.description.toLowerCase().includes(searchTerm)
    );

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No results found</p></div>';
        return;
    }

    results.forEach(group => {
        const card = document.createElement('div');
        card.className = 'group-card';

        const isMember = group.members.includes(currentUser.username);
        const hasPendingRequest = group.requests.includes(currentUser.username);

        card.innerHTML = `
            <h4>${group.name}</h4>
            <p>${group.description}</p>
            <p>👥 ${group.members.length} members</p>
            <p>👑 Owner: ${group.owner}</p>
            <div class="group-actions">
                ${isMember ? '<span style="color: green;">✅ Member</span>' :
                  hasPendingRequest ? '<span style="color: orange;">⏳ Request sent</span>' :
                  `<button class="btn-primary" onclick="requestJoinGroup(${group.id}, event)">Join</button>`}
            </div>
        `;
        searchResults.appendChild(card);
    });
}

function requestJoinGroup(groupId, event) {
    event.stopPropagation();

    const group = groups.find(g => g.id === groupId);
    if (!group.requests) {
        group.requests = [];
    }

    if (!group.requests.includes(currentUser.username)) {
        group.requests.push(currentUser.username);
        alert('Join request sent!');
        searchGroups();
    }
}

function loadGroupRequests() {
    const requestsList = document.getElementById('groupRequestsList');
    requestsList.innerHTML = '';

    const myGroups = groups.filter(g => g.owner === currentUser.username);
    let allRequests = [];

    myGroups.forEach(group => {
        if (group.requests && group.requests.length > 0) {
            group.requests.forEach(username => {
                allRequests.push({ group, username });
            });
        }
    });

    if (allRequests.length === 0) {
        requestsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📬</div><p>No join requests</p></div>';
        return;
    }

    allRequests.forEach(req => {
        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
            <div class="request-info">
                <strong>${req.username}</strong> wants to join <strong>${req.group.name}</strong>
            </div>
            <div class="request-actions">
                <button class="btn-primary" onclick="acceptGroupRequest('${req.group.id}', '${req.username}')">Accept</button>
                <button class="btn-secondary" onclick="rejectGroupRequest('${req.group.id}', '${req.username}')">Reject</button>
            </div>
        `;
        requestsList.appendChild(card);
    });
}

function acceptGroupRequest(groupId, username) {
    const group = groups.find(g => g.id == groupId);
    group.members.push(username);
    group.requests = group.requests.filter(u => u !== username);

    alert(`${username} has been added to the group!`);
    loadGroupRequests();
}

function rejectGroupRequest(groupId, username) {
    const group = groups.find(g => g.id == groupId);
    group.requests = group.requests.filter(u => u !== username);

    alert('Request rejected');
    loadGroupRequests();
}

function openGroupDetail(groupId) {
    const group = groups.find(g => g.id === groupId);
    currentGroupId = groupId;

    document.getElementById('groupDetailName').textContent = group.name;
    document.getElementById('groupOwner').textContent = group.owner;
    document.getElementById('groupMemberCount').textContent = group.members.length;
    document.getElementById('groupDescription').textContent = group.description;

    const membersList = document.getElementById('groupMembersList');
    membersList.innerHTML = '';

    group.members.forEach(member => {
        const card = document.createElement('div');
        card.className = 'member-card';
        card.innerHTML = `
            <div>${member} ${member === group.owner ? '👑' : ''}</div>
            ${!currentUser.friends.includes(member) && member !== currentUser.username ?
                `<button class="btn-secondary" onclick="sendFriendRequest('${member}', event)">Add Friend</button>` :
                member !== currentUser.username ? '<span style="color: green;">✅ Friend</span>' : ''}
        `;
        membersList.appendChild(card);
    });

    // Show admin actions if current user is owner
    if (group.owner === currentUser.username) {
        document.getElementById('groupAdminActions').style.display = 'block';
    } else {
        document.getElementById('groupAdminActions').style.display = 'none';
    }

    showScreen('groupDetailScreen');
}

function showCreateGroupModal() {
    document.getElementById('createGroupModal').classList.add('active');
}

function closeCreateGroupModal() {
    document.getElementById('createGroupModal').classList.remove('active');
    document.getElementById('newGroupName').value = '';
    document.getElementById('newGroupDescription').value = '';
}

function createGroup() {
    const name = document.getElementById('newGroupName').value.trim();
    const description = document.getElementById('newGroupDescription').value.trim();

    if (!name) {
        alert('Please enter a group name');
        return;
    }

    const newGroup = {
        id: groups.length + 1,
        name: name,
        description: description,
        owner: currentUser.username,
        members: [currentUser.username],
        requests: []
    };

    groups.push(newGroup);
    closeCreateGroupModal();
    loadMyGroups();
    alert('Group created!');
}

function inviteFriendsToGroup() {
    const group = groups.find(g => g.id === currentGroupId);
    const friendsToInviteList = document.getElementById('friendsToInviteList');
    friendsToInviteList.innerHTML = '';

    const availableFriends = currentUser.friends.filter(f => !group.members.includes(f));

    if (availableFriends.length === 0) {
        friendsToInviteList.innerHTML = '<div class="empty-state"><p>All friends are already members of the group</p></div>';
    } else {
        availableFriends.forEach(friend => {
            const card = document.createElement('div');
            card.className = 'friend-card';
            card.innerHTML = `
                <div class="friend-name">${friend}</div>
                <button class="btn-primary" onclick="inviteFriendToGroup('${friend}')">Invite</button>
            `;
            friendsToInviteList.appendChild(card);
        });
    }

    document.getElementById('inviteFriendsModal').classList.add('active');
}

function closeInviteFriendsModal() {
    document.getElementById('inviteFriendsModal').classList.remove('active');
}

function inviteFriendToGroup(friendUsername) {
    const group = groups.find(g => g.id === currentGroupId);

    // In a real app, this would send a notification to the friend
    group.members.push(friendUsername);
    alert(`${friendUsername} has been invited to the group!`);

    closeInviteFriendsModal();
    openGroupDetail(currentGroupId);
}

// Friends
function loadFriends() {
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';

    if (currentUser.friends.length === 0) {
        friendsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🤝</div><p>You have no friends yet</p></div>';
        return;
    }

    currentUser.friends.forEach(friend => {
        const card = document.createElement('div');
        card.className = 'friend-card';
        card.innerHTML = `
            <div class="friend-name">${friend}</div>
            <button class="btn-secondary" onclick="removeFriend('${friend}')">Remove</button>
        `;
        friendsList.appendChild(card);
    });
}

function loadFriendRequests() {
    // Received requests
    const requestsList = document.getElementById('friendRequestsList');
    requestsList.innerHTML = '';

    if (currentUser.friendRequests.length === 0) {
        requestsList.innerHTML = '<div class="empty-state"><p>No new requests</p></div>';
    } else {
        currentUser.friendRequests.forEach(username => {
            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <div class="request-info">
                    <strong>${username}</strong> wants to be your friend
                </div>
                <div class="request-actions">
                    <button class="btn-primary" onclick="acceptFriendRequest('${username}')">Accept</button>
                    <button class="btn-secondary" onclick="rejectFriendRequest('${username}')">Reject</button>
                </div>
            `;
            requestsList.appendChild(card);
        });
    }

    // Sent requests
    const sentRequestsList = document.getElementById('sentRequestsList');
    sentRequestsList.innerHTML = '';

    if (currentUser.sentRequests.length === 0) {
        sentRequestsList.innerHTML = '<div class="empty-state"><p>You have not sent any requests</p></div>';
    } else {
        currentUser.sentRequests.forEach(username => {
            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <div class="request-info">
                    Request sent to: <strong>${username}</strong>
                </div>
                <div class="request-actions">
                    <button class="btn-secondary" onclick="cancelFriendRequest('${username}')">Cancel</button>
                </div>
            `;
            sentRequestsList.appendChild(card);
        });
    }
}

function searchUsers() {
    const searchTerm = document.getElementById('friendSearchInput').value.toLowerCase().trim();
    const searchResults = document.getElementById('userSearchResults');
    searchResults.innerHTML = '';

    if (!searchTerm) {
        searchResults.innerHTML = '<div class="empty-state"><p>Enter a search term</p></div>';
        return;
    }

    const results = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm) &&
        u.username !== currentUser.username
    );

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No results found</p></div>';
        return;
    }

    results.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';

        const isFriend = currentUser.friends.includes(user.username);
        const hasPendingRequest = currentUser.sentRequests.includes(user.username);

        card.innerHTML = `
            <div class="user-name">${user.username}</div>
            ${isFriend ? '<span style="color: green;">✅ Friend</span>' :
              hasPendingRequest ? '<span style="color: orange;">⏳ Request sent</span>' :
              `<button class="btn-primary" onclick="sendFriendRequest('${user.username}', event)">Add Friend</button>`}
        `;
        searchResults.appendChild(card);
    });
}

function sendFriendRequest(username, event) {
    if (event) event.stopPropagation();

    const targetUser = users.find(u => u.username === username);

    if (!currentUser.sentRequests.includes(username)) {
        currentUser.sentRequests.push(username);
        targetUser.friendRequests.push(currentUser.username);
        alert('Friend request sent!');

        // Refresh current view
        if (document.getElementById('userSearchResults').innerHTML) {
            searchUsers();
        }
    }
}

function acceptFriendRequest(username) {
    currentUser.friends.push(username);
    currentUser.friendRequests = currentUser.friendRequests.filter(u => u !== username);

    const otherUser = users.find(u => u.username === username);
    otherUser.friends.push(currentUser.username);
    otherUser.sentRequests = otherUser.sentRequests.filter(u => u !== currentUser.username);

    alert(`${username} is now your friend!`);
    loadFriendRequests();
}

function rejectFriendRequest(username) {
    currentUser.friendRequests = currentUser.friendRequests.filter(u => u !== username);

    const otherUser = users.find(u => u.username === username);
    otherUser.sentRequests = otherUser.sentRequests.filter(u => u !== currentUser.username);

    alert('Request rejected');
    loadFriendRequests();
}

function cancelFriendRequest(username) {
    currentUser.sentRequests = currentUser.sentRequests.filter(u => u !== username);

    const otherUser = users.find(u => u.username === username);
    otherUser.friendRequests = otherUser.friendRequests.filter(u => u !== currentUser.username);

    alert('Request cancelled');
    loadFriendRequests();
}

function removeFriend(username) {
    if (confirm(`Are you sure you want to remove ${username} from your friends?`)) {
        currentUser.friends = currentUser.friends.filter(f => f !== username);

        const otherUser = users.find(u => u.username === username);
        otherUser.friends = otherUser.friends.filter(f => f !== currentUser.username);

        loadFriends();
        alert('Friend removed');
    }
}

// Leaderboard
function loadGlobalLeaderboard() {
    const leaderboard = document.getElementById('globalLeaderboard');
    leaderboard.innerHTML = '';

    const sortedUsers = [...users].sort((a, b) => b.totalPoints - a.totalPoints);

    if (sortedUsers.length === 0) {
        leaderboard.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>No users yet</p></div>';
        return;
    }

    sortedUsers.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';

        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';

        item.innerHTML = `
            <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
            <div class="leaderboard-name">${user.username}</div>
            <div class="leaderboard-points">${user.totalPoints}</div>
        `;
        leaderboard.appendChild(item);
    });
}

// Profile
function loadProfile() {
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileTotalPoints').textContent = currentUser.totalPoints;
    document.getElementById('profileCompletedChallenges').textContent = currentUser.completedChallenges;
}

// Initialize app
window.onload = function() {
    showScreen('loginScreen');
};
