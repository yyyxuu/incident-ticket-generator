# 事故工单生成器 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a client-side web application that generates Chinese incident ticket PDFs from a web form.

**Architecture:** Single HTML file with embedded CSS and JavaScript. Uses jsPDF library for client-side PDF generation. Data persists via localStorage.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, jsPDF, jsPDF-AutoTable

---

## Task 1: Create Basic HTML Structure

**Files:**
- Create: `index.html`

**Step 1: Write basic HTML skeleton**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>事故工单生成器</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <header>
        <h1><i class="fas fa-file-alt"></i> 事故工单生成器</h1>
        <p>填写事故信息，自动生成PDF工单</p>
    </header>

    <main>
        <form id="incidentForm">
            <!-- Form sections will be added in next tasks -->
        </form>
    </main>

    <footer>
        <button type="button" id="generateBtn" class="btn-primary">
            <i class="fas fa-file-pdf"></i> 生成PDF
        </button>
        <button type="button" id="clearBtn" class="btn-secondary">
            <i class="fas fa-trash"></i> 清空表单
        </button>
    </footer>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

**Step 2: Verify file creation**

Run: `ls -la index.html`
Expected: File exists with content

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add basic HTML structure for incident ticket generator"
```

---

## Task 2: Add CSS Styling

**Files:**
- Modify: `index.html` (add `<style>` in head)

**Step 1: Add CSS styles**

Add this in `<head>` section:

```css
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
    }

    header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    header h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    header p {
        font-size: 1rem;
        opacity: 0.9;
    }

    main {
        max-width: 900px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .form-section {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-section h2 {
        font-size: 1.25rem;
        color: #667eea;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e0e0e0;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        font-weight: 500;
        margin-bottom: 0.25rem;
        color: #555;
    }

    input[type="text"],
    input[type="date"],
    input[type="datetime-local"],
    textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.3s;
    }

    input:focus,
    textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    textarea {
        min-height: 100px;
        resize: vertical;
    }

    .checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .checkbox-item input[type="checkbox"] {
        width: auto;
        cursor: pointer;
    }

    .conditional-field {
        margin-top: 0.5rem;
        display: none;
    }

    .conditional-field.visible {
        display: block;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }

    table th,
    table td {
        padding: 0.75rem;
        text-align: left;
        border: 1px solid #ddd;
    }

    table th {
        background: #f5f5f5;
        font-weight: 600;
    }

    table input {
        width: 100%;
        padding: 0.5rem;
        border: none;
        background: transparent;
    }

    table input:focus {
        outline: none;
        background: #f9f9f9;
    }

    .btn-icon {
        background: none;
        border: none;
        color: #dc3545;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        font-size: 1rem;
    }

    .btn-icon:hover {
        color: #c82333;
    }

    .btn-add {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }

    .btn-add:hover {
        background: #218838;
    }

    footer {
        max-width: 900px;
        margin: 2rem auto;
        padding: 0 1rem;
        display: flex;
        gap: 1rem;
        justify-content: center;
    }

    .btn-primary,
    .btn-secondary {
        padding: 1rem 2rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
        background: #6c757d;
        color: white;
    }

    .btn-secondary:hover {
        background: #5a6268;
    }

    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    }

    .toast.success {
        background: #28a745;
    }

    .toast.error {
        background: #dc3545;
    }

    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        header h1 {
            font-size: 1.5rem;
        }

        .form-section {
            padding: 1rem;
        }

        footer {
            flex-direction: column;
        }

        .btn-primary,
        .btn-secondary {
            width: 100%;
            justify-content: center;
        }
    }
</style>
```

**Step 2: Verify CSS is added**

Run: `grep -c "<style>" index.html`
Expected: 1

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add CSS styling for incident ticket generator"
```

---

## Task 3: Build Section 1 - 事故详情 Form

**Files:**
- Modify: `index.html` (add form section)

**Step 1: Add Section 1 HTML**

Add inside `<form id="incidentForm">`:

