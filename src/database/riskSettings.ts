import { executeQuery, executeSingleQuery } from './index';

export interface RiskSettingsRecord {
    id: number;
    settings: any;
    updated_at: string;
}

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS risk_settings (
  id INT PRIMARY KEY,
  settings JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

export async function ensureRiskSettingsTable(): Promise<void> {
    await executeSingleQuery(CREATE_TABLE_SQL);
}

export async function getRiskSettings(): Promise<RiskSettingsRecord | null> {
    await ensureRiskSettingsTable();
    const rows = await executeQuery<RiskSettingsRecord>('SELECT id, settings, updated_at FROM risk_settings WHERE id = 1');
    if (rows.length === 0) return null;
    const rec = rows[0];
    try {
        if (typeof rec.settings === 'string') {
            (rec as any).settings = JSON.parse(rec.settings as any);
        }
    } catch {
        // leave as-is
    }
    return rec;
}

export async function upsertRiskSettings(settings: any): Promise<boolean> {
    await ensureRiskSettingsTable();
    // Use INSERT ... ON DUPLICATE KEY UPDATE pattern with fixed id=1
    const sql = `INSERT INTO risk_settings (id, settings) VALUES (1, ?) 
                 ON DUPLICATE KEY UPDATE settings = VALUES(settings), updated_at = CURRENT_TIMESTAMP`;
    const json = JSON.stringify(settings);
    const res = await executeSingleQuery(sql, [json]);
    return res.affectedRows > 0;
}


