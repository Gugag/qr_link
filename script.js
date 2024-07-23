function generateWiFiQRCode() {
    const ssid = document.getElementById('ssid').value;
    const password = document.getElementById('password').value;
    const encryption = document.getElementById('encryption').value;

    const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password};;`;

    QRCode.toDataURL(wifiString, function (err, url) {
        if (err) console.error(err);

        const img = document.createElement('img');
        img.src = url;
        const qrCodeContainer = document.getElementById('wifi-qr-code');
        qrCodeContainer.innerHTML = '';
        qrCodeContainer.appendChild(img);
    });
}

function generateLinkQRCode() {
    const link = document.getElementById('link').value;

    QRCode.toDataURL(link, function (err, url) {
        if (err) console.error(err);

        const img = document.createElement('img');
        img.src = url;
        const qrCodeContainer = document.getElementById('link-qr-code');
        qrCodeContainer.innerHTML = '';
        qrCodeContainer.appendChild(img);
    });
}
