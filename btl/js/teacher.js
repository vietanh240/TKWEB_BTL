// Dữ liệu mẫu và cấu hình
const subjects = {
    'toan': 'Toán',
    'van': 'Ngữ Văn', 
    'anh': 'Tiếng Anh',
    'ly': 'Vật Lý',
    'hoa': 'Hóa Học',
    'sinh': 'Sinh Học',
    'su': 'Lịch Sử',
    'dia': 'Địa Lý',
    'gdcd': 'GDCD',
    'theduc': 'Thể Dục'
};

const scoreWeights = {
    '15p1': 1,
    '15p2': 1, 
    '45p1': 2,
    'giuaky': 2,
    'cuoiky': 3
};

// Biến toàn cục
let students = [];
let scores = {};
let currentTeacher = null;
let currentTeacherSubjects = [];
let currentAction = null;
let currentStudentId = null;

// DOM Elements
const teacherSchoolName = document.getElementById('teacher-school-name');
const teacherSchoolSlogan = document.getElementById('teacher-school-slogan');
const teacherInfo = document.getElementById('teacher-info');
const teacherLogout = document.getElementById('teacher-logout');

// Stats elements
const totalStudentsCount = document.getElementById('total-students-count');
const totalSubjectsCount = document.getElementById('total-subjects-count');
const averageScore = document.getElementById('average-score');
const excellentStudents = document.getElementById('excellent-students');

// Tab elements
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

// Students tab elements
const studentsTbody = document.getElementById('students-tbody');
const studentModal = document.getElementById('student-modal');
const addStudentBtn = document.getElementById('add-student-btn');
const studentForm = document.getElementById('student-form');
const studentSearch = document.getElementById('student-search');
const filterClass = document.getElementById('filter-class');
const filterGrade = document.getElementById('filter-grade');
const clearFilters = document.getElementById('clear-filters');
const importStudentsBtn = document.getElementById('import-students-btn');
const exportStudentsBtn = document.getElementById('export-students-btn');
const downloadTemplateBtn = document.getElementById('download-template-btn');

// Subjects tab elements
const subjectsGrid = document.getElementById('subjects-grid');

// Scores tab elements
const scoreClass = document.getElementById('score-class');
const scoreSubject = document.getElementById('score-subject');
const scoreSemester = document.getElementById('score-semester');
const scoreType = document.getElementById('score-type');
const loadScoresBtn = document.getElementById('load-scores-btn');
const scoreInputSection = document.getElementById('score-input-section');

// Reports tab elements
const reportClass = document.getElementById('report-class');
const reportSubject = document.getElementById('report-subject');
const reportSemester = document.getElementById('report-semester');
const generateReportBtn = document.getElementById('generate-report');
const exportReportBtn = document.getElementById('export-report');
const reportContent = document.getElementById('report-content');

// Modal elements
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const cancelConfirm = document.getElementById('cancel-confirm');
const confirmAction = document.getElementById('confirm-action');
const fileInput = document.getElementById('file-input');

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', function() {
    checkTeacherLogin();
    initializeTeacherData();
    initializeTabs();
    loadStudents();
    updateClassSelects();
    updateDashboardStats();
    initializeEventListeners();
    initializeScores();
    checkStudentData();
});

// Kiểm tra đăng nhập giáo viên
function checkTeacherLogin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.type !== 'teacher') {
        alert('Vui lòng đăng nhập với tài khoản giáo viên!');
        window.location.href = 'index.html';
        return;
    }
    
    currentTeacher = currentUser.username;
    currentTeacherSubjects = Array.isArray(currentUser.subject) 
        ? currentUser.subject 
        : [currentUser.subject];
    
    // Cập nhật thông tin giáo viên
    teacherInfo.textContent = currentUser.name;
    
    const studentCount = students.length;
    const subjectNames = currentTeacherSubjects.map(sub => subjects[sub]).join(', ');
    
    if (currentUser.school) {
        teacherSchoolName.textContent = `${currentUser.school} - QUẢN LÝ ĐIỂM`;
        teacherSchoolSlogan.textContent = `Giáo viên: ${currentUser.name} - Môn: ${subjectNames} - ${studentCount} học sinh`;
    }
}

