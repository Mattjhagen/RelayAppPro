// OpenCode Mobile PWA - Main Application

class OpenCodeApp {
    constructor() {
        this.serverUrl = localStorage.getItem('serverUrl') || 'https://opencode.relayapp.pro';
        this.model = localStorage.getItem('model') || '';
        this.messages = this.loadMessages();
        this.theme = localStorage.getItem('theme') || 'auto';

        this.initializeElements();
        this.attachEventListeners();
        this.applyTheme();
        this.renderMessages();
        this.checkInstallPrompt();
    }

    initializeElements() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.themeBtn = document.getElementById('themeBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.serverUrlInput = document.getElementById('serverUrl');
        this.modelSelect = document.getElementById('modelSelect');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.installPrompt = document.getElementById('installPrompt');
        this.installBtn = document.getElementById('installBtn');
        this.dismissInstallBtn = document.getElementById('dismissInstallBtn');
    }

    attachEventListeners() {
        // Input
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Header buttons
        this.clearBtn.addEventListener('click', () => this.clearConversation());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.themeBtn.addEventListener('click', () => this.toggleTheme());

        // Settings modal
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // Click outside modal to close
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Install prompt
        this.installBtn.addEventListener('click', () => this.installApp());
        this.dismissInstallBtn.addEventListener('click', () => this.dismissInstall());
    }

    handleInputChange() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText;

        // Auto-resize textarea
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!this.sendBtn.disabled) {
                this.sendMessage();
            }
        }
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        // Add user message
        this.addMessage('user', text);
        this.messageInput.value = '';
        this.handleInputChange();

        // Show loading
        this.loadingIndicator.classList.add('active');

        try {
            const response = await fetch(`${this.serverUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    history: this.messages.slice(-10),
                    model: this.model || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.addMessage('assistant', data.response || 'No response received.');

        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('assistant', `❌ Error: ${error.message}\n\nPlease check:\n- Your server is running\n- Server URL is correct in settings\n- Network connection is stable`);
        } finally {
            this.loadingIndicator.classList.remove('active');
        }
    }

    addMessage(role, content) {
        const message = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date().toISOString(),
        };

        this.messages.push(message);
        this.saveMessages();
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';

        // Render markdown
        const htmlContent = marked.parse(message.content);
        bubbleDiv.innerHTML = htmlContent;

        // Add copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-button';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.onclick = () => this.copyMessage(message.content, copyBtn);
        bubbleDiv.appendChild(copyBtn);

        messageDiv.appendChild(bubbleDiv);
        this.messagesContainer.appendChild(messageDiv);
    }

    renderMessages() {
        this.messagesContainer.innerHTML = '';
        this.messages.forEach(msg => this.renderMessage(msg));
        this.scrollToBottom();
    }

    async copyMessage(text, button) {
        try {
            await navigator.clipboard.writeText(text);
            const originalText = button.innerHTML;
            button.innerHTML = '✅ Copied!';
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    clearConversation() {
        if (confirm('Clear conversation history?')) {
            this.messages = [{
                id: '0',
                role: 'assistant',
                content: '👋 Conversation cleared. What would you like to work on?',
                timestamp: new Date().toISOString(),
            }];
            this.saveMessages();
            this.renderMessages();
        }
    }

    openSettings() {
        this.serverUrlInput.value = this.serverUrl;
        this.modelSelect.value = this.model;
        this.settingsModal.classList.add('active');
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
    }

    saveSettings() {
        this.serverUrl = this.serverUrlInput.value.trim();
        this.model = this.modelSelect.value;

        localStorage.setItem('serverUrl', this.serverUrl);
        localStorage.setItem('model', this.model);

        this.closeSettings();

        // Show confirmation
        alert('Settings saved successfully!');
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    }

    applyTheme(theme = null) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const effectiveTheme = theme || this.theme;

        if (effectiveTheme === 'auto') {
            document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.body.setAttribute('data-theme', effectiveTheme);
        }
    }

    saveMessages() {
        try {
            localStorage.setItem('messages', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Failed to save messages:', error);
        }
    }

    loadMessages() {
        try {
            const stored = localStorage.getItem('messages');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }

        return [{
            id: '0',
            role: 'assistant',
            content: '👋 Welcome to OpenCode Mobile! I\'m ready to help you with coding, debugging, and any technical questions you have. What would you like to work on today?',
            timestamp: new Date().toISOString(),
        }];
    }

    // PWA Installation
    checkInstallPrompt() {
        let deferredPrompt = null;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show custom install prompt if not already dismissed
            const dismissed = localStorage.getItem('installPromptDismissed');
            if (!dismissed) {
                this.installPrompt.classList.add('active');
            }
        });

        this.installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('Install prompt outcome:', outcome);
                deferredPrompt = null;
                this.installPrompt.classList.remove('active');
            }
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.installPrompt.classList.remove('active');
        });
    }

    dismissInstall() {
        this.installPrompt.classList.remove('active');
        localStorage.setItem('installPromptDismissed', 'true');
    }

    async installApp() {
        // Handled by checkInstallPrompt
    }
}

// Marked.js configuration
marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function(code, lang) {
        return code;
    }
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new OpenCodeApp();
    });
} else {
    window.app = new OpenCodeApp();
}
