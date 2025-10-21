// score-upload.js - JavaScript cho tính năng upload điểm

// Thêm CSS vào document
function loadUploadStyles() {
    if (!document.querySelector('#score-upload-styles')) {
        const link = document.createElement('link');
        link.id = 'score-upload-styles';
        link.rel = 'stylesheet';
        link.href = '../quanlydiem/css/score-upload.css';
        document.head.appendChild(link);
    }
}

// Khởi tạo tính năng upload điểm
function initializeScoreUpload() {
    loadUploadStyles();
    console.log('Tính năng upload điểm đã được khởi tạo');
}

// score-upload.js - Cập nhật hàm downloadScoreTemplate
function downloadScoreTemplate() {
    const selectedClass = scoreClass.value;
    const selectedSubject = scoreSubject.value;
    const selectedType = scoreType.value;
    
    if (!selectedClass || !selectedSubject) {
        alert('Vui lòng chọn lớp và môn học trước!');
        return;
    }
    
    const classStudents = students.filter(s => s.class === selectedClass);
    
    if (classStudents.length === 0) {
        alert('Lớp được chọn không có học sinh nào!');
        return;
    }
    
    try {
        // Tạo dữ liệu cho template với đầy đủ thông tin
        const templateData = classStudents.map((student, index) => {
            const currentScore = scores[student.id]?.[selectedSubject]?.[selectedType] || '';
            
            return {
                'STT': index + 1,
                'Mã HS': student.id,
                'Họ Tên': student.name,
                'Ngày Sinh': student.dob,
                'Lớp': student.class,
                'Khối': student.grade,
                'Điểm': currentScore || '' // Để trống để người dùng nhập
            };
        });

        // Tạo workbook
        const wb = XLSX.utils.book_new();
        
        // Sheet hướng dẫn
        const instructionData = [
            ['HỆ THỐNG QUẢN LÝ ĐIỂM - TEMPLATE NHẬP ĐIỂM'],
            [''],
            ['HƯỚNG DẪN SỬ DỤNG:'],
            ['1. File này dùng để nhập điểm cho toàn bộ lớp'],
            ['2. Chỉ nhập điểm vào cột "Điểm" (cột G)'],
            ['3. Điểm hợp lệ: từ 0 đến 10, có thể nhập số thập phân (ví dụ: 8.5)'],
            ['4. Để trống nếu học sinh vắng hoặc chưa có điểm'],
            ['5. TUYỆT ĐỐI KHÔNG sửa các cột khác (Mã HS, Họ Tên, Ngày Sinh, Lớp, Khối)'],
            ['6. Sau khi nhập xong, lưu file và import lại vào hệ thống'],
            [''],
            ['THÔNG TIN NHẬP ĐIỂM:'],
            [`Môn học: ${subjects[selectedSubject]}`],
            [`Loại điểm: ${getScoreTypeName(selectedType)}`],
            [`Lớp: ${selectedClass}`],
            [`Tổng số học sinh: ${classStudents.length}`],
            [''],
            ['LƯU Ý QUAN TRỌNG:'],
            ['- File phải giữ nguyên định dạng và cấu trúc'],
            ['- Không xóa hoặc thay đổi tiêu đề cột'],
            ['- Không thay đổi thứ tự học sinh'],
            ['- Chỉ nhập điểm vào cột G']
        ];
        
        const wsInstructions = XLSX.utils.aoa_to_sheet(instructionData);
        
        // Sheet dữ liệu điểm
        const ws = XLSX.utils.json_to_sheet(templateData);
        
        // Định dạng độ rộng cột
        const colWidths = [
            { wch: 5 },  // STT
            { wch: 10 }, // Mã HS
            { wch: 25 }, // Họ Tên
            { wch: 12 }, // Ngày Sinh
            { wch: 8 },  // Lớp
            { wch: 6 },  // Khối
            { wch: 8 }   // Điểm
        ];
        ws['!cols'] = colWidths;
        
        // Định dạng sheet hướng dẫn
        const instructionColWidths = [
            { wch: 80 } // Độ rộng cho cột hướng dẫn
        ];
        wsInstructions['!cols'] = instructionColWidths;
        
        // Merge cells cho tiêu đề
        if (!wsInstructions['!merges']) wsInstructions['!merges'] = [];
        wsInstructions['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });
        
        // Thêm sheets vào workbook
        XLSX.utils.book_append_sheet(wb, wsInstructions, 'Hướng dẫn');
        XLSX.utils.book_append_sheet(wb, ws, 'Dữ liệu điểm');
        
        // Đánh dấu cột điểm cần nhập (màu vàng)
        if (ws['!ref']) {
            const range = XLSX.utils.decode_range(ws['!ref']);
            
            // Đánh dấu tiêu đề cột điểm
            const scoreHeaderCell = XLSX.utils.encode_cell({ r: 0, c: 6 });
            if (!ws[scoreHeaderCell]) ws[scoreHeaderCell] = {};
            if (!ws[scoreHeaderCell].s) ws[scoreHeaderCell].s = {};
            ws[scoreHeaderCell].s = {
                fill: { fgColor: { rgb: "FFFFFF00" } },
                font: { bold: true, color: { rgb: "FF000000" } },
                border: {
                    top: { style: "thin", color: { rgb: "FF000000" } },
                    left: { style: "thin", color: { rgb: "FF000000" } },
                    bottom: { style: "thin", color: { rgb: "FF000000" } },
                    right: { style: "thin", color: { rgb: "FF000000" } }
                },
                alignment: { horizontal: "center", vertical: "center" }
            };
            
            // Đánh dấu các ô nhập điểm
            for (let R = range.s.r + 1; R <= range.e.r; R++) {
                const scoreCell = XLSX.utils.encode_cell({ r: R, c: 6 });
                if (!ws[scoreCell]) ws[scoreCell] = {};
                if (!ws[scoreCell].s) ws[scoreCell].s = {};
                ws[scoreCell].s = {
                    fill: { fgColor: { rgb: "FFFFFF00" } },
                    border: {
                        top: { style: "thin", color: { rgb: "FF000000" } },
                        left: { style: "thin", color: { rgb: "FF000000" } },
                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                        right: { style: "thin", color: { rgb: "FF000000" } }
                    },
                    alignment: { horizontal: "center" }
                };
            }
        }
        
        // Tên file
        const fileName = `Nhap_Diem_${subjects[selectedSubject]}_${getScoreTypeName(selectedType)}_${selectedClass}.xlsx`;
        
        // Xuất file
        XLSX.writeFile(wb, fileName);
        
        // Hiển thị thông báo
        showUploadMessage(
            `✅ ĐÃ TẢI TEMPLATE THÀNH CÔNG!\n\n` +
            `📁 File: ${fileName}\n` +
            `📊 Môn: ${subjects[selectedSubject]}\n` +
            `🎯 Loại điểm: ${getScoreTypeName(selectedType)}\n` +
            `👥 Lớp: ${selectedClass}\n` +
            `📝 Số học sinh: ${classStudents.length}\n\n` +
            `💡 Hướng dẫn:\n` +
            `1. Mở file Excel vừa tải\n` +
            `2. Nhập điểm vào cột "Điểm" (cột G)\n` +
            `3. Lưu file và upload lại lên hệ thống`,
            'success'
        );
        
    } catch (error) {
        showUploadMessage('❌ Lỗi khi tạo template: ' + error.message, 'error');
    }
}

// Hàm xử lý import file điểm
function handleScoreFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Kiểm tra phần mở rộng file
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        showUploadMessage('❌ Vui lòng chọn file Excel (.xlsx hoặc .xls)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Tìm sheet chứa dữ liệu điểm (bỏ qua sheet hướng dẫn)
            let dataSheetName = workbook.SheetNames.find(name => name !== 'Hướng dẫn');
            if (!dataSheetName) dataSheetName = workbook.SheetNames[0];
            
            const dataSheet = workbook.Sheets[dataSheetName];
            const jsonData = XLSX.utils.sheet_to_json(dataSheet);
            
            processImportedScores(jsonData);
            
        } catch (error) {
            showUploadMessage('❌ Lỗi khi đọc file Excel: ' + error.message, 'error');
        }
    };
    reader.onerror = function() {
        showUploadMessage('❌ Lỗi khi đọc file. Vui lòng thử lại.', 'error');
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
}

