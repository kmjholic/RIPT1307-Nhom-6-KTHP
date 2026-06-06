import { login } from '@/server/services/authService';
import { validateLoginInput } from '@/utils/validation';
import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';

export default async function handler(req: UmiApiRequest, res: UmiApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const { email, password } = req.body ?? {};

    // Validate input
    const validation = validateLoginInput({ email, password });
    if (!validation.isValid) {
      res
        .status(400)
        .json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        });
      return;
    }

    const result = await login({ email: email.toLowerCase().trim(), password });
    res.status(200).json({ success: true, data: result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Đăng nhập thất bại';

    // Determine HTTP status code based on error message
    let statusCode = 401; // Default: Invalid credentials
    if (message.includes('khóa') || message.includes('cấm')) {
      statusCode = 403; // Account banned/locked
    } else if (
      message.includes('không tồn tại') ||
      message.includes('không được tìm thấy')
    ) {
      statusCode = 400; // User not found
    }

    res.status(statusCode).json({ success: false, message });
  }
}
