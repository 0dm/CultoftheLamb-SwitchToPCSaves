class SaveConverter {
    constructor() {
        this.files = new Map();
        this.pendingFiles = null; // Temporary storage for files pending confirmation
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.fileList = document.getElementById('fileList');
        this.selectedFiles = document.getElementById('selectedFiles');
        this.convertBtn = document.getElementById('convertBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.results = document.getElementById('results');
        this.resultsList = document.getElementById('resultsList');
        
        // Modal Elements
        this.modal = document.getElementById('warningModal');
        this.modalCancel = document.getElementById('modalCancelBtn');
        this.modalProceed = document.getElementById('modalProceedBtn');
    }

    initEventListeners() {
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('dragleave', () => this.handleDragLeave());
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.convertBtn.addEventListener('click', () => this.convertFiles());
        this.clearBtn.addEventListener('click', () => this.clearFiles());

        // Modal Listeners
        this.modalCancel.addEventListener('click', () => this.hideModal(false));
        this.modalProceed.addEventListener('click', () => this.hideModal(true));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.add('drag-over');
    }

    handleDragLeave() {
        this.dropZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.classList.remove('drag-over');
        this.checkAndAddFiles(e.dataTransfer.files);
    }

    handleFileSelect(e) {
        this.checkAndAddFiles(e.target.files);
    }

    // New check to intercept MP files before they are added
    checkAndAddFiles(fileList) {
        let hasMpFile = false;
        
        for (const file of fileList) {
            if (file.name.endsWith('MP') || file.name.endsWith('.mp')) {
                hasMpFile = true;
                break;
            }
        }

        if (hasMpFile) {
            this.pendingFiles = fileList;
            this.showModal();
        } else {
            this.addFiles(fileList);
        }
    }

    showModal() {
        this.modal.classList.remove('hidden');
    }

    hideModal(proceed) {
        this.modal.classList.add('hidden');
        if (proceed && this.pendingFiles) {
            this.addFiles(this.pendingFiles);
        } else {
            // Clear input so selecting the same file again works if they cancelled
            this.fileInput.value = ''; 
        }
        this.pendingFiles = null;
    }

    addFiles(fileList) {
        for (const file of fileList) {
            this.files.set(file.name, file);
        }
        this.updateFileList();
    }

    removeFile(fileName) {
        this.files.delete(fileName);
        this.updateFileList();
    }

    updateFileList() {
        this.selectedFiles.innerHTML = '';
        
        if (this.files.size === 0) {
            this.fileList.classList.remove('active');
            this.convertBtn.disabled = true;
            this.clearBtn.disabled = true;
            return;
        }

        this.fileList.classList.add('active');
        this.convertBtn.disabled = false;
        this.clearBtn.disabled = false;

        this.files.forEach((file, name) => {
            const isRisky = name.endsWith('MP') || name.endsWith('.mp');
            const li = document.createElement('li');
            
            // Visual indicator for risky files in the list
            if (isRisky) li.style.borderLeft = "3px solid var(--error-color)";

            li.innerHTML = `
                <div class="file-info">
                    <span class="file-icon">${isRisky ? '⚠️' : '📄'}</span>
                    <div>
                        <div class="file-name" style="${isRisky ? 'color: var(--error-color)' : ''}">${this.escapeHtml(name)}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="file-remove" title="Remove file">×</button>
            `;
            
            li.querySelector('.file-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(name);
            });
            
            this.selectedFiles.appendChild(li);
        });
    }

    clearFiles() {
        this.files.clear();
        this.fileInput.value = '';
        this.updateFileList();
        this.results.classList.remove('active');
        this.progressContainer.classList.remove('active');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async convertFiles() {
        if (this.files.size === 0) return;

        this.results.classList.remove('active');
        this.progressContainer.classList.add('active');
        this.progressFill.style.width = '0%';
        this.resultsList.innerHTML = '';
        this.convertBtn.disabled = true;

        const results = [];
        const fileArray = Array.from(this.files.values());
        let processed = 0;

        for (const file of fileArray) {
            this.progressText.textContent = `Processing ${file.name}...`;
            
            try {
                const result = await this.convertFile(file);
                results.push({ name: file.name, success: true, data: result });
            } catch (error) {
                results.push({ name: file.name, success: false, error: error.message });
            }

            processed++;
            this.progressFill.style.width = `${(processed / fileArray.length) * 100}%`;
        }

        this.progressText.textContent = 'Downloading converted files...';

        for (const result of results) {
            if (result.success) {
                const outputFilename = this.getOutputFilename(result.name, result.data.format);
                this.downloadFile(result.data.data, outputFilename, result.data.isMessagePack);
                await this.sleep(100);
            }
        }

        this.showResults(results);
        this.progressContainer.classList.remove('active');
        this.convertBtn.disabled = false;
    }

    getOutputFilename(inputName, format) {
        if (format === 'mp') {
            let baseName = inputName;
            if (baseName.endsWith('MP')) {
                baseName = baseName.slice(0, -2);
            }
            return `${baseName}.mp`;
        }
        return `${inputName}.json`;
    }

    async convertFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const uint8Array = new Uint8Array(e.target.result);

                    if (uint8Array.length < 2) {
                        throw new Error('File too small - invalid save file');
                    }

                    const header = String.fromCharCode(uint8Array[0], uint8Array[1]);
                    
                    let format;
                    if (header === 'ZB') {
                        format = 'json';
                    } else if (header === 'MP') {
                        format = 'mp';
                    } else if (file.name.endsWith('MP')) {
                        format = 'mp';
                    } else {
                        format = 'json';
                    }

                    const dataWithoutHeader = (header === 'ZB' || header === 'MP')
                        ? uint8Array.slice(2) 
                        : uint8Array;

                    let outputData;
                    if (format === 'mp') {
                        // Attempt decompression even for unsupported MP files
                        // because they are still Zlib compressed on Switch
                        try {
                            outputData = pako.inflate(dataWithoutHeader);
                        } catch (e) {
                            // Fallback if decompression fails
                            outputData = dataWithoutHeader; 
                        }
                    } else {
                        try {
                            outputData = pako.inflate(dataWithoutHeader);
                        } catch (inflateError) {
                            throw new Error(`Failed to decompress: ${inflateError.message}.`);
                        }
                    }

                    resolve({
                        data: outputData,
                        format: format,
                        isMessagePack: format === 'mp'
                    });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    downloadFile(content, filename, isBinary = false) {
        let blob;
        if (isBinary) {
            blob = new Blob([content], { type: 'application/octet-stream' });
        } else {
            const decoder = new TextDecoder('utf-8');
            blob = new Blob([decoder.decode(content)], { type: 'application/json' });
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showResults(results) {
        this.resultsList.innerHTML = '';
        
        for (const result of results) {
            const li = document.createElement('li');
            li.className = result.success ? 'success' : 'error';
            
            if (result.success) {
                const outputFilename = this.getOutputFilename(result.name, result.data.format);
                const formatLabel = result.data.isMessagePack ? '(MP - UNSUPPORTED)' : '(JSON)';
                li.textContent = `${result.name} → ${outputFilename} ${formatLabel}`;
                // Highlight MP conversions in red even if "successful"
                if(result.data.isMessagePack) li.style.color = "var(--error-color)";
            } else {
                li.textContent = `${result.name}: ${result.error}`;
            }
            
            this.resultsList.appendChild(li);
        }

        this.results.classList.add('active');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => new SaveConverter());