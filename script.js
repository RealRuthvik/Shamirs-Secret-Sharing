const MAX_SHARES = 50;

// --- Text Recovery: Dynamic Inputs (recover.html) ---
const numSharesInput = document.getElementById('numSharesInput');
const dynamicContainer = document.getElementById('dynamicShareInputs');
const recoverTextBtn = document.getElementById('recoverTextBtn');

if (numSharesInput && dynamicContainer && recoverTextBtn) {
    numSharesInput.addEventListener('input', (e) => {
        let count = parseInt(e.target.value) || 0;
        dynamicContainer.innerHTML = ''; 

        // SAFETY CHECK: Prevent browser crash on huge numbers
        if (count > MAX_SHARES) {
            alert(`For performance reasons, the maximum number of shares is limited to ${MAX_SHARES}.`);
            e.target.value = MAX_SHARES;
            count = MAX_SHARES;
        }

        if (count < 2) {
            dynamicContainer.innerHTML = '<p class="helper-text">Please enter at least 2 shares.</p>';
            recoverTextBtn.classList.add('hidden');
            return;
        }

        for (let i = 0; i < count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Paste Share ${i + 1} (e.g., ${i+1}-8273...)`;
            input.classList.add('dynamic-share-input'); 
            input.required = true;
            input.autocomplete = "off"; 
            dynamicContainer.appendChild(input);
        }
        recoverTextBtn.classList.remove('hidden');
    });
}

// --- Text Generation (index.html) ---
const textGenForm = document.getElementById('textGenForm');
if (textGenForm) {
    textGenForm.onsubmit = async (e) => {
        e.preventDefault();
        
        // Safety check for N input
        const nInput = textGenForm.querySelector('input[name="n"]');
        if (nInput && parseInt(nInput.value) > MAX_SHARES) {
             alert(`Maximum shares allowed is ${MAX_SHARES}`);
             return;
        }

        const formData = new FormData(e.target);
        const response = await fetch('/text/generate', { method: 'POST', body: formData });
        const json = await response.json();
        
        const resultContainer = document.getElementById('textGenResultContainer');
        const resultDiv = document.getElementById('textGenResult');
        resultContainer.classList.remove('hidden');
        
        // NEW: Render shares as individual divs for better differentiation
        resultDiv.innerHTML = '';
        json.shares.forEach(share => {
            const row = document.createElement('div');
            row.className = 'share-row';
            row.textContent = share;
            resultDiv.appendChild(row);
        });
    };
}

// --- Text Recovery Submission (recover.html) ---
const textRecForm = document.getElementById('textRecForm');
if (textRecForm) {
    textRecForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const shareInputs = document.querySelectorAll('.dynamic-share-input');
        const sharesArray = Array.from(shareInputs).map(input => input.value.trim()).filter(val => val !== '');
        
        if (sharesArray.length === 0) {
            alert("Please paste your shares into the boxes.");
            return;
        }

        const invalidShares = sharesArray.filter(s => !s.includes('-'));
        if (invalidShares.length > 0) {
            alert("Format Error: Shares must include the index prefix (e.g., '1-12345...').");
            return;
        }

        const combinedSharesStr = sharesArray.join('\n');
        
        const formData = new FormData();
        formData.append('shares', combinedSharesStr);

        const response = await fetch('/text/recover', { method: 'POST', body: formData });
        const json = await response.json();
        
        const resultContainer = document.getElementById('textRecResultContainer');
        const resultDiv = document.getElementById('textRecResult');
        resultContainer.classList.remove('hidden');
        resultDiv.innerText = json.secret; 
    };
}

// --- Image Generation (index.html) ---
const imageGenForm = document.getElementById('imageGenForm');
if (imageGenForm) {
    imageGenForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const nInput = imageGenForm.querySelector('input[name="n"]');
        if (nInput && parseInt(nInput.value) > MAX_SHARES) {
             alert(`Maximum shares allowed is ${MAX_SHARES}`);
             return;
        }

        const formData = new FormData(e.target);
        const response = await fetch('/image/generate', { method: 'POST', body: formData });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "shares.zip";
            link.click();
        } else {
            alert("Error generating shares");
        }
    };
}

// --- Image Recovery (recover.html) ---
const imageRecForm = document.getElementById('imageRecForm');
if (imageRecForm) {
    imageRecForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const response = await fetch('/image/recover', { method: 'POST', body: formData });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "recovered.png";
            link.click();
        } else {
            alert("Error recovering image. Ensure you selected enough valid share files.");
        }
    };
}