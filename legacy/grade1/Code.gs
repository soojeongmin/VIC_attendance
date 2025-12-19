const SPREADSHEET_ID = "1mUpP2drwc1-3N1yJJuK6RJt8FnwYr4SUKFS3qlT3R6A";
const ABSENCE_SHEET_ID = "11EeOofOHbRa6vn26pBptDx_FSFDUdEeo-TglLgzD3mI"; // 사전 결석 정보 시트
const DEVELOPER_EMAIL = "pantarei01@cnsa.hs.kr"; // 수정된 이메일

function sendFeedbackEmail(type, title, content) {
  const subject = `[면학실 관리 앱 - ${type}] ${title}`;
  const body = `
피드백 유형: ${type}
제목: ${title}
날짜: ${new Date().toLocaleString('ko-KR')}

내용:
${content}
`;
  
  try {
    MailApp.sendEmail(DEVELOPER_EMAIL, subject, body);
    return "성공적으로 전송되었습니다.";
  } catch (error) {
    Logger.log("이메일 전송 실패: " + error.message);
    throw new Error("이메일 전송에 실패했습니다: " + error.message);
  }
}

function doGet(e) {
  const page = e.parameter.page;
  
  if (page === 'stats') {
    return HtmlService.createHtmlOutputFromFile("stats")
      .setTitle("담임선생님용 출결 통계")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else if (page === 'seat') {
    return HtmlService.createHtmlOutputFromFile("seat")
      .setTitle("좌석 조회")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    return HtmlService.createTemplateFromFile("index")
      .evaluate()
      .setTitle("[1학년부] 면학실 관리 어플")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

// ⭐ include 함수 추가 (필수!)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function checkTodayTimeSlots(date, classroom) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("출결기록");
  
  const result = {
    hasET: false,
    hasEP1: false,
    hasEP2: false
  };
  
  // 시트가 비어있으면 false 반환
  if (sheet.getLastRow() === 0) {
    return result;
  }
  
  // 헤더 행 가져오기
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 3).getValues()[0];
  
  // 오늘 날짜의 각 시간대 확인
  const etHeader = `${date}(ET)`;
  const ep1Header = `${date}(EP1)`;
  const ep2Header = `${date}(EP2)`;
  
  for (let i = 3; i < headers.length; i++) { // D열부터 확인
    if (headers[i] === etHeader) {
      result.hasET = true;
    } else if (headers[i] === ep1Header) {
      result.hasEP1 = true;
    } else if (headers[i] === ep2Header) {
      result.hasEP2 = true;
    }
  }
  
  return result;
}

function getClassroomList() {
  return ["4A", "4B", "4C", "4D", "C407", "C409", "A401", "A402","A408"];
}

function getStudentMap() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("데이터");
  if (!sheet) throw new Error("❌ '데이터' 시트를 찾을 수 없습니다.");

  const data = sheet.getDataRange().getValues();
  const studentMap = {};

  const placementSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("발전실 배치");
  const placementData = placementSheet ? placementSheet.getDataRange().getValues() : [];

  const moveDateMap = {};

  for (let i = 1; i < placementData.length; i++) {
    const studentId = placementData[i][1];  // 학번
    const name = placementData[i][2];
    const moveDateRaw = placementData[i][4]; // 이동일 (E열)
    const movedSeat = placementData[i][7]; // 좌석배치 (H열)
    const email = placementData[i][6];

    if (!studentId || !movedSeat) continue;

    const moveDate = parseMoveDate(moveDateRaw);

    // 발전실 좌석을 studentMap에 직접 등록
    studentMap[movedSeat] = {
      seatNumber: movedSeat,
      studentId,
      name,
      email,
      hr: "", // HR 정보 없음
      classroom: movedSeat.split("-")[0], // A401-001 → A401
      moveDate,
      movedSeat: movedSeat
    };

    // 이동일 기록 (면학실 출석 비활성화용)
    moveDateMap[studentId] = {
      moveDate,
      newSeat: movedSeat
    };
  }

  // 기존 데이터 시트 학생도 추가
  for (let i = 1; i < data.length; i++) {
    const [seatNumber, room, hr, studentId, name, email] = data[i];
    if (!seatNumber) continue;

    const moveInfo = moveDateMap[studentId] || {};

    studentMap[seatNumber] = {
      seatNumber,
      studentId,
      name,
      classroom: room,
      hr,
      email,
      moveDate: moveInfo.moveDate || "",
      movedSeat: moveInfo.newSeat || ""
    };
  }

  return studentMap;
}

function parseMoveDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  if (typeof val === "string") {
    const parsed = new Date(val);
    if (!isNaN(parsed)) {
      return Utilities.formatDate(parsed, Session.getScriptTimeZone(), "yyyy-MM-dd");
    }
  }
  return "";
}

// 오늘 기록된 위반사항 가져오기
function getTodayViolations(studentId, date) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("위반기록");
  const data = sheet.getDataRange().getValues();
  
  const violations = [];
  
  for (let i = 1; i < data.length; i++) {
    const rowDate = Utilities.formatDate(new Date(data[i][0]), "Asia/Seoul", "yyyy-MM-dd");
    const rowStudentId = String(data[i][4]);
    
    if (rowDate === date && rowStudentId === String(studentId)) {
      violations.push({
        rowIndex: i + 1, // 실제 행 번호 (1부터 시작)
        timeSlot: data[i][1],
        violationType: data[i][6],
        note: data[i][7],
        recordTime: data[i][11] ? Utilities.formatDate(new Date(data[i][11]), "Asia/Seoul", "HH:mm") : "" // ✅ 수정
      });
    }
  }
  
  return violations;
}

// 위반사항 삭제
function deleteViolationRecord(rowIndex) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("위반기록");
  
  try {
    sheet.deleteRow(Number(rowIndex));
    return "삭제 성공";
  } catch (error) {
    throw new Error("삭제 실패: " + error.message);
  }
}

