# 事故工单生成器 - Design Document

**Date**: 2025-02-10
**Author**: Claude Code
**Status**: Approved

## Overview

A client-side web application for generating incident ticket PDFs based on a predefined Chinese template. Users fill out a web form, data auto-saves to localStorage, and clicking "Generate PDF" creates a downloadable PDF file.

## Architecture & Tech Stack

### Technology Stack
- **HTML5** - Semantic markup for form structure
- **CSS3** - Clean, minimal styling with Flexbox/Grid layout
- **Vanilla JavaScript** - No frameworks, fast and simple
- **jsPDF** - Client-side PDF generation (via CDN)
- **jsPDF-AutoTable** - Table plugin for PDF generation (via CDN)

### File Structure
```
/Users/yyx/Code/incidentTicketGenerater/
├── index.html          # Single-file app (HTML + CSS + JS)
├── 事故工单模版.md     # Original template reference
├── docs/plans/         # Design documentation
└── README.md           # Usage instructions
```

### Key Features
- Single-page form with all fields visible
- Auto-save to localStorage on every change
- Load saved data on page load
- PDF auto-downloads when generated
- Form validation for required fields

## UI Layout & Form Structure

### Page Layout
- **Header**: Title "事故工单生成器" with description
- **Main Content**: 5 form sections matching template
- **Footer**: Action buttons (Generate PDF, Clear Form)

### Form Sections

#### 1. 一、事故详情
- Checkboxes: 系统故障, 网络中断, 安全事件, 设备损坏, 其他
- Text input for custom "Other" type (conditional)
- Date/time inputs: 发生时间, 发现时间
- Text inputs: 发生地点/系统, 影响范围
- Textarea: 事故描述

#### 2. 二、处理过程
- Dynamic table with columns: 时间, 操作内容, 状态更新
- Add/Remove row buttons
- Minimum 5 rows

#### 3. 三、根本原因分析
- Textarea: 直接原因
- Textarea: 根本原因

#### 4. 四、解决方案与预防措施
- Textarea: 短期解决
- Textarea: 长期预防

#### 5. 五、附件
- Checkboxes: 现场照片/截图, 其他
- Text input for custom "Other" (conditional)

### Styling
- Clean, professional appearance
- Responsive design (mobile + desktop)
- Section headers with background color
- Clear focus states on inputs

## Data Flow & PDF Generation

### State Management
1. **Form Input → JavaScript Object**
   - On load: Check localStorage, populate if exists
   - On input change: Update localStorage immediately

2. **PDF Generation Flow**
   ```
   Click "Generate PDF"
   ↓
   Validate required fields
   ↓
   Collect form data into object
   ↓
   Create jsPDF document (A4, portrait)
   ↓
   Add content sections
   ↓
   Download: 事故工单-{timestamp}.pdf
   ```

### PDF Specifications
- **Margins**: 20mm all sides
- **Font**: Chinese-compatible (helvetica)
- **Title**: 18pt, centered, bold
- **Section headers**: 14pt, bold
- **Body text**: 10pt, regular
- **Tables**: Alternating row colors
- **Page breaks**: Automatic

## JavaScript Implementation

### Core Functions

#### State Management
- `formData` object stores all values
- `saveToLocalStorage()` - Debounced (500ms)
- `loadFromLocalStorage()` - Populate on load
- `clearForm()` - Reset form and localStorage

#### Event Handlers
- Event delegation for dynamic table rows
- Checkbox handlers for conditional fields
- Add/Remove row buttons for timeline table

#### PDF Generation
`generatePDF()`:
1. Collect form data
2. Validate required fields
3. Initialize jsPDF with Chinese font
4. Add content section by section
5. Save/download PDF

#### Utilities
- `formatDate()` - Format date strings
- `getCheckedValues()` - Extract checkboxes
- `showToast()` - Display notifications

### Table Management
- Starts with 5 rows
- "Add Row" appends new row
- Each row has delete button (min 5 rows)
- Data stored as array in formData

### Conditional Display
- "其他" checkbox toggles custom input
- Attachments "其他" toggles custom text

## Testing Checklist

### Form Functionality
- [ ] All input types work correctly
- [ ] Conditional fields show/hide properly
- [ ] Add/remove table rows function
- [ ] Minimum 5 rows enforced

### Data Persistence
- [ ] Form saves to localStorage
- [ ] Data loads on refresh
- [ ] Clear form removes all data

### PDF Generation
- [ ] PDF downloads with correct filename
- [ ] Chinese characters display correctly
- [ ] All form fields appear in PDF
- [ ] Table formatting is readable
- [ ] Page breaks handle long content
- [ ] Empty fields show as blank

### Browser Compatibility
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive
- [ ] Touch-friendly buttons

## Deployment

### Options
1. **Local**: Open `index.html` directly in browser
2. **Local server**: `python3 -m http.server` or `npx serve`
3. **Hosting**: Deploy to GitHub Pages or Netlify

### Usage Instructions
1. Open `index.html` in web browser
2. Fill in incident details
3. Click "生成PDF" button
4. PDF auto-downloads to Downloads folder
