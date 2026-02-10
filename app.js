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
        otherAttachment: ''
    };

    // DOM elements
    const form = document.getElementById('incidentForm');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const addRowBtn = document.getElementById('addRowBtn');
    const processTableBody = document.getElementById('processTableBody');

    // Initialize application
    function init() {
        console.log('Incident Ticket Generator initialized');
        loadFromLocalStorage();
        setupEventListeners();
        updateConditionalFields();
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
        localStorage.setItem('incidentTicketData', JSON.stringify(formData));
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

            // Add minimum 5 rows
            const totalRows = Math.max(5, data.processRows.length);
            for (let i = 0; i < totalRows; i++) {
                const rowData = data.processRows[i] || { time: '', action: '', status: '' };
                const row = document.createElement('tr');

                const deleteCell = i >= 5 ? `<td><button type="button" class="btn-icon delete-row"><i class="fas fa-times"></i></button></td>` : '<td></td>';

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
            }
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

        // Update conditional fields
        updateConditionalFields();
    }

    // Clear form
    function clearForm() {
        if (confirm('确定要清空表单吗？所有未保存的数据将丢失。')) {
            form.reset();
            formData = getEmptyFormData();
            localStorage.removeItem('incidentTicketData');
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
            otherAttachment: ''
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

    // Generate PDF
    function generatePDF() {
        try {
            // Collect latest form data
            collectFormData();

            // Validate required fields
            if (!validateForm()) {
                showToast('请填写必填字段', 'error');
                return;
            }

            showToast('正在生成PDF，请稍候...', 'success');

            // Create HTML content for PDF and add to DOM temporarily
            const pdfContent = createPDFContent();

            // Position element at top of page so user can see it during generation
            pdfContent.style.cssText = 'position: fixed; left: 0; top: 0; z-index: 10000; width: 210mm; padding: 20px; font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif; font-size: 12px; color: #333; background: white;';

            document.body.appendChild(pdfContent);

            // Use html2canvas directly with optimized settings
            html2canvas(pdfContent, {
                scale: 2,          // 2x resolution for better clarity
                backgroundColor: '#ffffff',  // White background reduces file size
                useCORS: false,
                logging: false,
                allowTaint: true
            }).then(canvas => {
                console.log('Canvas生成成功，尺寸:', canvas.width, 'x', canvas.height);

                // Get PDF instance
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                console.log('PDF页面尺寸:', pdfWidth, 'x', pdfHeight, 'mm');

                // Calculate image dimensions to fit in PDF
                const margin = 10;
                const imgWidth = pdfWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                console.log('图片在PDF中的尺寸:', imgWidth.toFixed(2), 'x', imgHeight.toFixed(2), 'mm');

                // Use JPEG with 0.85 quality for optimal size/quality balance
                // JPEG is more efficient than PNG for documents with text
                const imgData = canvas.toDataURL('image/jpeg', 1);

                // Add image to PDF with SLOW compression for smallest file size
                // Compression options: 'NONE', 'FAST', 'MEDIUM', 'SLOW'
                pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'SLOW');

                // Save PDF
                const filename = `事故工单-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.pdf`;
                pdf.save(filename);

                console.log('PDF保存成功:', filename);
                showToast('PDF生成成功！即将移除临时元素...', 'success');

                // Remove the temporary element after a short delay
                setTimeout(() => {
                    document.body.removeChild(pdfContent);
                }, 2000);
            }).catch(err => {
                console.error('PDF generation error:', err);
                showToast('PDF生成失败: ' + err.message, 'error');
                // Remove the temporary element on error too
                if (document.body.contains(pdfContent)) {
                    document.body.removeChild(pdfContent);
                }
            });

        } catch (error) {
            console.error('PDF generation error:', error);
            showToast('PDF生成失败: ' + error.message, 'error');
        }
    }

    // Create HTML content for PDF
    function createPDFContent() {
        const container = document.createElement('div');
        // Keep element in viewport but nearly invisible
        // Let content determine height naturally
        container.style.cssText = 'position: absolute; left: 0; top: 0; opacity: 0.01; z-index: -1; padding: 20px; font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif; font-size: 12px; color: #333; width: 210mm; background: white;';

        // HTML escape function
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        const types = escapeHtml(formData.accidentTypes.join('、')) + (formData.otherType ? ` (${escapeHtml(formData.otherType)})` : '');
        const attachments = escapeHtml(formData.attachments.join('、')) + (formData.otherAttachment ? ` (${escapeHtml(formData.otherAttachment)})` : '');

        // Build process table rows
        const processRowsHTML = formData.processRows
            .filter(row => row.time || row.action || row.status)
            .map(row => `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(formatDate(row.time))}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(row.action || '')}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(row.status || '')}</td>
                </tr>
            `).join('');

        container.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="font-size: 24px; margin-bottom: 10px; color: #333;">事故工单</h1>
                <p style="font-size: 10px; color: #666;">生成时间: ${new Date().toLocaleString('zh-CN')}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 16px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #667eea; color: #667eea;">一、事故详情</h2>
                <p style="margin: 8px 0;"><strong>事故类型:</strong> ${types || '未填写'}</p>
                <p style="margin: 8px 0;"><strong>发生时间:</strong> ${escapeHtml(formatDate(formData.occurTime)) || '未填写'}</p>
                <p style="margin: 8px 0;"><strong>发现时间:</strong> ${escapeHtml(formatDate(formData.discoverTime)) || '未填写'}</p>
                <p style="margin: 8px 0;"><strong>发生地点/系统:</strong> ${escapeHtml(formData.location) || '未填写'}</p>
                <p style="margin: 8px 0;"><strong>影响范围:</strong> ${escapeHtml(formData.impact) || '未填写'}</p>
                <div style="margin: 8px 0;">
                    <p style="margin-bottom: 5px;"><strong>事故描述:</strong></p>
                    <div style="padding: 10px; background: #f9f9f9; border-radius: 4px; min-height: 50px;">${escapeHtml(formData.description) || '未填写'}</div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 16px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #667eea; color: #667eea;">二、处理过程</h2>
                ${processRowsHTML ? `
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background: #667eea; color: white;">
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">时间</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">操作内容</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">状态更新</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${processRowsHTML}
                        </tbody>
                    </table>
                ` : '<p style="color: #999;">无处理记录</p>'}
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 16px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #667eea; color: #667eea;">三、根本原因分析</h2>
                <div style="margin: 8px 0;">
                    <p style="margin-bottom: 5px;"><strong>直接原因:</strong></p>
                    <div style="padding: 10px; background: #f9f9f9; border-radius: 4px; min-height: 50px;">${escapeHtml(formData.directCause) || '未填写'}</div>
                </div>
                <div style="margin: 8px 0;">
                    <p style="margin-bottom: 5px;"><strong>根本原因:</strong></p>
                    <div style="padding: 10px; background: #f9f9f9; border-radius: 4px; min-height: 50px;">${escapeHtml(formData.rootCause) || '未填写'}</div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="font-size: 16px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #667eea; color: #667eea;">四、解决方案与预防措施</h2>
                <div style="margin: 8px 0;">
                    <p style="margin-bottom: 5px;"><strong>短期解决:</strong></p>
                    <div style="padding: 10px; background: #f9f9f9; border-radius: 4px; min-height: 50px;">${escapeHtml(formData.shortTermSolution) || '未填写'}</div>
                </div>
                <div style="margin: 8px 0;">
                    <p style="margin-bottom: 5px;"><strong>长期预防:</strong></p>
                    <div style="padding: 10px; background: #f9f9f9; border-radius: 4px; min-height: 50px;">${escapeHtml(formData.longTermPrevention) || '未填写'}</div>
                </div>
            </div>

            <div>
                <h2 style="font-size: 16px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #667eea; color: #667eea;">五、附件</h2>
                <p style="margin: 8px 0;"><strong>附件清单:</strong> ${attachments || '无'}</p>
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
        row.innerHTML = `
            <td><input type="datetime-local" name="processTime[]"></td>
            <td><input type="text" name="processAction[]" placeholder="操作内容"></td>
            <td><input type="text" name="processStatus[]" placeholder="状态"></td>
            <td><button type="button" class="btn-icon delete-row"><i class="fas fa-times"></i></button></td>
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
            if (rowCount > 5) {
                row.remove();
                handleFormInput();
            } else {
                showToast('至少保留5行记录', 'error');
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
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