function saveViolationRecord(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName("위반기록");
    const today = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd");
    const currentTime = Utilities.formatDate(new Date(), "Asia/Seoul", "HH:mm:ss");

    Logger.log("✅ 시트 찾음: " + sheet.getName());
    Logger.log("저장 시작: " + JSON.stringify(data));

    sheet.appendRow([
      today,
      data.timeSlot || "",
      data.classroom || "",
      data.seatNumber || "",
      data.studentId || "",
      data.name || "",
      data.violationType || "",
      data.note || "",
      "false",
      "",
      data.email || "",
      currentTime
    ]);

    Logger.log("✅ appendRow 실행 완료");
    return "위반 사항이 저장되었습니다.";
  } catch (error) {
    Logger.log("saveViolationRecord 오류: " + error.toString());
    Logger.log("오류 스택: " + error.stack);
    Logger.log("오류 발생 시점 데이터: " + JSON.stringify({
      studentId: data ? data.studentId : 'unknown',
      name: data ? data.name : 'unknown',
      violationType: data ? data.violationType : 'unknown',
      timeSlot: data ? data.timeSlot : 'unknown',
      classroom: data ? data.classroom : 'unknown'
    }));
    throw new Error("위반사항 저장 실패: " + (error.message || error.toString()));
  }
}

function getSeatStatusMap(date, timeSlot, classroom) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("출결기록");
  const result = {};
  
  const headerText = `${date}(${timeSlot})`;
  
  // 시트가 비어있으면 빈 객체 반환
  if (sheet.getLastRow() === 0) {
    return result;
  }
  
  // 헤더 행에서 해당 날짜-시간대 열 찾기
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 3).getValues()[0];
  let targetCol = -1;
  
  for (let i = 3; i < headers.length; i++) { // D열(index 3)부터 검색
    if (headers[i] === headerText) {
      targetCol = i + 1;
      break;
    }
  }
  
  // 해당 열이 없으면 빈 객체 반환
  if (targetCol === -1) {
    return result;
  }
  
  // 좌석과 출결 데이터 가져오기
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return result;
  
  const data = sheet.getRange(2, 1, lastRow - 1, targetCol).getValues();
  
  for (let i = 0; i < data.length; i++) {
    const seatNumber = data[i][0];
    const attendanceValue = data[i][targetCol - 1]; // 출결 값

    // 해당 교실의 좌석만 처리
    if (seatNumber && seatNumber.startsWith(classroom)) {
      if (attendanceValue === "O") {
        result[seatNumber] = { status: "출석" };
      } else if (attendanceValue && attendanceValue !== "") {
        // O가 아닌 모든 값(X, 방과후, 1인1기 등)은 결석으로 처리
        result[seatNumber] = { status: "결석" };
      }
      // 빈칸은 미체크로 처리 (result에 포함하지 않음)
    }
  }
  
  return result;
}

// 수면 포스트잇 저장 (Properties 사용)
function saveSleepPostItData(data) {
  const today = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd");
  const key = `sleepPostIt_${today}`;
  
  try {
    PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(data));
    
    // 3일 이상 된 데이터 정리
    cleanOldSleepPostItData();
    
    return "저장 완료";
  } catch (error) {
    throw new Error("저장 실패: " + error.message);
  }
}

// 수면 포스트잇 불러오기
function loadSleepPostItData() {
  const today = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd");
  const key = `sleepPostIt_${today}`;
  
  try {
    const data = PropertiesService.getScriptProperties().getProperty(key);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
}

// 3일 이상 된 데이터 정리
function cleanOldSleepPostItData() {
  const properties = PropertiesService.getScriptProperties();
  const allKeys = properties.getKeys();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3); // 7일에서 3일로 변경
  
  allKeys.forEach(key => {
    if (key.startsWith('sleepPostIt_')) {
      const dateStr = key.replace('sleepPostIt_', '');
      const keyDate = new Date(dateStr);
      if (keyDate < threeDaysAgo) {
        properties.deleteProperty(key);
      }
    }
  });
}

