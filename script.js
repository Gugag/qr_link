     let qrCodeDataUrl;

        function generateLinkQRCode() {
            const link = document.getElementById('link').value;

            QRCode.toDataURL(link, function (err, url) {
                if (err) console.error(err);

                const img = document.createElement('img');
                img.src = url;
                const qrCodeContainer = document.getElementById('link-qr-code');
                qrCodeContainer.innerHTML = '';
                qrCodeContainer.appendChild(img);

                qrCodeDataUrl = url;

                const downloadButtons = document.getElementById('download-buttons');
                downloadButtons.style.display = 'flex';
            });
        }

        function downloadAsPDF() {
            // Ensure correct jsPDF reference
            const jsPDF = window.jspdf.jsPDF;
            const pdf = new jsPDF();
            pdf.addImage(qrCodeDataUrl, 'PNG', 15, 40, 180, 180);
            pdf.save('qr_code.pdf');
        }

        function downloadAsJPEG() {
            const link = document.createElement('a');
            link.href = qrCodeDataUrl;
            link.download = 'qr_code.jpeg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
