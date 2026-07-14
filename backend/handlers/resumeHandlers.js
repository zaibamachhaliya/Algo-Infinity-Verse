import multer from 'multer';
import { sendJson, getSession } from '../utils/helpers.js';
import { extractResumeText } from '../resume-analyzer/parser.js';
import { calculateATS } from '../resume-analyzer/atsScore.js';
import { findMissingSkills } from '../resume-analyzer/skills.js';
import { getSuggestions } from '../resume-analyzer/suggestions.js';
import {
  MAX_RESUME_TEXT_LENGTH,
  MAX_RESUME_FILE_SIZE_BYTES,
} from '../constants/resumeConstants.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_FILE_SIZE_BYTES, files: 1 },
}).single('resume');

export async function handleAnalyzeResume(req, res) {
  const session = getSession(req);
  if (!session) {
    return sendJson(res, 401, { error: 'Login required.' });
  }

  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.file) {
      return sendJson(res, 400, { error: 'No resume file uploaded.' });
    }

    const text = await extractResumeText(req.file);

    if (text.length > MAX_RESUME_TEXT_LENGTH) {
      return sendJson(res, 400, {
        error: `Resume text is too long (${text.length} characters). Please limit your resume text to ${MAX_RESUME_TEXT_LENGTH} characters.`,
      });
    }

    const atsScore = calculateATS(text);
    const missingSkills = findMissingSkills(text);
    const suggestions = getSuggestions(atsScore);

    return sendJson(res, 200, {
      atsScore,
    console.error('Resume analysis error:', error);

    if (error.code === 'LIMIT_FILE_SIZE') {
      return sendJson(res, 413, { error: 'File size exceeds the allowed limit.' });
    }

    if (error.message === 'Invalid file type uploaded.') {
      return sendJson(res, 400, { error: error.message });
    }

    if (error.message === 'Resume text extraction timed out.') {
      return sendJson(res, 408, {
        error:
          'The request took too long to process. The resume file might be corrupted or too complex.',
      });
    }

    return sendJson(res, 500, { error: error.message || 'Failed to analyze resume.' });
  }
}
