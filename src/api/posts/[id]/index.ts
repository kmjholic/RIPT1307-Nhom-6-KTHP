import { initDatabase } from '@/server/db';
import { requireAuth } from '@/server/middlewares/auth';
import {
  CommentEntity,
  QuestionEntity,
  TagEntity,
  UserEntity,
} from '@/server/models/entities';
import type { UmiApiRequest, UmiApiResponse } from '@umijs/max';
import { formatQuestion } from '../index';

export default async function handler(req: UmiApiRequest, res: UmiApiResponse) {
  await initDatabase();

  // Extract id from query (UmiJS passes dynamic segments as query params)
  let id = req.query?.id as string;

  // If not in query, try to extract from URL path
  if (!id && req.url) {
    const match = req.url.match(/\/api\/posts\/([^/?]+)/);
    id = match ? match[1] : undefined;
  }

  console.log('API [id] route - req.query:', req.query);
  console.log('API [id] route - req.params:', (req as any).params);
  console.log('API [id] route - req.url:', req.url);
  console.log('API [id] route - extracted id:', id);

  if (req.method === 'GET') {
    try {
      const question = await QuestionEntity.findOne({
        where: { id },
        include: [
          {
            model: UserEntity,
            as: 'author',
            attributes: ['name', 'role', 'reputation'],
          },
          { model: TagEntity, as: 'questionTags', through: { attributes: [] } },
        ],
      });

      if (!question) {
        res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy bài viết' });
        return;
      }

      question.views += 1;
      await question.save();

      const formattedQuestion = formatQuestion(question);

      res.status(200).json({
        success: true,
        data: {
          question: formattedQuestion,
        },
      });
    } catch (error) {
      console.error('API Error Details:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        success: false,
        message: 'Lỗi lấy chi tiết bài viết',
        error: errorMsg,
      });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      // Check authentication
      const authContext = requireAuth(req);
      if (!authContext) {
        res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập để xóa bài viết',
        });
        return;
      }

      const question = await QuestionEntity.findByPk(id);
      if (!question) {
        res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy bài viết' });
        return;
      }

      // Check authorization: only owner or admin can delete
      const isOwner = question.authorId === authContext.userId;
      const isAdmin = authContext.role === 'admin';

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa bài viết này',
        });
        return;
      }

      await (question as any).setQuestionTags([]);
      await CommentEntity.destroy({ where: { questionId: id } });
      await question.destroy();

      res
        .status(200)
        .json({ success: true, message: 'Đã xóa bài viết thành công' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi xóa bài viết',
        error: String(error),
      });
    }
    return;
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
}
