function generateLinkQRCode() {
    const link = document.getElementById('link').value;

    QRCode.toDataURL(link, function (err, url) {
        if (err) console.error(err);

        const img = document.createElement('img');
        img.src = url;
        const qrCodeContainer = document.getElementById('link-qr-code');
        qrCodeContainer.innerHTML = '';
        qrCodeContainer.appendChild(img);

        const downloadButton = document.getElementById('download-button');
        downloadButton.style.display = 'block';
        downloadButton.onclick = function() {
            downloadQRCode(url);
        };
    });
}

function downloadQRCode(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr_code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