// Khởi tạo dữ liệu giáo viên
function initializeTeacherData() {
    const allStudents = JSON.parse(localStorage.getItem('students')) || {};
    const allScores = JSON.parse(localStorage.getItem('scores')) || {};
    
    // Lấy dữ liệu của giáo viên hiện tại
    students = allStudents[currentTeacher] || [];
    scores = allScores[currentTeacher] || {};
    
    console.log(`Đã tải dữ liệu cho giáo viên ${currentTeacher}: ${students.length} học sinh`);
    
    // Khởi tạo dữ liệu mẫu nếu chưa có
    if (students.length === 0) {
        addSampleStudents();
    }
}

// Hàm lưu dữ liệu theo tài khoản
function saveDataToLocalStorage() {
    const allStudents = JSON.parse(localStorage.getItem('students')) || {};
    const allScores = JSON.parse(localStorage.getItem('scores')) || {};
    
    allStudents[currentTeacher] = students;
    allScores[currentTeacher] = scores;
    
    localStorage.setItem('students', JSON.stringify(allStudents));
    localStorage.setItem('scores', JSON.stringify(allScores));
    
    console.log(`Đã lưu dữ liệu cho giáo viên ${currentTeacher}`);
}

// Thêm hàm tạo học sinh mẫu
function addSampleStudents() {
    const sampleStudents = [
        {
            id: 'HS001',
            name: 'Nguyễn Văn A',
            dob: '2007-05-15',
            grade: '10',
            class: '10A1',
            year: '2023-2024'
        },
        {
            id: 'HS002', 
            name: 'Trần Thị B',
            dob: '2007-08-20',
            grade: '10',
            class: '10A1',
            year: '2023-2024'
        },
        {
            id: 'HS003',
            name: 'Lê Văn C',
            dob: '2007-03-10',
            grade: '10',
            class: '10A2',
            year: '2023-2024'
        }
    ];
    
    students = [...sampleStudents];
    
    // Khởi tạo điểm mẫu
    sampleStudents.forEach(student => {
        if (!scores[student.id]) {
            scores[student.id] = {};
        }
        currentTeacherSubjects.forEach(subject => {
            if (!scores[student.id][subject]) {
                scores[student.id][subject] = {
                    '15p1': null,
                    '15p2': null, 
                    '45p1': null,
                    'giuaky': null,
                    'cuoiky': null
                };
            }
        });
    });
    
    saveDataToLocalStorage();
    loadStudents();
    updateClassSelects();
    updateDashboardStats();
    
    console.log('Đã thêm học sinh mẫu');
}

// Khởi tạo tabs
function initializeTabs() {
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Cập nhật dữ liệu khi chuyển tab
            if (tabId === 'subjects') {
                loadSubjects();
            } else if (tabId === 'scores') {
                updateScoreSubjectSelect();
            } else if (tabId === 'reports') {
                updateReportSubjectSelect();
            }
        });
    });
}

// Khởi tạo event listeners
function initializeEventListeners() {
    // Modal học sinh
    addStudentBtn.addEventListener('click', () => openStudentModal());
    document.querySelector('#student-modal .close').addEventListener('click', () => closeModal(studentModal));
    document.getElementById('cancel-student').addEventListener('click', () => closeModal(studentModal));
    
    // Form submit
    studentForm.addEventListener('submit', handleStudentSubmit);
    
    // Tìm kiếm và lọc
    studentSearch.addEventListener('input', filterStudents);
    filterClass.addEventListener('change', filterStudents);
    filterGrade.addEventListener('change', filterStudents);
    clearFilters.addEventListener('click', clearAllFilters);
    
    // Import/Export
    importStudentsBtn.addEventListener('click', () => fileInput.click());
    exportStudentsBtn.addEventListener('click', exportStudentsToExcel);
    downloadTemplateBtn.addEventListener('click', downloadStudentTemplate);
    fileInput.addEventListener('change', handleFileImport);
    
    // Nhập điểm
    loadScoresBtn.addEventListener('click', function() {
    console.log('Nút Tải DS Nhập Điểm được click');
    updateScoreInputTable();
    });

    document.addEventListener('click', function(e) {
    if (e.target.closest('#excel-upload-area')) {
        document.getElementById('score-file-input').click();
    }
    });
    
    // Báo cáo
    generateReportBtn.addEventListener('click', generateReport);
    exportReportBtn.addEventListener('click', exportReportToExcel);
    
    // Đăng xuất
    teacherLogout.addEventListener('click', logout);
    
    // Modal xác nhận
    document.querySelector('#confirm-modal .close').addEventListener('click', () => closeModal(confirmModal));
    cancelConfirm.addEventListener('click', () => closeModal(confirmModal));
    confirmAction.addEventListener('click', handleConfirmAction);
    
    // Đóng modal khi click bên ngoài
    window.addEventListener('click', (e) => {
        if (e.target === studentModal) closeModal(studentModal);
        if (e.target === confirmModal) closeModal(confirmModal);
    });
}