function saveAttendanceBulk(entries) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("출결기록");

  try {
    if (!entries || entries.length === 0) {
      throw new Error("저장할 데이터가 없습니다.");
    }

    // 현재 날짜와 시간대 정보
    const today = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd");
    const timeSlot = entries[0].timeSlot;
    const headerText = `${today}(${timeSlot})`;

    // 발전실 여부 확인
    const classroom = entries[0].classroom;
    const isDevRoom = ["A401", "A402", "A408"].includes(classroom);

    // 사전 결석 정보 로드 (결석 사유 표시용) - 4개 시트 모두 확인
    let preAbsenceMap = {};
    try {
      if (ABSENCE_SHEET_ID) {
        const absenceSS = SpreadsheetApp.openById(ABSENCE_SHEET_ID);
        const absenceSheetName = timeSlot === "ET" ? "ET" : "EP1";

        // 1. 기존 ET/EP1 시트에서 로드
        const absenceSheet = absenceSS.getSheetByName(absenceSheetName);
        if (absenceSheet && absenceSheet.getLastRow() > 1) {
          const absenceData = absenceSheet.getDataRange().getValues();
          for (let i = 1; i < absenceData.length; i++) {
            const [studentId, name, reason, note] = absenceData[i];
            if (studentId && reason) {
              preAbsenceMap[String(studentId)] = reason; // 학번 -> 사유 매핑
            }
          }
        }

        // 2. 실험실 시트에서 로드 (C열이 시간대)
        const labSheet = absenceSS.getSheetByName("실험실");
        if (labSheet && labSheet.getLastRow() > 1) {
          const labData = labSheet.getDataRange().getValues();
          for (let i = 1; i < labData.length; i++) {
            const [studentId, name, sheetTimeSlot, reason, note] = labData[i];
            if (studentId && sheetTimeSlot) {
              const timeKey = String(sheetTimeSlot).trim().toUpperCase();
              // 현재 시간대와 일치하는 경우만 추가
              if ((timeSlot === "ET" && timeKey === "ET") ||
                  (timeSlot !== "ET" && (timeKey === "EP1" || timeKey === "EP2"))) {
                preAbsenceMap[String(studentId)] = reason || "실험실";
              }
            }
          }
        }

        // 3. 기타일정DB 시트에서 로드 (C열이 시간대)
        const etcSheet = absenceSS.getSheetByName("기타일정DB");
        if (etcSheet && etcSheet.getLastRow() > 1) {
          const etcData = etcSheet.getDataRange().getValues();
          for (let i = 1; i < etcData.length; i++) {
            const [studentId, name, sheetTimeSlot, reason, note] = etcData[i];
            if (studentId && sheetTimeSlot) {
              const timeKey = String(sheetTimeSlot).trim().toUpperCase();
              // 현재 시간대와 일치하는 경우만 추가
              if ((timeSlot === "ET" && timeKey === "ET") ||
                  (timeSlot !== "ET" && (timeKey === "EP1" || timeKey === "EP2"))) {
                preAbsenceMap[String(studentId)] = reason || "기타일정";
              }
            }
          }
        }
      }
    } catch (e) {
      Logger.log("사전 결석 정보 로드 실패 (무시): " + e.message);
    }
  
  // 출결기록 시트가 비어있으면 초기화
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1).setValue("좌석번호");
    sheet.getRange(1, 2).setValue("학번");
    sheet.getRange(1, 3).setValue("이름");
  }
  
  // 헤더 행 가져오기
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 3).getValues()[0];
  
  // 해당 날짜-시간대 열 찾기 또는 새로 만들기
  let targetCol = -1;
  for (let i = 3; i < headers.length; i++) {
    if (headers[i] === headerText) {
      targetCol = i + 1;
      break;
    }
  }
  
  // 열이 없으면 새로 추가
  if (targetCol === -1) {
    targetCol = sheet.getLastColumn() + 1;
    if (targetCol < 4) targetCol = 4;
    sheet.getRange(1, targetCol).setValue(headerText);
  }
  
  // 모든 기존 데이터 가져오기 (좌석, 학번, 이름)
  const lastRow = sheet.getLastRow();
  let existingData = [];
  if (lastRow > 1) {
    existingData = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  }
  
  // 기존 데이터를 매핑 (발전실과 일반 교실 구분)
  const rowMap = {};
  for (let i = 0; i < existingData.length; i++) {
    const seat = existingData[i][0];
    const studentId = String(existingData[i][1] || "");
    const name = existingData[i][2] || "";
    
    if (seat) {
      if (isDevRoom) {
        // 발전실의 경우: 좌석+학번+이름 모두 체크
        const key = `${seat}_${studentId}_${name}`;
        rowMap[key] = i + 2;
      } else {
        // 일반 교실: 좌석번호만으로 매칭
        rowMap[seat] = i + 2;
      }
    }
  }
  
  // 출결 데이터 입력
  for (let entry of entries) {
    let rowNum;
    
    if (isDevRoom) {
      // 발전실: 좌석+학번+이름으로 키 생성
      const key = `${entry.seatNumber}_${entry.studentId}_${entry.name}`;
      rowNum = rowMap[key];
      
      // 해당 조합이 없으면 새 행 추가
      if (!rowNum) {
        rowNum = sheet.getLastRow() + 1;
        // A열(좌석번호), B열(학번), C열(이름) 모두 저장
        sheet.getRange(rowNum, 1).setValue(entry.seatNumber);
        sheet.getRange(rowNum, 2).setValue(entry.studentId);
        sheet.getRange(rowNum, 3).setValue(entry.name);
        rowMap[key] = rowNum;
      }
    } else {
      // 일반 교실: 기존 방식대로 좌석번호만 체크
      rowNum = rowMap[entry.seatNumber];
      
      if (!rowNum) {
        rowNum = sheet.getLastRow() + 1;
        sheet.getRange(rowNum, 1).setValue(entry.seatNumber);
        // B열과 C열은 수식이 있으면 그대로 둠
        rowMap[entry.seatNumber] = rowNum;
      }
    }
    
    // 출결 상태 입력 (결석이고 사전 결석 사유가 있으면 사유 저장)
    let value = "";
    if (entry.status === "출석") {
      value = "O";
    } else if (entry.status === "결석") {
      // 사전 결석 사유가 있으면 사유 저장, 없으면 X
      const reason = preAbsenceMap[String(entry.studentId)];
      value = reason || "X";
    }
    sheet.getRange(rowNum, targetCol).setValue(value);
  }
  
  return "출결이 저장되었습니다.";
}catch (error) {
    Logger.log("saveAttendanceBulk 오류: " + error.toString());
    Logger.log("오류 스택: " + error.stack);
    Logger.log("오류 발생 시점 데이터: " + JSON.stringify({
      entriesLength: entries ? entries.length : 0,
      classroom: entries && entries[0] ? entries[0].classroom : 'unknown',
      timeSlot: entries && entries[0] ? entries[0].timeSlot : 'unknown'
    }));
    throw new Error("출결 저장 실패: " + (error.message || error.toString()));
}
}



function getOriginalSeat(studentId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dataSheet = ss.getSheetByName("데이터");
  
  const data = dataSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][3]) === String(studentId)) {
      return {
        originalSeat: data[i][0],
        studentId: data[i][3],
        name: data[i][4]
      };
    }
  }
  
  return null;
}
function searchStudentByName(searchName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dataSheet = ss.getSheetByName("데이터");
  const placementSheet = ss.getSheetByName("발전실 배치");
  
  const results = [];
  
  // 데이터 시트에서 검색
  const dataValues = dataSheet.getDataRange().getValues();
  for (let i = 1; i < dataValues.length; i++) {
    const [seat, classroom, hr, studentId, name, email] = dataValues[i];
    
    // 이름이 검색어를 포함하는지 확인 (부분 일치)
    if (name && name.includes(searchName)) {
      results.push({
        seat: seat,
        classroom: classroom,
        hr: hr,
        studentId: studentId,
        name: name,
        email: email,
        movedSeat: null,
        moveDate: null
      });
    }
  }
  
  // 발전실 배치 정보 확인
  if (placementSheet) {
    const placementData = placementSheet.getDataRange().getValues();
    
    for (let i = 1; i < placementData.length; i++) {
      const studentId = placementData[i][1];
      const movedSeat = placementData[i][7];
      const moveDateRaw = placementData[i][4];
      
      // 결과에서 해당 학생 찾아서 발전실 정보 추가
      const student = results.find(s => s.studentId === studentId);
      if (student && movedSeat) {
        student.movedSeat = movedSeat;
        student.moveDate = parseMoveDate(moveDateRaw);
      }
    }
  }
  
  // 학번 순으로 정렬
  results.sort((a, b) => String(a.studentId).localeCompare(String(b.studentId)));
  
  return results;
}

