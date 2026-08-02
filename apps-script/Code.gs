/**
 * 청첩장 방명록(GUESTBOOK)을 Google Sheets에 저장/조회하기 위한 Apps Script.
 *
 * 설정 방법
 * 1. 새 Google 스프레드시트를 만든다.
 * 2. 첫 번째 시트 이름을 "Guestbook" 으로 바꾸고, 1행에 헤더를 넣는다: Name | Message | Time
 * 3. 상단 메뉴 확장 프로그램 > Apps Script 를 열고, 기본 코드를 지운 뒤 이 파일 내용을 붙여넣는다.
 * 4. 배포 > 새 배포 > 유형: 웹 앱
 *    - 실행 계정: 나(본인)
 *    - 액세스 권한이 있는 사용자: 전체
 * 5. 배포 후 나오는 웹 앱 URL(.../exec)을 복사해서 index.html 의 GB_API_URL 상수에 붙여넣는다.
 */

const SHEET_NAME = 'Guestbook';

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Name', 'Message', 'Time']);
  }
  return sheet;
}

function doGet(e) {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  const entries = rows.slice(1)
    .filter(row => row[1])
    .map(row => ({ name: String(row[0] || '익명'), msg: String(row[1]), time: String(row[2] || '') }));

  return ContentService
    .createTextOutput(JSON.stringify(entries))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const name = String(data.name || '익명').slice(0, 20);
  const msg = String(data.msg || '').slice(0, 300);
  const time = String(data.time || '');

  if (!msg) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'empty message' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  getSheet_().appendRow([name, msg, time]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