```html
<!-- Section 1: 事故详情 -->
<div class="form-section">
    <h2>一、事故详情</h2>

    <div class="form-group">
        <label>事故类型</label>
        <div class="checkbox-group" id="accidentTypeGroup">
            <div class="checkbox-item">
                <input type="checkbox" id="type1" name="accidentType" value="系统故障">
                <label for="type1">系统故障</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="type2" name="accidentType" value="网络中断">
                <label for="type2">网络中断</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="type3" name="accidentType" value="安全事件">
                <label for="type3">安全事件</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="type4" name="accidentType" value="设备损坏">
                <label for="type4">设备损坏</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="type5" name="accidentType" value="其他" data-conditional="otherTypeInput">
                <label for="type5">其他</label>
            </div>
        </div>
        <div class="conditional-field" id="otherTypeInput">
            <input type="text" id="otherType" placeholder="请输入其他事故类型">
        </div>
    </div>

    <div class="form-group">
        <label for="occurTime">发生时间</label>
        <input type="datetime-local" id="occurTime" name="occurTime">
    </div>

    <div class="form-group">
        <label for="discoverTime">发现时间</label>
        <input type="datetime-local" id="discoverTime" name="discoverTime">
    </div>

    <div class="form-group">
        <label for="location">发生地点/系统</label>
        <input type="text" id="location" name="location" placeholder="请输入发生地点或系统名称">
    </div>

    <div class="form-group">
        <label for="impact">影响范围</label>
        <input type="text" id="impact" name="impact" placeholder="请输入影响范围">
    </div>

    <div class="form-group">
        <label for="description">事故描述</label>
        <textarea id="description" name="description" placeholder="请详细描述事故情况"></textarea>
    </div>
</div>
```

**Step 2: Verify section added**

Run: `grep "一、事故详情" index.html`
Expected: Found in file

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add accident details form section"
```

---

## Task 4: Build Section 2 - 处理过程 Table

**Files:**
- Modify: `index.html` (add table section)

**Step 1: Add Section 2 HTML**

Add after Section 1:

```html
<!-- Section 2: 处理过程 -->
<div class="form-section">
    <h2>二、处理过程</h2>

    <table id="processTable">
        <thead>
            <tr>
                <th style="width: 25%">时间</th>
                <th style="width: 50%">操作内容</th>
                <th style="width: 15%">状态更新</th>
                <th style="width: 10%">操作</th>
            </tr>
        </thead>
        <tbody id="processTableBody">
            <tr>
                <td><input type="datetime-local" name="processTime[]"></td>
                <td><input type="text" name="processAction[]" placeholder="操作内容"></td>
                <td><input type="text" name="processStatus[]" placeholder="状态"></td>
                <td></td>
            </tr>
            <tr>
                <td><input type="datetime-local" name="processTime[]"></td>
                <td><input type="text" name="processAction[]" placeholder="操作内容"></td>
                <td><input type="text" name="processStatus[]" placeholder="状态"></td>
                <td></td>
            </tr>
            <tr>
                <td><input type="datetime-local" name="processTime[]"></td>
                <td><input type="text" name="processAction[]" placeholder="操作内容"></td>
                <td><input type="text" name="processStatus[]" placeholder="状态"></td>
                <td></td>
            </tr>
            <tr>
                <td><input type="datetime-local" name="processTime[]"></td>
                <td><input type="text" name="processAction[]" placeholder="操作内容"></td>
                <td><input type="text" name="processStatus[]" placeholder="状态"></td>
                <td></td>
            </tr>
            <tr>
                <td><input type="datetime-local" name="processTime[]"></td>
                <td><input type="text" name="processAction[]" placeholder="操作内容"></td>
                <td><input type="text" name="processStatus[]" placeholder="状态"></td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <button type="button" class="btn-add" id="addRowBtn">
        <i class="fas fa-plus"></i> 添加一行
    </button>
</div>
```

**Step 2: Verify table added**

Run: `grep "二、处理过程" index.html`
Expected: Found in file

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add processing timeline table section"
```

---

## Task 5: Build Section 3 - 根本原因分析

**Files:**
- Modify: `index.html` (add analysis section)

**Step 1: Add Section 3 HTML**

Add after Section 2:

```html
<!-- Section 3: 根本原因分析 -->
<div class="form-section">
    <h2>三、根本原因分析</h2>

    <div class="form-group">
        <label for="directCause">直接原因</label>
        <textarea id="directCause" name="directCause" placeholder="请说明导致事故的直接原因"></textarea>
    </div>

    <div class="form-group">
        <label for="rootCause">根本原因</label>
        <textarea id="rootCause" name="rootCause" placeholder="请深入分析事故的根本原因"></textarea>
    </div>
</div>
```

**Step 2: Verify section added**

