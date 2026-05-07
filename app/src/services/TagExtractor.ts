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
        // [v6.0.1] Sanitización defensiva: JSON.parse falla con saltos de línea literales.
        // Reemplazamos saltos de línea por espacios para permitir formatos multilínea en los comentarios.
        const sanitizedPayload = jsonPayload.replace(/[\n\r]/g, ' ');
        const fieldData = JSON.parse(sanitizedPayload);
        
        // Validación básica
        if (fieldData && fieldData.id && fieldData.type && fieldData.label) {
          fields.push(fieldData as FormField);
        } else {
          console.warn('[TagExtractor] Campo ignorado por falta de id, type o label:', fieldData);
        }
      } catch (e: any) {
        console.warn('[TagExtractor] Error parseando tag JSON (posible sintaxis inválida):', e.message);
      }
    }

    return fields;
  }
}
