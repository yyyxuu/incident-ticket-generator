// Incident Ticket Generator - Main Application

(function() {
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

    // Get checked values as string
    function getCheckedValues(selector) {
        const checked = document.querySelectorAll(`${selector}:checked`);
        return Array.from(checked).map(cb => cb.value).join('、');
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

            // Create PDF document
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Incident Ticket', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

            // Add timestamp
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString('zh-CN')}`, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

            let yPos = 40;

            // Section 1: Accident Details
            yPos = addSection1(doc, yPos);

            // Section 2: Processing Timeline
            yPos = addSection2(doc, yPos);

            // Section 3: Root Cause
            yPos = addSection3(doc, yPos);

            // Section 4: Solutions
            yPos = addSection4(doc, yPos);

            // Section 5: Attachments
            addSection5(doc, yPos);

            // Save PDF
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            doc.save(`事故工单-${timestamp}.pdf`);

            showToast('PDF生成成功', 'success');

        } catch (error) {
            console.error('PDF generation error:', error);
            showToast('PDF生成失败: ' + error.message, 'error');
        }
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
