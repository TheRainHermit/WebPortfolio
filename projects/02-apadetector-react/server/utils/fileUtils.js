import { existsSync, unlinkSync } from 'fs';
import path from 'path';

export function deleteFile(filePath) {
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}