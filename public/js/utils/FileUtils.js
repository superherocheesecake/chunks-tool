var link;

module.exports = {

    WriteBlobToFile: function (filename, blob) {

        if (!link) {
            link = document.createElement('a');
            document.body.appendChild(link);
            link.style = 'display: none';
        }

        var url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }

};