Run: `grep "三、根本原因分析" index.html`
Expected: Found in file

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add root cause analysis section"
```

---

## Task 6: Build Section 4 - 解决方案与预防措施

**Files:**
- Modify: `index.html` (add solutions section)

**Step 1: Add Section 4 HTML**

Add after Section 3:

```html
<!-- Section 4: 解决方案与预防措施 -->
<div class="form-section">
    <h2>四、解决方案与预防措施</h2>

    <div class="form-group">
        <label for="shortTermSolution">短期解决</label>
        <textarea id="shortTermSolution" name="shortTermSolution" placeholder="请描述短期解决方案"></textarea>
    </div>

    <div class="form-group">
        <label for="longTermPrevention">长期预防</label>
        <textarea id="longTermPrevention" name="longTermPrevention" placeholder="请描述长期预防措施"></textarea>
    </div>
</div>
```

**Step 2: Verify section added**

Run: `grep "四、解决方案与预防措施" index.html`
Expected: Found in file

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add solutions and prevention measures section"
```

---

## Task 7: Build Section 5 - 附件

**Files:**
- Modify: `index.html` (add attachments section)

**Step 1: Add Section 5 HTML**

Add after Section 4:

```html
<!-- Section 5: 附件 -->
<div class="form-section">
    <h2>五、附件</h2>

    <div class="form-group">
        <label>附件清单</label>
        <div class="checkbox-group">
            <div class="checkbox-item">
                <input type="checkbox" id="attach1" name="attachments" value="现场照片/截图">
                <label for="attach1">现场照片/截图</label>
            </div>
            <div class="checkbox-item">
                <input type="checkbox" id="attach2" name="attachments" value="其他" data-conditional="otherAttachInput">
                <label for="attach2">其他</label>
            </div>
        </div>
        <div class="conditional-field" id="otherAttachInput">
            <input type="text" id="otherAttachment" placeholder="请输入其他附件说明">
        </div>
    </div>
</div>
```

**Step 2: Verify section added**

