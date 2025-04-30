document.addEventListener('DOMContentLoaded', function() {
    const tabsContainer = document.getElementById('tabs-container');
    const newTabBtn = document.getElementById('new-tab-btn');
    const tabContents = document.getElementById('tab-contents');
    const linesContainer = document.getElementById('lines');
    
    // Create lines for the legal pad
    function createLines() {
        linesContainer.innerHTML = '';
        const legalPadHeight = document.getElementById('legal-pad').clientHeight;
        const lineCount = Math.floor(legalPadHeight / 24);
        
        for (let i = 0; i < lineCount; i++) {
            const line = document.createElement('div');
            line.className = 'line';
            linesContainer.appendChild(line);
        }
    }
    
    // Create lines initially and on window resize
    createLines();
    window.addEventListener('resize', createLines);
    
    // Load saved contexts from localStorage or create default
    let contexts = JSON.parse(localStorage.getItem('legalPadContexts')) || [];
    
    if (contexts.length === 0) {
        // Add default contexts if none exist
        contexts = [
            { id: 'personal', title: 'Personal', content: '' },
            { id: 'work', title: 'Work', content: '' },
            { id: 'ideas', title: 'Ideas', content: '' }
        ];
        saveContexts();
    }
    
    // Initialize tabs and content
    function initializeContexts() {
        tabsContainer.innerHTML = '';
        tabContents.innerHTML = '';
        
        // Add the new tab button first
        tabsContainer.appendChild(newTabBtn);
        
        contexts.forEach((context, index) => {
            createTab(context, index === 0);
        });
    }
    
    // Create a new tab and its content
    function createTab(context, isActive = false) {
        // Create tab
        const tab = document.createElement('div');
        tab.className = `tab ${isActive ? 'active' : ''}`;
        tab.setAttribute('data-id', context.id);
        tab.innerHTML = `${context.title} <span class="tab-close" data-id="${context.id}">×</span>`;
        
        // Insert tab before the new tab button
        tabsContainer.insertBefore(tab, newTabBtn);
        
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = `tab-content ${isActive ? 'active' : ''}`;
        tabContent.setAttribute('data-id', context.id);
        
        const contextTitle = document.createElement('div');
        contextTitle.className = 'context-title';
        contextTitle.textContent = context.title;
        
        const textarea = document.createElement('textarea');
        textarea.className = 'note-content';
        textarea.setAttribute('data-id', context.id);
        textarea.value = context.content;
        textarea.placeholder = 'Start typing your notes here...';
        
        tabContent.appendChild(contextTitle);
        tabContent.appendChild(textarea);
        tabContents.appendChild(tabContent);
        
        // Add event listener to save content on input
        textarea.addEventListener('input', function() {
            const contextId = this.getAttribute('data-id');
            const contextIndex = contexts.findIndex(c => c.id === contextId);
            
            if (contextIndex !== -1) {
                contexts[contextIndex].content = this.value;
                saveContexts();
            }
        });
        
        // Add event listener to tab for switching
        tab.addEventListener('click', function(e) {
            if (!e.target.classList.contains('tab-close')) {
                switchTab(context.id);
            }
        });
    }
    
    // Switch between tabs
    function switchTab(contextId) {
        // Deactivate all tabs and contents
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Activate selected tab and content
        document.querySelector(`.tab[data-id="${contextId}"]`).classList.add('active');
        document.querySelector(`.tab-content[data-id="${contextId}"]`).classList.add('active');
        
        // Focus on the textarea
        document.querySelector(`.note-content[data-id="${contextId}"]`).focus();
    }
    
    // Save contexts to localStorage
    function saveContexts() {
        localStorage.setItem('legalPadContexts', JSON.stringify(contexts));
    }
    
    // Create a new context/tab
    newTabBtn.addEventListener('click', function() {
        const title = prompt('Enter a name for the new context:');
        
        if (title && title.trim() !== '') {
            const id = 'context-' + Date.now();
            const newContext = { id, title, content: '' };
            
            contexts.push(newContext);
            saveContexts();
            
            // Deactivate all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            createTab(newContext, true);
        }
    });
    
    // Handle tab close button clicks
    tabsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('tab-close')) {
            const contextId = e.target.getAttribute('data-id');
            const contextIndex = contexts.findIndex(c => c.id === contextId);
            
            if (contextIndex !== -1 && contexts.length > 1) {
                if (confirm('Are you sure you want to delete this context? All notes will be lost.')) {
                    // Remove the context
                    contexts.splice(contextIndex, 1);
                    saveContexts();
                    
                    // Remove the tab and content
                    const tab = document.querySelector(`.tab[data-id="${contextId}"]`);
                    const content = document.querySelector(`.tab-content[data-id="${contextId}"]`);
                    
                    tab.remove();
                    content.remove();
                    
                    // If the active tab was removed, switch to the first tab
                    if (tab.classList.contains('active')) {
                        const firstTabId = document.querySelector('.tab').getAttribute('data-id');
                        switchTab(firstTabId);
                    }
                }
            } else if (contexts.length === 1) {
                alert('You cannot delete the last context.');
            }
            
            e.stopPropagation();
        }
    });
    
    // Initialize the app
    initializeContexts();
    
    // Focus on the active textarea
    const activeTextarea = document.querySelector('.tab-content.active .note-content');
    if (activeTextarea) {
        activeTextarea.focus();
    }
});