/**
 * Guía de campo TUUA — receptor de entrevistas en Google Sheets (formato ancho).
 *
 * Cada entrevista = 1 fila. Cada pregunta = 1 columna (se crean solas según aparecen).
 * El encabezado de cada columna referencia la pregunta (código · texto), ej:
 *   "A.3 · Del 1 al 5, ¿qué tan fácil le pareció?"
 *
 * Cómo usarlo:
 *  1. Crea una Google Sheet nueva.
 *  2. Extensiones → Apps Script. Borra todo y pega ESTE archivo. Guarda.
 *  3. Implementar → (Administrar implementaciones → editar ✏️, o Nueva implementación):
 *       - Tipo: Aplicación web
 *       - Ejecutar como: Yo
 *       - Quién tiene acceso: Cualquier usuario
 *     Autoriza. Copia/confirma la URL que termina en /exec.
 *
 *  IMPORTANTE: si YA lo habías publicado antes, tras pegar este código nuevo debes
 *  crear una NUEVA VERSIÓN de la implementación (Administrar implementaciones →
 *  editar ✏️ → Versión: "Nueva versión" → Implementar) para que tome los cambios.
 */

const SHEET_NAME = 'Entrevistas';
// Columnas fijas que van siempre primero, en este orden.
const META = ['id','inicio','fin','pais_origen','pais_destino','conexion','camino','friccion','respuestas'];

function doPost(e){
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try{
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    let headers = readHeaders(sheet);
    if(headers.length === 0){
      headers = META.slice();
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }

    const body = JSON.parse(e.postData.contents);
    const rows = Array.isArray(body) ? body : [body];
    rows.forEach(function(r){ headers = upsertRow(sheet, headers, r); });

    return json({ ok:true, count: rows.length });
  }catch(err){
    return json({ ok:false, error: String(err) });
  }finally{
    lock.releaseLock();
  }
}

// Chequeo de salud: abre la URL /exec en el navegador y debe responder {"ok":true,...}
// version:'wide-1' confirma que corre este código nuevo (columnas por pregunta).
function doGet(){ return json({ ok:true, service:'guia-tuua', version:'wide-1' }); }

function readHeaders(sheet){
  if(sheet.getLastRow() === 0) return [];
  const width = Math.max(1, sheet.getLastColumn());
  return sheet.getRange(1, 1, 1, width).getValues()[0].filter(String);
}

// Inserta/actualiza la entrevista por id. Crea columnas nuevas (al final) para preguntas no vistas.
function upsertRow(sheet, headers, r){
  // 1) agregar encabezados nuevos que traiga este registro
  Object.keys(r).forEach(function(k){
    if(headers.indexOf(k) === -1) headers.push(k);
  });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // 2) buscar la fila por id
  const idCol = headers.indexOf('id') + 1;
  const id = String(r.id);
  const last = sheet.getLastRow();
  let rowIndex = -1;
  if(last > 1){
    const ids = sheet.getRange(2, idCol, last - 1, 1).getValues();
    for(var i = 0; i < ids.length; i++){
      if(String(ids[i][0]) === id){ rowIndex = i + 2; break; }
    }
  }

  // 3) armar la fila alineada a los encabezados (sin borrar lo ya existente)
  let existing = [];
  if(rowIndex > 0){ existing = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0]; }
  const vals = headers.map(function(h, idx){
    if(r[h] !== undefined && r[h] !== '') return r[h];
    return existing[idx] !== undefined ? existing[idx] : '';
  });

  if(rowIndex > 0){ sheet.getRange(rowIndex, 1, 1, vals.length).setValues([vals]); }
  else { sheet.appendRow(vals); }

  return headers;
}

function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