// 기타 특이사항을 시트에 저장하는 함수
function saveGeneralNote(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("특이사항");
    
    if (!sheet) {
      throw new Error("특이사항 시트를 찾을 수 없습니다.");
    }
    
    // 현재 날짜와 시간 가져오기
    const now = new Date();
    const dateStr = Utilities.formatDate(now, "GMT+9", "yyyy-MM-dd");
    
    // 새로운 행 추가
    const newRow = [
      dateStr,           // A열: 날짜
      data.timeSlot,     // B열: 시간대 (ET/EP1/EP2)
      data.subject,      // C열: 제목
      data.content       // D열: 특이사항 내용
    ];
    
    // 마지막 행에 데이터 추가
    sheet.appendRow(newRow);
    
    return "특이사항이 저장되었습니다.";
  } catch (error) {
    console.error("특이사항 저장 오류:", error);
    throw error;
  }
}


function getHrAttendanceStats(date, hr) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const studentSheet = ss.getSheetByName("데이터");
  const attendanceSheet = ss.getSheetByName("출결기록"); // 추가
  const violationSheet = ss.getSheetByName("위반기록");
  
  // HR에 해당하는 학생들 필터링 (데이터 시트에서)
  const students = studentSheet.getDataRange().getValues().slice(1)
    .filter(row => String(row[2]) === hr)
    .map(row => ({
      seat: row[0],
      classroom: row[1],
      hr: row[2],
      studentId: row[3],
      name: row[4],
      email: row[5]
    }))
    .sort((a, b) => String(a.studentId).localeCompare(String(b.studentId)));
  
  // 발전실 배치 확인
  const placementSheet = ss.getSheetByName("발전실 배치");
  const moveMap = {};
  if (placementSheet) {
    const placementData = placementSheet.getDataRange().getValues();
    for (let i = 1; i < placementData.length; i++) {
      const studentId = placementData[i][1];
      const movedSeat = placementData[i][7];
      const moveDate = placementData[i][4];
      if (studentId && movedSeat && moveDate && new Date(date) >= new Date(moveDate)) {
        moveMap[studentId] = movedSeat;
      }
    }
  }
  
  // 출결기록 시트에서 헤더 찾기 (수정된 부분)
  let etCol = -1, ep1Col = -1, ep2Col = -1;
  const seatAttendanceMap = {};
  
  if (attendanceSheet.getLastRow() > 0) {
    const headers = attendanceSheet.getRange(1, 1, 1, attendanceSheet.getLastColumn() || 3).getValues()[0];
    
    // 해당 날짜의 시간대 열 찾기
    for (let i = 3; i < headers.length; i++) {
      if (headers[i] === `${date}(ET)`) etCol = i + 1;
      if (headers[i] === `${date}(EP1)`) ep1Col = i + 1;
      if (headers[i] === `${date}(EP2)`) ep2Col = i + 1;
    }
    
    // 좌석별 출결 데이터 매핑
    if ((etCol > 0 || ep1Col > 0 || ep2Col > 0) && attendanceSheet.getLastRow() > 1) {
      const maxCol = Math.max(etCol, ep1Col, ep2Col, 3);
      const allData = attendanceSheet.getRange(2, 1, attendanceSheet.getLastRow() - 1, maxCol).getValues();
      
      for (let row of allData) {
        const seat = row[0];
        if (seat) {
          seatAttendanceMap[seat] = {
            ET: etCol > 0 ? row[etCol - 1] : "",
            EP1: ep1Col > 0 ? row[ep1Col - 1] : "",
            EP2: ep2Col > 0 ? row[ep2Col - 1] : ""
          };
        }
      }
    }
  }
  
// getHrAttendanceStats 함수 내 위반기록 확인 부분 수정
// 위반기록 확인
const violationMap = {};
const violationData = violationSheet.getDataRange().getValues();
for (let i = 1; i < violationData.length; i++) {
  const [d, slot, room, seat, studentId, name, type, memo, appeal, devMove, email, recordTime] = violationData[i];
  const rowDate = Utilities.formatDate(new Date(d), "Asia/Seoul", "yyyy-MM-dd");
  if (rowDate !== date) continue;
  if (!violationMap[studentId]) violationMap[studentId] = [];
  
  // 시간 정보도 포함하여 저장
  const timeInfo = recordTime ? ` (${recordTime})` : "";
  violationMap[studentId].push(`${type || ""}${timeInfo}${memo ? ": " + memo : ""}`);
}
  // 출결 값 변환 함수 (O, X, 또는 사유)
  const parseAttendance = (value) => {
    if (!value || value === "") return "미체크";
    if (value === "O") return "출석";
    if (value === "X") return "결석";
    // O, X가 아닌 경우 사유로 표시 (예: "방과후", "1인1기")
    return value;
  };

  // 결과 조합
  return students.map(s => {
    const currentSeat = moveMap[s.studentId] || s.seat;
    const attendance = seatAttendanceMap[currentSeat] || { ET: "", EP1: "", EP2: "" };

    return {
      studentId: s.studentId,
      name: s.name,
      seat: currentSeat,
      et: parseAttendance(attendance.ET),
      ep1: parseAttendance(attendance.EP1),
      ep2: parseAttendance(attendance.EP2),
      violationNote: (violationMap[s.studentId] || []).join("\n")
    };
  });
}

function searchStudentByStudentId(studentId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const dataSheet = ss.getSheetByName("데이터");
  const placementSheet = ss.getSheetByName("발전실 배치");

  const searchId = String(studentId).trim();

  const dataValues = dataSheet.getDataRange().getValues();
  for (let i = 1; i < dataValues.length; i++) {
    const [seat, classroom, hr, stdId, name, email] = dataValues[i];

    if (String(stdId) === searchId) {
      // ⭐ 좌석번호에서 교실명 추출 (C407-024 → C407)
      let actualClassroom = classroom;
      if (seat && seat.includes('-')) {
        actualClassroom = seat.split('-')[0];  // "C407-024" → "C407"
      }

      const result = {
        seat: seat,
        classroom: actualClassroom,  // ⭐ 수정된 교실명 사용
        hr: hr,
        studentId: stdId,
        name: name,
        email: email,
        movedSeat: null,
        moveDate: null
      };

      // 발전실 배치 정보 확인
      if (placementSheet) {
        const placementData = placementSheet.getDataRange().getValues();

        for (let j = 1; j < placementData.length; j++) {
          const placementStudentId = placementData[j][1];
          const movedSeat = placementData[j][7];
          const moveDateRaw = placementData[j][4];

          if (String(placementStudentId) === searchId && movedSeat) {
            result.movedSeat = movedSeat;
            result.moveDate = parseMoveDate(moveDateRaw);
            break;
          }
        }
      }

      return result;
    }
  }

  return null;
}

