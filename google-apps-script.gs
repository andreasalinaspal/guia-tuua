/**
 * Guía de campo TUUA — receptor de entrevistas en Google Sheets.
 *
 * Cómo usarlo:
 *  1. Crea una Google Sheet nueva.
 *  2. Menú Extensiones → Apps Script. Borra lo que haya y pega TODO este archivo.
 *  3. Implementar → Nueva implementación → tipo "Aplicación web":
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier usuario
 *     Autoriza con tu cuenta. Copia la URL que termina en /exec.
 *  4. Pega esa URL en index.html, en la constante SHEETS_URL.
 */

const SHEET_NAME = 'Entrevistas';
const HEADERS = ['id','inicio','fin','pais_origen','pais_destino','conexion','camino','friccion','respuestas','raw','recibido'];

function doPost(e){
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try{
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    ensureHeader(sheet);
    const body = JSON.parse(e.postData.contents);
    const rows = Array.isArray(body) ? body : [body];
    rows.forEach(function(r){ upsert(sheet, r); });
    return json({ ok:true, count: rows.length });
  }catch(err){
    return json({ ok:false, error: String(err) });
  }finally{
    lock.releaseLock();
  }
}

// Chequeo de salud: abre la URL /exec en el navegador y debe responder {"ok":true,...}
function doGet(){ return json({ ok:true, service:'guia-tuua' }); }

function ensureHeader(sheet){
  if(sheet.getLastRow() === 0){
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
}

// Inserta la entrevista; si ya existe una fila con el mismo id, la actualiza (no duplica).
function upsert(sheet, r){
  const id = String(r.id);
  const last = sheet.getLastRow();
  let rowIndex = -1;
  if(last > 1){
    const ids = sheet.getRange(2, 1, last - 1, 1).getValues();
    for(let i = 0; i < ids.length; i++){
      if(String(ids[i][0]) === id){ rowIndex = i + 2; break; }
    }
  }
  const values = [r.id, r.inicio, r.fin, r.pais_origen, r.pais_destino,
                  r.conexion, r.camino, r.friccion, r.respuestas, r.raw, new Date()];
  if(rowIndex > 0){ sheet.getRange(rowIndex, 1, 1, values.length).setValues([values]); }
  else { sheet.appendRow(values); }
}

function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
