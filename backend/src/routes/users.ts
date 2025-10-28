import { Router, Request, Response } from 'express';
import UserModel from '../models/User';

const router = Router();

// Интерфейсы для типизации запросов
interface UserQueryParams {
  page?: string;
  limit?: string;
  name?: string;
  city?: string;
  status?: string;
}

interface CreateUserBody {
  name: string;
  address?: string;
  city?: string;
  birthday?: string;
  status?: 10 | 20;
}

interface UpdateUserBody {
  name?: string;
  address?: string;
  city?: string;
  birthday?: string;
  status?: 10 | 20;
}

// GET /api/users - Получить всех пользователей с фильтрацией и пагинацией
router.get('/', async (req: Request<{}, any, any, UserQueryParams>, res: Response) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    
    // Валидация пагинации
    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        message: 'Неверные параметры пагинации'
      });
      return;
    }

    const filters: {
      name?: string;
      city?: string;
      status?: 10 | 20;
    } = {};
    
    if (req.query.name) filters.name = req.query.name;
    if (req.query.city) filters.city = req.query.city;
    if (req.query.status) {
      const status = parseInt(req.query.status, 10);
      if ([10, 20].includes(status)) {
        filters.status = status as 10 | 20;
      }
    }

    const result = await UserModel.getAll(page, limit, filters);
    
    res.json({
      success: true,
      message: 'Пользователи получены успешно',
      data: result
    });
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// GET /api/users/stats - Получить статистику пользователей
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await UserModel.getStatistics();
    
    res.json({
      success: true,
      message: 'Статистика получена успешно',
      data: stats
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// GET /api/users/:id - Получить пользователя по ID
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Неверный ID пользователя'
      });
      return;
    }

    const user = await UserModel.getById(id);
    
    res.json({
      success: true,
      message: 'Пользователь найден',
      data: user
    });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    const status = (error as Error).message.includes('не найден') ? 404 : 500;
    res.status(status).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// POST /api/users - Создать нового пользователя
router.post('/', async (req: Request<{}, any, CreateUserBody>, res: Response) => {
  try {
    const { name, address, city, birthday, status } = req.body;

    // Валидация обязательных полей
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Имя пользователя обязательно и должно быть строкой'
      });
      return;
    }

    // Валидация статуса
    if (status !== undefined && ![10, 20].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Статус должен быть 10 или 20'
      });
      return;
    }

    // Валидация даты рождения
    if (birthday && isNaN(Date.parse(birthday))) {
      res.status(400).json({
        success: false,
        message: 'Неверный формат даты рождения'
      });
      return;
    }

    const userData = {
      name: name.trim(),
      address: address?.trim(),
      city: city?.trim(),
      birthday,
      status
    };

    const newUser = await UserModel.create(userData);
    
    res.status(201).json({
      success: true,
      message: 'Пользователь создан успешно',
      data: newUser
    });
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    res.status(400).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// PUT /api/users/:id - Обновить пользователя
router.put('/:id', async (req: Request<{ id: string }, any, UpdateUserBody>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Неверный ID пользователя'
      });
      return;
    }

    const { name, address, city, birthday, status } = req.body;

    // Валидация имени
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Имя должно быть непустой строкой'
      });
      return;
    }

    // Валидация статуса
    if (status !== undefined && ![10, 20].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Статус должен быть 10 или 20'
      });
      return;
    }

    // Валидация даты рождения
    if (birthday !== undefined && birthday !== null && isNaN(Date.parse(birthday))) {
      res.status(400).json({
        success: false,
        message: 'Неверный формат даты рождения'
      });
      return;
    }

    const updateData: UpdateUserBody = {};
    if (name !== undefined) updateData.name = name.trim();
    if (address !== undefined) updateData.address = address?.trim();
    if (city !== undefined) updateData.city = city?.trim();
    if (birthday !== undefined) updateData.birthday = birthday;
    if (status !== undefined) updateData.status = status;

    const updatedUser = await UserModel.update(id, updateData);
    
    res.json({
      success: true,
      message: 'Пользователь обновлен успешно',
      data: updatedUser
    });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    const statusCode = (error as Error).message.includes('не найден') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: (error as Error).message
    });
  }
});

// DELETE /api/users/:id - Удалить пользователя
router.delete('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Неверный ID пользователя'
      });
      return;
    }

    const deletedUser = await UserModel.delete(id);
    
    res.json({
      success: true,
      message: 'Пользователь удален успешно',
      data: deletedUser
    });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    const statusCode = (error as Error).message.includes('не найден') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: (error as Error).message
    });
  }
});

export default router;