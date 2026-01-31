const maximumShares = 50;

const numSharesInput = document.getElementById('numSharesInput');
const sharesValueDisplay = document.getElementById('sharesValue');
const dynamicContainer = document.getElementById('dynamicShareInputs');
const recoverTextBtn = document.getElementById('recoverTextBtn');

if (numSharesInput && dynamicContainer && recoverTextBtn) {
    const updateInputs = (val) => {
        let count = parseInt(val) || 0;
        sharesValueDisplay.textContent = count; 

        dynamicContainer.innerHTML = ''; 

        for (let i = 0; i < count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Paste Share ${i + 1} (e.g. 1-23456...)`;
            input.classList.add('dynamic-share-input'); 
            input.required = false;
            input.autocomplete = "off"; 
            dynamicContainer.appendChild(input);
        }
        recoverTextBtn.classList.remove('hidden');
    };

    numSharesInput.addEventListener('input', (e) => updateInputs(e.target.value));

    updateInputs(numSharesInput.value);
}

const textGenForm = document.getElementById('textGenForm');
if (textGenForm) {
    textGenForm.onsubmit = async (e) => {
        e.preventDefault();

        const nInput = textGenForm.querySelector('input[name="n"]');
        if (nInput && parseInt(nInput.value) > maximumShares) {
             alert(`For performance reasons, the maximum number of shares is limited to ${maximumShares}.`);
             return;
        }

        const formData = new FormData(e.target);
        const response = await fetch('/text/generate', { method: 'POST', body: formData });
        const json = await response.json();

        const resultContainer = document.getElementById('textGenResultContainer');
        const resultDiv = document.getElementById('textGenResult');
        resultContainer.classList.remove('hidden');

        resultDiv.innerHTML = '';
        json.shares.forEach(share => {
            const row = document.createElement('div');
            row.className = 'share-row';
            row.textContent = share;
            resultDiv.appendChild(row);
        });
    };
}

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

        const combinedSharesStr = sharesArray.join('\n');

        const formData = new FormData();
        formData.append('shares', combinedSharesStr);

        const response = await fetch('/text/recover', { method: 'POST', body: formData });
        const json = await response.json();

        const resultContainer = document.getElementById('textRecResultContainer');
        const resultDiv = document.getElementById('textRecResult');
        resultContainer.classList.remove('hidden');

        if (!json.secret || json.secret.trim() === "") {
            resultDiv.innerText = "incorrect or insufficient shares";
            resultDiv.style.color = "var(--accent-harsh)";
        } else {
            resultDiv.innerText = json.secret;
            resultDiv.style.color = "var(--text-primary)";
        }
    };
}

const imageGenForm = document.getElementById('imageGenForm');
if (imageGenForm) {
    imageGenForm.onsubmit = async (e) => {
        e.preventDefault();

        const nInput = imageGenForm.querySelector('input[name="n"]');
        if (nInput && parseInt(nInput.value) > maximumShares) {
             alert(`Maximum shares allowed is ${maximumShares}`);
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