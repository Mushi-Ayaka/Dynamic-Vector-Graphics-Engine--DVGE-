import { FormField } from '../env'

/**
 * Servicio para extraer definiciones dinámicas de campos de Inspector
 * directamente desde el código fuente (HTML, CSS, JS).
 * 
 * Busca comentarios con el formato:
 * /* @dv-field {"id": "color", "type": "color", "label": "Color"} *\/
 */
export class TagExtractorService {
  static readonly TAG_REGEX_STR = '(?:\\/\\*|<\\!--|\\/\\/)\\s*@dv-(?:field|prop)\\s*({[\\s\\S]*?})\\s*(?:\\*\\/|-->|\\n|$)';

  /**
   * Extrae los campos de una colección de archivos
   */
  static extractFromFiles(files: { html?: string; css?: string; js?: string } | null): FormField[] {
    if (!files) return [];
    
    const extractedFields: FormField[] = [];

    if (files.html) extractedFields.push(...this.extractFromString(files.html));
    if (files.css) extractedFields.push(...this.extractFromString(files.css));
    if (files.js) extractedFields.push(...this.extractFromString(files.js));

    // Filtramos duplicados por ID (por si el mismo campo se declara en múltiples archivos)
    const uniqueFields = Array.from(new Map(extractedFields.map(f => [f.id, f])).values());
    return uniqueFields;
  }

  /**
   * Extrae los campos de un string individual
   */
  static extractFromString(content: string): FormField[] {
    const fields: FormField[] = [];
    const regex = new RegExp(this.TAG_REGEX_STR, 'g');
    let match;

    while ((match = regex.exec(content)) !== null) {
      try {
        const jsonPayload = match[1];
        const fieldData = JSON.parse(jsonPayload);
        
        // Validación básica
        if (fieldData.id && fieldData.type && fieldData.label) {
          fields.push(fieldData as FormField);
        } else {
          console.warn('[TagExtractor] Campo ignorado por falta de id, type o label:', fieldData);
        }
      } catch (e) {
        console.error('[TagExtractor] Error parseando tag JSON:', match[1], e);
      }
    }

    return fields;
  }
}