// ============================================
// 📋 사전 결석 정보 조회 기능
// ============================================

/**
 * 사전 결석 정보를 모두 가져오기 (ET, EP1, 실험실, 기타일정DB 시트)
 * 프로그램 시작 시 한 번에 로딩
 *
 * 시트 구조:
 * - ET, EP1 시트: 학번 | 이름 | 사유 | 비고 (시트명이 시간대)
 * - 실험실, 기타일정DB 시트: 학번 | 이름 | 시간 | 사유 | 비고 (C열이 시간대)
 */
function getPreAbsenceData() {
  try {
    const ss = SpreadsheetApp.openById(ABSENCE_SHEET_ID);
    const result = {
      ET: {},
      EP1: {}  // EP1, EP2 모두 EP1 시트 사용
    };

    // ========== 1. ET 시트 데이터 가져오기 (기존 방식) ==========
    const etSheet = ss.getSheetByName("ET");
    if (etSheet && etSheet.getLastRow() > 1) {
      const etData = etSheet.getDataRange().getValues();
      for (let i = 1; i < etData.length; i++) {
        const [studentId, name, reason, note] = etData[i];
        if (studentId) {
          result.ET[String(studentId)] = {
            studentId: String(studentId),
            name: name || "",
            reason: reason || "",
            note: note || ""
          };
        }
      }
    }

    // ========== 2. EP1 시트 데이터 가져오기 (기존 방식) ==========
    const ep1Sheet = ss.getSheetByName("EP1");
    if (ep1Sheet && ep1Sheet.getLastRow() > 1) {
      const ep1Data = ep1Sheet.getDataRange().getValues();
      for (let i = 1; i < ep1Data.length; i++) {
        const [studentId, name, reason, note] = ep1Data[i];
        if (studentId) {
          result.EP1[String(studentId)] = {
            studentId: String(studentId),
            name: name || "",
            reason: reason || "",
            note: note || ""
          };
        }
      }
    }

    // ========== 3. 실험실 시트 데이터 가져오기 (새로운 방식: C열이 시간대) ==========
    const labSheet = ss.getSheetByName("실험실");
    if (labSheet && labSheet.getLastRow() > 1) {
      const labData = labSheet.getDataRange().getValues();
      for (let i = 1; i < labData.length; i++) {
        const [studentId, name, timeSlot, reason, note] = labData[i];
        if (studentId && timeSlot) {
          const timeKey = String(timeSlot).trim().toUpperCase();
          // ET 또는 EP1에 해당하는 경우만 추가
          if (timeKey === "ET") {
            result.ET[String(studentId)] = {
              studentId: String(studentId),
              name: name || "",
              reason: reason || "실험실",
              note: note || ""
            };
          } else if (timeKey === "EP1" || timeKey === "EP2") {
            result.EP1[String(studentId)] = {
              studentId: String(studentId),
              name: name || "",
              reason: reason || "실험실",
              note: note || ""
            };
          }
        }
      }
    }

    // ========== 4. 기타일정DB 시트 데이터 가져오기 (새로운 방식: C열이 시간대) ==========
    const etcSheet = ss.getSheetByName("기타일정DB");
    if (etcSheet && etcSheet.getLastRow() > 1) {
      const etcData = etcSheet.getDataRange().getValues();
      for (let i = 1; i < etcData.length; i++) {
        const [studentId, name, timeSlot, reason, note] = etcData[i];
        if (studentId && timeSlot) {
          const timeKey = String(timeSlot).trim().toUpperCase();
          // ET 또는 EP1에 해당하는 경우만 추가
          if (timeKey === "ET") {
            result.ET[String(studentId)] = {
              studentId: String(studentId),
              name: name || "",
              reason: reason || "기타일정",
              note: note || ""
            };
          } else if (timeKey === "EP1" || timeKey === "EP2") {
            result.EP1[String(studentId)] = {
              studentId: String(studentId),
              name: name || "",
              reason: reason || "기타일정",
              note: note || ""
            };
          }
        }
      }
    }

    Logger.log(`사전 결석 정보 로드 완료 - ET: ${Object.keys(result.ET).length}명, EP1: ${Object.keys(result.EP1).length}명`);
    return result;
  } catch (error) {
    Logger.log("사전 결석 정보 로드 실패: " + error.message);
    return { ET: {}, EP1: {} };
  }
}

/**
 * 특정 학생의 사전 결석 정보 조회
 */
function getStudentPreAbsence(studentId, timeSlot) {
  try {
    const ss = SpreadsheetApp.openById(ABSENCE_SHEET_ID);
    const sheetName = timeSlot === "ET" ? "ET" : "EP1";
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet || sheet.getLastRow() <= 1) {
      return null;
    }

    const data = sheet.getDataRange().getValues();
    const searchId = String(studentId);

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === searchId) {
        return {
          studentId: searchId,
          name: data[i][1] || "",
          reason: data[i][2] || "",
          note: data[i][3] || ""
        };
      }
    }

    return null;
  } catch (error) {
    Logger.log("학생 사전 결석 정보 조회 실패: " + error.message);
    return null;
  }
}

// ============================================
// 📧 전날 위반사항 요약 이메일 발송 기능
// ============================================

/**
 * 전날 위반사항을 요약하여 담당교사에게 이메일로 발송
 * 매일 오전 7시에 트리거로 실행
 */
