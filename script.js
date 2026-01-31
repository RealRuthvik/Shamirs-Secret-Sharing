function switchTab(mode) {
    document.getElementById('text-section').classList.add('hidden');
    document.getElementById('image-section').classList.add('hidden');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    if (mode === 'text') {
        document.getElementById('text-section').classList.remove('hidden');
        document.querySelector('.tab:nth-child(1)').classList.add('active');
    } else {
        document.getElementById('image-section').classList.remove('hidden');
        document.querySelector('.tab:nth-child(2)').classList.add('active');
    }
}

document.getElementById('textGenForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('/text/generate', { method: 'POST', body: formData });
    const json = await response.json();
    const resultDiv = document.getElementById('textGenResult');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = json.shares.join('<br>');
};

document.getElementById('textRecForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('/text/recover', { method: 'POST', body: formData });
    const json = await response.json();
    const resultDiv = document.getElementById('textRecResult');
    resultDiv.classList.remove('hidden');
    resultDiv.innerText = json.secret;
};

document.getElementById('imageGenForm').onsubmit = async (e) => {
    e.preventDefault();
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

document.getElementById('imageRecForm').onsubmit = async (e) => {
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
        alert("Error recovering image");
    }
};