Run: `grep "五、附件" index.html`
Expected: Found in file

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add attachments section"
```

---

## Task 8: Create JavaScript File - Core Structure

**Files:**
- Create: `app.js`

**Step 1: Create app.js with core structure**

```javascript
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
        // Will be implemented in next task
        console.log('Collecting form data...');
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
        // Will be implemented in next task
        console.log('Populating form with data...');
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

    // Generate PDF
    function generatePDF() {
        console.log('Generating PDF...');
        showToast('PDF生成功能开发中...', 'error');
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
```

**Step 2: Verify file created**

Run: `ls -la app.js`
Expected: File exists

**Step 3: Update HTML to use app.js**

Change in `index.html`:
```html
<!-- Change this line -->
<script src="app.js"></script>
```

**Step 4: Commit**

```bash
git add app.js index.html
git commit -m "feat: add core JavaScript structure and event handlers"
```

---

## Task 9: Implement Form Data Collection

**Files:**
- Modify: `app.js` (implement collectFormData function)

**Step 1: Implement collectFormData function**

Replace the placeholder `collectFormData()` function with:

```javascript
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
```

**Step 2: Test data collection**

Open `index.html` in browser, open console, fill some fields, check console for "Collecting form data..."

**Step 3: Commit**

```bash
git add app.js
git commit -m "feat: implement form data collection from all fields"
```

---

## Task 10: Implement Form Population

**Files:**
- Modify: `app.js` (implement populateForm function)

**Step 1: Implement populateForm function**

Replace the placeholder `populateForm()` function with:

```javascript
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
```

**Step 2: Test form population**

Open `index.html`, fill form, refresh page - data should persist

**Step 3: Commit**

```bash
git add app.js
git commit -m "feat: implement form population from saved data"
```

---

## Task 11: Implement PDF Generation - Part 1

**Files:**
- Modify: `app.js` (implement PDF generation basics)

**Step 1: Implement PDF generation helper functions**

Add these functions before the `generatePDF()` function:

```javascript
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
```

**Step 2: Implement basic PDF structure**

Replace the `generatePDF()` function with:

```javascript
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
```

**Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add PDF generation basic structure and validation"
```

---

## Task 12: Implement PDF Generation - Part 2 (Section Functions)

**Files:**
- Modify: `app.js` (add section rendering functions)

**Step 1: Add section rendering functions**

Add these functions after `validateForm()`:

```javascript
    // Add Section 1: Accident Details
    function addSection1(doc, yPos) {
        const marginLeft = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - 2 * marginLeft;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('一、事故详情', marginLeft, yPos);

        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Accident types
        const types = formData.accidentTypes.join('、');
        if (formData.otherType) {
            types += ` (${formData.otherType})`;
        }
        yPos = addWrappedText(doc, `事故类型: ${types}`, marginLeft, yPos, maxWidth);

        // Times
        yPos = addField(doc, '发生时间', formatDate(formData.occurTime), marginLeft, yPos);
        yPos = addField(doc, '发现时间', formatDate(formData.discoverTime), marginLeft, yPos);

        // Text fields
        yPos = addField(doc, '发生地点/系统', formData.location, marginLeft, yPos);
        yPos = addField(doc, '影响范围', formData.impact, marginLeft, yPos);

        // Description (multiline)
        yPos = addMultilineField(doc, '事故描述', formData.description, marginLeft, yPos, maxWidth);

        return yPos + 10;
    }

    // Add Section 2: Processing Timeline
    function addSection2(doc, yPos) {
        const marginLeft = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('二、处理过程', marginLeft, yPos);

        yPos += 10;

        // Prepare table data
        const tableData = formData.processRows.map(row => [
            formatDate(row.time),
            row.action,
            row.status
        ]);

        // Add table if there's data
        if (tableData.length > 0 && tableData.some(row => row.some(cell => cell))) {
            doc.autoTable({
                startY: yPos,
                head: [['时间', '操作内容', '状态更新']],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 2 },
                headStyles: { fillColor: [102, 126, 234] },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 10;
        } else {
            yPos += 10;
        }

        return yPos;
    }

    // Add Section 3: Root Cause Analysis
    function addSection3(doc, yPos) {
        const marginLeft = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - 2 * marginLeft;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('三、根本原因分析', marginLeft, yPos);

        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        yPos = addMultilineField(doc, '直接原因', formData.directCause, marginLeft, yPos, maxWidth);
        yPos = addMultilineField(doc, '根本原因', formData.rootCause, marginLeft, yPos, maxWidth);

        return yPos + 10;
    }

    // Add Section 4: Solutions
    function addSection4(doc, yPos) {
        const marginLeft = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - 2 * marginLeft;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('四、解决方案与预防措施', marginLeft, yPos);

        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        yPos = addMultilineField(doc, '短期解决', formData.shortTermSolution, marginLeft, yPos, maxWidth);
        yPos = addMultilineField(doc, '长期预防', formData.longTermPrevention, marginLeft, yPos, maxWidth);

        return yPos + 10;
    }

    // Add Section 5: Attachments
    function addSection5(doc, yPos) {
        const marginLeft = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('五、附件', marginLeft, yPos);

        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const attachments = formData.attachments.join('、');
        if (formData.otherAttachment) {
            attachments += ` (${formData.otherAttachment})`;
        }

        if (attachments) {
            doc.text(`附件清单: ${attachments}`, marginLeft, yPos);
        } else {
            doc.text('附件清单: 无', marginLeft, yPos);
        }
    }

    // Helper: Add a single field
    function addField(doc, label, value, x, y) {
        doc.text(`${label}: ${value || '未填写'}`, x, y);
        return y + 7;
    }

    // Helper: Add multiline field
    function addMultilineField(doc, label, value, x, y, maxWidth) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, x, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        if (value) {
            const lines = doc.splitTextToSize(value, maxWidth);
            lines.forEach(line => {
                doc.text(line, x, y);
                y += 5;
            });
        } else {
            doc.text('未填写', x, y);
            y += 5;
        }

        return y + 3;
    }

    // Helper: Add wrapped text
    function addWrappedText(doc, text, x, y, maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach(line => {
            doc.text(line, x, y);
            y += 5;
        });
        return y + 2;
    }
```

**Step 2: Test PDF generation**

Open `index.html` in browser, fill form, click "生成PDF" - should download PDF

**Step 3: Commit**

```bash
git add app.js
git commit -m "feat: implement PDF section rendering functions"
```

---

## Task 13: Add README Documentation

**Files:**
- Create: `README.md`

**Step 1: Create README**

```markdown
# 事故工单生成器

一个简单易用的事故工单生成工具，基于网页表单填写，自动生成PDF格式的事故工单。

## 功能特性

- 📝 **在线填写**: 在浏览器中直接填写工单信息，无需安装软件
- 💾 **自动保存**: 表单数据自动保存到浏览器本地存储，刷新页面不丢失
- 📄 **PDF生成**: 一键生成专业PDF格式的事故工单
- 📱 **响应式设计**: 支持电脑、平板、手机等多种设备
- 🌐 **纯前端**: 所有数据处理在浏览器本地完成，数据不上传服务器

## 使用方法

### 方式一: 直接打开（推荐）

1. 双击打开 `index.html` 文件
2. 填写事故工单信息
3. 点击"生成PDF"按钮
4. PDF文件将自动下载到您的下载文件夹

### 方式二: 本地服务器

```bash
# 使用 Python
python3 -m http.server 8000

# 或使用 Node.js
npx serve
```

然后在浏览器中访问 `http://localhost:8000`

## 工单内容

工单包含以下五个部分：

### 一、事故详情
- 事故类型（系统故障、网络中断、安全事件、设备损坏、其他）
- 发生时间、发现时间
- 发生地点/系统
- 影响范围
- 事故描述

### 二、处理过程
- 时间线表格（可添加多行）
- 记录操作内容和状态更新

### 三、根本原因分析
- 直接原因
- 根本原因

### 四、解决方案与预防措施
- 短期解决方案
- 长期预防措施

### 五、附件
- 现场照片/截图
- 其他附件说明

## 技术栈

- HTML5
- CSS3
- Vanilla JavaScript
- jsPDF - PDF生成库
- jsPDF-AutoTable - PDF表格插件

## 数据隐私

- 所有数据存储在浏览器的 localStorage 中
- 不会上传到任何服务器
- 清空浏览器数据会导致保存的表单数据丢失

## 浏览器兼容性

支持所有现代浏览器：
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 开源协议

MIT License
```

**Step 2: Verify README created**

Run: `cat README.md | head -20`
Expected: README content displayed

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README documentation"
```

---

## Task 14: Create .gitignore File

**Files:**
- Create: `.gitignore`

**Step 1: Create .gitignore**

```gitignore
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Thumbnails
._*

# Files that might appear in the root of a volume
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent

# Node modules (if added later)
node_modules/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
```

**Step 2: Verify .gitignore created**

Run: `cat .gitignore`
Expected: gitignore content displayed

**Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore for macOS and common files"
```

---

## Task 15: Final Testing and Verification

**Files:**
- None (testing task)

**Step 1: Test all form sections**

Run: Open `index.html` in browser

Verify:
- [ ] All 5 sections display correctly
- [ ] All input fields are accessible
- [ ] Checkboxes work for accident types
- [ ] "其他" checkbox shows conditional field
- [ ] Process table has 5 initial rows
- [ ] Add row button works
- [ ] Delete button works (only when > 5 rows)

**Step 2: Test data persistence**

Run:
1. Fill various fields
2. Refresh page (Cmd+R or F5)
3. Verify data persists

Expected: All filled data remains after refresh

**Step 3: Test localStorage clear**

Run:
1. Click "清空表单" button
2. Confirm dialog
3. Verify all fields are empty

Expected: Form is cleared and empty

**Step 4: Test PDF generation**

Run:
1. Fill in sample data
2. Click "生成PDF" button
3. Check Downloads folder

Expected:
- PDF file downloads with name format: `事故工单-YYYY-MM-DDTHH-mm-ss.pdf`
- PDF contains all form data
- Chinese characters display correctly
- Table formatting is readable

**Step 5: Test mobile responsiveness**

Run: Open DevTools, toggle device toolbar, test mobile view

Verify:
- [ ] Layout adapts to mobile screen
- [ ] Form is usable on mobile
- [ ] Buttons are touch-friendly

**Step 6: Test browser compatibility**

Run: Test in multiple browsers (Chrome, Firefox, Safari, Edge)

Verify:
- [ ] All features work in each browser
- [ ] PDF downloads successfully

**Step 7: Commit final changes**

```bash
git add -A
git commit -m "test: complete all testing and verification"
```

---

## Task 16: Final Polish and Code Review

**Files:**
- Modify: `index.html`, `app.js` (if needed)

**Step 1: Review code quality**

Check for:
- [ ] No console errors
- [ ] Code is well-commented
- [ ] Functions have clear names
- [ ] No hardcoded values that should be constants
- [ ] Error handling is appropriate

**Step 2: Optimize if needed**

Potential optimizations:
- Minify JavaScript (optional)
- Add loading indicator for PDF generation
- Improve error messages

**Step 3: Final commit**

```bash
git add -A
git commit -m "polish: final code review and optimizations"
```

---

## Implementation Complete!

**Next Steps:**

1. **Deploy** (optional):
   - GitHub Pages: Push to GitHub repo, enable Pages
   - Netlify: Drag and drop the folder
   - Vercel: Import from GitHub

2. **Share**:
   - Send link to users
   - Distribute `index.html` file for local use

3. **Enhancements** (future):
   - Add PDF template customization
   - Export/import form data as JSON
   - Add more language support
   - Print to PDF option

---

**Total Estimated Time**: 2-3 hours for complete implementation

**Commit Strategy**: Each task commits independently, making it easy to track progress and revert if needed.