function sendDailyViolationSummary() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const violationSheet = ss.getSheetByName("위반기록");

  if (!violationSheet || violationSheet.getLastRow() <= 1) {
    Logger.log("위반기록이 없습니다.");
    return;
  }

  // 전날 날짜 계산
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = Utilities.formatDate(yesterday, "Asia/Seoul", "yyyy-MM-dd");
  const yesterdayDisplay = Utilities.formatDate(yesterday, "Asia/Seoul", "yyyy년 MM월 dd일");

  // 위반기록 데이터 가져오기
  const data = violationSheet.getDataRange().getValues();
  const violations = [];

  for (let i = 1; i < data.length; i++) {
    const [date, timeSlot, classroom, seatNumber, studentId, name, violationType, note, appeal, devMove, email, recordTime] = data[i];

    if (!date) continue;

    const rowDate = Utilities.formatDate(new Date(date), "Asia/Seoul", "yyyy-MM-dd");

    if (rowDate === yesterdayStr) {
      violations.push({
        timeSlot: timeSlot || "",
        classroom: classroom || "",
        seatNumber: seatNumber || "",
        studentId: studentId || "",
        name: name || "",
        violationType: violationType || "",
        note: note || "",
        recordTime: recordTime || ""
      });
    }
  }

  // 위반사항이 없으면 이메일 발송하지 않음
  if (violations.length === 0) {
    Logger.log(`${yesterdayStr}: 위반사항이 없어 이메일을 발송하지 않습니다.`);
    return;
  }

  // 위반 유형별 통계
  const stats = {
    수면: 0,
    전자기기: 0,
    이석: 0,
    기타: 0
  };

  violations.forEach(v => {
    if (v.violationType === "수면") stats.수면++;
    else if (v.violationType === "전자기기") stats.전자기기++;
    else if (v.violationType === "이석") stats.이석++;
    else stats.기타++;
  });

  // 시간대별 그룹화
  const byTimeSlot = {
    ET: [],
    EP1: [],
    EP2: []
  };

  violations.forEach(v => {
    if (byTimeSlot[v.timeSlot]) {
      byTimeSlot[v.timeSlot].push(v);
    }
  });

  // 이메일 본문 생성
  const subject = `[면학실 위반사항 요약] ${yesterdayDisplay} - 총 ${violations.length}건`;

  let body = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 면학실 위반사항 일일 요약 보고서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 날짜: ${yesterdayDisplay}
📊 총 위반 건수: ${violations.length}건

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 위반 유형별 통계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 💤 수면: ${stats.수면}건
• 📱 전자기기: ${stats.전자기기}건
• 🚶 이석: ${stats.이석}건
• 📝 기타: ${stats.기타}건

`;

  // 시간대별 상세 내역
  const timeSlotNames = {
    ET: "ET (16:50~18:10)",
    EP1: "EP1 (19:20~20:50)",
    EP2: "EP2 (21:10~22:30)"
  };

  ['ET', 'EP1', 'EP2'].forEach(slot => {
    const slotViolations = byTimeSlot[slot];
    if (slotViolations && slotViolations.length > 0) {
      body += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ ${timeSlotNames[slot]} - ${slotViolations.length}건
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      slotViolations.forEach((v, index) => {
        body += `
${index + 1}. ${v.name} (${v.studentId})
   • 교실: ${v.classroom} / 좌석: ${v.seatNumber}
   • 위반유형: ${v.violationType}
   • 기록시간: ${v.recordTime || "미기록"}
   • 상세내용: ${v.note || "없음"}