// Hàm xử lý dữ liệu điểm import
function processImportedScores(data) {
    const selectedClass = scoreClass.value;
    const selectedSubject = scoreSubject.value;
    const selectedType = scoreType.value;
    
    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];
    const successUpdates = [];
    
    data.forEach((row, index) => {
        try {
            const studentId = (row['Mã HS'] || '').toString().trim().toUpperCase();
            const scoreValue = row['Điểm'];
            
            // Validate student exists
            const student = students.find(s => s.id === studentId && s.class === selectedClass);
            if (!student) {
                errors.push(`Dòng ${index + 2}: Không tìm thấy học sinh ${studentId} trong lớp ${selectedClass}`);
                errorCount++;
                return;
            }
            
            // Validate score - cho phép để trống
            if (scoreValue === '' || scoreValue === null || scoreValue === undefined) {
                // Xóa điểm nếu để trống
                const oldScore = scores[student.id]?.[selectedSubject]?.[selectedType];
                if (scores[student.id] && scores[student.id][selectedSubject]) {
                    scores[student.id][selectedSubject][selectedType] = null;
                }
                processedCount++;
                if (oldScore !== null && oldScore !== undefined) {
                    updatedCount++;
                    successUpdates.push(`🗑️ ${student.name} (${studentId}): Đã xóa điểm`);
                }
                return;
            }
            
            const score = parseFloat(scoreValue);
            if (isNaN(score) || score < 0 || score > 10) {
                errors.push(`Dòng ${index + 2}: Điểm không hợp lệ "${scoreValue}" - phải từ 0 đến 10`);
                errorCount++;
                return;
            }
            
            // Lưu điểm
            if (!scores[studentId]) scores[studentId] = {};
            if (!scores[studentId][selectedSubject]) scores[studentId][selectedSubject] = {};
            
            const oldScore = scores[studentId][selectedSubject][selectedType];
            scores[studentId][selectedSubject][selectedType] = score;
            
            processedCount++;
            if (oldScore !== score) {
                updatedCount++;
                successUpdates.push(`✅ ${student.name} (${studentId}): ${oldScore || 'Chưa có'} → ${score}`);
            }
            
        } catch (error) {
            errors.push(`Dòng ${index + 2}: Lỗi xử lý - ${error.message}`);
            errorCount++;
        }
    });
    
  // Lưu dữ liệu
    saveDataToLocalStorage();
    updateDashboardStats();
    
    // Hiển thị kết quả chi tiết
    let message = '📊 KẾT QUẢ IMPORT ĐIỂM\n';
    message += '─────────────────────\n';
    message += `✅ Đã xử lý: ${processedCount} học sinh\n`;
    message += `✏️ Cập nhật điểm: ${updatedCount} học sinh\n`;
    if (errorCount > 0) message += `❌ Lỗi: ${errorCount} dòng\n`;
    
    if (successUpdates.length > 0) {
        message += '\n📝 CHI TIẾT CẬP NHẬT:\n';
        successUpdates.slice(0, 10).forEach(update => message += `${update}\n`);
        if (successUpdates.length > 10) message += `... và ${successUpdates.length - 10} cập nhật khác\n`;
    }
    
    if (errors.length > 0) {
        message += '\n🚨 LỖI CẦN SỬA:\n';
        errors.slice(0, 5).forEach(error => message += `• ${error}\n`);
        if (errors.length > 5) message += `• ... và ${errors.length - 5} lỗi khác\n`;
    }
    
    showUploadMessage(message, errorCount > 0 ? 'warning' : 'success');
    
    // Cập nhật lại giao diện
    updateScoreInputTable();
}

