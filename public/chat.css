document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const chatDiv = document.getElementById('chat');
    const authDiv = document.getElementById('auth');
    const sendMessageButton = document.getElementById('send-message');
    const messageInput = document.getElementById('message');
    const messagesDiv = document.getElementById('messages');
    const userIdSpan = document.getElementById('user-id');
    const contactList = document.getElementById('contact-list');
    const addContactButton = document.getElementById('add-contact');
    const newContactIdInput = document.getElementById('new-contact-id');
    const newContactNameInput = document.getElementById('new-contact-name');

    let userId = null;
    let selectedContactId = null;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (response.ok) {
            alert(`Registration successful! Your ID is ${result.userId}. Please log in.`);
        } else {
            alert(result.error);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (response.ok) {
            userId = result.userId;
            userIdSpan.textContent = userId;
            authDiv.style.display = 'none';
            chatDiv.style.display = 'block';
            logoutButton.style.display = 'block';
            loadContacts();
        } else {
            alert(result.error);
        }
    });

    logoutButton.addEventListener('click', async () => {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (response.ok) {
            authDiv.style.display = 'block';
            chatDiv.style.display = 'none';
            logoutButton.style.display = 'none';
            messagesDiv.innerHTML = '';
            contactList.innerHTML = '';
            userId = null;
            selectedContactId = null;
        }
    });

    addContactButton.addEventListener('click', async () => {
        const contactId = newContactIdInput.value;
        const contactName = newContactNameInput.value;
        if (!contactId || !contactName) return;

        const response = await fetch('/api/add-contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactId, contactName })
        });

        if (response.ok) {
            newContactIdInput.value = '';
            newContactNameInput.value = '';
            loadContacts();
        } else {
            alert('Failed to add contact');
        }
    });

    sendMessageButton.addEventListener('click', async () => {
        const content = messageInput.value;
        if (!content || !selectedContactId) return;

        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, recipientId: selectedContactId })
        });

        if (response.ok) {
            messageInput.value = '';
            loadMessages(selectedContactId);
        } else {
            alert('Failed to send message');
        }
    });

    async function loadContacts() {
        const response = await fetch('/api/contacts');
        const contacts = await response.json();
        contactList.innerHTML = contacts.map(contact => 
            `<li class="contact" data-id="${contact.id}">${contact.name} (${contact.id})</li>`
        ).join('');

        contactList.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                selectedContactId = li.dataset.id;
                loadMessages(selectedContactId);
            });
        });
    }

    async function loadMessages(contactId) {
        const response = await fetch(`/api/messages/${contactId}`);
        const messages = await response.json();
        messagesDiv.innerHTML = messages.map(msg => 
            `<div>${msg.timestamp}: ${msg.content} (${msg.sender_id === userId ? 'You' : 'Contact'})</div>`
        ).join('');
    }
});