`;
      });
    }
  });

  body += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 본 메일은 자동 발송되었습니다.
면학실 관리 어플 - 1학년부
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  // 이메일 발송
  try {
    MailApp.sendEmail({
      to: DEVELOPER_EMAIL,
      subject: subject,
      body: body
    });
    Logger.log(`✅ 위반사항 요약 이메일 발송 완료: ${violations.length}건`);
  } catch (error) {
    Logger.log(`❌ 이메일 발송 실패: ${error.message}`);
    throw new Error("이메일 발송 실패: " + error.message);
  }
}

/**
 * 매일 오전 7시 트리거 설정 함수
 * Apps Script 에디터에서 한 번만 실행하면 됩니다.
 */
function setupDailyViolationEmailTrigger() {
  // 기존 트리거 삭제 (중복 방지)
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendDailyViolationSummary') {
      ScriptApp.deleteTrigger(trigger);
      Logger.log("기존 트리거 삭제됨");
    }
  });

  // 새 트리거 생성: 매일 오전 7시
  ScriptApp.newTrigger('sendDailyViolationSummary')
    .timeBased()
    .atHour(7)
    .everyDays(1)
    .inTimezone("Asia/Seoul")
    .create();

  Logger.log("✅ 매일 오전 7시 위반사항 요약 이메일 트리거가 설정되었습니다.");
}

/**
 * 트리거 삭제 함수
 */
function removeDailyViolationEmailTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendDailyViolationSummary') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  Logger.log(`✅ ${removed}개의 트리거가 삭제되었습니다.`);
}

/**
 * 테스트용: 수동으로 이메일 발송 테스트
 */
function testSendViolationSummary() {
  Logger.log("테스트 이메일 발송 시작...");
  sendDailyViolationSummary();
  Logger.log("테스트 완료");
}

// ============================================
// 📧 담임/부장 일일 출결 및 위반 이메일 발송
// ============================================

/**
 * 학번에서 반 번호 추출 (1학년용)
 * 10103 → 1, 11111 → 11, 10823 → 8
 */
function getClassFromStudentId(studentId) {
  const idStr = String(studentId);
  if (idStr.length !== 5 || !idStr.startsWith('1')) return null;
  const classNum = parseInt(idStr.substring(1, 3), 10);
  if (classNum >= 1 && classNum <= 12) return classNum;
  return null;
}

/**
 * 담임선생님 이메일 목록 가져오기
 * 데이터 시트의 H열(담당반: "1반", "2반", ... "부장"), I열(이메일) 사용
 * @returns {Object} { 1: "email1@...", 2: "email2@...", ..., "부장": "email@..." }
 */
function getTeacherEmails() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("데이터");
  const data = sheet.getDataRange().getValues();

  const teacherEmails = {};

  for (let i = 1; i < data.length; i++) {
    const classInfo = data[i][7]; // H열 (0-indexed: 7)
    const email = data[i][8];     // I열 (0-indexed: 8)

    if (classInfo && email) {
      const classStr = String(classInfo).trim();
      let classKey;

      // "1반", "2반" 형식에서 숫자 추출, "부장"은 그대로
      if (classStr === "부장") {
        classKey = "부장";
      } else if (classStr.endsWith("반")) {
        // "1반" → 1, "12반" → 12
        classKey = parseInt(classStr.replace("반", ""), 10);
      } else {
        // 숫자만 있는 경우도 처리
        const num = parseInt(classStr, 10);
        if (!isNaN(num)) {
          classKey = num;
        } else {
          classKey = classStr;
        }
      }

      // 중복 방지 (첫 번째 값만 사용)
      if (classKey && !teacherEmails[classKey]) {
        teacherEmails[classKey] = String(email).trim();
      }
    }
  }

  return teacherEmails;
}

/**
 * 전날 미안내 결석생 및 위반자 정보를 담임/부장에게 발송
 * 매일 오전 8시 30분에 트리거로 실행 (토/일 제외, 금요일 데이터는 월요일에 발송)
 */
function sendDailyClassReport() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=일, 1=월, 2=화, ... 6=토

  // 토요일(6), 일요일(0)에는 메일 발송 안함
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    Logger.log("주말에는 메일을 발송하지 않습니다.");
    return;
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const attendanceSheet = ss.getSheetByName("출결기록");
  const violationSheet = ss.getSheetByName("위반기록");
  const dataSheet = ss.getSheetByName("데이터");

  // 대상 날짜 계산 (월요일이면 금요일 데이터, 그 외에는 전날 데이터)
  const targetDate = new Date();
  if (dayOfWeek === 1) {
    // 월요일: 금요일 데이터 (3일 전)
    targetDate.setDate(targetDate.getDate() - 3);
  } else {
    // 화~금: 전날 데이터
    targetDate.setDate(targetDate.getDate() - 1);
  }
  const yesterdayStr = Utilities.formatDate(targetDate, "Asia/Seoul", "yyyy-MM-dd");
  const yesterdayDisplay = Utilities.formatDate(targetDate, "Asia/Seoul", "yyyy년 MM월 dd일");

  // 담임 이메일 목록 가져오기
  const teacherEmails = getTeacherEmails();
  Logger.log("담임 이메일 목록: " + JSON.stringify(teacherEmails));

  // 학생 정보 가져오기 (학번 → 이름, 반 매핑)
  const studentData = dataSheet.getDataRange().getValues();
  const studentInfo = {}; // { 학번: { name, class } }

  for (let i = 1; i < studentData.length; i++) {
    const studentId = studentData[i][3]; // D열: 학번
    const name = studentData[i][4];       // E열: 이름
    if (studentId) {
      const classNum = getClassFromStudentId(studentId);
      studentInfo[String(studentId)] = {
        name: name || "",
        class: classNum
      };
    }
  }

  // ========== 1. 미안내 결석생 수집 ==========
  const unexplainedAbsences = {}; // { 반번호: [{ studentId, name, timeSlot }] }
  for (let i = 1; i <= 12; i++) {
    unexplainedAbsences[i] = [];
  }

  if (attendanceSheet && attendanceSheet.getLastRow() > 1) {
    const headers = attendanceSheet.getRange(1, 1, 1, attendanceSheet.getLastColumn()).getValues()[0];

    // 전날 시간대 열 찾기
    const timeSlotCols = {};
    ['ET', 'EP1', 'EP2'].forEach(slot => {
      const headerText = `${yesterdayStr}(${slot})`;
      for (let i = 0; i < headers.length; i++) {
        if (headers[i] === headerText) {
          timeSlotCols[slot] = i;
          break;
        }
      }
    });

    // 출결 데이터 확인
    if (Object.keys(timeSlotCols).length > 0) {
      const attendanceData = attendanceSheet.getDataRange().getValues();

      for (let i = 1; i < attendanceData.length; i++) {
        const seatNumber = attendanceData[i][0];
        const studentId = attendanceData[i][1]; // B열: 학번

        if (!studentId) continue;

        const info = studentInfo[String(studentId)];
        if (!info || !info.class) continue;

        // 각 시간대별 확인
        ['ET', 'EP1', 'EP2'].forEach(slot => {
          if (timeSlotCols[slot] !== undefined) {
            const value = attendanceData[i][timeSlotCols[slot]];
            // X인 경우만 미안내 결석 (방과후, 1인1기 등 사유가 있으면 제외)
            if (value === "X") {
              unexplainedAbsences[info.class].push({
                studentId: studentId,
                name: info.name,
                timeSlot: slot
              });
            }
          }
        });
      }
    }
  }

  // ========== 2. 위반자 수집 ==========
  const violations = {}; // { 반번호: [{ studentId, name, timeSlot, type, note, recordTime }] }
  for (let i = 1; i <= 12; i++) {
    violations[i] = [];
  }

  if (violationSheet && violationSheet.getLastRow() > 1) {
    const violationData = violationSheet.getDataRange().getValues();

    for (let i = 1; i < violationData.length; i++) {
      const [date, timeSlot, classroom, seatNumber, studentId, name, violationType, note, appeal, devMove, email, recordTime] = violationData[i];

      if (!date || !studentId) continue;

      const rowDate = Utilities.formatDate(new Date(date), "Asia/Seoul", "yyyy-MM-dd");
      if (rowDate !== yesterdayStr) continue;

      const classNum = getClassFromStudentId(studentId);
      if (!classNum) continue;

      violations[classNum].push({
        studentId: studentId,
        name: name || "",
        timeSlot: timeSlot || "",
        type: violationType || "",
        note: note || "",
        recordTime: recordTime || ""
      });
    }
  }

  // ========== 3. 담임선생님에게 이메일 발송 ==========
  let totalEmailsSent = 0;
  let totalAbsences = 0;
  let totalViolations = 0;

  for (let classNum = 1; classNum <= 12; classNum++) {
    const classAbsences = unexplainedAbsences[classNum] || [];
    const classViolations = violations[classNum] || [];

    // 데이터가 없으면 스킵
    if (classAbsences.length === 0 && classViolations.length === 0) continue;

    const teacherEmail = teacherEmails[String(classNum)];
    if (!teacherEmail) {
      Logger.log(`${classNum}반 담임 이메일 없음 - 스킵`);
      continue;
    }

    totalAbsences += classAbsences.length;
    totalViolations += classViolations.length;

    // 이메일 본문 생성
    const subject = `[1학년 ${classNum}반] ${yesterdayDisplay} 면학실 일일 보고`;

    let body = `📋 1학년 ${classNum}반 면학실 일일 보고서