// Đăng xuất
function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Khởi tạo dữ liệu điểm
function initializeScores() {
    let needsSave = false;
    
    students.forEach(student => {
        if (!scores[student.id]) {
            scores[student.id] = {};
            needsSave = true;
        }
        
        currentTeacherSubjects.forEach(subject => {
            if (!scores[student.id][subject]) {
                scores[student.id][subject] = {
                    '15p1': null,
                    '15p2': null,
                    '45p1': null,
                    'giuaky': null,
                    'cuoiky': null
                };
                needsSave = true;
            }
        });
    });
    
    if (needsSave) {
        saveDataToLocalStorage();
    }
}

// Modal functions
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
    if (modal === studentModal) {
        studentForm.reset();
        document.getElementById('modal-title').textContent = 'Thêm Học Sinh Mới';
        document.getElementById('save-button-text').textContent = 'Lưu Học Sinh';
        document.getElementById('edit-student-id').value = '';
        document.getElementById('student-id').readOnly = false;
    }
}

// Mở modal thêm/sửa học sinh
function openStudentModal(student = null) {
    if (student) {
        // Chế độ sửa
        document.getElementById('modal-title').textContent = 'Sửa Thông Tin Học Sinh';
        document.getElementById('save-button-text').textContent = 'Cập Nhật';
        document.getElementById('edit-student-id').value = student.id;
        document.getElementById('student-id').value = student.id;
        document.getElementById('student-id').readOnly = true;
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-dob').value = student.dob;
        document.getElementById('student-grade').value = student.grade;
        document.getElementById('student-class').value = student.class;
        document.getElementById('student-year').value = student.year || '2023-2024';
    } else {
        // Chế độ thêm
        document.getElementById('modal-title').textContent = 'Thêm Học Sinh Mới';
        document.getElementById('save-button-text').textContent = 'Lưu Học Sinh';
        document.getElementById('edit-student-id').value = '';
        document.getElementById('student-id').readOnly = false;
    }
    openModal(studentModal);
}

// Xử lý thêm/sửa học sinh
function handleStudentSubmit(e) {
    e.preventDefault();
    
    const editId = document.getElementById('edit-student-id').value;
    const studentId = document.getElementById('student-id').value.trim().toUpperCase();
    const studentName = document.getElementById('student-name').value.trim();
    const studentDob = document.getElementById('student-dob').value;
    const studentGrade = document.getElementById('student-grade').value;
    const studentClass = document.getElementById('student-class').value.trim().toUpperCase();
    const studentYear = document.getElementById('student-year').value;

    // Validate
    if (!/^HS\d{3,}$/.test(studentId)) {
        alert('Mã học sinh phải bắt đầu bằng "HS" và theo sau là số (VD: HS001)');
        return;
    }

    if (editId) {
        // Sửa học sinh
        const studentIndex = students.findIndex(s => s.id === editId);
        if (studentIndex !== -1) {
            students[studentIndex] = {
                ...students[studentIndex],
                id: studentId,
                name: studentName,
                dob: studentDob,
                grade: studentGrade,
                class: studentClass,
                year: studentYear
            };
            
            // Cập nhật key trong scores nếu mã HS thay đổi
            if (editId !== studentId) {
                scores[studentId] = scores[editId] || {};
                delete scores[editId];
            }
            
            saveDataToLocalStorage();
            loadStudents();
            updateClassSelects();
            updateDashboardStats();
            closeModal(studentModal);
            
            alert(`✅ Đã cập nhật thông tin học sinh:\n${studentName} (${studentId})`);
        }
    } else {
        // Thêm học sinh mới
        if (students.find(s => s.id === studentId)) {
            alert('Mã học sinh đã tồn tại! Vui lòng chọn mã khác.');
            return;
        }

        const newStudent = {
            id: studentId,
            name: studentName,
            dob: studentDob,
            grade: studentGrade,
            class: studentClass,
            year: studentYear
        };

        students.push(newStudent);
        
        // Khởi tạo điểm cho học sinh mới
        if (!scores[studentId]) {
            scores[studentId] = {};
        }
        
        currentTeacherSubjects.forEach(subject => {
            if (!scores[studentId][subject]) {
                scores[studentId][subject] = {
                    '15p1': null,
                    '15p2': null,
                    '45p1': null,
                    'giuaky': null,
                    'cuoiky': null
                };
            }
        });

        saveDataToLocalStorage();
        loadStudents();
        updateClassSelects();
        updateDashboardStats();
        closeModal(studentModal);
        
        alert(`✅ Đã thêm học sinh mới:\n${studentName} (${studentId})\nLớp: ${studentClass}`);
    }
}

