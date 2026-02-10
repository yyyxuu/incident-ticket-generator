// Incident Ticket Generator - Main Application

(function () {
    'use strict';

    // Form data object
    let formData = {
        accidentTypes: [],
        otherType: '',
        occurTime: '',
        discoverTime: '',
        location: '',
        impact: '',
        description: '',
        processRows: [],
        directCause: '',
        rootCause: '',
        shortTermSolution: '',
        longTermPrevention: '',
        attachments: [],
        otherAttachment: '',
        uploadedImages: []  // Store uploaded images as base64
    };

    // DOM elements
    const form = document.getElementById('incidentForm');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const addRowBtn = document.getElementById('addRowBtn');
    const processTableBody = document.getElementById('processTableBody');

    // Initialize application
    function init() {
        loadFromLocalStorage();
        setupEventListeners();
        updateConditionalFields();

        // Ensure uploadedImages array exists
        if (!formData.uploadedImages) {
            formData.uploadedImages = [];
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Form input changes - auto-save
        form.addEventListener('input', debounce(handleFormInput, 500));

        // Generate PDF button
        generateBtn.addEventListener('click', generatePDF);

        // Clear form button
        clearBtn.addEventListener('click', clearForm);

        // Add row button
        addRowBtn.addEventListener('click', addTableRow);

        // Checkbox conditional fields
        document.querySelectorAll('[data-conditional]').forEach(checkbox => {
            checkbox.addEventListener('change', handleConditionalCheckbox);
        });

        // Table delete buttons (event delegation)
        processTableBody.addEventListener('click', handleTableDelete);

        // Image file input
        const imageFileInput = document.getElementById('imageFileInput');
        if (imageFileInput) {
            imageFileInput.addEventListener('change', handleImageUpload);
        }

        // Preview modal controls
        const modal = document.getElementById('pdfPreviewModal');
        const closeModalBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelPreview');
        const confirmBtn = document.getElementById('confirmDownload');

        // Close modal
        closeModalBtn.addEventListener('click', hidePreviewModal);
        cancelBtn.addEventListener('click', hidePreviewModal);

        // Confirm download
        confirmBtn.addEventListener('click', downloadPDF);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hidePreviewModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                hidePreviewModal();
            }
        });
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Handle form input - collect data and save
    function handleFormInput() {
        collectFormData();
        saveToLocalStorage();
    }

    // Collect form data into formData object
    function collectFormData() {
        // Accident types
        const typeCheckboxes = document.querySelectorAll('input[name="accidentType"]:checked');
        formData.accidentTypes = Array.from(typeCheckboxes).map(cb => cb.value);

        // Other type
        const otherTypeCheckbox = document.getElementById('type5');
        formData.otherType = otherTypeCheckbox.checked ? document.getElementById('otherType').value : '';

        // Date/time fields
        formData.occurTime = document.getElementById('occurTime').value || '';
        formData.discoverTime = document.getElementById('discoverTime').value || '';

        // Text fields
        formData.location = document.getElementById('location').value || '';
        formData.impact = document.getElementById('impact').value || '';
        formData.description = document.getElementById('description').value || '';

        // Process table rows
        formData.processRows = [];
        const rows = processTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const time = row.querySelector('input[name="processTime[]"]').value;
            const action = row.querySelector('input[name="processAction[]"]').value;
            const status = row.querySelector('input[name="processStatus[]"]').value;

            if (time || action || status) {
                formData.processRows.push({ time, action, status });
            }
        });

        // Root cause
        formData.directCause = document.getElementById('directCause').value || '';
        formData.rootCause = document.getElementById('rootCause').value || '';

        // Solutions
        formData.shortTermSolution = document.getElementById('shortTermSolution').value || '';
        formData.longTermPrevention = document.getElementById('longTermPrevention').value || '';

        // Attachments
        const attachCheckboxes = document.querySelectorAll('input[name="attachments"]:checked');
        formData.attachments = Array.from(attachCheckboxes).map(cb => cb.value);

        // Other attachment
        const otherAttachCheckbox = document.getElementById('attach2');
        formData.otherAttachment = otherAttachCheckbox.checked ? document.getElementById('otherAttachment').value : '';
    }

    // Save to localStorage
    function saveToLocalStorage() {
        try {
            const dataStr = JSON.stringify(formData);
            // Check if data is too large (localStorage has ~5MB limit)
            if (dataStr.length > 4.5 * 1024 * 1024) {  // 4.5MB threshold
                showToast('警告：图片过多，可能无法保存到本地存储', 'error');
                // Save without images
                const formDataWithoutImages = {...formData, uploadedImages: []};
                localStorage.setItem('incidentTicketData', JSON.stringify(formDataWithoutImages));
            } else {
                localStorage.setItem('incidentTicketData', dataStr);
            }
        } catch (e) {
            console.error('localStorage save error:', e);
            showToast('保存失败：数据过大，请减少图片数量', 'error');
        }
    }

    // Load from localStorage
    function loadFromLocalStorage() {
        const saved = localStorage.getItem('incidentTicketData');
        if (saved) {
            try {
                formData = JSON.parse(saved);
                populateForm(formData);
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }

    // Populate form with data
    function populateForm(data) {
        // Accident types
        document.querySelectorAll('input[name="accidentType"]').forEach(cb => {
            cb.checked = data.accidentTypes.includes(cb.value);
        });

        // Other type
        if (data.otherType) {
            document.getElementById('otherType').value = data.otherType;
        }

        // Date/time fields
        if (data.occurTime) document.getElementById('occurTime').value = data.occurTime;
        if (data.discoverTime) document.getElementById('discoverTime').value = data.discoverTime;

        // Text fields
        if (data.location) document.getElementById('location').value = data.location;
        if (data.impact) document.getElementById('impact').value = data.impact;
        if (data.description) document.getElementById('description').value = data.description;

        // Process table
        if (data.processRows && data.processRows.length > 0) {
            // Clear existing rows
            processTableBody.innerHTML = '';

            // Add rows with data
            data.processRows.forEach((rowData, i) => {
                const row = document.createElement('tr');
                // Only show delete button if this is not the first row (index > 0)
                const deleteCell = i >= 1 ? `<td style="text-align: center;"><button type="button" class="btn-delete delete-row">删除</button></td>` : '<td></td>';

                // XSS SAFETY: user data only goes into input value attributes, not innerHTML text content.
                // HTML attribute values are treated as plain text by browser parsers and cannot execute JavaScript.
                // The data originates from input.value (browser auto-escaped) → localStorage → input value attribute.
                // No XSS risk despite using innerHTML here.
                row.innerHTML = `
                    <td><input type="datetime-local" name="processTime[]" value="${rowData.time}"></td>
                    <td><input type="text" name="processAction[]" placeholder="操作内容" value="${rowData.action}"></td>
                    <td><input type="text" name="processStatus[]" placeholder="状态" value="${rowData.status}"></td>
                    ${deleteCell}
                `;
                processTableBody.appendChild(row);
            });
        }

        // Root cause
        if (data.directCause) document.getElementById('directCause').value = data.directCause;
        if (data.rootCause) document.getElementById('rootCause').value = data.rootCause;

        // Solutions
        if (data.shortTermSolution) document.getElementById('shortTermSolution').value = data.shortTermSolution;
        if (data.longTermPrevention) document.getElementById('longTermPrevention').value = data.longTermPrevention;

        // Attachments
        document.querySelectorAll('input[name="attachments"]').forEach(cb => {
            cb.checked = data.attachments.includes(cb.value);
        });

        // Other attachment
        if (data.otherAttachment) {
            document.getElementById('otherAttachment').value = data.otherAttachment;
        }

        // Uploaded images
        if (data.uploadedImages && data.uploadedImages.length > 0) {
            formData.uploadedImages = data.uploadedImages;
            updateImagePreview();
        }

        // Update conditional fields
        updateConditionalFields();
    }

    // Clear form
    function clearForm() {
        if (confirm('确定要清空表单吗？所有未保存的数据将丢失。')) {
            form.reset();
            formData = getEmptyFormData();
            localStorage.removeItem('incidentTicketData');

            // Clear image preview
            const grid = document.getElementById('imagePreviewGrid');
            if (grid) {
                grid.innerHTML = '';
            }

            showToast('表单已清空', 'success');
        }
    }

    // Get empty form data object
    function getEmptyFormData() {
        return {
            accidentTypes: [],
            otherType: '',
            occurTime: '',
            discoverTime: '',
            location: '',
            impact: '',
            description: '',
            processRows: [],
            directCause: '',
            rootCause: '',
            shortTermSolution: '',
            longTermPrevention: '',
            attachments: [],
            otherAttachment: '',
            uploadedImages: []
        };
    }

    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Store generated PDF data for download
    let generatedPDF = null;
    let previewPages = [];

    // Generate PDF preview
    function generatePDF() {
        try {
            // Collect latest form data
            collectFormData();

            // Validate required fields
            if (!validateForm()) {
                showToast('请填写必填字段', 'error');
                return;
            }

            showToast('正在生成预览，请稍候...', 'success');

            // Create HTML content for PDF (main content and images page)
            const hasImages = formData.uploadedImages && formData.uploadedImages.length > 0;
            const pdfContent = createPDFContent(false);  // Main content without images

            // Hide element off-screen while rendering
            pdfContent.style.cssText = 'position: absolute; left: -9999px; top: 0; z-index: -1; width: 210mm; padding: 12px; font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif; font-size: 12px; color: #333; background: white;';

            document.body.appendChild(pdfContent);

            // Reset preview pages
            previewPages = [];

            // Generate main content
            html2canvas(pdfContent, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: false,
                logging: false,
                allowTaint: true
            }).then(canvas => {
                // Get PDF instance
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const margin = 8;
                const imgWidth = pdfWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Add first page (main content)
                const imgData = canvas.toDataURL('image/jpeg', 1);
                pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'SLOW');

                // Store page preview
                previewPages.push({
                    imageData: imgData,
                    pageNumber: 1,
                    title: '事故工单'
                });

                // Remove main content element
                document.body.removeChild(pdfContent);

                // If there are images, create multiple pages
                if (hasImages) {
                    // Split images into pages (2 images per page for better layout)
                    const imagesPerPage = 2;
                    const totalPages = Math.ceil(formData.uploadedImages.length / imagesPerPage);

                    // Create image pages one by one
                    let currentPage = 0;

                    const processImagePage = () => {
                        if (currentPage >= totalPages) {
                            // All pages processed, show preview
                            generatedPDF = pdf;
                            showPreviewModal();
                            showToast('预览生成成功！', 'success');
                            return;
                        }

                        // Get images for current page
                        const startIndex = currentPage * imagesPerPage;
                        const endIndex = Math.min(startIndex + imagesPerPage, formData.uploadedImages.length);
                        const pageImages = formData.uploadedImages.slice(startIndex, endIndex);

                        // Create image page content
                        const imagesContent = createImagePageContent(pageImages, currentPage + 1, totalPages);
                        imagesContent.style.cssText = 'position: absolute; left: -9999px; top: 0; z-index: -1; width: 210mm; padding: 12px; font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif; font-size: 12px; color: #333; background: white;';
                        document.body.appendChild(imagesContent);

                        // Generate canvas for this page
                        html2canvas(imagesContent, {
                            scale: 2,
                            backgroundColor: '#ffffff',
                            useCORS: false,
                            logging: false,
                            allowTaint: true
                        }).then(imagesCanvas => {
                            // Add new page for images
                            pdf.addPage();

                            const imagesImgHeight = (imagesCanvas.height * imgWidth) / imagesCanvas.width;
                            const imagesImgData = imagesCanvas.toDataURL('image/jpeg', 1);

                            // Add images to new page
                            pdf.addImage(imagesImgData, 'JPEG', margin, margin, imgWidth, imagesImgHeight, undefined, 'SLOW');

                            // Store page preview
                            previewPages.push({
                                imageData: imagesImgData,
                                pageNumber: currentPage + 2,
                                title: `图片附件 (${startIndex + 1}-${Math.min(endIndex, formData.uploadedImages.length)})`
                            });

                            // Remove images content element
                            document.body.removeChild(imagesContent);

                            // Process next page
                            currentPage++;
                            processImagePage();
                        }).catch(err => {
                            console.error('Image page generation error:', err);
                            document.body.removeChild(imagesContent);
                            showToast('图片页生成失败: ' + err.message, 'error');
                        });
                    };

                    // Start processing image pages
                    processImagePage();
                } else {
                    // No images, show preview directly
                    generatedPDF = pdf;
                    showPreviewModal();
                    showToast('预览生成成功！', 'success');
                }
            }).catch(err => {
                console.error('PDF generation error:', err);
                showToast('PDF生成失败: ' + err.message, 'error');

                // Clean up temporary elements on error
                if (document.body.contains(pdfContent)) {
                    document.body.removeChild(pdfContent);
                }
            });

        } catch (error) {
            console.error('PDF generation error:', error);
            showToast('PDF生成失败: ' + error.message, 'error');
        }
    }

    // Create image page content for a specific page
    function createImagePageContent(images, pageNumber, totalPages) {
        const container = document.createElement('div');
        container.style.cssText = 'position: absolute; left: -9999px; top: 0; z-index: -1; padding: 12px; font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif; font-size: 12px; color: #333; width: 210mm; background: white;';

        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // Calculate max height for each image based on page count
        // With 2 images per page, each can use up to 450px height max
        const maxImageHeight = images.length === 1 ? '700px' : '420px';

        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 12px;">
                <h1 style="font-size: 22px; margin-bottom: 8px; color: #333;">事故工单 - 图片附件</h1>
                <p style="font-size: 10px; color: #666;">生成时间: ${new Date().toLocaleString('zh-CN')} | 第${pageNumber}页/共${totalPages}页</p>
            </div>

            <div style="margin-bottom: 12px;">
                <h2 style="font-size: 15px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #667eea; color: #667eea;">五、附件 - 现场照片/截图</h2>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${images.map(img => `
                        <div style="text-align: center;">
                            <img src="${img.data}" alt="${escapeHtml(img.name)}" style="max-width: 100%; max-height: ${maxImageHeight}; height: auto; border: 1px solid #ddd; border-radius: 4px; object-fit: contain;">
                            <p style="font-size: 11px; color: #666; margin-top: 6px;">${escapeHtml(img.name)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        return container;
    }

    // Create HTML content for PDF (main content without images)
    function createPDFContent() {
        const container = document.createElement('div');
        // Hide element off-screen
        container.style.cssText = 'position: absolute; left: -9999px; top: 0; z-index: -1; padding: 12px; font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif; font-size: 12px; color: #333; width: 210mm; background: white;';

        // HTML escape function
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // Escape HTML and convert newlines to <br> tags
        const escapeHtmlWithBreaks = (text) => {
            if (!text) return '';
            const escaped = escapeHtml(text);
            return escaped.replace(/\n/g, '<br>');
        };

        const types = escapeHtml(formData.accidentTypes.join('、')) + (formData.otherType ? ` (${escapeHtml(formData.otherType)})` : '');
        const attachments = escapeHtml(formData.attachments.join('、')) + (formData.otherAttachment ? ` (${escapeHtml(formData.otherAttachment)})` : '');

        // Build process table rows
        const processRowsHTML = formData.processRows
            .filter(row => row.time || row.action || row.status)
            .map(row => `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 6px;">${escapeHtml(formatDate(row.time))}</td>
                    <td style="border: 1px solid #ddd; padding: 6px;">${escapeHtml(row.action || '')}</td>
                    <td style="border: 1px solid #ddd; padding: 6px;">${escapeHtml(row.status || '')}</td>
                </tr>
            `).join('');

        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <h1 style="font-size: 22px; margin-bottom: 8px; color: #333;">事故工单</h1>
                <p style="font-size: 10px; color: #666;">生成时间: ${new Date().toLocaleString('zh-CN')}</p>
            </div>

            <div style="margin-bottom: 15px;">
                <h2 style="font-size: 15px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #667eea; color: #667eea;">一、事故详情</h2>
                <p style="margin: 6px 0;"><strong>事故类型:</strong> ${types || '未填写'}</p>
                <p style="margin: 6px 0;"><strong>发生时间:</strong> ${escapeHtml(formatDate(formData.occurTime)) || '未填写'}</p>
                <p style="margin: 6px 0;"><strong>发现时间:</strong> ${escapeHtml(formatDate(formData.discoverTime)) || '未填写'}</p>
                <p style="margin: 6px 0;"><strong>发生地点/系统:</strong> ${escapeHtml(formData.location) || '未填写'}</p>
                <p style="margin: 6px 0;"><strong>影响范围:</strong> ${escapeHtml(formData.impact) || '未填写'}</p>
                <div style="margin: 6px 0;">
                    <p style="margin-bottom: 4px;"><strong>事故描述:</strong></p>
                    <div style="padding: 8px; background: #f9f9f9; border-radius: 4px; min-height: 50px;">${escapeHtmlWithBreaks(formData.description) || '未填写'}</div>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <h2 style="font-size: 15px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #667eea; color: #667eea;">二、处理过程</h2>
                ${processRowsHTML ? `
                    <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                        <thead>
                            <tr style="background: #e8e8e8; color: #333;">
                                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: 600;">时间</th>
                                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: 600;">操作内容</th>
                                <th style="border: 1px solid #ddd; padding: 6px; text-align: left; font-weight: 600;">状态更新</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${processRowsHTML}
                        </tbody>
                    </table>
                ` : '<p style="color: #999;">无处理记录</p>'}
            </div>

            <div style="margin-bottom: 15px;">
                <h2 style="font-size: 15px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #667eea; color: #667eea;">三、根本原因分析</h2>
                <div style="margin: 6px 0;">
                    <p style="margin-bottom: 4px;"><strong>直接原因:</strong></p>
                    <div style="padding: 8px; background: #f9f9f9; border-radius: 4px; min-height: 50px;">${escapeHtmlWithBreaks(formData.directCause) || '未填写'}</div>
                </div>
                <div style="margin: 6px 0;">
                    <p style="margin-bottom: 4px;"><strong>根本原因:</strong></p>
                    <div style="padding: 8px; background: #f9f9f9; border-radius: 4px; min-height: 50px;">${escapeHtmlWithBreaks(formData.rootCause) || '未填写'}</div>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <h2 style="font-size: 15px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #667eea; color: #667eea;">四、解决方案与预防措施</h2>
                <div style="margin: 6px 0;">
                    <p style="margin-bottom: 4px;"><strong>短期解决:</strong></p>
                    <div style="padding: 8px; background: #f9f9f9; border-radius: 4px; min-height: 50px;">${escapeHtmlWithBreaks(formData.shortTermSolution) || '未填写'}</div>
                </div>
                <div style="margin: 6px 0;">
                    <p style="margin-bottom: 4px;"><strong>长期预防:</strong></p>
                    <div style="padding: 8px; background: #f9f9f9; border-radius: 4px; min-height: 50px;">${escapeHtmlWithBreaks(formData.longTermPrevention) || '未填写'}</div>
                </div>
            </div>

            <div>
                <h2 style="font-size: 15px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #667eea; color: #667eea;">五、附件</h2>
                <p style="margin: 6px 0;"><strong>附件清单:</strong> ${attachments || '无'}</p>
                ${formData.uploadedImages && formData.uploadedImages.length > 0 ? `
                    <p style="margin-top: 10px; color: #667eea; font-weight: 600;">图片附件共${formData.uploadedImages.length}张，见后续页面</p>
                ` : ''}
            </div>
        `;

        return container;
    }

    // Validate form
    function validateForm() {
        // Require at least some data
        return formData.description.length > 0 ||
            formData.accidentTypes.length > 0 ||
            formData.location.length > 0;
    }

    // Add table row
    function addTableRow() {
        const row = document.createElement('tr');
        const rowCount = processTableBody.querySelectorAll('tr').length;
        // Only show delete button if this is not the first row
        const deleteCell = rowCount >= 1 ? `<td style="text-align: center;"><button type="button" class="btn-delete delete-row">删除</button></td>` : '<td></td>';
        row.innerHTML = `
            <td><input type="datetime-local" name="processTime[]"></td>
            <td><input type="text" name="processAction[]" placeholder="操作内容"></td>
            <td><input type="text" name="processStatus[]" placeholder="状态"></td>
            ${deleteCell}
        `;
        processTableBody.appendChild(row);
        handleFormInput();
    }

    // Handle table delete button
    function handleTableDelete(e) {
        const btn = e.target.closest('.delete-row');
        if (btn) {
            const row = btn.closest('tr');
            const rowCount = processTableBody.querySelectorAll('tr').length;
            if (rowCount > 1) {
                row.remove();
                handleFormInput();
            } else {
                showToast('至少保留1行记录', 'error');
            }
        }
    }

    // Handle conditional checkbox change
    function handleConditionalCheckbox(e) {
        updateConditionalFields();
        handleFormInput();
    }

    // Update conditional field visibility
    function updateConditionalFields() {
        document.querySelectorAll('[data-conditional]').forEach(checkbox => {
            const targetId = checkbox.dataset.conditional;
            const target = document.getElementById(targetId);
            if (target) {
                if (checkbox.checked) {
                    target.classList.add('visible');
                } else {
                    target.classList.remove('visible');
                }
            }
        });
    }

    // Show toast notification
    // Track active toasts for stacking
    let activeToasts = [];

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        // Calculate vertical position based on active toasts
        const toastSpacing = 80; // Space between toasts
        const topOffset = 20 + (activeToasts.length * toastSpacing);
        toast.style.top = `${topOffset}px`;

        document.body.appendChild(toast);
        activeToasts.push(toast);

        setTimeout(() => {
            // Remove from active toasts array
            const index = activeToasts.indexOf(toast);
            if (index > -1) {
                activeToasts.splice(index, 1);
                // Reposition remaining toasts
                activeToasts.forEach((t, i) => {
                    t.style.top = `${20 + (i * toastSpacing)}px`;
                });
            }
            toast.remove();
        }, 3000);
    }

    // Handle image upload
    function handleImageUpload(e) {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        // Ensure uploadedImages array exists
        if (!formData.uploadedImages) {
            formData.uploadedImages = [];
        }

        // Process each file
        files.forEach(file => {
            // Check for HEIC format
            const isHeic = file.name.toLowerCase().endsWith('.heic') ||
                          file.type === 'image/heic' ||
                          file.type === 'image/heif';

            if (!file.type.startsWith('image/') && !isHeic) {
                showToast('只能上传图片文件', 'error');
                return;
            }

            if (isHeic) {
                // Convert HEIC to JPEG using heic2any
                showToast('正在转换HEIC图片，请稍候...', 'success');

                heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                }).then(function(blob) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const imageData = {
                            name: file.name.replace(/\.heic$/i, '.jpg'),
                            data: event.target.result
                        };
                        formData.uploadedImages.push(imageData);
                        updateImagePreview();
                        saveToLocalStorage();
                        showToast('HEIC图片已转换并添加', 'success');
                    };
                    reader.readAsDataURL(blob);
                }).catch(function(err) {
                    console.error('HEIC conversion error:', err);
                    showToast('HEIC图片转换失败，请重试', 'error');
                });
            } else {
                // Regular image format
                const reader = new FileReader();
                reader.onload = function(event) {
                    const imageData = {
                        name: file.name,
                        data: event.target.result  // base64 data URL
                    };
                    formData.uploadedImages.push(imageData);
                    updateImagePreview();
                    saveToLocalStorage();
                };
                reader.readAsDataURL(file);
            }
        });

        // Clear file input
        e.target.value = '';
    }

    // Update image preview grid
    function updateImagePreview() {
        const grid = document.getElementById('imagePreviewGrid');
        if (!grid) return;

        grid.innerHTML = '';

        formData.uploadedImages.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'image-preview-item';
            item.innerHTML = `
                <img src="${image.data}" alt="${image.name}">
                <button type="button" class="remove-image" data-index="${index}" title="删除图片">×</button>
            `;
            grid.appendChild(item);
        });

        // Add event listeners for remove buttons
        grid.querySelectorAll('.remove-image').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                formData.uploadedImages.splice(index, 1);
                updateImagePreview();
                saveToLocalStorage();
                showToast('图片已删除', 'success');
            });
        });
    }

    // Show preview modal
    function showPreviewModal() {
        const modal = document.getElementById('pdfPreviewModal');
        const previewPagesContainer = document.getElementById('previewPages');

        // Clear previous preview
        previewPagesContainer.innerHTML = '';

        // Add all preview pages
        previewPages.forEach(page => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'preview-page';

            const img = document.createElement('img');
            img.src = page.imageData;
            img.alt = page.title;

            const pageNumber = document.createElement('div');
            pageNumber.className = 'preview-page-number';
            pageNumber.textContent = `${page.title} - 第 ${page.pageNumber} 页`;

            pageDiv.appendChild(img);
            pageDiv.appendChild(pageNumber);
            previewPagesContainer.appendChild(pageDiv);
        });

        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Hide preview modal
    function hidePreviewModal() {
        const modal = document.getElementById('pdfPreviewModal');
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Download PDF
    function downloadPDF() {
        if (!generatedPDF) {
            showToast('没有可下载的PDF', 'error');
            return;
        }

        const filename = `事故工单-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.pdf`;
        generatedPDF.save(filename);
        showToast('PDF下载成功！', 'success');

        // Hide modal after download
        hidePreviewModal();
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