// Hàm hiển thị bảng nhập điểm trực tiếp
function showDirectInputTable() {
    const selectedClass = scoreClass.value;
    const selectedSubject = scoreSubject.value;
    const selectedType = scoreType.value;
    const classStudents = students.filter(s => s.class === selectedClass);
    
    const typeName = getScoreTypeName(selectedType);
    const subjectName = subjects[selectedSubject];
    
    let tableHTML = `
        <div class="direct-input-table">
            <div class="table-header">
                <h5><i class="fas fa-edit"></i> Nhập điểm trực tiếp - ${typeName} - ${subjectName} - Lớp ${selectedClass}</h5>
                <button class="btn btn-sm btn-outline" onclick="hideDirectInputTable()">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
            <div class="table-container">
                <table class="score-input-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã HS</th>
                            <th>Họ Tên</th>
                            <th>Lớp</th>
                            <th>Điểm ${typeName}</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    classStudents.forEach((student, index) => {
        const currentScore = scores[student.id]?.[selectedSubject]?.[selectedType] || '';
        const status = currentScore !== '' ? 'Đã nhập' : 'Chưa nhập';
        
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${student.id}</strong></td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>
                    <input type="number" min="0" max="10" step="0.1" 
                           class="score-input" 
                           data-student="${student.id}" 
                           data-subject="${selectedSubject}"
                           data-type="${selectedType}"
                           value="${currentScore}"
                           placeholder="0.0">
                </td>
                <td class="score-status">${status}</td>
            </tr>
        `;
    });
    
    tableHTML += `
                    </tbody>
                </table>
            </div>
            <div class="table-actions">
                <button class="btn btn-success" onclick="saveAllScores()">
                    <i class="fas fa-save"></i> Lưu Tất Cả Điểm
                </button>
                <div class="auto-save-indicator" id="auto-save-indicator">
                    <i class="fas fa-check"></i> Đã lưu tự động
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('direct-input-section').innerHTML = tableHTML;
    document.getElementById('direct-input-section').style.display = 'block';
    
    // Thêm event listeners cho các ô nhập điểm
    const scoreInputs = document.querySelectorAll('.score-input');
    scoreInputs.forEach(input => {
        input.addEventListener('input', handleScoreInput);
        input.addEventListener('blur', handleScoreBlur);
    });
}

// Hàm ẩn bảng nhập điểm trực tiếp
function hideDirectInputTable() {
    document.getElementById('direct-input-section').style.display = 'none';
}

// Hàm hiển thị thông báo upload
function showUploadMessage(message, type = 'info') {
    // Tạo thông báo tạm thời
    const notification = document.createElement('div');
    notification.className = `upload-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <pre>${message}</pre>
        </div>
    `;
    
    // Thêm CSS cho notification nếu chưa có
    if (!document.querySelector('#upload-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'upload-notification-styles';
        style.textContent = `
            .upload-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                max-width: 400px;
                border-left: 4px solid #3498db;
            }
            .upload-notification.success {
                border-left-color: #27ae60;
            }
            .upload-notification.error {
                border-left-color: #e74c3c;
            }
            .upload-notification.warning {
                border-left-color: #f39c12;
            }
            .notification-content {
                padding: 15px;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }
            .notification-content i {
                margin-top: 2px;
                flex-shrink: 0;
            }
            .notification-content pre {
                margin: 0;
                white-space: pre-wrap;
                font-family: inherit;
                font-size: 14px;
                line-height: 1.4;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Tự động xóa sau 5 giây
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Cập nhật hàm updateScoreInputTable để sử dụng tính năng upload
function updateScoreInputTable() {
    console.log('Hàm updateScoreInputTable được gọi');
    
    const selectedClass = scoreClass.value;
    const selectedSubject = scoreSubject.value;
    const selectedType = scoreType.value;
    
    console.log('Lớp được chọn:', selectedClass);
    console.log('Môn được chọn:', selectedSubject);
    console.log('Loại điểm:', selectedType);
    console.log('Tổng số học sinh:', students.length);
    
    scoreInputSection.innerHTML = '';
    
    if (!selectedClass || !selectedSubject) {
        console.log('Chưa chọn đủ lớp hoặc môn');
        scoreInputSection.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-clipboard-list fa-3x"></i>
                <h3>Chọn lớp và môn học để nhập điểm</h3>
                <p>Hãy chọn lớp, môn học và loại điểm để bắt đầu nhập điểm cho học sinh.</p>
            </div>
        `;
        return;
    }
    
    const classStudents = students.filter(s => s.class === selectedClass);
    console.log('Số học sinh trong lớp:', classStudents.length);
    
    if (classStudents.length === 0) {
        console.log('Không có học sinh trong lớp được chọn');
        scoreInputSection.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-users-slash fa-3x"></i>
                <h3>Không có học sinh trong lớp này</h3>
                <p>Lớp ${selectedClass} hiện không có học sinh nào.</p>
                <button class="btn btn-primary" onclick="addSampleStudents(); updateScoreInputTable();">
                    <i class="fas fa-plus"></i> Thêm Học Sinh Mẫu
                </button>
            </div>
        `;
        return;
    }
    
    const typeName = getScoreTypeName(selectedType);
    const subjectName = subjects[selectedSubject];
    
    // Tạo giao diện với nút tải template
    scoreInputSection.innerHTML = `
        <div class="score-upload-section">
            <div class="upload-header">
                <h4><i class="fas fa-file-excel"></i> Nhập Điểm ${typeName} - ${subjectName} - Lớp ${selectedClass}</h4>
                <p>Có 2 cách nhập điểm:</p>
            </div>
            
            <div class="upload-options">
                <div class="upload-option">
                    <div class="option-header">
                        <i class="fas fa-download fa-2x"></i>
                        <h5>Nhập bằng Excel</h5>
                    </div>
                    <p>Tải template Excel, nhập điểm và upload lại</p>
                    <button class="btn btn-success" onclick="downloadScoreTemplate()">
                        <i class="fas fa-file-download"></i> Tải Template Excel
                    </button>
                    <div class="upload-area" id="excel-upload-area">
                        <i class="fas fa-cloud-upload-alt fa-2x"></i>
                        <p>Kéo file Excel vào đây hoặc</p>
                        <button class="btn btn-outline" onclick="document.getElementById('score-file-input').click()">
                            <i class="fas fa-folder-open"></i> Chọn File
                        </button>
                        <input type="file" id="score-file-input" accept=".xlsx, .xls" style="display: none;" onchange="handleScoreFileImport(event)">
                    </div>
                </div>
                
                <div class="upload-option">
                    <div class="option-header">
                        <i class="fas fa-edit fa-2x"></i>
                        <h5>Nhập trực tiếp</h5>
                    </div>
                    <p>Nhập điểm trực tiếp trên bảng bên dưới</p>
                    <button class="btn btn-primary" onclick="showDirectInputTable()">
                        <i class="fas fa-table"></i> Hiện Bảng Nhập Điểm
                    </button>
                </div>
            </div>
            
            <div class="upload-instructions">
                <h5><i class="fas fa-info-circle"></i> Hướng dẫn nhập điểm bằng Excel:</h5>
                <ul>
                    <li>Tải template Excel về máy</li>
                    <li>Nhập điểm vào cột "Điểm" (từ 0 đến 10)</li>
                    <li>Để trống nếu chưa có điểm</li>
                    <li>KHÔNG sửa các cột khác (Mã HS, Họ Tên, Lớp)</li>
                    <li>Lưu file và upload lại lên hệ thống</li>
                </ul>
            </div>
            
            <div class="direct-input-section" id="direct-input-section" style="display: none;">
                <!-- Bảng nhập điểm trực tiếp sẽ được thêm ở đây -->
            </div>
        </div>
    `;
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    initializeScoreUpload();
});