📅 날짜: ${yesterdayDisplay}
`;

    // 미안내 결석생
    if (classAbsences.length > 0) {
      // 학생별로 그룹화
      const byStudent = {};
      classAbsences.forEach(a => {
        const key = `${a.studentId}_${a.name}`;
        if (!byStudent[key]) {
          byStudent[key] = { studentId: a.studentId, name: a.name, timeSlots: [] };
        }
        byStudent[key].timeSlots.push(a.timeSlot);
      });

      body += `
❌ 미안내 결석생 (${Object.keys(byStudent).length}명)

`;
      Object.values(byStudent).forEach((student, idx) => {
        body += `${idx + 1}. ${student.name} (${student.studentId}) - ${student.timeSlots.join(', ')}\n`;
      });

      body += `
※ 방과후, 1인1기, 장소이동 등 사전 안내 없이 결석한 학생입니다.
`;
    }

    // 규정 위반자
    if (classViolations.length > 0) {
      body += `
⚠️ 규정 위반자 (${classViolations.length}건)

`;
      classViolations.forEach((v, idx) => {
        body += `${idx + 1}. ${v.name} (${v.studentId})
   • 시간대: ${v.timeSlot}
   • 위반유형: ${v.type}
   • 기록시간: ${v.recordTime || "미기록"}
   • 상세내용: ${v.note || "없음"}

`;
      });
    }

    body += `
⚠️ 본 메일은 자동 발송되었습니다.
면학실 관리 어플 - 1학년부
`;

    // 이메일 발송
    try {
      MailApp.sendEmail({
        to: teacherEmail,
        subject: subject,
        body: body
      });
      Logger.log(`✅ ${classNum}반 담임에게 이메일 발송 완료: ${teacherEmail}`);
      totalEmailsSent++;
    } catch (error) {
      Logger.log(`❌ ${classNum}반 담임 이메일 발송 실패: ${error.message}`);
    }
  }

  // ========== 4. 부장에게 전체 현황 발송 ==========
  const chiefEmail = teacherEmails["부장"];
  if (chiefEmail) {
    const subject = `[1학년부] ${yesterdayDisplay} 면학실 전체 현황`;

    let body = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 1학년부 면학실 전체 현황 보고서
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 날짜: ${yesterdayDisplay}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 전체 통계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 미안내 결석: 총 ${totalAbsences}건
• 규정 위반: 총 ${totalViolations}건
• 담임 발송: ${totalEmailsSent}명

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 반별 현황
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    for (let classNum = 1; classNum <= 12; classNum++) {
      const absCount = unexplainedAbsences[classNum] ? unexplainedAbsences[classNum].length : 0;
      const vioCount = violations[classNum] ? violations[classNum].length : 0;

      if (absCount > 0 || vioCount > 0) {
        body += `${classNum}반: 미안내 결석 ${absCount}건, 위반 ${vioCount}건\n`;
      }
    }

    // 위반 유형별 통계
    const violationStats = { 수면: 0, 전자기기: 0, 이석: 0, 기타: 0 };
    for (let classNum = 1; classNum <= 12; classNum++) {
      (violations[classNum] || []).forEach(v => {
        if (v.type === "수면") violationStats.수면++;
        else if (v.type === "전자기기") violationStats.전자기기++;
        else if (v.type === "이석") violationStats.이석++;
        else violationStats.기타++;
      });
    }

    body += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 위반 유형별 통계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 수면: ${violationStats.수면}건
• 전자기기: ${violationStats.전자기기}건
• 이석: ${violationStats.이석}건
• 기타: ${violationStats.기타}건

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 본 메일은 자동 발송되었습니다.
면학실 관리 어플 - 1학년부
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    try {
      MailApp.sendEmail({
        to: chiefEmail,
        subject: subject,
        body: body
      });
      Logger.log(`✅ 부장에게 전체 현황 이메일 발송 완료: ${chiefEmail}`);
    } catch (error) {
      Logger.log(`❌ 부장 이메일 발송 실패: ${error.message}`);
    }
  } else {
    Logger.log("부장 이메일이 설정되지 않았습니다.");
  }

  Logger.log(`📧 일일 보고 완료 - 담임 ${totalEmailsSent}명 발송, 결석 ${totalAbsences}건, 위반 ${totalViolations}건`);
}

/**
 * 매일 오전 8시 30분 담임/부장 이메일 트리거 설정 (토/일 제외는 함수 내에서 처리)
 */
function setupDailyClassReportTrigger() {
  // 기존 트리거 삭제 (중복 방지)
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendDailyClassReport') {
      ScriptApp.deleteTrigger(trigger);
      Logger.log("기존 sendDailyClassReport 트리거 삭제됨");
    }
  });

  // 새 트리거 생성: 매일 오전 8시 30분 (nearMinute으로 정확한 시간 설정)
  ScriptApp.newTrigger('sendDailyClassReport')
    .timeBased()
    .atHour(8)
    .nearMinute(30)
    .everyDays(1)
    .inTimezone("Asia/Seoul")
    .create();

  Logger.log("✅ 매일 오전 8시 30분 담임/부장 일일 보고 이메일 트리거가 설정되었습니다. (토/일 제외)");
}

/**
 * 담임/부장 이메일 트리거 삭제
 */
function removeDailyClassReportTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendDailyClassReport') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  Logger.log(`✅ ${removed}개의 sendDailyClassReport 트리거가 삭제되었습니다.`);
}

/**
 * 테스트용: 담임/부장 이메일 수동 발송
 */
function testSendDailyClassReport() {
  Logger.log("담임/부장 일일 보고 이메일 테스트 시작...");
  sendDailyClassReport();
  Logger.log("테스트 완료");
}