// Tải danh sách học sinh
function loadStudents() {
    studentsTbody.innerHTML = '';
    
    const filteredStudents = getFilteredStudents();
    
    if (filteredStudents.length === 0) {
        studentsTbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-users-slash fa-2x" style="margin-bottom: 10px;"></i>
                    <p>Không có học sinh nào phù hợp</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredStudents.forEach((student, index) => {
        const row = document.createElement('tr');
        const gpa = calculateStudentGPA(student.id);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${student.id}</strong></td>
            <td>${student.name}</td>
            <td>${formatDate(student.dob)}</td>
            <td><span class="class-badge">${student.class}</span></td>
            <td>Khối ${student.grade}</td>
            <td>${student.year || '2023-2024'}</td>
            <td class="${getGradeClass(gpa)}">${gpa > 0 ? gpa.toFixed(1) : 'Chưa có'}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="openStudentModal(${JSON.stringify(student).replace(/"/g, '&quot;')})">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteStudent('${student.id}')">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </td>
        `;
        
        studentsTbody.appendChild(row);
    });
}

// Lọc học sinh
function getFilteredStudents() {
    let filtered = [...students];
    const searchTerm = studentSearch.value.toLowerCase();
    const classFilter = filterClass.value;
    const gradeFilter = filterGrade.value;
    
    if (searchTerm) {
        filtered = filtered.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.id.toLowerCase().includes(searchTerm) ||
            student.class.toLowerCase().includes(searchTerm)
        );
    }
    
    if (classFilter) {
        filtered = filtered.filter(student => student.class === classFilter);
    }
    
    if (gradeFilter) {
        filtered = filtered.filter(student => student.grade === gradeFilter);
    }
    
    return filtered.sort((a, b) => {
        if (a.class !== b.class) return a.class.localeCompare(b.class);
        return a.name.localeCompare(b.name);
    });
}

function filterStudents() {
    loadStudents();
}

function clearAllFilters() {
    studentSearch.value = '';
    filterClass.value = '';
    filterGrade.value = '';
    loadStudents();
}

// Xác nhận xóa học sinh
function confirmDeleteStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    currentAction = 'deleteStudent';
    currentStudentId = studentId;
    confirmMessage.textContent = `Bạn có chắc chắn muốn xóa học sinh:\n${student.name} (${studentId})?\n\nToàn bộ điểm số của học sinh này cũng sẽ bị xóa.`;
    openModal(confirmModal);
}

// Xử lý hành động xác nhận
function handleConfirmAction() {
    switch (currentAction) {
        case 'deleteStudent':
            deleteStudent(currentStudentId);
            break;
    }
    closeModal(confirmModal);
    currentAction = null;
    currentStudentId = null;
}

// Xóa học sinh
function deleteStudent(studentId) {
    const studentName = getStudentName(studentId);
    
    students = students.filter(s => s.id !== studentId);
    delete scores[studentId];
    
    saveDataToLocalStorage();
    loadStudents();
    updateClassSelects();
    updateDashboardStats();
    
    alert(`✅ Đã xóa học sinh:\n${studentName} (${studentId})`);
}

// Cập nhật dropdown chọn lớp
function updateClassSelects() {
    const classes = [...new Set(students.map(s => s.class))].sort();
    console.log('Các lớp có sẵn để cập nhật dropdown:', classes);
    // Cập nhật cho tất cả dropdown
    [filterClass, scoreClass, reportClass].forEach(select => {
        const currentValue = select.value;
        select.innerHTML = select.id === 'filter-class' ? '<option value="">Tất cả lớp</option>' : 
                          select.id === 'score-class' ? '<option value="">-- Chọn lớp --</option>' : 
                          '<option value="">Tất cả lớp</option>';
        
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            select.appendChild(option);
        });
        
        // Giữ lại giá trị cũ nếu vẫn tồn tại
        if (classes.includes(currentValue)) {
            select.value = currentValue;
        }
    });
}

// Cập nhật dropdown môn học
function updateScoreSubjectSelect() {
    scoreSubject.innerHTML = '<option value="">-- Chọn môn --</option>';
    currentTeacherSubjects.forEach(subjectKey => {
        const option = document.createElement('option');
        option.value = subjectKey;
        option.textContent = subjects[subjectKey];
        scoreSubject.appendChild(option);
    });
}

function updateReportSubjectSelect() {
    reportSubject.innerHTML = '<option value="">Tất cả môn</option>';
    currentTeacherSubjects.forEach(subjectKey => {
        const option = document.createElement('option');
        option.value = subjectKey;
        option.textContent = subjects[subjectKey];
        reportSubject.appendChild(option);
    });
}

// Cập nhật thống kê dashboard
function updateDashboardStats() {
    totalStudentsCount.textContent = students.length;
    
    // Tính số lớp đảm nhiệm
    const classes = [...new Set(students.map(s => s.class))];
    document.getElementById('total-classes-count').textContent = classes.length;
    
    // Tính điểm trung bình
    let totalGPA = 0;
    let studentCount = 0;
    
    students.forEach(student => {
        const gpa = calculateStudentGPA(student.id);
        if (gpa > 0) {
            totalGPA += gpa;
            studentCount++;
        }
    });
    
    const avgGPA = studentCount > 0 ? totalGPA / studentCount : 0;
    averageScore.textContent = avgGPA.toFixed(1);
    
    // Đếm học sinh xuất sắc
    const excellentCount = students.filter(student => {
        const gpa = calculateStudentGPA(student.id);
        return gpa >= 8.0;
    }).length;
    
    excellentStudents.textContent = excellentCount;
}

// Tải thông tin lớp học
function loadClasses() {
    const classesGrid = document.getElementById('classes-grid');
    const classes = [...new Set(students.map(s => s.class))].sort();
    
    classesGrid.innerHTML = '';
    
    classes.forEach(className => {
        const classStudents = students.filter(s => s.class === className);
        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        
        // Tính điểm trung bình của lớp
        let classGPA = 0;
        let studentCount = 0;
        
        classStudents.forEach(student => {
            const gpa = calculateStudentGPA(student.id);
            if (gpa > 0) {
                classGPA += gpa;
                studentCount++;
            }
        });
        
        const avgGPA = studentCount > 0 ? (classGPA / studentCount).toFixed(1) : 'Chưa có';
        
        classCard.innerHTML = `
            <h5><i class="fas fa-chalkboard"></i> Lớp ${className}</h5>
            <div class="class-stats">
                <div class="stat">
                    <span class="stat-value">${classStudents.length}</span>
                    <span class="stat-label">Học sinh</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${avgGPA}</span>
                    <span class="stat-label">Điểm TB</span>
                </div>
            </div>
            <div class="class-subjects">
                <span>Môn dạy: ${currentTeacherSubjects.map(sub => subjects[sub]).join(', ')}</span>
            </div>
        `;
        
        classesGrid.appendChild(classCard);
    });
}
// Cập nhật thông tin giảng dạy
function updateTeachingInfo() {
    document.getElementById('teacher-name-display').textContent = currentTeacher;
    document.getElementById('teacher-subjects-display').textContent = 
        currentTeacherSubjects.map(sub => subjects[sub]).join(', ');
    document.getElementById('total-students-display').textContent = students.length;
}

// Trong hàm initializeTabs, thêm xử lý cho tab classes
function initializeTabs() {
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Cập nhật dữ liệu khi chuyển tab
            if (tabId === 'classes') {
                loadClasses();
                updateTeachingInfo();
            } else if (tabId === 'scores') {
                updateScoreSubjectSelect();
            } else if (tabId === 'reports') {
                updateReportSubjectSelect();
            }
        });
    });
}

// Tính điểm trung bình học sinh
function calculateStudentGPA(studentId) {
    const studentScores = scores[studentId];
    if (!studentScores) return 0;
    
    let totalScore = 0;
    let subjectCount = 0;
    
    currentTeacherSubjects.forEach(subject => {
        const subjectScores = studentScores[subject];
        if (subjectScores) {
            const average = calculateSubjectAverage(subjectScores);
            if (average !== null) {
                totalScore += average;
                subjectCount++;
            }
        }
    });
    
    return subjectCount > 0 ? totalScore / subjectCount : 0;
}

// Tải môn học
function loadSubjects() {
    subjectsGrid.innerHTML = '';
    
    currentTeacherSubjects.forEach(subjectKey => {
        const subjectCard = document.createElement('div');
        subjectCard.className = 'subject-card';
        subjectCard.innerHTML = `
            <h5><i class="fas fa-book"></i> ${subjects[subjectKey]}</h5>
            <p>2 bài 15p • 1 bài 45p • 1 GK • 1 CK</p>
        `;
        subjectsGrid.appendChild(subjectCard);
    });
}


// Cập nhật bảng nhập điểm
function updateScoreInputTable() {
    // Hàm này đã được chuyển sang score-upload.js
    console.log('Gọi hàm updateScoreInputTable từ score-upload.js');
}
// Xử lý nhập điểm
function handleScoreInput(e) {
    const input = e.target;
    const value = parseFloat(input.value);
    
    // Validate
    if (input.value && (isNaN(value) || value < 0 || value > 10)) {
        input.classList.add('invalid');
    } else {
        input.classList.remove('invalid');
        // Auto-save sau 2 giây không nhập
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            saveScore(input);
        }, 2000);
    }
}

function handleScoreBlur(e) {
    const input = e.target;
    if (!input.classList.contains('invalid')) {
        saveScore(input);
    }
}

function saveScore(input) {
    const studentId = input.getAttribute('data-student');
    const subject = input.getAttribute('data-subject');
    const type = input.getAttribute('data-type');
    const value = input.value ? parseFloat(input.value) : null;
    
    if (value !== null && (value < 0 || value > 10)) {
        return;
    }
    
    // Cập nhật điểm
    if (!scores[studentId]) scores[studentId] = {};
    if (!scores[studentId][subject]) scores[studentId][subject] = {};
    scores[studentId][subject][type] = value;
    
    // Cập nhật trạng thái
    const row = input.closest('tr');
    const statusCell = row.querySelector('.score-status');
    statusCell.textContent = value !== null ? 'Đã nhập' : 'Chưa nhập';
    
    // Hiển thị thông báo auto-save
    showAutoSaveIndicator();
    
    saveDataToLocalStorage();
    updateDashboardStats();
}

function saveAllScores() {
    const scoreInputs = document.querySelectorAll('.score-input');
    let savedCount = 0;
    
    scoreInputs.forEach(input => {
        if (!input.classList.contains('invalid')) {
            saveScore(input);
            savedCount++;
        }
    });
    
    alert(`✅ Đã lưu ${savedCount} điểm số!`);
}

function showAutoSaveIndicator() {
    const indicator = document.getElementById('auto-save-indicator');
    indicator.style.display = 'block';
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 3000);
}

// Tính điểm trung bình môn
function calculateSubjectAverage(subjectScores) {
    let totalWeight = 0;
    let weightedSum = 0;
    let hasScore = false;
    
    Object.keys(scoreWeights).forEach(type => {
        if (subjectScores[type] !== null && !isNaN(subjectScores[type])) {
            weightedSum += subjectScores[type] * scoreWeights[type];
            totalWeight += scoreWeights[type];
            hasScore = true;
        }
    });
    
    return hasScore ? weightedSum / totalWeight : null;
}

// Tạo báo cáo
function generateReport() {
    const selectedClass = reportClass.value;
    const selectedSubject = reportSubject.value;
    const selectedSemester = reportSemester.value;
    
    let reportStudents = students;
    if (selectedClass) {
        reportStudents = students.filter(s => s.class === selectedClass);
    }
    
    if (reportStudents.length === 0) {
        reportContent.innerHTML = `
            <div class="report-placeholder">
                <i class="fas fa-users-slash fa-3x"></i>
                <h3>Không có dữ liệu</h3>
                <p>Không tìm thấy học sinh phù hợp với tiêu chí đã chọn.</p>
            </div>
        `;
        return;
    }
    
    let reportHTML = `
        <div class="report-summary">
            <h4>Báo Cáo Tổng Quan</h4>
            <div class="summary-stats">
                <div class="stat-item">
                    <span>Số lượng học sinh:</span>
                    <span>${reportStudents.length}</span>
                </div>
                <div class="stat-item">
                    <span>Điểm trung bình:</span>
                    <span>${calculateReportAverage(reportStudents, selectedSubject).toFixed(2)}</span>
                </div>
                <div class="stat-item">
                    <span>Học sinh giỏi:</span>
                    <span>${countStudentsByGrade(reportStudents, selectedSubject, 8.0)}</span>
                </div>
                <div class="stat-item">
                    <span>Học sinh yếu:</span>
                    <span>${countStudentsByGrade(reportStudents, selectedSubject, 0, 5.0)}</span>
                </div>
            </div>
        </div>
    `;
    
    if (selectedSubject) {
        reportHTML += createSubjectReport(reportStudents, selectedSubject);
    } else {
        reportHTML += createOverallReport(reportStudents);
    }
    
    reportContent.innerHTML = reportHTML;
}

// Tạo báo cáo chi tiết
function createSubjectReport(students, subject) {
    let html = `
        <div class="detailed-scores">
            <h4>Điểm Chi Tiết Môn ${subjects[subject]}</h4>
            <table class="score-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã HS</th>
                        <th>Họ Tên</th>
                        <th>Lớp</th>
                        <th>15p1</th>
                        <th>15p2</th>
                        <th>45p</th>
                        <th>GK</th>
                        <th>CK</th>
                        <th>ĐTB</th>
                        <th>Xếp Loại</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    students.forEach((student, index) => {
        const subjectScores = scores[student.id]?.[subject] || {};
        const average = calculateSubjectAverage(subjectScores);
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${student.id}</strong></td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${subjectScores['15p1'] || '-'}</td>
                <td>${subjectScores['15p2'] || '-'}</td>
                <td>${subjectScores['45p1'] || '-'}</td>
                <td>${subjectScores['giuaky'] || '-'}</td>
                <td>${subjectScores['cuoiky'] || '-'}</td>
                <td class="${getGradeClass(average)}">${average !== null ? average.toFixed(1) : '-'}</td>
                <td>${getGradeText(average)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// Export functions
function downloadStudentTemplate() {
    try {
        const templateData = [{
            'Mã HS': 'HS001',
            'Họ Tên': 'Nguyễn Văn A',
            'Ngày Sinh': '2007-05-15',
            'Lớp': '10A1',
            'Khối': '10',
            'Năm Học': '2023-2024'
        }];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template import');
        XLSX.writeFile(wb, 'template_hoc_sinh.xlsx');
        
    } catch (error) {
        alert('Lỗi khi tạo template: ' + error.message);
    }
}
// Kiểm tra dữ liệu học sinh
function checkStudentData() {
    console.log('=== KIỂM TRA DỮ LIỆU HỌC SINH ===');
    console.log('Tổng số học sinh:', students.length);
    console.log('Các lớp có sẵn:', [...new Set(students.map(s => s.class))]);
    console.log('Dữ liệu học sinh:', students);
    
    if (students.length === 0) {
        console.warn('CHÚ Ý: Không có học sinh nào trong danh sách!');
        // Tự động thêm học sinh mẫu nếu danh sách trống
        addSampleStudents();
    }
}


function exportStudentsToExcel() {
    try {
        const studentData = students.map(student => ({
            'Mã HS': student.id,
            'Họ Tên': student.name,
            'Ngày Sinh': student.dob,
            'Lớp': student.class,
            'Khối': student.grade,
            'Năm Học': student.year || '2023-2024',
            'Điểm TB': calculateStudentGPA(student.id).toFixed(1)
        }));

        const ws = XLSX.utils.json_to_sheet(studentData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học sinh');
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        XLSX.writeFile(wb, `danh_sach_hoc_sinh_${currentUser.name}.xlsx`);
        
    } catch (error) {
        alert('Lỗi khi xuất file: ' + error.message);
    }
}

function exportReportToExcel() {
    // Tương tự như exportStudentsToExcel nhưng cho báo cáo
    alert('Tính năng xuất báo cáo Excel sẽ được triển khai!');
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('vi-VN');
}

function getStudentName(studentId) {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
}

function getScoreTypeName(type) {
    const types = {
        '15p1': '15 phút 1',
        '15p2': '15 phút 2',
        '45p1': '45 phút',
        'giuaky': 'Giữa kỳ',
        'cuoiky': 'Cuối kỳ'
    };
    return types[type] || type;
}

function getGradeClass(average) {
    if (average === null || average === 0) return '';
    if (average >= 8.0) return 'grade-A';
    if (average >= 6.5) return 'grade-B';
    if (average >= 5.0) return 'grade-C';
    if (average >= 4.0) return 'grade-D';
    return 'grade-F';
}

function getGradeText(average) {
    if (average === null || average === 0) return '-';
    if (average >= 8.0) return 'Giỏi';
    if (average >= 6.5) return 'Khá';
    if (average >= 5.0) return 'Trung bình';
    if (average >= 4.0) return 'Yếu';
    return 'Kém';
}

function calculateReportAverage(students, subject) {
    let totalScore = 0;
    let count = 0;
    
    students.forEach(student => {
        let score;
        if (subject) {
            const subjectScores = scores[student.id]?.[subject] || {};
            score = calculateSubjectAverage(subjectScores);
        } else {
            score = calculateStudentGPA(student.id);
        }
        
        if (score !== null && score > 0) {
            totalScore += score;
            count++;
        }
    });
    
    return count > 0 ? totalScore / count : 0;
}

function countStudentsByGrade(students, subject, minScore, maxScore = 10) {
    return students.filter(student => {
        let score;
        if (subject) {
            const subjectScores = scores[student.id]?.[subject] || {};
            score = calculateSubjectAverage(subjectScores);
        } else {
            score = calculateStudentGPA(student.id);
        }
        
        return score !== null && score >= minScore && score <= maxScore;
    }).length;
}

// Thêm các hàm xử lý import file (tương tự như trong code trước)
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            processImportedData(jsonData);
        } catch (error) {
            alert('Lỗi khi đọc file Excel: ' + error.message);
        }
    };
    reader.onerror = function() {
        alert('Lỗi khi đọc file. Vui lòng thử lại.');
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
}

function processImportedData(data) {
    let importedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];

    data.forEach((row, index) => {
        try {
            const studentId = (row['Mã HS'] || '').toString().trim().toUpperCase();
            const studentName = (row['Họ Tên'] || '').toString().trim();
            const studentDob = row['Ngày Sinh'];
            const studentClass = (row['Lớp'] || '').toString().trim().toUpperCase();
            const studentGrade = (row['Khối'] || '').toString();
            const studentYear = row['Năm Học'] || '2023-2024';

            if (!studentId || !studentName) {
                errors.push(`Dòng ${index + 2}: Thiếu mã HS hoặc họ tên`);
                errorCount++;
                return;
            }

            const existingIndex = students.findIndex(s => s.id === studentId);
            if (existingIndex !== -1) {
                students[existingIndex] = {
                    ...students[existingIndex],
                    name: studentName,
                    dob: studentDob || students[existingIndex].dob,
                    class: studentClass || students[existingIndex].class,
                    grade: studentGrade || students[existingIndex].grade,
                    year: studentYear
                };
                updatedCount++;
            } else {
                students.push({
                    id: studentId,
                    name: studentName,
                    dob: studentDob || '2007-01-01',
                    class: studentClass,
                    grade: studentGrade || '10',
                    year: studentYear
                });

                if (!scores[studentId]) scores[studentId] = {};
                currentTeacherSubjects.forEach(subject => {
                    if (!scores[studentId][subject]) {
                        scores[studentId][subject] = {
                            '15p1': null, '15p2': null, '45p1': null, 'giuaky': null, 'cuoiky': null
                        };
                    }
                });
                importedCount++;
            }
        } catch (error) {
            errors.push(`Dòng ${index + 2}: Lỗi xử lý`);
            errorCount++;
        }
    });

    saveDataToLocalStorage();
    loadStudents();
    updateClassSelects();
    updateDashboardStats();

    let message = '📊 KẾT QUẢ IMPORT\n';
    message += '────────────────\n';
    if (importedCount > 0) message += `✅ Thêm mới: ${importedCount} học sinh\n`;
    if (updatedCount > 0) message += `✏️ Cập nhật: ${updatedCount} học sinh\n`;
    if (errorCount > 0) message += `❌ Lỗi: ${errorCount} dòng\n`;
    
    if (errors.length > 0) {
        message += '\nCHI TIẾT LỖI:\n';
        errors.slice(0, 5).forEach(error => message += `• ${error}\n`);
    }

    alert(message);
}