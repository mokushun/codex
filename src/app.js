import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import {
  getFirestore,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};

const ALLOWED_EMAILS = [
  'alice@example.com',
  'bob@example.com',
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authMessage = document.getElementById('authMessage');
const authSection = document.getElementById('authSection');
const chatSection = document.getElementById('chatSection');
const userInfo = document.getElementById('userInfo');
const messagesEl = document.getElementById('messages');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

function isAllowed(email) {
  return ALLOWED_EMAILS.includes((email || '').toLowerCase());
}

function containsBlockedContent(text) {
  const urlPattern = /(https?:\/\/|www\.)\S+/i;
  return urlPattern.test(text);
}

function renderMessages(snapshot) {
  messagesEl.innerHTML = '';
  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const row = document.createElement('article');
    row.className = 'message';
    row.innerHTML = `
      <div class="meta">${data.userName} (${data.userEmail})</div>
      <div>${data.text}</div>
    `;
    messagesEl.appendChild(row);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

loginBtn.addEventListener('click', async () => {
  authMessage.textContent = '';
  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email?.toLowerCase();

    if (!isAllowed(email)) {
      authMessage.textContent = 'このGoogleアカウントは許可されていません。';
      await signOut(auth);
    }
  } catch (error) {
    authMessage.textContent = `ログイン失敗: ${error.message}`;
  }
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (!user || !isAllowed(user.email)) {
    authSection.classList.remove('hidden');
    chatSection.classList.add('hidden');
    userInfo.textContent = '';
    messagesEl.innerHTML = '';
    return;
  }

  authSection.classList.add('hidden');
  chatSection.classList.remove('hidden');
  userInfo.textContent = `${user.displayName} / ${user.email}`;

  const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(100));
  onSnapshot(q, renderMessages);
});

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const user = auth.currentUser;
  if (!user || !isAllowed(user.email)) {
    authMessage.textContent = '認証状態が無効です。再ログインしてください。';
    return;
  }

  const text = messageInput.value.trim();
  if (!text) {
    return;
  }

  if (containsBlockedContent(text)) {
    authMessage.textContent = 'URLを含むメッセージは送信できません。';
    return;
  }

  await addDoc(collection(db, 'messages'), {
    text,
    userEmail: user.email,
    userName: user.displayName || 'unknown',
    createdAt: serverTimestamp(),
  });

  messageInput.value = '';
  authMessage.textContent = '';
});

['drop', 'dragover'].forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    event.preventDefault();
    authMessage.textContent = 'ファイル添付は無効です。';
  });
});
