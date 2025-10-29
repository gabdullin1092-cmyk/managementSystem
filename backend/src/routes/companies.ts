import express, { Request, Response } from 'express';
import CompanyModel from '../models/Company';
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompanyFilters,
  CompanyStatus,
} from '../types/index';

const router = express.Router();

// GET /api/companies - Получить список компаний с фильтрацией и пагинацией
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: CompanyFilters = {
      name: req.query.name as string | undefined,
      idn: req.query.idn as string | undefined,
      status: req.query.status
        ? parseInt(req.query.status as string)
        : undefined,
    };

    const pagination = {
      page: parseInt((req.query.page as string) || '1'),
      limit: parseInt((req.query.limit as string) || '10'),
    };

    const result = await CompanyModel.getAll(filters, pagination);

    res.json({
      success: true,
      message: 'Компании успешно получены',
      data: result,
    });
  } catch (error) {
    console.error('Ошибка при получении компаний:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении компаний',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    });
  }
});

// GET /api/companies/stats - Получить статистику по компаниям
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await CompanyModel.getStats();

    res.json({
      success: true,
      message: 'Статистика успешно получена',
      data: stats,
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    });
  }
});

// GET /api/companies/:id - Получить компанию по ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Некорректный ID компании',
      });
      return;
    }

    const company = await CompanyModel.getById(id);

    if (!company) {
      res.status(404).json({
        success: false,
        message: `Компания с ID ${id} не найдена`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Компания успешно получена',
      data: company,
    });
  } catch (error) {
    console.error('Ошибка при получении компании:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении компании',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    });
  }
});

// POST /api/companies - Создать новую компанию
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const companyData: CreateCompanyRequest = req.body;

    // Валидация обязательных полей
    if (!companyData.name || !companyData.idn) {
      res.status(400).json({
        success: false,
        message: 'Поля name и idn обязательны для заполнения',
      });
      return;
    }

    // Валидация статуса
    if (
      companyData.status &&
      companyData.status !== CompanyStatus.ACTIVE &&
      companyData.status !== CompanyStatus.INACTIVE
    ) {
      res.status(400).json({
        success: false,
        message: 'Статус должен быть 10 или 20',
      });
      return;
    }

    const newCompany = await CompanyModel.create(companyData);

    res.status(201).json({
      success: true,
      message: 'Компания успешно создана',
      data: newCompany,
    });
  } catch (error) {
    console.error('Ошибка при создании компании:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка при создании компании',
    });
  }
});

// PUT /api/companies/:id - Обновить компанию
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Некорректный ID компании',
      });
      return;
    }

    const updateData: UpdateCompanyRequest = req.body;

    // Валидация статуса если он передан
    if (
      updateData.status !== undefined &&
      updateData.status !== CompanyStatus.ACTIVE &&
      updateData.status !== CompanyStatus.INACTIVE
    ) {
      res.status(400).json({
        success: false,
        message: 'Статус должен быть 10 или 20',
      });
      return;
    }

    const updatedCompany = await CompanyModel.update(id, updateData);

    if (!updatedCompany) {
      res.status(404).json({
        success: false,
        message: `Компания с ID ${id} не найдена`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Компания успешно обновлена',
      data: updatedCompany,
    });
  } catch (error) {
    console.error('Ошибка при обновлении компании:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка при обновлении компании',
    });
  }
});

// DELETE /api/companies/:id - Удалить компанию
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Некорректный ID компании',
      });
      return;
    }

    const deleted = await CompanyModel.delete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: `Компания с ID ${id} не найдена`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Компания успешно удалена',
    });
  } catch (error) {
    console.error('Ошибка при удалении компании:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении компании',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    });
  }
});

// POST /api/companies/:id/employees - Добавить сотрудника в компанию
router.post('/:id/employees', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Некорректный ID компании',
      });
      return;
    }

    const { userId, userName } = req.body;

    if (!userId || !userName) {
      res.status(400).json({
        success: false,
        message: 'Поля userId и userName обязательны',
      });
      return;
    }

    const updatedCompany = await CompanyModel.addEmployee(id, userId, userName);

    if (!updatedCompany) {
      res.status(404).json({
        success: false,
        message: `Компания с ID ${id} не найдена`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Сотрудник успешно добавлен',
      data: updatedCompany,
    });
  } catch (error) {
    console.error('Ошибка при добавлении сотрудника:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка при добавлении сотрудника',
    });
  }
});

// DELETE /api/companies/:id/employees/:userId - Удалить сотрудника из компании
router.delete('/:id/employees/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id || '0');
    const userId = parseInt(req.params.userId || '0');

    if (isNaN(id) || isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: 'Некорректный ID компании или сотрудника',
      });
      return;
    }

    const updatedCompany = await CompanyModel.removeEmployee(id, userId);

    if (!updatedCompany) {
      res.status(404).json({
        success: false,
        message: `Компания с ID ${id} не найдена`,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Сотрудник успешно удален',
      data: updatedCompany,
    });
  } catch (error) {
    console.error('Ошибка при удалении сотрудника:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении сотрудника',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    });
  }
});

export default router;
